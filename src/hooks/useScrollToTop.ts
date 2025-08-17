import { useEffect } from "react";

export const useScrollToTop = (dependencies: any[] = []) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, dependencies);
};
