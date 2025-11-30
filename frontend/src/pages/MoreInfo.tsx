import HeroImage from "../components/HeroImage";
import VolunteerList from "../components/VolunteerList";

function MoreInfo() {
  return (
    <>
      <HeroImage
        title={<h1 className="Display">Other Volunteer Activities</h1>}
        imgSrc="/hero-img.jpg"
        heightClass="h-64 md:h-96"
      />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore More Opportunities</h2>
          <p className="text-gray-700 text-lg">
            Discover volunteer opportunities from external platforms. Find projects that match your interests and availability.
          </p>
        </div>
        <VolunteerList />
      </main>
    </>
  );
}

export default MoreInfo;
