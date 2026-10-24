import type { Metadata } from "next";
import { LegalPage } from "../../components/legal-page";
import { createPageMetadata } from "../../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Terms of Service | afterservice",
    description:
      "Terms for using afterservice to manage service records, customer follow-ups and team workflows.",
    path: "/terms",
  });
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service">
      <section>
        <h2>Our agreement</h2>
        <p>
          afterservice is operated by Zeroes and One Hi-Tech, registered in
          Nigeria and trading as afterservice. These terms cover your use of
          afterservice.app and its dashboard. By creating an account or using
          the service, you agree to these terms. If you act for a business, you
          must have authority to accept them for that business.
        </p>
        <p>
          Questions about the service or these terms can be sent to{" "}
          <a href="mailto:hello@afterservice.app">hello@afterservice.app</a>.
          Our <a href="/privacy">privacy policy</a> explains how we handle
          information.
        </p>
      </section>
      <section>
        <h2>Accounts and workspace access</h2>
        <p>
          Provide accurate account details, protect your sign-in credentials and
          allow access only to authorized team members. Workspace owners are
          responsible for managing their team and permissions. Tell us promptly
          if you suspect your account has been compromised.
        </p>
      </section>
      <section>
        <h2>Your records and customer contact</h2>
        <p>
          You retain ownership of the content you add. You give us permission to
          host and process it as needed to provide the service and carry out
          your instructions. You are responsible for its accuracy and for having
          the authority and lawful basis to store it, use it and contact the
          people it identifies. Respect customer preferences and requests to
          stop contact.
        </p>
        <p>
          Review recipients, message content, timing and any AI suggestions
          before confirming an action. Sending and delivery depend on the
          configured channel and provider; saving a follow-up or recording a
          manual contact does not guarantee that a customer received a message.
          You remain responsible for the underlying service work and promises to
          customers.
        </p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <p>
          Do not use afterservice for unlawful activity, unsolicited bulk
          messaging, harassment, fraud, infringing content or attempts to access
          another workspace. Do not bypass access controls, abuse service
          limits, disrupt the service or introduce malicious code. Add only the
          personal information needed for your workflow and keep highly
          sensitive records out of notes and AI prompts.
        </p>
      </section>
      <section>
        <h2>Plans, billing and cancellation</h2>
        <p>
          Free and paid plans have the limits described on our{" "}
          <a href="/pricing">pricing page</a> and in the dashboard. When paid
          checkout is available, Polar handles payment. Review the price,
          currency, billing interval, taxes and renewal terms shown at checkout
          before subscribing. A checkout attempt alone does not activate a paid
          subscription; payment-provider confirmation is required.
        </p>
        <p>
          Manage an existing subscription through the billing controls or
          provider portal available from your account. Contact support if you
          cannot access those controls, need help cancelling or have a billing
          or refund question. Applicable statutory refund and consumer rights
          remain available. We will communicate material price or plan changes
          before they apply to an existing paid subscription.
        </p>
      </section>
      <section>
        <h2>Availability and third-party services</h2>
        <p>
          We maintain and improve afterservice, but interruptions, errors and
          changes can occur. Features may depend on third-party hosting, email,
          billing or AI services. We do not promise uninterrupted operation,
          successful message delivery or a particular business result. Keep
          independent copies of records critical to your business. Features
          marked as planned or coming soon are not commitments to a delivery
          date.
        </p>
      </section>
      <section>
        <h2>Suspension, closing an account and data</h2>
        <p>
          We may restrict access where needed to address abuse, security risks,
          non-payment or a breach of these terms. Contact support if you believe
          a restriction is a mistake. You may stop using the service and request
          account closure through support. Stopping use alone does not cancel an
          existing paid subscription; use the cancellation route described
          above.
        </p>
        <p>
          Request any needed copy or return of workspace records before closing
          an account. Data handling and retention are described in the{" "}
          <a href="/privacy">privacy policy</a>. Closing a workspace does not
          remove obligations that already arose, such as valid outstanding fees.
        </p>
      </section>
      <section>
        <h2>Rights, responsibility and resolving concerns</h2>
        <p>
          We retain rights in the afterservice software and branding. These
          terms allow you to use the service, without transferring ownership of
          that software or your own records. Nothing in these terms excludes or
          limits liability or rights that applicable law does not allow to be
          excluded or limited.
        </p>
        <p>
          These terms are governed by the laws of Nigeria, subject to mandatory
          protections that apply in your jurisdiction. Please contact{" "}
          <a href="mailto:hello@afterservice.app">hello@afterservice.app</a> so
          we can try to resolve concerns. This does not prevent you from using
          legal remedies available to you.
        </p>
      </section>
      <section>
        <h2>Changes to these terms</h2>
        <p>
          Updated terms will appear here with a revised effective date. We will
          communicate material changes through the service or your account
          contact details before they take effect where required. If you do not
          accept a change, you can stop using the service and contact us about
          closing your account and any active subscription.
        </p>
      </section>
    </LegalPage>
  );
}
