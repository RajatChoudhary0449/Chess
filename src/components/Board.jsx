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
import { useState } from "react";
import { blackPieceAvailable, encode, getAllBlackMoves, getAllPossibleMoves, getAllWhiteMoves, isBlackKingChecked, isWhiteKingChecked, playMove, whitePieceAvailable } from "../utils/CommonFunctions.js"
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
    const handleClick = ({ row, col, piece }) => {
        if (curTurn === "white") {
            //Handle First White Tap
            if (whitePieceAvailable(row, col, board)) {
                setActiveSquare({ row, col });
                const availableMoves = getAllPossibleMoves({ row, col, piece }, board, moves);
                setAvailableMoves(availableMoves);
                return;
            }
        }
        if (curTurn === "black") {
            //Handle First Black Tap
            if (blackPieceAvailable(row, col, board)) {
                setActiveSquare({ row, col });
                const availableMoves = getAllPossibleMoves({ row, col, piece }, board, moves);
                setAvailableMoves(availableMoves);
                return;
            }
        }
        const isPlayable = availableMoves.some(move => move.row === row && move.col === col);
        if (isPlayable) {
            const isCaptured = (curTurn === "white" && blackPieceAvailable(row, col, board)) || (curTurn === "black" && whitePieceAvailable(row, col, board));
            const capturedPiece = isCaptured ? board[row][col] : null;
            //Check for promotion if any:
            const isPromotion =
                (curTurn === "white" && board[activeSquare.row][activeSquare.col] === PIECES.WHITE.PAWN && row === 0) ||
                (curTurn === "black" && board[activeSquare.row][activeSquare.col] === PIECES.BLACK.PAWN && row === 7);
            const isCastling = (curTurn === "white" && board[activeSquare.row][activeSquare.col] === PIECES.WHITE.KING && Math.abs(activeSquare.col - col) === 2) || ((curTurn === "black" && board[activeSquare.row][activeSquare.col] === PIECES.BLACK.KING && Math.abs(activeSquare.col - col) === 2))
            const updatedBoard = isCastling ? playMove({ from: { row: activeSquare.row, col: activeSquare.col }, to: { row, col } }, board, null, true) : playMove({ from: { row: activeSquare.row, col: activeSquare.col }, to: { row, col } }, board);
            const curMove = { from: { row: activeSquare.row, col: activeSquare.col }, piece, to: { row, col }, isCaptured: isCaptured, capturedPiece: capturedPiece, turn: curTurn, board: updatedBoard };
            if (isPromotion) {
                setPromotionPiece({ move: curMove, turn: curTurn });
            }
            else setPromotionPiece(null);

            setBoard(updatedBoard);
            if (!isPromotion) setMoves([curMove, ...moves]);
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
            }
            else if (curTurn === "white") {
                setMessage("Draw by stalemate");
                setGameOver(true);
            }
        }
        if (getAllBlackMoves(updatedBoard).length === 0) {
            if (isBlackKingChecked(updatedBoard)) {
                setMessage("White wins!!!");
                setGameOver(true);
            }
            else if (curTurn === "black") {
                setMessage("Draw by stalemate");
                setGameOver(true);
            }
        }
        return false;
    }
    const handlePromotion = (piece) => {
        const { move, turn } = promotionPiece;
        const updatedBoard = playMove(move, board, piece);
        setBoard(updatedBoard);
        setMoves([move, ...moves]);
        setCurTurn(turn === "white" ? "black" : "white");
        setPromotionPiece(null); // close modal
        checkGameOver(updatedBoard);
    };

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
            <GameOverModal gameOver={gameOver} message={message} />
            <div className="flex md:flex-row flex-col md:gap-x-2 lg:gap-x-4 gap-y-4">
                <div className="flex flex-col gap-y-2">
                    <div className="flex justify-center">
                        <div className="w-fit bg-[#e0c097]/90 flex justify-center gap-x-2 py-2 px-2">
                            <div className={`w-[20px] h-[20px] rounded-full ${curTurn === "white" ? "bg-white border-black" : "bg-black border-white "}`}></div>
                            {curTurn === "white" ? "White" : "Black"}{`'s turn`}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {board.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center items-center cursor-pointer">
                                {row.map((item, colIndex) => {
                                    const piece = mapSymbolToPiece(item);
                                    const isWhiteSquare = (rowIndex + colIndex) % 2 == 0;
                                    const isAvailableMove = availableMoves.some(move => move.row === rowIndex && move.col === colIndex);
                                    const isActiveSquare = activeSquare.row === rowIndex && activeSquare.col === colIndex;
                                    return (<button key={`${rowIndex},${colIndex}`} onClick={() => { handleClick({ row: rowIndex, col: colIndex, piece: item }) }} className={`max-h-[min(11vh,11vw)] max-w-[min(11vh,11vw)] md:w-[min(10vh,10vw)] md:h-[min(10vh,10vw)] lg:w-[min(11vh,11vw)] lg:h-[min(11vh,11vw)] w-[50px] h-[50px] flex justify-center items-center relative ${getBackground(isWhiteSquare, rowIndex, colIndex)} ${isWhiteSquare ? "text-[#5c3a1e]" : "text-[#fdf6e3]"} md:text-[16px] text-[10px]`}>

                                        {colIndex === 0 && <div className="absolute md:left-1 md:top-1 left-0.5 top-0.5">{8 - rowIndex}</div>}

                                        {rowIndex === 7 && <div className="absolute md:right-1 ,md:bottom-1 right-0.5 bottom-0.5">{String.fromCharCode('a'.charCodeAt(0) + colIndex)}</div>}

                                        {piece ? <img src={piece} className={`w-[90%]  transition-transform duration-300 ease-in-out mb-2 
                                            ${isAvailableMove && "border-6 !mb-0 border-red-500 rounded-full"} ${isActiveSquare && "scale-110"}`} /> : isAvailableMove && <div className="w-[30%] h-[30%] bg-[#769656] rounded-full"></div>}
                                    </button>)
                                })}
                            </div>
                        ))}
                        {/* <div className="flex justify-center text-center ml-4">{Array.from({ length: 8 }, (_, i) => (String.fromCharCode('a'.charCodeAt(0) + i)
                    )).map((item, index) => (<span key={index} className="max-h-[min(10vh,10vw)] max-w-[min(10vh,10vw)] md:w-[100px] w-[50px]">{item}</span>))}</div> */}
                    </div>
                </div>
                <div className="h-[200px] md:h-[min(80vh,80vw)] lg:h-[min(88vh,88vw)] md:max-h-[min(80vh,80vw)] lg:max-h-[min(88vh,88vw)] w-full">
                    <div className="md:w-full md:max-w-[220px] md:min-w-[200px] w-[90%] mx-auto px-4 h-full bg-[#e0c097]/90 text-[#5c3a1e] opacity-90 py-2 md:mt-12 rounded-md shadow-md flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <div className="font-semibold">Move List</div>
                            {moves.length > 0 && (
                                <div className="flex gap-x-2 text-white">
                                    <button onClick={handleMoveUndo} className="bg-amber-400 p-2 rounded-[4px]">
                                        <i className="fas fa-undo" title="Undo"></i>
                                    </button>
                                    <button onClick={handleResetGame} className="bg-red-500 p-2 rounded-[4px]">
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
        </div >
    );
}
