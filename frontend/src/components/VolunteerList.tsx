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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function VolunteerList() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/external/volunteering`)
      .then((response) => {
        if (!response.ok) throw new Error("HTTP error: " + response.status);
        return response.json();
      })
      .then((data) => {
        setOpportunities(data.results || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center py-16">
        <ThreeDots height={80} width={80} color="#F0BB00" visible={true} />
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-semibold">Unable to load opportunities</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    );

  if (!opportunities.length)
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-700 font-semibold">No opportunities available</p>
        <p className="text-gray-600 text-sm mt-2">Please try again later</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {opportunities.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-[var(--card-bg)] rounded-xl shadow-xl dark:shadow-2xl dark:shadow-black/30 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:scale-[1.02]"
        >
          {/* Header */}
          <div className="bg-[#1f2124] p-4 h-20 flex items-center">
            <h3 className="font-bold text-white text-lg line-clamp-2">{item.title}</h3>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-4">
            {/* Organization */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Organization</p>
              <a
                href={item.organization.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F0BB00] hover:text-[#D4A700] font-semibold text-sm hover:underline break-words"
              >
                {item.organization.name}
              </a>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-4 flex-1">
              {item.description}
            </p>

            {/* Dates if available */}
            {item.dates && (
              <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Dates:</span> {item.dates}
              </div>
            )}
          </div>

          {/* Footer with CTA */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-4 pt-3">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-4 py-2 rounded-3xl font-semibold text-sm transition-colors duration-200 w-full text-center"
            >
              View Details →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export default VolunteerList;
