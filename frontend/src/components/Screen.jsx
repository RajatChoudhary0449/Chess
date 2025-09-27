import { useEffect } from "react";
import socket from "../socket.js";
import { encode, playMove, flipTurn, addMove, checkGameOver } from "../utils/CommonFunctions.js"
import { BLACK, INITIALBOARDSETUP, WHITE } from "../constants/constants.js";
import GameOverModal from "./GameOverModal.jsx";
import PromotionModal from "./PromotionModal.jsx";
import useGame from "../hooks/useGame.js";
import Board from "./Board";
import InformationBlock from "./InformationBlock.jsx";
import MoveList from "./MoveList.jsx";
export default function Screen() {
    const { curTurn, setCurTurn, setAvailableMoves, promotionPiece, setPromotionPiece, gameOver, setGameOver, board, setBoard, moves, setMoves, message, setMessage, playerColor, setPlayerColor, spectatorMode, setSpectatorMode } = useGame();
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
        const onOpponentJoin = (message) => {
            alert(message);
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

        socket.on("player_assignment", onPlayerAssignment);
        socket.on("opponent_move", onOpponentMove);
        socket.on("game_state", onGameState);
        socket.on("opponent_join", onOpponentJoin);
        return () => {
            socket.off("player_assignment", onPlayerAssignment);
            socket.off("opponent_move", onOpponentMove);
            socket.off("game_state", onGameState);
            socket.off("opponent_join", onOpponentJoin);
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

    return (
        <div className="flex justify-center items-center flex-col h-[100dvh]" style={{ backgroundImage: `url("/icon.jpeg")` }}>
            {promotionPiece && <PromotionModal curTurn={curTurn} handlePromotion={handlePromotion} />}
            {!playerColor && !spectatorMode
                && <div className="text-[#542c0b] text-[34px] p-2 bg-white opacity-75 rounded-2xl animate-bounce">Please wait while we assign game to you...</div>
            }
            {(playerColor || spectatorMode) &&
                <>
                    <GameOverModal gameOver={gameOver} message={message} />
                    <div className="flex md:flex-row flex-col md:gap-x-2 lg:gap-x-4 gap-y-4">
                        <div className="flex flex-col gap-y-2">
                            <InformationBlock />
                            <Board />
                        </div>
                        <MoveList/>
                    </div>
                </>
            }
        </div >
    );
}