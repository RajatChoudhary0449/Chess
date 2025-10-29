import { useEffect, useState } from 'react'
import useMobileView from "../../hooks/useMobileView"
export default function FullScreenContainer({ children }) {
    const [height, setHeight] = useState(window.innerHeight);
    useEffect(() => {
        const handleResize = () => setHeight(window.innerHeight);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const isMobile=useMobileView();
    return (
        <div className={`md:h-[100dvh] w-[100%] max-w-[100vw] flex justify-center items-center`} style={{ backgroundImage: `url("/icon.jpeg")`, 
        ...(isMobile && {minHeight:`${height}px`})
        }}>
            {children}
        </div>
    )
}
