import useGame from '../hooks/useGame'
import { encode, flipTurn } from '../utils/CommonFunctions';
import { INITIALBOARDSETUP, WHITE } from '../constants/constants';
import socket from '../socket';

export default function MoveList() {
    const { moves, spectatorMode, setCurTurn, setAvailableMoves, setBoard, setMoves } = useGame();
    const handleMoveUndo = () => {
        const curMoves = moves;
        if (curMoves.length === 0) return;
        setCurTurn(curTurn => flipTurn(curTurn));
        setAvailableMoves([]);
        setBoard(curMoves.length === 1 ? INITIALBOARDSETUP : curMoves[1].board);
        setMoves(moves => moves.slice(1));
        socket.emit("move_undo",moves.slice(1));
    }
    const handleResetGame = () => {
        if (!window.confirm("Are you sure you want to restart the game?")) {
            return;
        }
        setCurTurn(WHITE);
        setAvailableMoves([]);
        setBoard(INITIALBOARDSETUP);
        setMoves([]);
        socket.emit("reset_game");
    }
    return (
        <div className="h-[200px] md:h-[min(80vh,80vw)] lg:h-[min(88vh,88vw)] md:max-h-[min(80vh,80vw)] lg:max-h-[min(88vh,88vw)] w-full">
            <div className={`md:w-full md:max-w-[220px] md:min-w-[200px] w-[90%] mx-auto px-4 h-full bg-[#e0c097]/90 text-[#5c3a1e] opacity-90 py-2 ${spectatorMode ? "md:mt-11" : "md:mt-18"} rounded-md shadow-md flex flex-col`}>
                <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold">Move List</div>
                    {moves.length > 0 && (
                        <div className="flex gap-x-2 text-white">
                            <button onClick={handleMoveUndo} className="bg-amber-400 p-2 rounded-[4px]" disabled={spectatorMode || true}>
                                <i className="fas fa-undo" title="Undo"></i>
                            </button>
                            <button onClick={handleResetGame} className="bg-red-500 p-2 rounded-[4px]" disabled={spectatorMode || true}>
                                <i className="fas fa-refresh" title="Refresh"></i>
                            </button>
                        </div>
                    )}
                </div>
                <ul className="flex flex-col gap-2 overflow-y-auto h-full">
                    {moves.map((cur, index) => (
                        <li key={index} className="flex gap-x-2 items-center text-sm pb-1">
                            <div className="w-[20px] text-center">{moves.length - index}</div>
                            <div className={`w-[20px] h-[20px] ${cur.turn === WHITE ? "bg-white" : "bg-black"} shadow-md rounded-full`}></div>
                            <span>played {encode(cur.from.row, cur.from.col)} → {encode(cur.to.row, cur.to.col)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>)
}
