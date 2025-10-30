
import React from 'react';

interface ImageContainerProps {
  title: string;
  imageUrl?: string | null;
  placeholderText: string;
  children?: React.ReactNode;
}

const ImageContainer: React.FC<ImageContainerProps> = ({ title, imageUrl, placeholderText, children }) => {
  return (
    <div className="flex flex-col items-center w-full h-full p-4 bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-gray-300 mb-4">{title}</h2>
      <div className="relative w-full aspect-square flex items-center justify-center bg-gray-900/70 rounded-lg overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="object-contain w-full h-full" />
        ) : children ? (
          children
        ) : (
          <div className="text-center text-gray-500 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2">{placeholderText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageContainer;
