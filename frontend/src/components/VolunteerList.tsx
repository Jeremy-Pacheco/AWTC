import { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";

type Opportunity = {
  id: number;
  title: string;
  description: string;
  url: string;
  organization: {
    name: string;
    url: string;
    logo?: string;
  };
  dates?: string;
};

function VolunteerList() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://www.volunteerconnector.org/api/search/")
      .then((response) => {
        if (!response.ok) throw new Error("HTTP error: " + response.status);
        return response.json();
      })
      .then((data) => {
        setOpportunities(data.results || []);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!opportunities.length)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}
      >
        <ThreeDots height={64} width={64} color="#000000" visible={true} />
        <span style={{ marginTop: "12px", color: "#222" }}>
        </span>
      </div>
    );

  return (
    <div>
      {opportunities.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #eee",
            marginBottom: 24,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>{item.title}</h2>
          <p>
            <b>Organización:</b>{" "}
            <a
              href={item.organization.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.organization.name}
            </a>
          </p>
          <p>{item.description}</p>
          {item.dates && (
            <p>
              <b>Fechas:</b> {item.dates}
            </p>
          )}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1867c0" }}
          >
            Detalle &gt;
          </a>
        </div>
      ))}
    </div>
  );
}

export default VolunteerList;
