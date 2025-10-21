import { useEffect, useRef, useState } from "react";
import socket from "../socket.js";
import { playMove, flipTurn, addMove, checkGameOver } from "../utils/CommonFunctions.js"
import GameOverModal from "./GameOverModal.jsx";
import PromotionModal from "./PromotionModal.jsx";
import useGame from "../hooks/useGame.js";
import Board from "./Board";
import InformationBlock from "./InformationBlock.jsx";
import MoveList from "./MoveList.jsx";
import DrawWindowModal from "./DrawWindowModal.jsx";
import EvaluationBar from "./EvaluationBar.jsx";
import InformationModal from "./InformationModal.jsx";
import { useParams } from "react-router-dom";
import JoinChoiceModal from "./JoinChoiceModal.jsx";
import { BLACK, WHITE } from "../constants/constants.js";
import TimerWindow from "./TimerWindow.jsx";
export default function Screen() {
    const { curTurn, setCurTurn, promotionPiece, setPromotionPiece, gameOver, setGameOver, board, setBoard, setMoves, message, setMessage, playerColor, spectatorMode, setSpectatorMode, drawWindow, showDrawWindow, showInfoModal, setShowInfoModal, infoMessage, availableRights, showJoinModal, setShowJoinModal, flipped, blackPlayerTimerRef, whitePlayerTimerRef, timeMode } = useGame();
    const [val, setVal] = useState();
    const { id } = useParams();
    const onePlayer = id?.length !== 6;
    // const blackPlayerTimerRef = useRef();
    // const whitePlayerTimerRef = useRef();
    useEffect(() => {
        if (spectatorMode || playerColor) return;
        socket.emit("check_for_room", { id, source: "Screen" });
    }, []);
    const handlePromotion = (piece) => {
        const { move, turn } = promotionPiece;
        move.promotedTo = piece;
        const updatedBoard = playMove(move, board, piece);
        setBoard(updatedBoard);
        move.board = updatedBoard;
        setMoves(moves => addMove(move, moves));
        setCurTurn(flipTurn(turn));
        setPromotionPiece(null);
        socket.emit("make_move", { move });
        const { state, message } = checkGameOver(updatedBoard);
        setGameOver(state);
        setMessage(message);
    };
    const viewBoard = () => {
        setSpectatorMode(true);
        setGameOver(false);
    }
    const handleTimeOut = (color) => {
        const message = `${color.slice(0,1).toUpperCase()+color.slice(1)} wins by timeout!!`;
        if (!onePlayer)
            socket.emit("resign", { state: true, message: message });
        setGameOver(true);
        setMessage(message);
    }
    const handleJoinFromChoiceModal = (color) => {
        socket.emit("join_room", { id, color });
        setShowJoinModal(false);
    }
    return (
        <div className="flex justify-center items-center flex-col h-[100dvh]" style={{ backgroundImage: `url("/icon.jpeg")` }}>
            {showJoinModal &&
                <JoinChoiceModal onClose={() => setShowJoinModal(false)}
                    availableRights={availableRights}
                    onJoinWhite={() => { handleJoinFromChoiceModal(WHITE) }}
                    onJoinBlack={() => { handleJoinFromChoiceModal(BLACK) }}
                    onSpectate={() => { handleJoinFromChoiceModal("spectator") }}
                />}
            {showInfoModal &&
                <InformationModal message={infoMessage} setShow={setShowInfoModal} position="top-right" />}
            {promotionPiece &&
                <PromotionModal curTurn={curTurn} handlePromotion={handlePromotion} />}
            {!playerColor && !spectatorMode &&
                <div className="text-[#542c0b] text-[34px] p-2 bg-white opacity-75 rounded-2xl animate-bounce">Please wait while we assign game to you...</div>
            }
            {(playerColor || spectatorMode) &&
                <>
                    <GameOverModal gameOver={gameOver} message={message} viewBoard={viewBoard} setGameOver={setGameOver} setMessage={setMessage} roomId={id} />
                    {drawWindow && <DrawWindowModal setShowModal={showDrawWindow} />}
                    <div className="flex md:flex-row flex-col md:gap-x-2 lg:gap-x-4 gap-y-4">
                        <div className="flex flex-col gap-y-2">
                            <InformationBlock />
                            <div className="flex md:flex-row flex-col gap-y-2 md:gap-x-4 text-white">
                                {spectatorMode && <EvaluationBar val={val} setVal={setVal} />}
                                <div className="flex flex-col">
                                    <div className="flex justify-end md:mr-0 mr-5">
                                        {timeMode?.mode !== "None" &&
                                            <TimerWindow ref={flipped ? whitePlayerTimerRef : blackPlayerTimerRef} time={timeMode?.initial * 60} color={flipped ? WHITE : BLACK} onTimerUp={() => handleTimeOut(flipped ? BLACK : WHITE)}></TimerWindow>
                                        }
                                    </div>
                                    <Board onePlayer={onePlayer} />
                                    <div className="flex justify-end md:mr-0 mr-5">
                                        {timeMode?.mode !== "None" &&
                                            <TimerWindow ref={flipped ? blackPlayerTimerRef : whitePlayerTimerRef} time={timeMode?.initial * 60} color={flipped ? BLACK : WHITE} onTimerUp={() => handleTimeOut(flipped ? WHITE : BLACK)}></TimerWindow>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <MoveList val={val} setVal={setVal} />
                    </div>
                </>
            }
        </div >
    );
}