import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How EngiNerd collects, uses, and protects your data — under India's DPDPA 2023.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="May 4, 2026">
      <p>
        This policy explains what data EngiNerd collects, why, and what your
        rights are. It&apos;s written to comply with the Digital Personal Data
        Protection Act, 2023 (DPDPA) and standard global privacy norms.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — name, email or phone, optional college
          name and graduation year. You provide this when signing up.
        </li>
        <li>
          <strong>Learning activity</strong> — which subjects you read, problems
          you solve, time spent, streak data. Used to power your dashboard,
          progress, and recommendations.
        </li>
        <li>
          <strong>Payment data</strong> — handled by Razorpay; we store the
          order ID, payment ID, and plan, but never your card or UPI
          credentials.
        </li>
        <li>
          <strong>Technical data</strong> — IP address (used for rate-limiting),
          user agent, browser-level analytics (page views, button clicks).
        </li>
      </ul>

      <h2>2. Why we collect it</h2>
      <ul>
        <li>To run the service: serve lessons, save progress, send OTPs.</li>
        <li>
          To bill correctly and meet our tax obligations under Indian law.
        </li>
        <li>
          To improve the product: understand which content lands, where users
          drop off.
        </li>
        <li>
          To prevent abuse: detect rate-limit violations, payment fraud, and
          account takeover.
        </li>
      </ul>

      <h2>3. Who we share it with</h2>
      <p>
        We share data with infrastructure providers strictly to operate the
        service:
      </p>
      <ul>
        <li>
          <strong>Neon</strong> (database), <strong>Upstash</strong>{" "}
          (rate-limit cache), <strong>Vercel</strong> (hosting) — based in the
          US/EU, contractually bound by data-protection terms.
        </li>
        <li>
          <strong>Razorpay</strong> (payments) — Indian-domiciled, RBI-licensed.
        </li>
        <li>
          <strong>MSG91 / Resend</strong> (OTP and transactional email).
        </li>
        <li>
          <strong>Sentry / PostHog</strong> (error monitoring + analytics) — IP
          addresses and event metadata only, no lesson content.
        </li>
      </ul>
      <p>We do not sell your data to advertisers or data brokers.</p>

      <h2>4. How long we keep it</h2>
      <p>
        Account and learning data are retained for as long as your account is
        active. If you delete your account, we erase your personal data within
        30 days, except where law (e.g., tax records) requires us to retain
        invoices for up to 7 years.
      </p>

      <h2>5. Your rights under DPDPA 2023</h2>
      <ul>
        <li>
          <strong>Access</strong> — request a copy of the data we hold about
          you.
        </li>
        <li>
          <strong>Correction</strong> — fix inaccurate or incomplete data.
        </li>
        <li>
          <strong>Erasure</strong> — request deletion (subject to lawful
          retention).
        </li>
        <li>
          <strong>Grievance</strong> — escalate to our Data Protection Officer.
        </li>
      </ul>
      <p>
        Email <a href="mailto:privacy@enginerd.in">privacy@enginerd.in</a> with
        any of the above. We respond within 7 working days.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use a small number of strictly-necessary cookies to keep you signed
        in and to apply rate limits. We do not use third-party advertising
        cookies.
      </p>

      <h2>7. Security</h2>
      <p>
        Data in transit is encrypted with TLS. Passwords are not stored — we
        use OTP-based sign-in. Payments are PCI-DSS compliant via Razorpay.
        Despite reasonable safeguards, no online service is 100% secure;
        please use a strong, unique sign-in method.
      </p>

      <h2>8. Children</h2>
      <p>
        EngiNerd is not intended for users under 16. If you believe a minor has
        signed up, write to us and we&apos;ll remove the account.
      </p>

      <h2>9. Updates to this policy</h2>
      <p>
        Material changes will be announced at least 14 days before they take
        effect, via email and an in-app banner.
      </p>
    </LegalPage>
  );
}
