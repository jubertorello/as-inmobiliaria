import React from 'react';

type Props = {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  fallbackSrc?: string;
};

const LazyImage: React.FC<Props> = ({
  src,
  alt,
  className,
  imgClassName,
  loading = 'lazy',
  fallbackSrc,
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(src || '');
  const [hasError, setHasError] = React.useState(false);
  const triedFallbackRef = React.useRef(false);

  React.useEffect(() => {
    setLoaded(false);
    setHasError(false);
    setCurrentSrc(src || '');
    triedFallbackRef.current = false;
  }, [src]);

  const onError = () => {
    if (fallbackSrc && !triedFallbackRef.current) {
      triedFallbackRef.current = true;
      setLoaded(false);
      setHasError(false);
      setCurrentSrc(fallbackSrc);
      return;
    }

    // Hide the broken <img> icon and show a placeholder instead
    setHasError(true);
    setLoaded(true); // stop spinner
  };

  const showImg = Boolean(currentSrc) && !hasError;

  return (
    <div className={`relative overflow-hidden ${className || ''}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-brand-pink rounded-full animate-spin" />
        </div>
      )}

      {showImg ? (
        <img
          src={currentSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          className={`${imgClassName || ''} ${loaded ? '' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => setLoaded(true)}
          onError={onError}
        />
      ) : (
        <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center text-gray-300">
          <span className="material-symbols-outlined text-5xl opacity-60">hide_image</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;