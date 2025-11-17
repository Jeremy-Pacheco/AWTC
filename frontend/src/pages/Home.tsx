// import NavBar from "../components/NavBar";

import HeroImage from "../components/HeroImage";

function Home() {
  return (
    <>
      <HeroImage title={<span className="Display ">A Will To Change</span>} imgSrc="/hero-img.jpg" heightClass="h-64 md:h-96" titleClass="Display text-white" />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold">Welcome</h2>
        <p className="mt-4 text-gray-700">Discover volunteer projects and make an impact.</p>
      </main>
    </>
  );
}

export default Home;
