/** Optional enhancement: an unavailable/failed observer leaves semantic content intact. */
export function observeIntersection(
  target: Element | null,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): IntersectionObserver | null {
  if (!target || typeof IntersectionObserver !== "function") return null;
  let observer: IntersectionObserver | undefined;
  try {
    observer = new IntersectionObserver(callback, options);
    observer.observe(target);
    return observer;
  } catch {
    observer?.disconnect();
    return null;
  }
}
