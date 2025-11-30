import React, { useEffect, useState } from "react";
import HeroImage from "../components/HeroImage";
import AlertModal from "../components/AlertModal";

const AboutUs: React.FC = () => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const openSignup = () => {
    window.dispatchEvent(new CustomEvent("openAuthModal", { detail: { mode: "signup" } }));
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
    <div className="min-h-[80vh]">
      <HeroImage title={<h1 className="Display">A Will To Change</h1>} imgSrc="/hero-img.jpg" heightClass="h-64 md:h-96" />

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* About Us */}
        <section>
          <h2 className="text-3xl font-bold mb-6">About Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <img
              src="/aboutUs/aboutUs.jpg"
              alt="About AWTC"
              className="w-full h-64 md:h-72 object-cover rounded-lg order-1 md:order-2"
              style={{ objectPosition: "center 20%" }}
            />

            <div className="order-2 md:order-1 flex flex-col justify-center">
              <p className="mb-4 text-justify leading-relaxed">
                A Will to Change (AWTC) is a platform dedicated to enabling structured, verified
                volunteering opportunities. All projects listed within our platform are created,
                curated, and managed by our administrative team to ensure clarity, compliance, and
                community relevance.
              </p>
              <p className="text-justify leading-relaxed">
                Our goal is to make volunteering accessible, well-defined,
                and aligned with real needs so that participants can contribute with confidence
                and purpose. We believe that meaningful change happens when opportunities are clear,
                achievable, and supported by a trusted community.
              </p>
            </div>
          </div>
        </section>

        {/* Our mission */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Our mission</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <img
              src="/aboutUs/mision.jpg"
              alt="Our mission"
              className="w-full h-64 md:h-72 object-cover rounded-lg"
            />

            <div className="flex flex-col justify-center">
              <p className="mb-4 text-justify leading-relaxed">
                Our mission is to reduce the friction between willingness and action by designing
                volunteer projects that are transparent, feasible, and outcome-oriented. We
                believe that when people are given clear pathways to contribute, positive impact
                scales one decision, one hour, and one project at a time.
              </p>
              <p className="text-justify leading-relaxed">
                Through AWTC, we empower individuals to become agents of change in their communities,
                guided by our core values of transparency, accessibility, and measurable impact.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Wanna join our team (styled same as Contact us) */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <section className="bg-white p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-6">Wanna join our team?</h2>
          <p className="mb-6 text-gray-700">
            Become part of AWTC and contribute to projects that create real, measurable
            impact. Your time matters — and change begins when you decide to take action.
          </p>
          <button
            onClick={openSignup}
            className="inline-block bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-6 py-2 rounded-3xl font-semibold shadow transition"
          >
            Become a volunteer today
          </button>
        </section>

        {/* Contact us */}
        <section id="contact-section" className="bg-white p-8 rounded-lg mt-8 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black">Contact us</h2>

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
                    setAlertMessage('Your message has been sent successfully. Our team will get back to you shortly.');
                    setAlertOpen(true);
                    form.reset();
                  } catch (err: any) {
                    setAlertMessage('Failed to send message: ' + (err.message || err));
                    setAlertOpen(true);
                  }
                }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
            >
              <input
                name="name"
                placeholder="Name"
                className="w-full pl-3 pr-3 py-2 bg-white border border-[#767676] rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-black"
                required
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full pl-3 pr-3 py-2 bg-white border border-[#767676] rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-black"
                required
              />

              <input
                name="subject"
                placeholder="Subject"
                className="w-full md:col-span-2 pl-3 pr-3 py-2 bg-white border border-[#767676] rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-black"
              />

              <textarea
                name="message"
                placeholder="Message"
                className="w-full md:col-span-2 pl-3 pr-3 py-2 bg-white border border-[#767676] rounded-lg focus:ring-2 focus:ring-blue-400 outline-none h-40 resize-y text-black"
                required
              />

              <div className="md:col-span-2 text-right">
                <button
                  type="submit"
                  className="inline-block bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-6 py-2 rounded-3xl font-semibold shadow transition"
                >
                  Send message
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
