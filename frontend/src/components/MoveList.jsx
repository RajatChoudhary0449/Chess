import useGame from '../hooks/useGame'
import { encode, flipTurn, getLastMove } from '../utils/CommonFunctions';
import { INITIALBOARDSETUP, WHITE } from '../constants/constants';
import socket from '../socket';
import { useEffect, useState } from 'react';

export default function MoveList({ lastPawnMoveOrCapture }) {
    const { moves, spectatorMode, curTurn, setCurTurn, setAvailableMoves, setBoard, setMoves, playerColor, setGameOver, setMessage } = useGame();
    const [usedDraw, setUsedDraw] = useState(false);
    const handleMoveUndo = () => {
        const curMoves = moves;
        if (curMoves.length === 0) return;
        setCurTurn(curTurn => flipTurn(curTurn));
        setAvailableMoves([]);
        setBoard(curMoves.length === 1 ? INITIALBOARDSETUP : curMoves[1].board);
        setMoves(moves => moves.slice(1));
        socket.emit("move_undo", moves.slice(1));
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
    const handleResign = () => {
        if (!window.confirm("Are you sure you want to resign?")) {
            return;
        }
        const message = `${playerColor === WHITE ? "Black" : "White"} wins by resignation`;
        socket.emit("resign", { state: true, message: message });
        setGameOver(true);
        setMessage(message);
    }
    useEffect(() => {
        if (usedDraw) setUsedDraw(false);
    }, [moves]);
    const areBoardsEqual = (board1, board2) => {
        if (!board1 || !board2) return false;
        for (let i = 0; i < 8; i++)
            for (let j = 0; j < 8; j++)
                if (board1[i][j] !== board2[i][j]) return false;
        return true;
    }
    const threeFoldRepetation = (moves) => {
        const lastMove = getLastMove(moves);
        let count = 0;
        if (areBoardsEqual(lastMove.board, INITIALBOARDSETUP)) count = count + 1;
        for (let move of moves) {
            if (areBoardsEqual(move.board, lastMove.board) && move.turn === lastMove.turn && move.castlingRights === lastMove.castlingRights)
                count = count + 1;
        }
        return count >= 3;
    }
    const handleOfferDraw = () => {
        setUsedDraw(true);
        let message = `Draw by threefold repetation`;
        if (threeFoldRepetation(moves)) {
            setGameOver(true);
            setMessage(message);
            socket.emit("draw", { state: true, message });
            return;
        }
        else if (lastPawnMoveOrCapture >= 50) {
            message = "Draw by Fifty-move rule"
            setGameOver(true);
            setMessage(message);
            socket.emit("draw", { state: true, message });
        }
        else {
            socket.emit("offer_draw");
        }
    }
    const shouldDisable = curTurn !== playerColor || usedDraw;
    return (
        <div className="h-[200px] md:h-[min(80vh,80vw)] lg:h-[min(88vh,88vw)] md:max-h-[min(80vh,80vw)] lg:max-h-[min(88vh,88vw)] w-full">
            <div className={`md:w-full md:max-w-[220px] md:min-w-[200px] w-[90%] mx-auto px-4 h-full bg-[#e0c097]/90 text-[#5c3a1e] opacity-90 py-2 ${spectatorMode ? "md:mt-11" : "md:mt-18"} rounded-md shadow-md flex flex-col`}>
                <div className='flex justify-between gap-x-2 mb-2'>
                    <button className={` text-[16px] p-2 w-fit flex justify-center border border-white font-bold  transition duration-100 ${shouldDisable ? "pointer-none" : "hover:bg-white hover:scale-110 cursor-pointer"}`} onClick={handleOfferDraw} disabled={shouldDisable}>Offer Draw</button>
                    <button className={`cursor-pointer text-[16px] p-2 w-fit flex justify-center border border-white hover:text-[16px] font-bold hover:bg-white hover:scale-110 transition duration-100`} onClick={handleResign}>Resign</button>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold">Move List</div>
                    {moves.length > 0 && (
                        <div className="flex gap-x-2 text-white">
                            {false &&
                                <div>

                                    <button onClick={handleMoveUndo} className="bg-amber-400 p-2 rounded-[4px]" disabled={false}>
                                        <i className="fas fa-undo" title="Undo"></i>
                                    </button>
                                    <button onClick={handleResetGame} className="bg-red-500 p-2 rounded-[4px]" disabled={spectatorMode || true}>
                                        <i className="fas fa-refresh" title="Refresh"></i>
                                    </button>
                                </div>
                            }
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
