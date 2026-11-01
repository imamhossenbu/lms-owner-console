"use client";

import { useLayoutEffect, type RefObject } from "react";

/**
 * Keeps an absolutely-positioned popover (dropdown, date picker, menu) fully inside the viewport horizontally:
 * when it would spill past the left/right edge it is nudged back with the CSS `translate` property (separate from
 * framer-motion's `transform`, so open/close animations keep working) and its width is capped to the viewport.
 * Measures layout boxes (offsetLeft / offsetWidth), so the initial scale animation doesn't skew the result.
 *
 *   const panelRef = useRef<HTMLDivElement>(null);
 *   useViewportFit(open, panelRef);
 */
export function useViewportFit(open: boolean, panelRef: RefObject<HTMLElement | null>, margin = 12) {
  useLayoutEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    if (!el) return;

    const fit = () => {
      const vw = document.documentElement.clientWidth;
      el.style.maxWidth = `${Math.max(0, vw - margin * 2)}px`;
      const parent = el.offsetParent as HTMLElement | null;
      const left = (parent ? parent.getBoundingClientRect().left : 0) + el.offsetLeft;
      const width = el.offsetWidth;
      let shift = 0;
      if (left + width > vw - margin) shift = vw - margin - width - left;
      if (left + shift < margin) shift = margin - left;
      el.style.translate = shift ? `${Math.round(shift)}px 0` : "";
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [open, panelRef, margin]);
}
