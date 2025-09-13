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
import { blackPieceAvailable, encode, getAllPossibleMoves, playMove, whitePieceAvailable } from "../utils/CommonFunctions.js"
export default function Board() {
    const [activeSquare, setActiveSquare] = useState({ row: null, col: null });
    const [curTurn, setCurTurn] = useState("white");
    const [availableMoves, setAvailableMoves] = useState([]);
    const [board, setBoard] = useState([
        ["r", "n", "b", "q", "k", "b", "n", "r"],
        Array.from({ length: 8 }, () => "p"),
        ...Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => "")),
        Array.from({ length: 8 }, () => "P"),
        ["R", "N", "B", "Q", "K", "B", "N", "R"],
    ]);
    const [moves, setMoves] = useState([]);
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
            const curMove={ from: { row: activeSquare.row, col: activeSquare.col }, to: { row, col }, isCaptured: isCaptured, capturedPiece: capturedPiece, turn: curTurn }
            const updatedBoard=playMove(curMove,board);
            setBoard(updatedBoard);
            setMoves([curMove, ...moves]);
            setCurTurn((cur) => cur === "white" ? "black" : "white");
        }
        setActiveSquare({ row: null, col: null });
        setAvailableMoves([]);
    }
    const getBackground = (isWhiteSquare, row, col) => {
        // if (availableMoves.some(move => move.row === row && move.col === col))
        // {
        //     return "bg-[#769656]";
        // }
        const shouldHover = (curTurn === "white" && whitePieceAvailable(row, col, board)) || (availableMoves.some((item) => item.row === row && item.col === col));
        if (row === activeSquare.row && col === activeSquare.col)
            // return isWhiteSquare?"bg-gray-300":"bg-green-400";
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
            <div className={`${curTurn === "white" ? "" : ""}`}>
                {curTurn === "white" ? "White" : "Black"} {"'s turn"}
            </div>
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
