import React, { useState, useEffect, useRef } from 'react';

export default function LazyImage({
  src,
  alt = '',
  className = '',
  placeholderClassName = '',
  fallbackSrc = '/logo2.png',
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '150px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const imageSource = hasError ? fallbackSrc : src;

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Skeleton Loading Placeholder */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 bg-slate-200 animate-pulse ${placeholderClassName}`}
        />
      )}

      {isInView && (
        <img
          src={imageSource}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
}
