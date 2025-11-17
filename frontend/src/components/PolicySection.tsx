import React from "react";

interface PolicySectionProps {
	title: string;
	id?: string;
}

const PolicySection: React.FC<React.PropsWithChildren<PolicySectionProps>> = ({ title, id, children }) => {
	return (
		<section id={id} className="mb-8">
			<h4 className="mb-4">{title}</h4>
			<div className="prose max-w-none text-gray-700">{children}</div>
		</section>
	);
};

export default PolicySection;

