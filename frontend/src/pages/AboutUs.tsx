import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HeroImage from "../components/HeroImage";
import AlertModal from "../components/AlertModal";

const AboutUs: React.FC = () => {
  const { t } = useTranslation();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  const handleBecomeVolunteer = () => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      // User is logged in, go to volunteering page
      navigate("/volunteering");
    } else {
      // User is not logged in, open signup modal
      window.dispatchEvent(new CustomEvent("openAuthModal", { detail: { mode: "signup" } }));
    }
  };

  useEffect(() => {
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="min-h-[80vh] bg-white dark:bg-[var(--bg-primary)]">
      <HeroImage title={<h1 className="Display">{t('common.appName')}</h1>} imgSrc="/hero-img.jpg" heightClass="h-64 md:h-96" />

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* About Us */}
        <section>
          <h2 className="text-3xl font-bold mb-6">{t('aboutUs.title')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <img
              src="/aboutUs/aboutUs.jpg"
              alt="About AWTC"
              className="w-full h-64 md:h-72 object-cover rounded-lg order-1 md:order-2"
              style={{ objectPosition: "center 20%" }}
            />

            <div className="order-2 md:order-1 flex flex-col justify-center">
              <p className="mb-4 text-justify leading-relaxed">
                {t('aboutUs.description1')}
              </p>
              <p className="text-justify leading-relaxed">
                {t('aboutUs.description2')}
              </p>
            </div>
          </div>
        </section>

        {/* Our mission */}
        <section>
          <h2 className="text-3xl font-bold mb-6">{t('aboutUs.missionTitle')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <img
              src="/aboutUs/mision.jpg"
              alt="Our mission"
              className="w-full h-64 md:h-72 object-cover rounded-lg"
            />

            <div className="flex flex-col justify-center">
              <p className="mb-4 text-justify leading-relaxed">
                {t('aboutUs.missionDescription1')}
              </p>
              <p className="text-justify leading-relaxed">
                {t('aboutUs.missionDescription2')}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Wanna join our team (styled same as Contact us) */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <section className="bg-white dark:bg-[var(--card-bg)] p-8 rounded-xl shadow-xl dark:shadow-2xl dark:shadow-black/30 border border-gray-100 dark:border-gray-700 text-center">
          <h2 className="text-3xl font-bold mb-6">{t('aboutUs.joinTeamTitle')}</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            {t('aboutUs.joinTeamDescription')}
          </p>
          <button
            onClick={handleBecomeVolunteer}
            className="inline-block bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-6 py-2 rounded-3xl font-semibold shadow transition"
          >
            {t('aboutUs.becomeVolunteer')}
          </button>
        </section>

        {/* Contact us */}
        <section id="contact-section" className="bg-white dark:bg-[var(--card-bg)] p-8 rounded-xl mt-8 shadow-xl dark:shadow-2xl dark:shadow-black/30 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black dark:text-white">{t('aboutUs.contactTitle')}</h2>

          <div className="w-full">
            <form
              onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  const body = Object.fromEntries(formData as any);

                  try {
                    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                    const res = await fetch(`${apiBase}/api/contacts`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(body),
                    });

                    if (!res.ok) {
                      const text = await res.text();
                      throw new Error(text || res.statusText || 'Network error');
                    }
                    setAlertMessage(t('aboutUs.messageSent'));
                    setAlertOpen(true);
                    form.reset();
                  } catch (err: any) {
                    setAlertMessage(t('aboutUs.messageFailed') + (err.message || err));
                    setAlertOpen(true);
                  }
                }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
            >
              <input
                name="name"
                placeholder={t('aboutUs.namePlaceholder')}
                className="w-full pl-3 pr-3 py-2 bg-white dark:bg-[var(--bg-secondary)] border border-[#767676] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-black dark:text-white"
                required
              />

              <input
                name="email"
                type="email"
                placeholder={t('aboutUs.emailPlaceholder')}
                className="w-full pl-3 pr-3 py-2 bg-white dark:bg-[var(--bg-secondary)] border border-[#767676] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-black dark:text-white"
                required
              />

              <input
                name="subject"
                placeholder={t('aboutUs.subjectPlaceholder')}
                className="w-full md:col-span-2 pl-3 pr-3 py-2 bg-white dark:bg-[var(--bg-secondary)] border border-[#767676] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-black dark:text-white"
              />

              <textarea
                name="message"
                placeholder={t('aboutUs.messagePlaceholder')}
                className="w-full md:col-span-2 pl-3 pr-3 py-2 bg-white dark:bg-[var(--bg-secondary)] border border-[#767676] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none h-40 resize-y text-black dark:text-white"
                required
              />

              <div className="md:col-span-2 text-right">
                <button
                  type="submit"
                  className="inline-block bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-6 py-2 rounded-3xl font-semibold shadow transition"
                >
                  {t('aboutUs.sendMessage')}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <AlertModal open={alertOpen} message={alertMessage} onAccept={() => setAlertOpen(false)} />
    </div>
  );
};

export default AboutUs;
