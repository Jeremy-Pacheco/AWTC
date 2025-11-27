import React from "react";
import PolicySection from "../components/PolicySection";
import HeroImage from "../components/HeroImage";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-[80vh]">
      <HeroImage title={<h1 className="Display">Privacy Policy</h1>} imgSrc="/hero-img.jpg" heightClass="h-64 md:h-96" />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <PolicySection title="Introduction">
          <p>
            This Privacy Policy explains how A Will To Change (AWTC) collects, uses, and shares
            personal information when you use our website and services. Please read it carefully.
          </p>
        </PolicySection>

        <PolicySection title="Information We Collect">
          <p>
            We may collect information you provide directly (such as when you register, sign up
            for newsletters, or contact us) and information collected automatically (such as
            usage data and cookies).
          </p>
        </PolicySection>

        <PolicySection title="How We Use Your Information">
          <p>
            We use collected information to provide, maintain and improve our services, send
            notifications, respond to requests, and to comply with legal obligations.
          </p>
        </PolicySection>

        <PolicySection title="Cookies and Tracking Technologies">
          <p>
            We use cookies and similar technologies to personalize content, measure performance,
            and for analytics. You can control cookie preferences via your browser settings.
          </p>
        </PolicySection>

        <PolicySection title="Third-Party Services">
          <p>
            We may share information with trusted third parties that help provide services,
            including analytics providers, hosting providers, and payment processors when
            applicable.
          </p>
        </PolicySection>

        <PolicySection title="Security">
          <p>
            We implement reasonable administrative, technical, and physical safeguards to
            protect personal data, but no system is completely secure — please exercise care
            with your account credentials.
          </p>
        </PolicySection>

        <PolicySection title="Your Rights">
          <p>
            Depending on your jurisdiction, you may have the right to access, correct, or delete
            your personal information. Contact us to exercise these rights.
          </p>
        </PolicySection>

        <PolicySection title="Changes to This Policy">
          <p>
            We may update this policy occasionally. We will post changes on this page with a
            revised effective date.
          </p>
        </PolicySection>

        <PolicySection title="Contact">
          <p>
            If you have questions about this Privacy Policy, contact us at <a href="mailto:info@awtc.es">info@awtc.es</a>.
          </p>
        </PolicySection>
      </main>
    </div>
  );
};

export default Privacy;
