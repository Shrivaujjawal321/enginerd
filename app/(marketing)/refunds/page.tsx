import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "EngiNerd refund policy — when refunds apply and how to request one.",
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" lastUpdated="May 4, 2026">
      <p>
        We want students to feel confident upgrading. This page explains when
        refunds apply and how to request one.
      </p>

      <h2>1. The 7-day refund window</h2>
      <p>
        If you upgrade to a paid plan and decide it isn&apos;t the right fit,
        write to us within 7 days of your first payment and we&apos;ll issue a
        full refund. No questions, no friction.
      </p>
      <p>
        The 7-day window starts on the date of your first successful payment,
        not on each renewal.
      </p>

      <h2>2. What we cannot refund</h2>
      <ul>
        <li>
          Renewal payments after the original 7-day window. Cancel anytime
          before the next renewal date and you keep paid features until the end
          of the current period — but we do not pro-rate or refund the unused
          portion.
        </li>
        <li>
          Partial refunds for unused features within an active billing period.
        </li>
        <li>
          One-time purchases (mock interview slots, cohort fees) once the
          session has been booked.
        </li>
      </ul>

      <h2>3. Failed payments</h2>
      <p>
        If your card is charged but the upgrade does not activate within 30
        minutes, you do not need to ask for a refund — Razorpay auto-reverses
        the hold within 5–7 business days. If you don&apos;t see the reversal
        after 7 days, write to us with the order ID and we&apos;ll resolve it.
      </p>

      <h2>4. How to request a refund</h2>
      <ol>
        <li>
          Email <a href="mailto:billing@enginerd.in">billing@enginerd.in</a>{" "}
          from the address on your account.
        </li>
        <li>
          Include your order ID (find it on the <a href="/billing">Billing</a>{" "}
          page) and a one-line reason. The reason helps us improve, but it is
          not required.
        </li>
        <li>
          We confirm receipt within 1 working day and credit the original
          payment method within 5–7 working days. Razorpay handles the
          reversal; the timing is governed by your bank.
        </li>
      </ol>

      <h2>5. GST and refunds</h2>
      <p>
        Refunds are issued for the full amount you paid, including GST.
        We&apos;ll issue a credit note with the same GSTIN against your
        original invoice.
      </p>

      <h2>6. Disputed charges</h2>
      <p>
        If you didn&apos;t recognize a charge, contact us first — we resolve
        most issues within 24 hours. Initiating a chargeback before talking to
        us means your account is suspended pending review, which we&apos;d
        rather avoid.
      </p>
    </LegalPage>
  );
}
