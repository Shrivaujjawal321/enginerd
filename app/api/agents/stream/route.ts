import { auth } from "@/auth";
import { runStore } from "@/lib/agents/store";
import { apiLimiter, tooManyRequests } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: "unauthenticated" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const rl = await apiLimiter.limit(`agents:stream:${session.user.id}`);
  if (!rl.success) return tooManyRequests(rl.reset);

  const url = new URL(req.url);
  const runId = url.searchParams.get("runId");
  if (!runId) {
    return new Response(
      JSON.stringify({ error: "missing_runId" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const run = await runStore.get(runId);
  if (!run) {
    return new Response(
      JSON.stringify({ error: "not_found", message: `Run ${runId} not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }
  if (run.userId && run.userId !== session.user.id) {
    return new Response(
      JSON.stringify({ error: "forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          closed = true;
        }
      };

      // Replay history first so reconnects don't drop earlier events.
      send("hello", { runId, status: run.status, mode: run.mode });
      for (const ev of run.events) {
        send(ev.type, ev);
      }

      const unsubscribe = runStore.subscribe(runId, (ev) => {
        send(ev.type, ev);
        if (ev.type === "run.completed" || ev.type === "agent.failed") {
          // Give the client a moment to read the final event, then close.
          setTimeout(() => {
            if (!closed) {
              closed = true;
              try {
                controller.close();
              } catch {
                // ignore
              }
            }
          }, 50);
        }
      });

      // Keep-alive pings every 15s
      const ping = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          closed = true;
        }
      }, 15_000);

      const cleanup = () => {
        clearInterval(ping);
        unsubscribe();
      };

      req.signal.addEventListener("abort", () => {
        closed = true;
        cleanup();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });

      // Defensive: cleanup when controller detects closure
      const origClose = controller.close.bind(controller);
      controller.close = () => {
        cleanup();
        return origClose();
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
