import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component automatically scrolls the window to the top (0, 0)
 * whenever the route path changes or page navigation/reload occurs.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Ensure browser opens pages at the top on reload as well
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Instant scroll to top on page navigation
    });
  }, [pathname]);

  return null;
}
