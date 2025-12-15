import React from "react";
import { useTranslation } from "react-i18next";
import PolicySection from "../components/PolicySection";
import HeroImage from "../components/HeroImage";

const Terms: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh]">
      <HeroImage title={<h1 className="Display">{t('terms.heroTitle')}</h1>} imgSrc="/hero-img.jpg" heightClass="h-64 md:h-96" />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <PolicySection title={t('terms.acceptanceTitle')}>
          <p>
            {t('terms.acceptanceContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms.usingServiceTitle')}>
          <p>
            {t('terms.usingServiceContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms.accountsTitle')}>
          <p>
            {t('terms.accountsContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms.intellectualPropertyTitle')}>
          <p>
            {t('terms.intellectualPropertyContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms.limitationTitle')}>
          <p>
            {t('terms.limitationContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms.terminationTitle')}>
          <p>
            {t('terms.terminationContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms.governingLawTitle')}>
          <p>
            {t('terms.governingLawContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms.contactTitle')}>
          <p>
            {t('terms.contactContent')} <a href="mailto:info@awtc.example">info@awtc.es</a>.
          </p>
        </PolicySection>
      </main>
    </div>
  );
};

export default Terms;
