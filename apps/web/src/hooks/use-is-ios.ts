import { useEffect, useState } from "react";

function isIOSLike(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";

  // iOS devices (classic)
  const isiOSDevice = /\b(iPhone|iPad|iPod)\b/i.test(ua);

  // iPadOS on Desktop Mode (Macintosh UA + Touch Points)
  // Double check both 'Macintosh' UA and 'MacIntel' platform to be safe
  const isIPadOSDesktop =
    (/\bMacintosh\b/.test(ua) || platform === "MacIntel") &&
    navigator.maxTouchPoints > 1;

  return isiOSDevice || isIPadOSDesktop;
}

export function useIsIOS() {
  const [isIOS, setIsIOS] = useState<boolean | null>(null);

  useEffect(() => {
    setIsIOS(isIOSLike());
  }, []);

  return isIOS;
}
