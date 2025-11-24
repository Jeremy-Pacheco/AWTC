import React from "react";
import HeroImage from "../components/HeroImage";
import Logo from "../assets/awtc-logo.png";

const AboutUs: React.FC = () => {
  const openSignup = () => {
    window.dispatchEvent(new CustomEvent("openAuthModal", { detail: { mode: "signup" } }));
  };

  return (
    <div className="min-h-[80vh]">
      <HeroImage title={<h1 className="Display">A Will To Change</h1>} imgSrc="/hero-img.jpg" heightClass="h-64 md:h-96" />

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* About Us */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">About Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <img
              src={Logo}
              alt="About AWTC"
              className="w-full h-64 md:h-80 object-cover rounded-lg order-1 md:order-2"
            />

            <div className="order-2 md:order-1">
              <p className="mb-4">
                A Will to Change (AWTC) is a platform dedicated to enabling structured, verified
                volunteering opportunities. All projects listed within our platform are created,
                curated, and managed by our administrative team to ensure clarity, compliance, and
                community relevance. Our goal is to make volunteering accessible, well-defined,
                and aligned with real needs — so that participants can contribute with confidence
                and purpose.
              </p>
            </div>
          </div>
        </section>

        {/* Our mission */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Our mission</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <img
              src={Logo}
              alt="Our mission"
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />

            <div>
              <p>
                Our mission is to reduce the friction between willingness and action by designing
                volunteer projects that are transparent, feasible, and outcome-oriented. We
                believe that when people are given clear pathways to contribute, positive impact
                scales — one decision, one hour, and one project at a time.
              </p>
            </div>
          </div>
  </section>
      </main>

      {/* Wanna join our team (styled same as Contact us) */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <section className="bg-white p-8 rounded-lg text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Wanna join our team?</h2>
          <p className="mb-6 text-gray-700">
            Become part of AWTC and contribute to projects that create real, measurable
            impact. Your time matters — and change begins when you decide to take action.
          </p>
          <button
            onClick={openSignup}
            className="inline-block bg-[#F0BB00] text-black px-6 py-2 rounded-md hover:bg-[#C68900] transition font-semibold"
          >
            Become a volunteer today
          </button>
        </section>

        {/* Contact us */}
        <section className="bg-[#F5F1E3] p-8 rounded-lg mt-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Contact us</h2>

          <div className="w-full">
            <form
              onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  const body = Object.fromEntries(formData as any);

                  try {
                    const apiBase = (window as any).API_BASE || 'http://localhost:8080';
                    const res = await fetch(`${apiBase}/api/contacts`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(body),
                    });

                    if (!res.ok) {
                      const text = await res.text();
                      throw new Error(text || res.statusText || 'Network error');
                    }
                    alert('Message sent — thank you!');
                    form.reset();
                  } catch (err: any) {
                    alert('Failed to send message: ' + (err.message || err));
                  }
                }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
            >
              <input
                name="name"
                placeholder="Name"
                className="w-full pl-3 pr-3 py-2 bg-white border border-[#767676] rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full pl-3 pr-3 py-2 bg-white border border-[#767676] rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />

              <input
                name="subject"
                placeholder="Subject"
                className="w-full md:col-span-2 pl-3 pr-3 py-2 bg-white border border-[#767676] rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <textarea
                name="message"
                placeholder="Message"
                className="w-full md:col-span-2 pl-3 pr-3 py-2 bg-white border border-[#767676] rounded-lg focus:ring-2 focus:ring-blue-400 outline-none h-40 resize-y"
                required
              />

              <div className="md:col-span-2 text-right">
                <button
                  type="submit"
                  className="inline-block bg-[#F0BB00] text-black px-6 py-2 rounded-md hover:bg-[#C68900] transition"
                >
                  Send message
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
