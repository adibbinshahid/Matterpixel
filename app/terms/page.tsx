import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { brand } from "@/content/siteConfig";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description:
    "The terms for using the Matterpixel website: prices and quotes, our work and content, concept builds, and liability.",
  path: "/terms",
});

const UPDATED = "21 November 2026";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated={UPDATED}
      lede="These terms cover your use of this website. Client projects are governed by the written proposal and agreement signed for that project."
    >
      <h2>About these terms</h2>
      <p>
        This website is operated by Matterpixel, a studio run by {brand.founder} in Dhaka, Bangladesh. By using the
        site you agree to these terms. If you don&rsquo;t agree, please don&rsquo;t use the site.
      </p>

      <h2>Prices and quotes</h2>
      <p>
        Prices on this site are starting points (&ldquo;from&rdquo;) and estimates, shown so you can plan. They are not
        an offer. Every project gets a fixed quote in writing before any work starts, and only that written quote and
        the agreement that goes with it are binding. Estimates from the stack builder are a guide, not a quote.
      </p>

      <h2>Concept builds and examples</h2>
      <p>
        Projects marked as concept builds were made by Matterpixel to a brief we set ourselves. They are not client
        work, and we say so on each one. Their live demos and admin panels are provided for you to explore and may be
        reset or changed at any time. Please don&rsquo;t enter real personal or payment details into them.
      </p>

      <h2>Our content</h2>
      <p>
        The text, design, code, images and video on this site belong to Matterpixel unless stated otherwise. You may
        share links and short quotes with credit. You may not copy the site, its designs or its media for your own
        commercial use without written permission. Work we deliver to clients is owned by the client as set out in their
        agreement.
      </p>

      <h2>Using the site properly</h2>
      <p>
        Please don&rsquo;t try to break, overload or gain unauthorised access to the site, its forms or the demo
        sites, or use the forms to send spam. We may block access that does.
      </p>

      <h2>Third-party links</h2>
      <p>
        Links to other services (such as WhatsApp, Telegram, LinkedIn or our demo sites) are provided for convenience.
        We are not responsible for content or policies on sites we don&rsquo;t control.
      </p>

      <h2>No guarantees from the site itself</h2>
      <p>
        We keep the site accurate and available, but it is provided as is. Articles and examples are general
        information, not professional advice for your specific situation. Performance figures describe the builds
        they are attached to, measured as stated; results for your project depend on its scope and are set out in your
        proposal.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent the law allows, Matterpixel is not liable for indirect or consequential loss arising from use of
        this website. Nothing in these terms limits liability that cannot be limited by law.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of Bangladesh. If you are a consumer, you keep any protections the law of
        your own country gives you.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${brand.email}`}>{brand.email}</a>. How we handle personal data
        is explained in our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
