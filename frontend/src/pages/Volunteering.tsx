import Projects from "../components/Projects";
import Categories from "../components/Categories";

function Volunteering() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Volunteering</h1>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Proyectos</h2>
        <Projects />
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-2">Categorías</h2>
        <Categories />
      </section>
    </div>
  );
}

export default Volunteering;
