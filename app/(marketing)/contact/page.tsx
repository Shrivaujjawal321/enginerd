import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the EngiNerd team.",
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact" lastUpdated="May 4, 2026">
      <p>
        We answer every email. Pick the right address for the fastest reply.
      </p>

      <h2>For students</h2>
      <ul>
        <li>
          <strong>Account, billing, refunds</strong> —{" "}
          <a href="mailto:billing@enginerd.in">billing@enginerd.in</a>
        </li>
        <li>
          <strong>Bug reports, feature requests, content errors</strong> —{" "}
          <a href="mailto:hello@enginerd.in">hello@enginerd.in</a>
        </li>
        <li>
          <strong>Privacy, data access, deletion</strong> —{" "}
          <a href="mailto:privacy@enginerd.in">privacy@enginerd.in</a>
        </li>
      </ul>

      <h2>For colleges and TPOs</h2>
      <p>
        We work with engineering colleges to power placement-cell prep.
        Volume pricing, tracked dashboards, mock-interview integrations.
        Email{" "}
        <a href="mailto:colleges@enginerd.in">colleges@enginerd.in</a> with
        your college name, batch size, and a one-line ask.
      </p>

      <h2>For partners and press</h2>
      <p>
        Partnership, integration, or press requests —{" "}
        <a href="mailto:hello@enginerd.in">hello@enginerd.in</a> with
        &quot;partnership&quot; or &quot;press&quot; in the subject.
      </p>

      <h2>Response time</h2>
      <p>
        Every email gets an acknowledgement within 1 working day. Most
        questions are answered within 48 hours. Refund requests within 5–7
        working days.
      </p>

      <h2>Office</h2>
      <p>
        EngiNerd is a remote-first team headquartered in Bengaluru, India. We
        don&apos;t take walk-ins, but if you&apos;re a student in town and
        want to say hi, ping us on email — we love a chai meeting.
      </p>
    </LegalPage>
  );
}
