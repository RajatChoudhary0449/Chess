import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { BLACK, WHITE } from "../constants/constants";
import socket from "../socket";
import useGame from "../hooks/useGame";
export default function Room() {
    const [inputId, setInputId] = useState("");
    const [showModes, setShowModes] = useState(false);
    const { availableRights } = useGame();
    const nav = useNavigate()
    const handleBackPress = () => {
        nav("/");
    }
    const handleCreateRoom = () => {
        nav(`/room/create`);
    }
    const handleJoinRoom = () => {
        setShowModes(mode => !mode);
        socket.emit("check_for_room", {id:inputId,source:"Room"});
    }
    useEffect(() => {
        if (inputId.length < 6 && showModes) { console.log("Invalid RoomId"); setShowModes(false); }
    }, [inputId, showModes]);
    const handleJoinWithMode = (color) => {
        socket.emit("join_room", { id: inputId, color });
        nav(`/room/${inputId}`);
    }
    return (
        <div className='h-[100dvh] w-full flex justify-center items-center ' style={{ backgroundImage: `url("/icon.jpeg")` }}>
            <button className="absolute top-0 left-0 text-white bg-[#e0c097] md:text-2xl text-xl pr-4" onClick={handleBackPress}>{"< Back"}</button>
            <div className='h-auto bg-[#e0c097] text-white rounded-2xl px-4 py-6 max-w-[90%]'>
                <h3 className='my-2 text-xl'>Choose one of the option:</h3>
                <div className='flex flex-col text-xl gap-y-2'>
                    <button className='hover:bg-[#a07556] hover:border-[#e0c097] font-bold border-white border px-4 py-4 flex rounded-[4px] items-center gap-x-4 cursor-pointer' onClick={handleCreateRoom}>
                        Create a room
                    </button>
                    <input maxLength={7} onChange={(e) => setInputId(e.target.value)} value={inputId} className="mt-2 px-4 py-4 outline-none text-decoration-none border-white text-[#444]" autoFocus placeholder="Enter the room id to join" spellCheck={false}></input>
                    <button className='hover:bg-[#a07556] hover:border-[#e0c097] font-bold border-white border px-4 py-4 flex rounded-[4px] items-center justify-between cursor-pointer ' onClick={handleJoinRoom}>
                        {showModes ? "Join as?" : "Join a Room"}
                        <div className="flex gap-x-2">
                            <div className="h-[30px] border border-white"></div>
                            <div ><i className={`fas ${showModes ? "fa-circle-chevron-up" : "fa-circle-chevron-down"}`}></i></div>
                        </div>
                    </button>
                    {showModes &&
                        <div className="w-full flex justify-end">
                            <div className="bg-white -mt-2 w-[80%] justify-end rounded-b-2xl px-4 py-2">
                                {availableRights.includes(WHITE) &&
                                    <div onClick={() => handleJoinWithMode(WHITE)} className="text-[#a07556] cursor-pointer">Join as White</div>
                                }
                                {availableRights.includes(BLACK) &&
                                    <>
                                        <div className="border-dashed border w-full h-[2px] border-[#a07556]"></div>
                                        <div onClick={() => handleJoinWithMode(BLACK)} className="text-[#a07556] cursor-pointer">Join as Black</div>
                                    </>
                                }
                                <div className="border-dashed border w-full h-[2px] border-[#a07556]"></div>
                                <div onClick={() => handleJoinWithMode("spectator")} className="text-[#a07556] cursor-pointer">Watch as spectator</div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}
