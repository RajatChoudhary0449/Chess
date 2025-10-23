import { useNavigate, useParams } from "react-router-dom";
import { WHITE } from "../constants/constants";
import useGame from "../hooks/useGame";
import socket from "../socket";
import { useState } from "react";

export default function InformationBlock() {
    const { spectatorMode, playerColor, curTurn, gameStarted } = useGame();
    const { id } = useParams();
    const nav = useNavigate();
    const [copied, setCopied] = useState(false);
    const handleCopyId = () => {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, [3000]);
    }
    const handleBackClick = () => {
        socket.emit("remove_from_room");
        nav(`/room/create`);
    }
    return (
        <div className="flex md:flex-row flex-col gap-y-2 justify-between items-center">
            <div className="flex gap-x-4 items-center md:justify-start justify-between w-full md:w-auto">
                <button className={`text-white flex gap-x-2 md:text-2xl text-xl cursor-pointer`} onClick={handleBackClick}>
                    <span><i className="fas fa-arrow-left"></i></span>Back
                </button>
                <div className="text-white flex flex-col md:hidden md:text-2xl text-xl justify-center">
                    <div className="flex gap-x-2 items-center">
                        <p>
                            Room ID: <strong>{id}</strong>
                        </p>
                        <div className="w-0 h-[15px] border border-white "></div>
                        <button className="rounded-full aspect-square cursor-pointer hover:bg-gray-400 p-2 disabled:bg-transparent disabled:opacity-50 disabled:cursor-default" onClick={handleCopyId} disabled={copied}><i className="fa fa-copy"></i></button></div>
                    {copied && <span className="text-green-500 font-bold flex justify-end">Id Copied!!</span>}
                </div>
            </div>
            {gameStarted ?
                <div className={`rounded-2xl w-fit bg-[#e0c097]/90 flex justify-center gap-x-2 py-2 px-4 ${playerColor === WHITE ? "text-white" : "text-black"}`}>
                    <div className={`flex justify-center items-center gap-x-2`}>
                        <div className={`${spectatorMode ? "hidden" : ""}`}>
                            You are 
                        </div>
                        <div className={`w-[20px] h-[20px] rounded-full ${spectatorMode && curTurn === WHITE ? "bg-white border-black" : "bg-black border-white "} ${!spectatorMode && playerColor === WHITE ? "bg-white border-black" : "bg-black border-white "}`}></div>

                    </div>
                    <div className={`flex items-center gap-x-2 ${spectatorMode && "hidden"}`}>
                        {
                            curTurn === playerColor ? "It's your turn!" : "Waiting for opponent..."
                        }
                        <div className={`text-xl animate-spin`}>
                            {curTurn === playerColor ? "🟢" : "🕒"}
                        </div>
                    </div>
                </div>
                :
                <div className={` rounded-2xl w-fit bg-[#e0c097]/90 flex justify-center gap-x-2 py-2 px-4 text-white`}>
                    <div>Please wait, the match is about to start...</div>
                    <div className={`text-xl animate-spin`}>
                            🕒
                    </div>
                </div>
            }
            <div className="text-white flex-col hidden md:flex">
                <div className="flex gap-x-2 items-center">
                    <p className="font-medium">
                        Room ID: <strong>{id}</strong>
                    </p>
                    <div className="w-0 h-[15px] border border-white "></div>
                    <button className="rounded-full aspect-square cursor-pointer hover:bg-gray-400 p-2 disabled:bg-transparent disabled:opacity-50 disabled:cursor-default" onClick={handleCopyId} disabled={copied}><i className="fa fa-copy"></i></button>
                    {copied && <span className="text-green-500 font-bold">Id Copied!!</span>}
                </div>
            </div>
        </div>
    )
}
