import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 14, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p className="mt-2">
            By accessing or using TempChair (&quot;the Platform&quot;), operated by TempChair (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
          <p className="mt-2">
            TempChair is an online marketplace that connects dental clinics (&quot;Clinics&quot;) with dental professionals including hygienists, dental assistants, and dentists (&quot;Workers&quot;) for temporary and permanent staffing positions. We facilitate connections but are not a staffing agency and do not employ Workers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. User Accounts</h2>
          <p className="mt-2">
            You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must be at least 18 years old to use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. User Responsibilities</h2>
          <h3 className="mt-3 font-medium text-foreground">For Workers:</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>You are responsible for maintaining valid licenses, certifications, and credentials required for your profession.</li>
            <li>You represent that all information in your profile is accurate and current.</li>
            <li>You are responsible for your own tax obligations as an independent contractor.</li>
            <li>You agree to fulfill any shifts you accept in good faith.</li>
          </ul>
          <h3 className="mt-3 font-medium text-foreground">For Clinics:</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>You are responsible for verifying credentials and performing background checks on Workers before they begin work.</li>
            <li>You represent that all job postings are accurate and comply with applicable employment laws.</li>
            <li>You are responsible for providing a safe working environment.</li>
            <li>You agree to pay Workers directly for services rendered at the agreed-upon rate.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Fees and Payment</h2>
          <p className="mt-2">
            Worker accounts are free. Clinics are charged fees for posting positions and for premium features as described on our <Link href="/pricing" className="text-primary hover:underline">Pricing page</Link>. All fees are non-refundable unless otherwise stated. Payment terms are subject to change with 30 days notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Reviews and Ratings</h2>
          <p className="mt-2">
            Users may leave reviews and ratings for other users. Reviews must be honest, accurate, and based on genuine interactions. We reserve the right to remove reviews that are fraudulent, abusive, or violate these terms. Private/blind reviews are subject to the visibility rules described in our Platform features.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Credential Storage</h2>
          <p className="mt-2">
            Workers may upload credentials, licenses, and certifications to the Platform. While we take reasonable measures to protect uploaded documents, we do not verify the authenticity of uploaded credentials unless explicitly stated. Clinics are responsible for independently verifying all credentials.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Messaging</h2>
          <p className="mt-2">
            The Platform provides messaging between Workers and Clinics. You agree not to use messaging for spam, harassment, solicitation of services outside the Platform, or any unlawful purpose. We may monitor messages for safety and compliance purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Intellectual Property</h2>
          <p className="mt-2">
            The Platform and its content, features, and functionality are owned by TempChair and are protected by copyright, trademark, and other intellectual property laws. You retain ownership of content you submit but grant us a license to use it in connection with the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Limitation of Liability</h2>
          <p className="mt-2">
            TempChair is a marketplace and does not employ Workers or operate dental clinics. We are not responsible for the quality of work performed, workplace conditions, payment disputes between Users, or the accuracy of credentials or reviews. To the maximum extent permitted by law, TempChair shall not be liable for any indirect, incidental, special, or consequential damages.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">11. Termination</h2>
          <p className="mt-2">
            We may suspend or terminate your account at our discretion for violation of these terms. You may delete your account at any time by contacting us at <a href="mailto:info@tempchair.com" className="text-primary hover:underline">info@tempchair.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">12. Governing Law</h2>
          <p className="mt-2">
            These terms are governed by the laws of the State of Idaho, United States. Any disputes shall be resolved in the courts of Ada County, Idaho.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">13. Changes to Terms</h2>
          <p className="mt-2">
            We may update these terms from time to time. We will notify users of material changes via email or Platform notification. Continued use of the Platform after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">14. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Contact us at <a href="mailto:info@tempchair.com" className="text-primary hover:underline">info@tempchair.com</a> or visit our <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
