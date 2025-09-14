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
    const [promotionPiece, setPromotionPiece] = useState("");
    const [gameOver, setGameOver] = useState(false);
    const [board, setBoard] = useState(INITIALBOARDSETUP);
    const [moves, setMoves] = useState([]);
    const [message, setMessage] = useState("");
    const handleClick = ({ row, col, piece }) => {
        if (curTurn === "white") {
            //Handle First White Tap
            if (whitePieceAvailable(row, col, board)) {
                setActiveSquare({ row, col });
                const moves = getAllPossibleMoves({ row, col, piece }, board);
                setAvailableMoves(moves);
                return;
            }
        }
        if (curTurn === "black") {
            //Handle First Black Tap
            if (blackPieceAvailable(row, col, board)) {
                setActiveSquare({ row, col });
                const moves = getAllPossibleMoves({ row, col, piece }, board);
                setAvailableMoves(moves);
                return;
            }
        }
        const isPlayable = availableMoves.some(move => move.row === row && move.col === col);
        if (isPlayable) {
            const isCaptured = (curTurn === "white" && blackPieceAvailable(row, col, board)) || (curTurn === "black" && whitePieceAvailable(row, col, board));
            const capturedPiece = isCaptured ? board[row][col] : null;
            const curMove = { from: { row: activeSquare.row, col: activeSquare.col }, to: { row, col }, isCaptured: isCaptured, capturedPiece: capturedPiece, turn: curTurn }
            //Check for promotion if any:
            const isPromotion =
                (curTurn === "white" && board[activeSquare.row][activeSquare.col] === PIECES.WHITE.PAWN && row === 0) ||
                (curTurn === "black" && board[activeSquare.row][activeSquare.col] === PIECES.BLACK.PAWN && row === 7);
            if (isPromotion) {
                setPromotionPiece({ move: curMove, turn: curTurn });
            }

            const updatedBoard = playMove(curMove, board);
            setBoard(updatedBoard);
            setMoves([curMove, ...moves]);
            setCurTurn((cur) => cur === "white" ? "black" : "white");
            if (getAllWhiteMoves(updatedBoard).length === 0) {
                if (isWhiteKingChecked(updatedBoard)) {
                    setMessage("Black wins!!!");
                }
                else {
                    setMessage("Draw by stalemate");
                }
                setGameOver(true);
            }
            if (getAllBlackMoves(updatedBoard).length === 0) {
                if (isBlackKingChecked(updatedBoard)) {
                    setMessage("White wins!!!");
                }
                else {
                    setMessage("Draw by stalemate");
                }
                setGameOver(true);
            }

        }
        setActiveSquare({ row: null, col: null });
        setAvailableMoves([]);
    }
    const handlePromotion = (piece) => {
        const { move, turn } = promotionPiece;
        const updatedBoard = playMove(move, board, piece);
        setBoard(updatedBoard);
        setMoves([move, ...moves]);
        setCurTurn(turn === "white" ? "black" : "white");
        setPromotionPiece(""); // close modal

        checkGameOver(updatedBoard);
    };

    const getBackground = (isWhiteSquare, row, col) => {
        if (board[row][col] === PIECES.WHITE.KING && isWhiteKingChecked(board))
            return "bg-red-500";
        if (board[row][col] === PIECES.BLACK.KING && isBlackKingChecked(board))
            return "bg-red-500";
        const shouldHover = (curTurn === "white" && whitePieceAvailable(row, col, board)) || (availableMoves.some((item) => item.row === row && item.col === col));
        if (row === activeSquare.row && col === activeSquare.col)
            return `bg-[#fef08a] ${shouldHover && "hover:bg-[#fde047]"}`;
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
    return (
        <div className="flex justify-center items-center flex-col h-[100vh]">
            {promotionPiece && <PromotionModal curTurn={curTurn} handlePromotion={handlePromotion} />}
            <div className={`${curTurn === "white" ? "" : ""}`}>
                {curTurn === "white" ? "White" : "Black"} {"'s turn"}
            </div>
            <GameOverModal gameOver={gameOver} message={message} />
            <div className="flex md:flex-row flex-col gap-x-4">
                <div className="flex flex-col">
                    {board.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center items-center cursor-pointer">
                            <div className="mr-2">{8 - rowIndex}</div>
                            {row.map((item, colIndex) => {
                                const piece = mapSymbolToPiece(item);
                                const isWhiteSquare = (rowIndex + colIndex) % 2 == 0;
                                const isAvailableMove = availableMoves.some(move => move.row === rowIndex && move.col === colIndex);
                                const isActiveSquare = activeSquare.row === rowIndex && activeSquare.col === colIndex;
                                return (<button key={`${rowIndex},${colIndex}`} onClick={() => { handleClick({ row: rowIndex, col: colIndex, piece: item }) }} className={`max-h-[min(10vh,10vw)] max-w-[min(10vh,10vw)] md:w-[100px] md:h-[100px] w-[50px] h-[50px] flex justify-center items-center ${getBackground(isWhiteSquare, rowIndex, colIndex)}`}>
                                    {piece ? <img src={piece} className={`w-[80%]  transition-transform duration-300 ease-in-out ${isAvailableMove && "border border-red-500 rounded-full"} ${isActiveSquare && "scale-110"}`} /> : isAvailableMove && <div className="w-[30%] h-[30%] bg-[#769656] rounded-full"></div>}
                                </button>)
                            })}
                        </div>
                    ))}
                    <div className="flex justify-center text-center ml-4">{Array.from({ length: 8 }, (_, i) => (String.fromCharCode('a'.charCodeAt(0) + i)
                    )).map((item, index) => (<span key={index} className="max-h-[min(10vh,10vw)] max-w-[min(10vh,10vw)] md:w-[100px] w-[50px]">{item}</span>))}</div>
                </div>
                <div className="">
                    <ul>
                        {moves.map((cur, index) => (<li key={index}>{cur.turn} played {encode(cur.from.row, cur.from.col)} to {encode(cur.to.row, cur.to.col)}</li>))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
