import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "EngiNerd terms of service — the rules that govern your use of the platform.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="May 4, 2026">
      <p>
        These terms govern your use of EngiNerd. By creating an account or using
        any part of the service, you agree to them. If you don&apos;t, please
        don&apos;t use the platform.
      </p>

      <h2>1. Who runs EngiNerd</h2>
      <p>
        EngiNerd is operated from Bengaluru, India. If you need to reach us for
        anything related to these terms, write to{" "}
        <a href="mailto:legal@enginerd.in">legal@enginerd.in</a>.
      </p>

      <h2>2. Your account</h2>
      <p>
        You need to be at least 16 years old to create an account. You are
        responsible for keeping your login credentials safe and for any activity
        that happens under your account. Tell us immediately if you suspect
        unauthorized access.
      </p>
      <p>
        We may suspend or terminate accounts that violate these terms — for
        example, attempting to circumvent rate limits, scraping protected
        content, or abusing other users.
      </p>

      <h2>3. What you can do with the content</h2>
      <p>
        Lessons, problems, roadmaps, and other learning content on EngiNerd are
        available for your personal, non-commercial study. You may not
        redistribute, resell, or use the content to train machine-learning
        models without written permission.
      </p>
      <p>
        Code you write inside the platform — submissions, snippets, notes —
        remains yours. You grant us a limited license to store and display it
        back to you, and to use de-identified aggregates to improve the
        product.
      </p>

      <h2>4. Subscriptions and payments</h2>
      <p>
        Paid plans are billed through Razorpay in Indian Rupees, inclusive of
        applicable GST. Plans renew automatically unless you cancel. Cancelling
        stops the next renewal — you keep paid features until the end of the
        current billing period.
      </p>
      <p>
        For refund policy, see <a href="/refunds">Refunds</a>.
      </p>

      <h2>5. Acceptable use</h2>
      <p>
        Don&apos;t use EngiNerd to break the law, harass others, post malware,
        or interfere with the platform&apos;s operation. The code runner is
        sandboxed for short-lived problem solving — don&apos;t use it as a
        general compute service.
      </p>

      <h2>6. No warranties</h2>
      <p>
        EngiNerd is provided &quot;as is&quot;. We work hard to keep it
        accurate, available, and secure, but we don&apos;t promise it will be
        uninterrupted or error-free. Don&apos;t rely on EngiNerd content for
        legal, financial, or medical decisions.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the extent permitted by law, EngiNerd is not liable for any indirect
        or consequential damages. Our maximum liability for any claim is the
        amount you paid us in the 12 months preceding the claim.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these terms from time to time. Material changes will be
        announced via email or an in-app notice at least 14 days before they
        take effect.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of India. Any disputes will be
        subject to the exclusive jurisdiction of the courts in Bengaluru,
        Karnataka.
      </p>
    </LegalPage>
  );
}
