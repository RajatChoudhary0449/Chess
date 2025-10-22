import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { BLACK, MESSAGE_TYPES, POSITIONS, WHITE } from "../constants/constants";
import socket from "../socket";
import useGame from "../hooks/useGame";
import useNotification from "../hooks/useNotification";
export default function Room() {
    const [inputId, setInputId] = useState("");
    const { availableRights, showModes, setShowModes } = useGame();
    const { showNotification } = useNotification();
    const nav = useNavigate();
    const handleBackPress = () => {
        nav("/");
    }
    const handleCreateRoom = () => {
        nav(`/room/create`);
    }
    const handleJoinRoom = () => {
        if (inputId.length < 6) {
            showNotification({ message: `Invalid Room ID length`, type: MESSAGE_TYPES.WARNING,position:POSITIONS.TOP_CENTER })
            setShowModes(false);
        }
        else {
            // setShowModes(mode => !mode);
            socket.emit("check_for_room", { id: inputId, source: "Room" });
        }
    }
    useEffect(() => {
        if (showModes) setShowModes(false);
    }, [inputId]);
    const handleJoinWithMode = (color) => {
        socket.emit("join_room", { id: inputId, color });
        nav(`/room/${inputId}`);
    }
    return (
        <div className='h-[100dvh] w-[100dvw] flex justify-center items-center ' style={{ backgroundImage: `url("/icon.jpeg")` }}>
            <div className='h-auto bg-[#444] text-white rounded-2xl px-4 py-6 max-w-[90%]'>
                <button className="flex justify-start text-white bg-[#444] md:text-2xl text-xl pr-4" onClick={handleBackPress}>{"< Back"}</button>
                <h3 className='my-2 text-xl'>Choose one of the option:</h3>
                <div className='flex flex-col text-xl gap-y-2'>
                    <button className='hover:bg-white hover:text-[#444] font-bold border-white border px-4 py-4 flex rounded-[4px] items-center gap-x-4 cursor-pointer' onClick={handleCreateRoom}>
                        Create a room
                    </button>
                    <input maxLength={7} onChange={(e) => setInputId(e.target.value)} value={inputId} className="mt-2 px-4 py-4 outline-none text-decoration-none border-white text-white" autoFocus placeholder="Enter the room id to join" spellCheck={false}></input>
                    <button className='hover:bg-white hover:text-[#444] font-bold border-white border px-4 py-4 flex rounded-[4px] items-center justify-between cursor-pointer ' onClick={handleJoinRoom}>
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
                                {availableRights.length > 1 &&
                                    <div className="border-dashed border w-full h-[2px] border-[#a07556]"></div>
                                }
                                {availableRights.includes(BLACK) &&
                                    <>
                                        <div onClick={() => handleJoinWithMode(BLACK)} className="text-[#a07556] cursor-pointer">Join as Black</div>
                                    </>
                                }
                                {availableRights.length > 0 && <div className="border-dashed border w-full h-[2px] border-[#a07556]"></div>}
                                <div onClick={() => handleJoinWithMode("spectator")} className="text-[#a07556] cursor-pointer">Watch as spectator</div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}
