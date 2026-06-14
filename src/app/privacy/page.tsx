import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 14, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
          <p className="mt-2">
            TempChair (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at tempchair.com (&quot;the Platform&quot;).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
          <h3 className="mt-3 font-medium text-foreground">Information You Provide:</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Account information:</strong> Name, email address, password, role (worker or clinic).</li>
            <li><strong>Profile information:</strong> Specialty, location, bio, experience, hourly rate, availability, certifications (for workers). Clinic name, contact name, address, phone, description (for clinics).</li>
            <li><strong>Credentials:</strong> Professional licenses, certifications, and supporting documents you upload.</li>
            <li><strong>Job postings:</strong> Position details, dates, hours, pay rates, descriptions.</li>
            <li><strong>Applications:</strong> Cover notes, application status.</li>
            <li><strong>Messages:</strong> Content of messages between workers and clinics.</li>
            <li><strong>Reviews:</strong> Ratings, comments, and visibility preferences (public or private).</li>
          </ul>
          <h3 className="mt-3 font-medium text-foreground">Information Collected Automatically:</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Usage data:</strong> Pages visited, features used, timestamps.</li>
            <li><strong>Device information:</strong> Browser type, operating system, IP address.</li>
            <li><strong>Cookies:</strong> Authentication session cookies required for the Platform to function.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>To create and manage your account.</li>
            <li>To display your profile to other users as appropriate for your role.</li>
            <li>To facilitate job posting, applications, and matching between workers and clinics.</li>
            <li>To enable messaging between workers and clinics.</li>
            <li>To send email notifications about messages, applications, and account activity.</li>
            <li>To calculate and display ratings and reviews.</li>
            <li>To provide market rate insights to premium clinics (aggregated, anonymized data).</li>
            <li>To securely store and share credentials when authorized.</li>
            <li>To improve the Platform and develop new features.</li>
            <li>To respond to your inquiries and provide support.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. How We Share Your Information</h2>
          <p className="mt-2">We do not sell your personal information. We share information in these limited circumstances:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Between users:</strong> Worker profiles are visible to clinics. Clinic profiles are visible to workers. Credential documents are shared only with clinics that have accepted a worker&apos;s application.</li>
            <li><strong>Private reviews:</strong> Private worker reviews of clinics are visible to other workers. Private clinic reviews of workers are visible only to other premium-tier clinics.</li>
            <li><strong>Service providers:</strong> We use Supabase (database and authentication), Vercel (hosting), and Resend (email notifications) to operate the Platform. These providers process data on our behalf under their respective privacy policies.</li>
            <li><strong>Legal requirements:</strong> We may disclose information if required by law, court order, or government request.</li>
            <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Data Storage and Security</h2>
          <p className="mt-2">
            Your data is stored on secure servers provided by Supabase (PostgreSQL database) hosted in the United States. Credential documents are stored in encrypted cloud storage. We use industry-standard security measures including HTTPS encryption, secure authentication tokens, and access controls. However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
          <p className="mt-2">You have the right to:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Access</strong> your personal information stored on the Platform.</li>
            <li><strong>Update</strong> your profile and account information at any time.</li>
            <li><strong>Delete</strong> your uploaded credentials.</li>
            <li><strong>Request deletion</strong> of your account and associated data by contacting us.</li>
            <li><strong>Opt out</strong> of non-essential email notifications (feature coming soon).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Cookies</h2>
          <p className="mt-2">
            We use essential cookies for authentication and session management. These cookies are necessary for the Platform to function and cannot be disabled. We do not currently use advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Children&apos;s Privacy</h2>
          <p className="mt-2">
            The Platform is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. We will notify users of material changes via email or Platform notification. The &quot;Last updated&quot; date at the top indicates the most recent revision.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Contact Us</h2>
          <p className="mt-2">
            If you have questions about this Privacy Policy or your data, contact us at <a href="mailto:info@tempchair.com" className="text-primary hover:underline">info@tempchair.com</a> or visit our <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
