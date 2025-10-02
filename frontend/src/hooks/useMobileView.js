import { useState, useEffect } from "react";

const useMobileView = (minwidth = 920) => {
  const [mobileView, setMobileView] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= minwidth) {
        setMobileView(false);
      } else {
        setMobileView(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return mobileView;
};

export default useMobileView;