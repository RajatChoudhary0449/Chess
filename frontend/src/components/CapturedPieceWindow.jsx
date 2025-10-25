import { useState, useEffect } from "react";
import useGame from "../hooks/useGame";
import {
    getAllCapturedBlackPieces,
    getAllCapturedWhitePieces,
    getPointsFromPieces,
} from "../utils/CommonFunctions";
import { BLACK, INITIALBOARDSETUP, PIECES, WHITE } from "../constants/constants";
import blackRook from "../assets/blackRook.png";
import blackKnight from "../assets/blackKnight.png";
import blackBishop from "../assets/blackBishop.png";
import blackQueen from "../assets/blackQueen.png";
import blackPawn from "../assets/blackPawn.png";
import whiteRook from "../assets/whiteRook.png";
import whiteKnight from "../assets/whiteKnight.png";
import whiteBishop from "../assets/whiteBishop.png";
import whiteQueen from "../assets/whiteQueen.png";
import whitePawn from "../assets/whitePawn.png";

export default function CapturedPieceWindow({ isWhite }) {
    const { activeMoveIndex, moves } = useGame();
    const symbol = isWhite ? WHITE.toUpperCase() : BLACK.toUpperCase();
    const currentBoard = moves?.[activeMoveIndex]?.board || INITIALBOARDSETUP;

    const [currentCapturedPieces, setCurrentCapturedPieces] = useState(
        isWhite
            ? getAllCapturedWhitePieces(currentBoard)
            : getAllCapturedBlackPieces(currentBoard)
    );
    const [points,setPoints]=useState(getPointsFromPieces(currentBoard));

    useEffect(() => {
        const currentBoard = moves?.[activeMoveIndex]?.board || INITIALBOARDSETUP;
        setCurrentCapturedPieces(
            isWhite
                ? getAllCapturedWhitePieces(currentBoard)
                : getAllCapturedBlackPieces(currentBoard)
        );
        setPoints(_=>getPointsFromPieces(currentBoard));
    }, [activeMoveIndex, moves, isWhite]);

    const pieceIcons = isWhite
        ? {
            [PIECES.WHITE.PAWN]: whitePawn,
            [PIECES.WHITE.KNIGHT]: whiteKnight,
            [PIECES.WHITE.BISHOP]: whiteBishop,
            [PIECES.WHITE.ROOK]: whiteRook,
            [PIECES.WHITE.QUEEN]: whiteQueen,
        }
        : {
            [PIECES.BLACK.PAWN]: blackPawn,
            [PIECES.BLACK.KNIGHT]: blackKnight,
            [PIECES.BLACK.BISHOP]: blackBishop,
            [PIECES.BLACK.ROOK]: blackRook,
            [PIECES.BLACK.QUEEN]: blackQueen,
        };

    const pieceOrder = [
        PIECES[symbol].PAWN,
        PIECES[symbol].KNIGHT,
        PIECES[symbol].BISHOP,
        PIECES[symbol].ROOK,
        PIECES[symbol].QUEEN,
    ];

    return (
        <div
            className={`flex items-center p-1 ${isWhite ? "bg-[#444]" : "bg-white"
                } overflow-x-auto`}
        >
            {pieceOrder.map((pieceType) => {
                const count = currentCapturedPieces[pieceType] || 0;
                if (count <= 0) return null;

                return (
                    <div
                        key={pieceType}
                        className="flex items-center mr-1 last:mr-0 relative"
                    >
                        {Array.from({ length: count }).map((_, i) => (
                            <img
                                key={`${pieceType}-${i}`}
                                src={pieceIcons[pieceType]}
                                alt={pieceType}
                                className={`w-5 h-5 ${pieceType === PIECES[symbol].PAWN ? "-ml-3" : "-ml-2"} first:ml-0 ${isWhite ? "drop-shadow-sm" : ""}`}
                            />
                        ))}
                    </div>
                );
            })}
            {isWhite && points.white>points.black && <p className="text-white">+{points.white-points.black}</p>}
            {!isWhite && points.black>points.white && <p className="">+{points.black-points.white}</p>}
        </div>
    );

}
