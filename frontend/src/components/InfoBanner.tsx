import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const InfoBanner = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  // Check localStorage on mount to see if user closed the banner before
  useEffect(() => {
    const bannerClosed = localStorage.getItem('infoBannerClosed');
    if (bannerClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('infoBannerClosed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-yellow-400 dark:bg-yellow-500 border-b border-yellow-500 dark:border-yellow-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <svg 
              className="w-5 h-5 text-gray-800 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="text-sm font-medium text-gray-800">
              {t('common.infoBanner')}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-4 p-1 rounded-md hover:bg-yellow-500 dark:hover:bg-yellow-600 transition-colors duration-200"
            aria-label="Close banner"
          >
            <svg 
              className="w-5 h-5 text-gray-800" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;
