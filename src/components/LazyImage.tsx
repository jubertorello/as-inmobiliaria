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
  const [error, setError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(src || '');
  const [retries, setRetries] = React.useState(0);

  const loadedRef = React.useRef(false);
  const errorRef = React.useRef(false);
  const retriesRef = React.useRef(0);
  const triedFallbackRef = React.useRef(false);

  // Sync refs with state
  React.useEffect(() => {
    loadedRef.current = loaded;
  }, [loaded]);

  React.useEffect(() => {
    errorRef.current = error;
  }, [error]);

  React.useEffect(() => {
    retriesRef.current = retries;
  }, [retries]);

  React.useEffect(() => {
    setLoaded(false);
    setError(false);
    setCurrentSrc(src || '');
    setRetries(0);
    triedFallbackRef.current = false;

    // Check if image is already cached/loaded
    if (src) {
      const img = new Image();
      img.src = src;

      // If image is already complete (cached), mark as loaded immediately
      if (img.complete && img.naturalWidth > 0) {
        setLoaded(true);
        return;
      }
    }

    // Only show loading spinner after a small delay to avoid flash for fast-loading images
    const showSpinnerTimer = setTimeout(() => {
      if (!loadedRef.current && !errorRef.current) {
        // Spinner will show now (component will re-render with loaded=false)
      }
    }, 100);

    const timer = setTimeout(() => {
      if (!loadedRef.current && !errorRef.current) {
        // Use a functional update style or check the latest ref
        onError();
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(showSpinnerTimer);
    };
  }, [src]);

  const onError = () => {
    // Automatic retry once - check the latest ref
    if (retriesRef.current < 1 && src) {
      setRetries(prev => prev + 1);
      const separator = src.includes('?') ? '&' : '?';
      setCurrentSrc(`${src}${separator}retry=${Date.now()}`);
      return;
    }

    if (fallbackSrc && !triedFallbackRef.current) {
      triedFallbackRef.current = true;
      setLoaded(false);
      setError(false);
      setCurrentSrc(fallbackSrc);
      return;
    }
    setError(true);
    setLoaded(true);
  };

  const onLoad = () => {
    setLoaded(true);
    setError(false);
  };

  const showImg = Boolean(currentSrc) && !error;

  // Only position the wrapper ourselves if the caller didn't: otherwise Tailwind's
  // `.relative` rule wins over the `absolute inset-0` passed in, the wrapper collapses
  // to auto height and the inner `h-full` image falls back to its natural size.
  const hasPosition = /(^|\s)(absolute|fixed|sticky|relative)(\s|$)/.test(className || '');

  return (
    <div className={`${hasPosition ? '' : 'relative'} overflow-hidden ${className || ''}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-brand-pink rounded-full animate-spin" />
        </div>
      )}

      {showImg ? (
        <img
          src={currentSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          className={`${imgClassName || ''} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={onLoad}
          onError={onError}
        />
      ) : (
        <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center text-gray-300">
          <span className="material-symbols-outlined text-5xl opacity-60">hide_image</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2">No disponible</span>
          <button
            onClick={() => {
              setLoaded(false);
              setError(false);
              setCurrentSrc(`${src}?r=${Date.now()}`); // Force reload
            }}
            className="mt-4 px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-100 hover:text-brand-pink transition-colors"
          >
            Recargar
          </button>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
