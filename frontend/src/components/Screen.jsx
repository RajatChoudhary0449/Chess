import { useEffect, useRef, useState } from "react";
import socket from "../socket.js";
import { playMove, flipTurn, addMove, checkGameOver, getLastMove } from "../utils/CommonFunctions.js"
import { BLACK, INITIALBOARDSETUP, PIECES, WHITE } from "../constants/constants.js";
import GameOverModal from "./GameOverModal.jsx";
import PromotionModal from "./PromotionModal.jsx";
import useGame from "../hooks/useGame.js";
import Board from "./Board";
import InformationBlock from "./InformationBlock.jsx";
import MoveList from "./MoveList.jsx";
import DrawWindowModal from "./DrawWindowModal.jsx";
export default function Screen() {
    const { curTurn, setCurTurn, promotionPiece, setPromotionPiece, gameOver, setGameOver, board, setBoard, setMoves, message, setMessage, playerColor, setPlayerColor, spectatorMode, setSpectatorMode } = useGame();
    let lastPawnMoveOrCapture = useRef(0);
    const [drawWindow,showDrawWindow]=useState(false);
    useEffect(() => {
        if (!socket.connected) socket.connect();
        const onPlayerAssignment = (color) => {
            console.log("color", color);
            if (color === "spectator") {
                setSpectatorMode(true);
                alert("A match is already running, have a seat and enjoy the match");
            }
            else {
                setPlayerColor(color);
            }
        };
        const onUndoMove = (moveList) => {
            const lastMove = getLastMove(moveList);
            if (moveList.length === 0) {
                setBoard(INITIALBOARDSETUP);
                setCurTurn(WHITE);
                setMoves(moveList);
            }
            else {
                setBoard(lastMove.board);
                setCurTurn(moveList?.length % 2 === 0 ? WHITE : BLACK);
                setMoves(moveList);
            }
        }
        const onOpponentJoin = (message) => {
            alert(message);
        }
        const onRecievingResign = ({ state, message }) => {
            setGameOver(state);
            setMessage(message);
        }
        const onGameState = ({ moves }) => {
            setMoves(_ => moves);
            const updatedBoard = moves.length > 0 ? moves[0].board : INITIALBOARDSETUP;
            setBoard(_ => updatedBoard);
            setCurTurn(moves?.length % 2 === 0 ? WHITE : BLACK);
        }
        const onOpponentMove = (move) => {
            if (move.turn === playerColor) return; // Prevent duplicate move
            setMoves((moves) => [move, ...moves]);
            if (move.isCaptured || move.piece === PIECES.BLACK.PAWN || move.piece === PIECES.WHITE.PAWN) {
                lastPawnMoveOrCapture.current = 0;
            }
            else {
                lastPawnMoveOrCapture.current = lastPawnMoveOrCapture.current + 1;
            }
            if (move.isPromotion) {
                applyPromotion(move);
                return;
            }
            const nextTurn = flipTurn(move.turn);
            setCurTurn(() => nextTurn);
            const updatedBoard = move.board;
            setBoard(_ => updatedBoard);
            const { state, message } = checkGameOver(updatedBoard);
            setGameOver(state);
            setMessage(message);
        };
        const onDrawn=(message)=>{
            setGameOver(true);
            setMessage(message);
        }
        const onDrawOffered=()=>{
            showDrawWindow(true);
        }
        const onDrawAccepted=()=>{
            let message=`Draw by mutual agreement`;
            setGameOver(true);
            setMessage(message);
            socket.emit("draw",{state:true,message});
        }
        const onDrawRejected=()=>{
            alert("Draw rejected");
        }
        socket.on("player_assignment", onPlayerAssignment);
        socket.on("opponent_move", onOpponentMove);
        socket.on("game_state", onGameState);
        socket.on("undo_move", onUndoMove)
        socket.on("opponent_join", onOpponentJoin);
        socket.on("resign", onRecievingResign);
        socket.on("drawn", onDrawn);
        socket.on("draw_offered", onDrawOffered);
        socket.on("draw_accepted", onDrawAccepted);
        socket.on("draw_rejected", onDrawRejected);
        return () => {
            socket.off("player_assignment", onPlayerAssignment);
            socket.off("opponent_move", onOpponentMove);
            socket.off("game_state", onGameState);
            socket.off("undo_move", onUndoMove);
            socket.off("opponent_join", onOpponentJoin);
            socket.off("resign", onRecievingResign);
            socket.off("drawn", onDrawn);
            socket.off("draw_offered", onDrawOffered);
            socket.off("draw_accepted", onDrawAccepted);
            socket.off("draw_rejected", onDrawRejected);
        };
    }, []);

    const applyPromotion = (move) => {
        const updatedBoard = move.board;
        setBoard(updatedBoard);
        setCurTurn(flipTurn(move.turn));
        const { state, message } = checkGameOver(updatedBoard);
        setGameOver(state);
        setMessage(message);
    }
    const handlePromotion = (piece) => {
        const { move, turn } = promotionPiece;
        move.promotedTo = piece;
        const updatedBoard = playMove(move, board, piece);
        setBoard(updatedBoard);
        move.board = updatedBoard;
        setMoves(moves => addMove(move, moves));
        setCurTurn(flipTurn(turn));
        setPromotionPiece(null); // close modal
        socket.emit("make_move", { move });
        const { state, message } = checkGameOver(updatedBoard);
        setGameOver(state);
        setMessage(message);
    };
    const viewBoard = () => {
        setSpectatorMode(true);
        setGameOver(false);
    }
    return (
        <div className="flex justify-center items-center flex-col h-[100dvh]" style={{ backgroundImage: `url("/icon.jpeg")` }}>
            {promotionPiece && <PromotionModal curTurn={curTurn} handlePromotion={handlePromotion} />}
            {!playerColor && !spectatorMode
                && <div className="text-[#542c0b] text-[34px] p-2 bg-white opacity-75 rounded-2xl animate-bounce">Please wait while we assign game to you...</div>
            }
            {(playerColor || spectatorMode) &&
                <>
                    <GameOverModal gameOver={gameOver} message={message} viewBoard={viewBoard} />
                    {drawWindow && <DrawWindowModal setShowModal={showDrawWindow}/>}
                    <div className="flex md:flex-row flex-col md:gap-x-2 lg:gap-x-4 gap-y-4">
                        <div className="flex flex-col gap-y-2">
                            <InformationBlock />
                            <Board lastPawnMoveOrCapture={lastPawnMoveOrCapture} />
                        </div>
                        <MoveList lastPawnMoveOrCapture={lastPawnMoveOrCapture.current}/>
                    </div>
                </>
            }
        </div >
    );
}