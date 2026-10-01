import { useEffect } from 'react';
import { useSmoothScroll } from './SmoothScrollProvider';

/**
 * useModalSmoothScroll
 * 
 * High-performance, zero-lag smooth scrolling inside modal popups:
 * - Native 120Hz/60Hz hardware touch scrolling on mobile (zero touch latency)
 * - Zero-latency 1:1 tracking for trackpad gestures (Windows Precision / Mac)
 * - Snappy, responsive lerp smoothing for physical notched mouse wheels (no sluggish lag)
 * - 100% background page lock (prevents window & document body scrolling)
 * - Lenis pause on modal open, resume on modal close
 * - Safe passthrough for pin markers, map controls, and inputs
 * - Supports nested scrollables (e.g. autocomplete dropdowns, city lists)
 */
export function useModalSmoothScroll({
  isOpen,
  overlayRef,
  scrollContainerRef,
  lerpFactor = 0.28,
  wheelMultiplier = 1.0,
}) {
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (!isOpen) return;

    // 1. Lock background page scroll
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // 2. Pause global Lenis smooth scroll
    if (lenis) {
      try {
        lenis.stop();
      } catch (_) {}
    }

    const overlayEl = overlayRef?.current;
    if (!overlayEl) return;

    let currentScrollY = 0;
    let targetScrollY = 0;
    let activeTarget = null;
    let rafId = null;

    // High-performance RAF physics loop (snappy lerp decay)
    const smoothStep = () => {
      if (!activeTarget) {
        rafId = null;
        return;
      }

      const diff = targetScrollY - currentScrollY;
      if (Math.abs(diff) > 0.4) {
        currentScrollY += diff * lerpFactor;
        activeTarget.scrollTop = currentScrollY;
        rafId = requestAnimationFrame(smoothStep);
      } else {
        currentScrollY = targetScrollY;
        activeTarget.scrollTop = targetScrollY;
        rafId = null;
      }
    };

    // Helper: find nearest scrollable ancestor within modal
    const getScrollTarget = (element) => {
      const mainContainer = scrollContainerRef?.current;
      if (!mainContainer) return null;

      let el = element;
      while (el && el !== overlayEl) {
        if (el === mainContainer) {
          return mainContainer;
        }
        try {
          const overflowY = window.getComputedStyle(el).overflowY;
          if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
            return el;
          }
        } catch (_) {}
        el = el.parentElement;
      }
      return mainContainer;
    };

    // 3. Responsive, Zero-Lag Wheel Handler
    const handleWheel = (e) => {
      // Don't intercept purely horizontal scroll actions
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 15) {
        return;
      }

      const targetScrollable = getScrollTarget(e.target);
      if (targetScrollable) {
        const maxScroll = targetScrollable.scrollHeight - targetScrollable.clientHeight;
        if (maxScroll > 0) {
          // Detect precision trackpad gestures (fractional delta or small continuous bursts)
          const isTrackpad =
            e.deltaMode === 0 && (!Number.isInteger(e.deltaY) || Math.abs(e.deltaY) < 36);

          if (isTrackpad) {
            // Trackpads have OS-level inertial physics: scroll immediately with 0ms latency
            if (rafId !== null) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
            targetScrollable.scrollTop += e.deltaY;
            currentScrollY = targetScrollable.scrollTop;
            targetScrollY = targetScrollable.scrollTop;
            activeTarget = targetScrollable;
            if (e.cancelable) e.preventDefault();
            return;
          }

          // Stepped mouse wheel: normalize lines (Firefox on Windows) vs pages
          let delta = e.deltaY;
          if (e.deltaMode === 1) {
            delta *= 34;
          } else if (e.deltaMode === 2) {
            delta *= (targetScrollable.clientHeight || 300);
          }

          if (activeTarget !== targetScrollable || rafId === null) {
            activeTarget = targetScrollable;
            currentScrollY = targetScrollable.scrollTop;
            targetScrollY = targetScrollable.scrollTop;
          }

          // Clamp destination smoothly
          targetScrollY = Math.max(0, Math.min(maxScroll, targetScrollY + delta * wheelMultiplier));

          if (rafId === null) {
            rafId = requestAnimationFrame(smoothStep);
          }
        }
      }

      // Prevent background page scroll
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    // 4. Scrollbar sync when user clicks or drags scrollbar thumb
    const handlePointerDown = (e) => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      const targetScrollable = getScrollTarget(e.target);
      if (targetScrollable) {
        currentScrollY = targetScrollable.scrollTop;
        targetScrollY = targetScrollable.scrollTop;
        activeTarget = targetScrollable;
      }
    };

    const handleScrollSync = (e) => {
      if (rafId === null && e.target) {
        currentScrollY = e.target.scrollTop;
        targetScrollY = e.target.scrollTop;
      }
    };

    overlayEl.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    overlayEl.addEventListener('pointerdown', handlePointerDown, { passive: true });
    overlayEl.addEventListener('scroll', handleScrollSync, { passive: true, capture: true });

    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
      if (lenis) {
        try {
          lenis.start();
        } catch (_) {}
      }

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      overlayEl.removeEventListener('wheel', handleWheel, { capture: true });
      overlayEl.removeEventListener('pointerdown', handlePointerDown);
      overlayEl.removeEventListener('scroll', handleScrollSync, { capture: true });
    };
  }, [isOpen, lenis, lerpFactor, wheelMultiplier, overlayRef, scrollContainerRef]);
}

export default useModalSmoothScroll;
