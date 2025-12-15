import { useTranslation } from "react-i18next";
import HeroImage from "../components/HeroImage";
import VolunteerList from "../components/VolunteerList";

function MoreInfo() {
  const { t } = useTranslation();

  return (
    <>
      <HeroImage
        title={<h1 className="Display">{t('moreInfo.heroTitle')}</h1>}
        imgSrc="/hero-img.jpg"
        heightClass="h-64 md:h-96"
      />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold">{t('moreInfo.exploreTitle')}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('moreInfo.exploreSubtitle')}
          </p>
        </div>
        <VolunteerList />
      </main>
    </>
  );
}

export default MoreInfo;
