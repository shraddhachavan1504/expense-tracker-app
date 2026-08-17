/**
 * hooks/use-auto-scroll.ts
 *
 * The mentor tip calls this out specifically: pin to bottom only
 * while the user is ALREADY at the bottom, and release the pin the
 * moment they scroll up — even mid-stream. This hook is the whole
 * fix, isolated so it can be tested/reasoned about on its own.
 */

import { useEffect, useRef, useState, useCallback } from "react";

// How close to the bottom (in px) still counts as "at the bottom".
// A few px of slack avoids fighting sub-pixel scroll rounding.
const BOTTOM_THRESHOLD = 32;

export function useAutoScroll<T extends HTMLElement>(dependency: unknown) {
  const containerRef = useRef<T | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const checkIsAtBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceFromBottom <= BOTTOM_THRESHOLD;
  }, []);

  // Any user scroll updates whether we're "pinned" — this is what
  // lets someone scroll up mid-stream and have it actually stick,
  // instead of being yanked back down on the next token.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => setIsAtBottom(checkIsAtBottom());
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [checkIsAtBottom]);

  // Only auto-scroll on new content (dependency changes) if we were
  // already pinned to the bottom. This runs on every streamed token
  // when `dependency` is the message text, which is what makes
  // "smooth follow" work without a re-render fight.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isAtBottom) return;
    el.scrollTop = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency, isAtBottom]);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setIsAtBottom(true);
  }, []);

  return { containerRef, isAtBottom, scrollToBottom };
}