import { useNavigate } from "react-router-dom"
import one from "../assets/1pchess.jpeg"
import two from "../assets/2pchess.webp"
import InformationModal from "./InformationModal";
import useGame from "../hooks/useGame";
export default function Home() {
    const nav = useNavigate();
    const handleOnePlayerClick = () => {
        nav("/lobby/create");
    }
    const handleTwoPlayerClick = () => {
        nav("room");
    }
    const { showInfoModal, setShowInfoModal, infoMessage } = useGame();
    return (
        <div className='h-[100dvh] w-full flex justify-center items-center' style={{ backgroundImage: `url("/icon.jpeg")` }}>
            {showInfoModal && <InformationModal message={infoMessage} setShow={setShowInfoModal} />}
            <div className='h-auto bg-[#444] text-white rounded-2xl px-8 py-8 '>
                <h2 className='text-2xl'>Welcome!</h2>
                <h3 className='my-2 text-xl'>Choose the mode of play</h3>
                <div className='flex flex-col text-xl gap-y-4'>
                    <button className='hover:bg-white hover:text-[#444] font-bold border-white border px-4 py-4 flex rounded-[4px] items-center gap-x-4 cursor-pointer' onClick={handleOnePlayerClick}>
                        <img alt="One Player chess" src={one} className="w-[60px] aspect-square"></img>
                        One Player
                    </button>
                    <button className='hover:bg-white hover:text-[#444] font-bold border-white border px-4 py-4 flex rounded-[4px] items-center gap-x-4 cursor-pointer' onClick={handleTwoPlayerClick}>
                        <img alt="One Player chess" src={two} className="w-[60px] aspect-square"></img>
                        Two Player</button>
                </div>
            </div>
        </div>
    )
}
