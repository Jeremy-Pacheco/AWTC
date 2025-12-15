import React from "react";
import { useTranslation } from "react-i18next";
import PolicySection from "../components/PolicySection";
import HeroImage from "../components/HeroImage";

const Privacy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh]">
      <HeroImage title={<h1 className="Display">{t('privacy.heroTitle')}</h1>} imgSrc="/hero-img.jpg" heightClass="h-64 md:h-96" />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <PolicySection title={t('privacy.introductionTitle')}>
          <p>
            {t('privacy.introductionContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy.informationCollectTitle')}>
          <p>
            {t('privacy.informationCollectContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy.howWeUseTitle')}>
          <p>
            {t('privacy.howWeUseContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy.cookiesTitle')}>
          <p>
            {t('privacy.cookiesContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy.thirdPartyTitle')}>
          <p>
            {t('privacy.thirdPartyContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy.securityTitle')}>
          <p>
            {t('privacy.securityContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy.yourRightsTitle')}>
          <p>
            {t('privacy.yourRightsContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy.changesTitle')}>
          <p>
            {t('privacy.changesContent')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy.contactTitle')}>
          <p>
            {t('privacy.contactContent')} <a href="mailto:info@awtc.es">info@awtc.es</a>.
          </p>
        </PolicySection>
      </main>
    </div>
  );
};

export default Privacy;
