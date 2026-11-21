import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { brand } from "@/content/siteConfig";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What Matterpixel collects when you contact us or book a call, why, who processes it, how long we keep it, and how to have it deleted.",
  path: "/privacy",
});

const UPDATED = "21 November 2026";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={UPDATED}
      lede="Short version: we collect only what you send us, use it only to reply and do the work, never sell it, and delete it when you ask."
    >
      <h2>Who we are</h2>
      <p>
        Matterpixel is a founder-led digital studio run by {brand.founder}, based in Dhaka, Bangladesh. We are the
        controller of the personal data described here. Questions about this policy go to{" "}
        <a href={`mailto:${brand.email}`}>{brand.email}</a>.
      </p>

      <h2>What we collect</h2>
      <h3>When you send a project brief</h3>
      <p>
        Your name, work email and, if you choose to give them, WhatsApp number, company, website, the kind of project,
        your budget range and anything you write about the project.
      </p>
      <h3>When you book a free audit call</h3>
      <p>
        The same contact details, plus your role, timeline, what you want the audit to focus on, the time slot you
        picked and your time zone.
      </p>
      <h3>When you message us directly</h3>
      <p>
        If you reach us by email, WhatsApp or Telegram, we receive whatever you send through that service. Those
        services have their own privacy policies.
      </p>
      <h3>When you browse</h3>
      <p>
        We use Vercel Web Analytics to count page views and see which pages and links are used. It does not use
        cookies, does not track you across other sites, and does not give us your identity. We also record which page
        a contact link was clicked from, so we know which parts of the site are useful.
      </p>

      <h2>Form drafts on your device</h2>
      <p>
        If you start a form and leave before sending it, your answers are saved in your own browser&rsquo;s local
        storage so you can pick up where you left off. That draft never leaves your device until you press send. It is
        removed when you submit or press &ldquo;Start over&rdquo;, and expires on its own after 14 days.
      </p>

      <h2>Why we use it</h2>
      <ul>
        <li>To reply to your enquiry, prepare a quote, and schedule and run the call you asked for.</li>
        <li>To deliver and support a project if you become a client.</li>
        <li>To keep the site secure, for example by limiting repeated form submissions.</li>
      </ul>
      <p>
        We process this data because you asked us to take steps before a possible contract, and because we have a
        legitimate interest in answering business enquiries. We do not use it for advertising, and we never sell or
        rent it.
      </p>

      <h2>Who processes it for us</h2>
      <ul>
        <li>
          <strong>Vercel</strong> hosts the website and provides the cookieless analytics.
        </li>
        <li>
          <strong>Resend</strong> delivers the emails sent when you submit a form.
        </li>
        <li>
          <strong>Our email and calendar provider</strong> holds the inbox and calendar where your enquiry and any call
          booking end up.
        </li>
      </ul>
      <p>
        These providers may store data in the United States and other countries. Where data leaves your country, we rely
        on their standard contractual safeguards.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Enquiries that don&rsquo;t become a project are deleted within 24 months. If you become a client, we keep
        project correspondence and records for as long as the work and any legal or accounting obligations require.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see the data we hold about you, correct it, have it deleted, or object to how we use it. Email{" "}
        <a href={`mailto:${brand.email}`}>{brand.email}</a> and we will act within 30 days. If you are in the EU, UK or
        another region with a data protection authority, you also have the right to complain to it.
      </p>

      <h2>Security</h2>
      <p>
        The site is served only over HTTPS, forms are protected against automated abuse, and access to enquiries is
        limited to the people working on your project.
      </p>

      <h2>Children</h2>
      <p>This site is for businesses. We do not knowingly collect data from anyone under 16.</p>

      <h2>Changes</h2>
      <p>
        If we change this policy, we will update the date at the top of this page. See also our{" "}
        <Link href="/terms">Terms of Use</Link>.
      </p>
    </LegalPage>
  );
}
