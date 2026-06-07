import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const action = useNavigationType();

    useEffect(() => {
        // Skip scroll to top if returning to properties page from a detail page
        if (pathname === '/propiedades' && sessionStorage.getItem('from_detail_page') === 'true') {
            return;
        }
        // Let the browser handle scroll restoration for back/forward navigation
        if (action === 'POP') {
            return;
        }
        
        // Use a slight timeout to ensure DOM layout is ready before scrolling
        setTimeout(() => window.scrollTo(0, 0), 0);
    }, [pathname, action]);

    return null;
};

export default ScrollToTop;
