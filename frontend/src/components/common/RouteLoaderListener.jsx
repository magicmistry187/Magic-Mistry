import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageLoader from './PageLoader';

export default function RouteLoaderListener({ children }) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip loader trigger on very first page load since Suspense / initial render handles it
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450); // 450ms smooth transition delay

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="route-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PageLoader label="Loading page..." />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
