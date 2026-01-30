
import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  robots?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords, image, url, robots }) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const updateMeta = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      let el = document.querySelector(isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const updateLink = (rel: string, href: string) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // SEO Básico
    if (description) {
      updateMeta('description', description);
      updateMeta('og:description', description, true);
      updateMeta('twitter:description', description);
    }

    if (keywords) {
      updateMeta('keywords', keywords);
    }

    if (robots) {
      updateMeta('robots', robots);
    } else {
      updateMeta('robots', 'index, follow');
    }

    // Social Media Tags
    if (title) {
      updateMeta('og:title', title, true);
      updateMeta('twitter:title', title);
    }

    if (image) {
      updateMeta('og:image', image, true);
      updateMeta('twitter:image', image);
    }

    if (url) {
      updateMeta('og:url', url, true);
      updateLink('canonical', url);
    } else {
      updateLink('canonical', window.location.href);
    }

    updateMeta('og:type', 'website', true);
    updateMeta('twitter:card', 'summary_large_image');

  }, [title, description, keywords, image, url, robots]);

  return null;
};

export default SEO;
