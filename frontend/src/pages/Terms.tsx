import React from "react";
import HeaderImg from "../assets/awtc-logo.png";
import PolicySection from "../components/PolicySection";

const Terms: React.FC = () => {
  return (
    <div className="min-h-[80vh]">
      <header className="relative h-40 md:h-56 w-full overflow-hidden">
        <img
          src={HeaderImg}
          alt="Terms and Conditions"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.12 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-gray-900 text-2xl md:text-4xl font-bold">Terms & Conditions</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <PolicySection title="Acceptance of Terms">
          <p>
            By accessing and using A Will To Change (AWTC), you agree to be bound by these
            Terms and Conditions. If you do not agree, please do not use our services.
          </p>
        </PolicySection>

        <PolicySection title="Using the Service">
          <p>
            You may use the platform to browse and participate in volunteering projects. You
            agree not to misuse the service, to provide accurate information, and to comply with
            applicable laws and the rules set by individual projects.
          </p>
        </PolicySection>

        <PolicySection title="Accounts and Registration">
          <p>
            Some parts of the service require an account. You are responsible for maintaining the
            confidentiality of your account credentials and for any activity under your account.
          </p>
        </PolicySection>

        <PolicySection title="Intellectual Property">
          <p>
            All content on this site is owned or licensed by AWTC. You may not reproduce or
            distribute materials from the site without permission, except for personal, non-
            commercial use.
          </p>
        </PolicySection>

        <PolicySection title="Limitation of Liability">
          <p>
            AWTC is provided "as is" and we are not liable for indirect or consequential damages.
            We strive to ensure accuracy but do not guarantee completeness or suitability.
          </p>
        </PolicySection>

        <PolicySection title="Termination">
          <p>
            We may suspend or terminate access to the service for violations of these terms or
            for other reasons at our discretion.
          </p>
        </PolicySection>

        <PolicySection title="Governing Law">
          <p>
            These terms are governed by the laws of the jurisdiction where AWTC is operated.
          </p>
        </PolicySection>

        <PolicySection title="Contact">
          <p>
            For questions about these Terms, contact us at <a href="mailto:info@awtc.example">info@awtc.es</a>.
          </p>
        </PolicySection>
      </main>
    </div>
  );
};

export default Terms;
