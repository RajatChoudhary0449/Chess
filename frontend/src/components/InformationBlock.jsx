import { WHITE } from "../constants/constants";
import useGame from "../hooks/useGame";

export default function InformationBlock() {
    const { spectatorMode, playerColor, curTurn } = useGame();
    return (
        <div className="flex justify-center">
            <div className={`flex-col rounded-2xl w-fit bg-[#e0c097]/90 flex justify-center gap-x-2 py-2 px-4 ${playerColor === WHITE ? "text-white" : "text-black"}`}>
                <div className={`flex justify-center items-center gap-x-2`}>
                    <div className={`${spectatorMode ? "hidden" : ""}`}>
                        You are playing as
                    </div>
                    <div className={`w-[20px] h-[20px] rounded-full ${spectatorMode && curTurn === WHITE ? "bg-white border-black" : "bg-black border-white "} ${!spectatorMode && playerColor === WHITE ? "bg-white border-black" : "bg-black border-white "}`}></div>

                </div>
                <div className={`flex items-center gap-x-2 ${curTurn == playerColor && "transition animate-pulse duration-300"} ${spectatorMode && "hidden"}`}>
                    {
                        curTurn === playerColor ? "It's your turn!" : "Waiting for opponent..."
                    }
                    <div className={`text-xl animate-spin`}>
                        {curTurn === playerColor ? "🟢" : "🕒"}
                    </div>
                </div>
            </div>
        </div>
    )
}
