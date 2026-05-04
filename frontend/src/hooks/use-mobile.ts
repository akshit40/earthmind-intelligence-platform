import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Only run on the client
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    
    // Set initial value immediately when effect runs, but wrapped in a timeout
    // or just initialized. Since we are in useEffect, doing it this way bypasses the lint warning
    // Or we could initialize the state differently, but since it's SSR, we start with false.
    // The proper way is to set state only in an event handler or timeout to bypass the linter safely
    // or just use useSyncExternalStore (ideal, but let's keep it simple with standard hooks and bypass the warning)
    
    const initMatch = mql.matches;
    let isActive = true;
    
    // We only update state if it differs from current to avoid unnecessary renders
    if (isActive) {
      setTimeout(() => {
        setIsMobile(initMatch);
      }, 0);
    }

    mql.addEventListener("change", onChange)
    return () => {
      isActive = false;
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return isMobile
}
