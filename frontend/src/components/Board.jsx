import blackRook from "../assets/blackRook.png";
import blackKnight from "../assets/blackKnight.png";
import blackBishop from "../assets/blackBishop.png";
import blackQueen from "../assets/blackQueen.png";
import blackKing from "../assets/blackKing.png";
import blackPawn from "../assets/blackPawn.png";
import whiteRook from "../assets/whiteRook.png";
import whiteKnight from "../assets/whiteKnight.png";
import whiteBishop from "../assets/whiteBishop.png";
import whiteQueen from "../assets/whiteQueen.png";
import whiteKing from "../assets/whiteKing.png";
import whitePawn from "../assets/whitePawn.png";
import { useState, useEffect } from "react";
import socket from "../socket.js";
import { blackPieceAvailable, encode, flipBoard, getAllBlackMoves, getAllPossibleMoves, getAllWhiteMoves, isBlackKingChecked, isWhiteKingChecked, playMove, whitePieceAvailable } from "../utils/CommonFunctions.js"
import { INITIALBOARDSETUP, PIECES } from "../constants/constants.js";
import GameOverModal from "./GameOverModal.jsx";
import PromotionModal from "./PromotionModal.jsx";
export default function Board() {
    const [activeSquare, setActiveSquare] = useState({ row: null, col: null });
    const [curTurn, setCurTurn] = useState("white");
    const [availableMoves, setAvailableMoves] = useState([]);
    const [promotionPiece, setPromotionPiece] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [board, setBoard] = useState(INITIALBOARDSETUP);
    const [moves, setMoves] = useState([]);
    const [message, setMessage] = useState("");
    const [playerColor, setPlayerColor] = useState(null);
    const [spectatorMode, setSpectatorMode] = useState(false); //To Do
    const flipped = playerColor === "black";
    const renderBoard = flipped ? flipBoard(board) : board;
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
            setCurTurn(moves?.length % 2 === 0 ? "white" : "black");
        }
        const onOpponentMove = (move) => {
            if (move.turn === playerColor) return; // Prevent duplicate move
            setMoves((moves) => [move, ...moves]);
            if (move.isPromotion) {
                applyPromotion(move);
                return;
            }
            const nextTurn = move.turn === "white" ? "black" : "white";
            setCurTurn(() => nextTurn);
            const updatedBoard = move.board;
            setBoard(_ => updatedBoard);
            checkGameOver(updatedBoard);
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


    const handleClick = ({ row, col, piece }) => {
        if (curTurn === "white") {
            //Handle First White Tap
            if (whitePieceAvailable(row, col, board)) {
                setActiveSquare({ row, col });
                let allPossibleMoves = getAllPossibleMoves({ row, col, piece }, board, moves);
                if (flipped) allPossibleMoves = allPossibleMoves.map(item => flipCoordinates(item));
                setAvailableMoves(allPossibleMoves);
                return;
            }
        }
        if (curTurn === "black") {
            //Handle First Black Tap
            if (blackPieceAvailable(row, col, board)) {
                setActiveSquare({ row, col });
                let allPossibleMoves = getAllPossibleMoves({ row, col, piece }, board, moves);
                if (flipped) allPossibleMoves = allPossibleMoves.map(item => flipCoordinates(item));
                setAvailableMoves(allPossibleMoves);
                return;
            }
        }
        const isPlayable = availableMoves.some(move => move.row === (flipped ? flip(row) : row) && move.col === (flipped ? flip(col) : col));
        if (isPlayable) {
            const isCaptured = (curTurn === "white" && blackPieceAvailable(row, col, board)) || (curTurn === "black" && whitePieceAvailable(row, col, board));
            const capturedPiece = isCaptured ? board[row][col] : null;
            //Check for promotion if any:
            const isPromotion =
                (curTurn === "white" && board[activeSquare.row][activeSquare.col] === PIECES.WHITE.PAWN && row === 0) ||
                (curTurn === "black" && board[activeSquare.row][activeSquare.col] === PIECES.BLACK.PAWN && row === 7);
            const isCastling = (curTurn === "white" && board[activeSquare.row][activeSquare.col] === PIECES.WHITE.KING && Math.abs(activeSquare.col - col) === 2) || ((curTurn === "black" && board[activeSquare.row][activeSquare.col] === PIECES.BLACK.KING && Math.abs(activeSquare.col - col) === 2))
            const updatedBoard = isCastling ? playMove({ from: { row: activeSquare.row, col: activeSquare.col }, to: { row, col } }, board, null, true) : playMove({ from: { row: activeSquare.row, col: activeSquare.col }, to: { row, col } }, board);
            const curMove = { from: { row: activeSquare.row, col: activeSquare.col }, piece, to: { row, col }, isCaptured: isCaptured, promotedTo: null, capturedPiece: capturedPiece, isCastling, isPromotion, turn: curTurn, board: updatedBoard };
            if (isPromotion) {
                setPromotionPiece({ move: curMove, turn: curTurn });
            }
            else setPromotionPiece(null);

            setBoard(updatedBoard);
            if (!isPromotion) {
                setMoves([curMove, ...moves]);
                socket.emit("make_move", { move: curMove });
            }
            setCurTurn((cur) => cur === "white" ? "black" : "white");
            checkGameOver(updatedBoard);
        }
        setActiveSquare({ row: null, col: null });
        setAvailableMoves([]);
    }
    const checkGameOver = (updatedBoard) => {
        if (getAllWhiteMoves(updatedBoard).length === 0) {
            if (isWhiteKingChecked(updatedBoard)) {
                setMessage("Black wins!!!");
                setGameOver(true);
                socket.emit("game_over");
            }
            else if (curTurn === "white") {
                setMessage("Draw by stalemate");
                setGameOver(true);
                socket.emit("game_over");
            }
        }
        if (getAllBlackMoves(updatedBoard).length === 0) {
            if (isBlackKingChecked(updatedBoard)) {
                setMessage("White wins!!!");
                setGameOver(true);
                socket.emit("game_over");
            }
            else if (curTurn === "black") {
                setMessage("Draw by stalemate");
                setGameOver(true);
                socket.emit("game_over");
            }
        }
        return false;
    }
    const applyPromotion = (move) => {
        const updatedBoard = move.board;
        setBoard(updatedBoard);
        setCurTurn(move.turn === "white" ? "black" : "white");
        checkGameOver(updatedBoard);
    }
    const handlePromotion = (piece) => {
        const { move, turn } = promotionPiece;
        move.promotedTo = piece;
        const updatedBoard = playMove(move, board, piece);
        setBoard(updatedBoard);
        move.board = updatedBoard;
        setMoves((moves) => [move, ...moves]);
        setCurTurn(turn === "white" ? "black" : "white");
        setPromotionPiece(null); // close modal
        socket.emit("make_move", { move });
        checkGameOver(updatedBoard);
    };
    const flip = (entity) => {
        return 7 - entity;
    }
    const flipCoordinates = ({ row, col }) => {
        return { row: flip(row), col: flip(col) };
    }
    const getBackground = (isWhiteSquare, row, col) => {
        if (board[row][col] === PIECES.WHITE.KING && isWhiteKingChecked(board))
            return "bg-red-500";
        if (board[row][col] === PIECES.BLACK.KING && isBlackKingChecked(board))
            return "bg-red-500";
        const lastMove = moves.length > 0 ? moves[0] : null;
        const shouldHover = (curTurn === "white" && whitePieceAvailable(row, col, board)) || (availableMoves.some((item) => item.row === row && item.col === col));

        if (lastMove && ((lastMove.from.row === row && lastMove.from.col === col) || lastMove.to.row === row && lastMove.to.col === col)) {
            return `${isWhiteSquare ? "bg-amber-300" : "bg-amber-400"}`;
        }
        if (row === activeSquare.row && col === activeSquare.col)
            return `bg-yellow-200 ${shouldHover && "hover:bg-[#fde047]"}`;
        else
            return isWhiteSquare ? `bg-[#f0d9b5] ${shouldHover && "hover:bg-[#e6cfa5]"}` : `bg-[#b58863] ${shouldHover && "hover:bg-[#a07556]"}`;
    }
    const mapSymbolToPiece = (symbol) => {
        let result = null;
        switch (symbol) {
            case 'r': result = blackRook; break;
            case 'n': result = blackKnight; break;
            case 'b': result = blackBishop; break;
            case 'q': result = blackQueen; break;
            case 'k': result = blackKing; break;
            case 'p': result = blackPawn; break;
            case 'R': result = whiteRook; break;
            case 'N': result = whiteKnight; break;
            case 'B': result = whiteBishop; break;
            case 'Q': result = whiteQueen; break;
            case 'K': result = whiteKing; break;
            case 'P': result = whitePawn; break;
            default: result = null;
        }
        return result;
    }
    const handleMoveUndo = () => {
        const curMoves = moves;
        if (curMoves.length === 0) return;
        setCurTurn(curTurn => curTurn === "white" ? "black" : "white");
        setAvailableMoves([]);
        setBoard(curMoves.length === 1 ? INITIALBOARDSETUP : curMoves[1].board);
        setMoves(moves => moves.slice(1));
    }
    const handleResetGame = () => {
        if (!window.confirm("Are you sure you want to restart the game?")) {
            return;
        }
        setCurTurn("white");
        setAvailableMoves([]);
        setBoard(INITIALBOARDSETUP);
        setMoves([]);
    }
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
                            <div className="flex justify-center">
                                <div className={`flex-col rounded-2xl w-fit bg-[#e0c097]/90 flex justify-center gap-x-2 py-2 px-4 ${playerColor === "white" ? "text-white" : "text-black"}`}>
                                    <div className={`flex justify-center items-center gap-x-2`}>
                                        <div className={`${spectatorMode ? "hidden" : ""}`}>
                                            You are playing as
                                        </div>
                                        <div className={`w-[20px] h-[20px] rounded-full ${spectatorMode && curTurn === "white" ? "bg-white border-black" : "bg-black border-white "} ${!spectatorMode && playerColor === "white" ? "bg-white border-black" : "bg-black border-white "}`}></div>

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
                            <div className={`flex flex-col ${curTurn !== playerColor && "pointer-events-none"} ${spectatorMode && "pointer-events-none"}`}>
                                {renderBoard.map((row, rowIndex) => (
                                    <div key={rowIndex} className="flex justify-center items-center cursor-pointer">
                                        {row.map((item, colIndex) => {
                                            const piece = mapSymbolToPiece(item);
                                            const isWhiteSquare = (rowIndex + colIndex) % 2 == 0;
                                            const isAvailableMove = availableMoves.some(move => move.row === rowIndex && move.col === colIndex);
                                            const isActiveSquare = activeSquare.row === flip(rowIndex) && activeSquare.col === flip(colIndex);
                                            return (<button key={`${rowIndex},${colIndex}`} onClick={() => {
                                                curTurn === playerColor && handleClick({ row: flipped ? flip(rowIndex) : rowIndex, col: flipped ? flip(colIndex) : colIndex, piece: flipped ? board[flip(rowIndex)][flip(colIndex)] : item })
                                            }
                                            }
                                                className={`max-h-[min(11vh,11vw)] max-w-[min(11vh,11vw)] md:w-[min(10vh,10vw)] md:h-[min(10vh,10vw)] lg:w-[min(11vh,11vw)] lg:h-[min(11vh,11vw)] w-[50px] h-[50px] flex justify-center items-center relative ${getBackground(isWhiteSquare, flipped ? flip(rowIndex) : rowIndex, flipped ? flip(colIndex) : colIndex)} ${isWhiteSquare ? "text-[#5c3a1e]" : "text-[#fdf6e3]"} md:text-[16px] text-[10px]`}>

                                                {colIndex === 0 && <div className="absolute md:left-1 md:top-1 left-0.5 top-0.5">{flipped ? (rowIndex + 1) : (8 - rowIndex)}</div>}

                                                {rowIndex === 7 && <div className="absolute md:right-1 ,md:bottom-1 right-0.5 bottom-0.5">{flipped ? String.fromCharCode('a'.charCodeAt(0) + 7 - colIndex) : String.fromCharCode('a'.charCodeAt(0) + colIndex)}</div>}

                                                {piece ? <img src={piece} className={`w-[90%]  transition-transform duration-300 ease-in-out mb-2 
                                            ${isAvailableMove && "border-6 !mb-0 border-red-500 rounded-full"} ${isActiveSquare && "scale-110"}`} /> : isAvailableMove && <div className="w-[30%] h-[30%] bg-[#769656] rounded-full"></div>}
                                            </button>)
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
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
                                            <div className={`w-[20px] h-[20px] ${cur.turn === "white" ? "bg-white" : "bg-black"} shadow-md rounded-full`}></div>
                                            <span>played {encode(cur.from.row, cur.from.col)} → {encode(cur.to.row, cur.to.col)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            }
        </div >
    );
}
