import React, { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarImgProps {
  src: string;
  alt: string;
  className?: string;
}

export const AvatarImg: React.FC<AvatarImgProps> = ({ src, alt, className = 'h-12 w-12 rounded-xl' }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-500 shrink-0`}
        aria-label={alt}
      >
        <User className="h-5 w-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} object-cover shrink-0 bg-gray-100`}
    />
  );
};
