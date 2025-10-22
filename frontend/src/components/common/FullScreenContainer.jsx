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
        <div className={`md:h-[100dvh] w-[100dvw] flex justify-center items-center`} style={{ backgroundImage: `url("/icon.jpeg")`, 
        ...(isMobile && {height:`${height}px`})
        }}>
            {children}
        </div>
    )
}
