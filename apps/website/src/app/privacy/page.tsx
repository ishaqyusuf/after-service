import type { Metadata } from "next";
import { LegalPage } from "../../components/legal-page";
import { createPageMetadata } from "../../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Privacy Policy | afterservice",
    description:
      "How afterservice handles account, customer and service data, and how to contact us about your privacy.",
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <section>
        <h2>Who operates afterservice</h2>
        <p>
          Zeroes and One Hi-Tech, registered in Nigeria and trading as
          afterservice, operates afterservice.app and its dashboard. For privacy
          questions or requests, email{" "}
          <a href="mailto:hello@afterservice.app">hello@afterservice.app</a>.
        </p>
        <p>
          We decide how account, billing, support and service-usage information
          is used. For customer records a business adds to its workspace, that
          business decides the purpose of processing and we provide the tools to
          process those records on its behalf. If you are a customer of a
          business using afterservice, contact that business first about its
          records or messages. You can also contact us for help routing your
          request.
        </p>
      </section>
      <section>
        <h2>Information we handle</h2>
        <ul>
          <li>
            Account and workspace details: name, email, sign-in information,
            sessions, workspace settings, team membership and permissions. If
            you choose Google sign-in, we receive the profile information needed
            to identify your account.
          </li>
          <li>
            Records you and your team add: customer names and contact details,
            service jobs, notes, follow-ups, templates, message content,
            outreach logs and activity history.
          </li>
          <li>
            Subscription and support information: plan, checkout and
            subscription references, billing status, support correspondence and
            details you choose to share with us. Payment card details are
            handled by our checkout provider, Polar, rather than entered into
            our own forms.
          </li>
          <li>
            Technical and usage information: pages visited, feature events,
            approximate country, device/browser information, request details,
            errors and delivery status used to operate and improve the service.
          </li>
        </ul>
        <p>
          Add only information needed for your service workflow. Do not put
          passwords, payment card numbers, government identifiers, health
          records or other sensitive personal information into customer notes or
          prompts.
        </p>
      </section>
      <section>
        <h2>Why we use it</h2>
        <p>
          We use information to provide accounts and workspace features, save
          records, carry out requested messages and actions, manage billing,
          respond to support requests, prevent abuse, diagnose failures and
          understand product usage. Without the information needed for an
          account or a requested action, we may be unable to provide that
          feature.
        </p>
        <p>
          For information we control, our bases for processing are providing the
          service under our agreement with you, our legitimate interests in
          maintaining and improving a secure service where those interests do
          not override your rights, meeting legal obligations, and consent where
          required. A business using afterservice is responsible for its lawful
          basis for adding customer records and contacting those customers.
        </p>
      </section>
      <section>
        <h2>Messages and optional AI features</h2>
        <p>
          Email delivery uses Resend and Trigger.dev to carry out requested
          sends. Message content, recipient details and delivery records are
          processed for that purpose. Recording a phone or WhatsApp contact does
          not itself send a message through that channel.
        </p>
        <p>
          Where AI assistant features are available and you use them, your
          prompts and relevant workspace context are sent to the configured AI
          provider, currently DeepSeek, to produce a response. Conversations and
          action records are stored in your workspace. Review responses before
          relying on them and avoid including unnecessary personal information.
        </p>
      </section>
      <section>
        <h2>Who receives information</h2>
        <p>
          Workspace information is available to authorized members of that
          workspace. Our authorized staff may access information as needed for
          support, service operations, security and investigating problems.
        </p>
        <p>
          Our service providers include Vercel for hosting, Neon for database
          storage, Resend for email, Trigger.dev for background tasks, Polar for
          billing, Sentry for error monitoring, Logly for usage analytics and
          DeepSeek for the AI features described above. Google handles Google
          sign-in if you choose it. Providers receive information relevant to
          their function. We may also disclose information when legally required
          or necessary to protect people, the service or legal rights.
        </p>
        <p>
          These services may process information outside Nigeria. Applicable
          data-protection requirements for international transfers continue to
          apply. Contact us for information about the providers and transfer
          arrangements relevant to your workspace.
        </p>
      </section>
      <section>
        <h2>Cookies, local storage and analytics</h2>
        <p>
          Sign-in and app functionality use cookies and browser storage. We use
          Logly to understand visits and feature usage, and Sentry to diagnose
          errors. Browser analytics is configured to respect privacy signals
          such as Do Not Track and Global Privacy Control. Blocking essential
          cookies or clearing browser storage may sign you out or remove saved
          browser preferences. Contact us about your analytics choices or
          privacy concerns.
        </p>
      </section>
      <section>
        <h2>Retention and security</h2>
        <p>
          We keep information for as long as needed to provide the service and
          for relevant support, security, accounting and legal purposes. The
          appropriate period depends on the record, whether your workspace is
          active and any legal need to retain it. Closing an account does not
          necessarily remove every backup or legally required record
          immediately. Ask us about deleting or returning workspace data before
          closing it.
        </p>
        <p>
          We use authentication, workspace access controls and restricted
          service credentials to protect information. No online service can
          guarantee complete security. Report suspected unauthorized access
          promptly to{" "}
          <a href="mailto:hello@afterservice.app">hello@afterservice.app</a>.
        </p>
      </section>
      <section>
        <h2>Your choices and rights</h2>
        <p>
          Subject to applicable law, you can request access to or correction of
          your personal information, deletion, restriction of processing or a
          portable copy, and object to certain processing. You can withdraw
          consent where processing relies on it; this does not affect processing
          that was lawful before withdrawal. You can also raise concerns about
          automated decisions. The assistant is a support tool; it does not
          decide your eligibility for employment, credit or similar services.
        </p>
        <p>
          Send requests to{" "}
          <a href="mailto:hello@afterservice.app">hello@afterservice.app</a>. We
          may need to verify your identity and authority over a workspace.
          Please do not email passwords or full customer lists. You can complain
          to the{" "}
          <a href="https://ndpc.gov.ng/">Nigeria Data Protection Commission</a>{" "}
          or another competent data-protection authority. Contacting us first
          does not limit that right.
        </p>
      </section>
      <section>
        <h2>Changes to this policy</h2>
        <p>
          We will update this page and its effective date when our practices
          change. Material changes affecting how your information is used will
          be communicated through the service or your account contact details as
          appropriate.
        </p>
      </section>
    </LegalPage>
  );
}
