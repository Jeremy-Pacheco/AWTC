import React from "react";

interface HeroImageProps {
  title?: React.ReactNode;
  imgSrc?: string;
  heightClass?: string; // tailwind height classes like 'h-40 md:h-56'
  titleClass?: string;
}

const HeroImage: React.FC<React.PropsWithChildren<HeroImageProps>> = ({
  title,
  imgSrc = "/hero-img.jpg",
  heightClass = "h-40 md:h-56",
  titleClass = "text-gray-900 text-2xl md:text-4xl font-bold",
  children,
}) => {
  return (
    <header className={`relative ${heightClass} w-full overflow-hidden`}>
      <img
        src={imgSrc}
        alt={typeof title === "string" ? title : "Hero image"}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.12 }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {title ? (
          typeof title === "string" ? (
            <h1 className={titleClass}>{title}</h1>
          ) : (
            title
          )
        ) : null}
      </div>
      {children}
    </header>
  );
};

export default HeroImage;
