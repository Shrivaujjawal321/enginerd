/**
 * NextAuth v5 catch-all handler.
 *
 * All `/api/auth/*` routes (signin, signout, callback, csrf, providers,
 * session) are routed through here. Provider-specific OTP send/verify lives
 * under sibling routes (`/api/auth/otp/...`) which call signIn() server-side.
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
