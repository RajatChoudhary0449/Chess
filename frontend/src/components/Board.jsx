import { BLACK, PIECES, WHITE } from '../constants/constants';
import useGame from '../hooks/useGame';
import { addMove, areCoordinatesEqual, blackPieceAvailable, checkGameOver, flip, flipBoard, flipCoordinates, flipTurn, getAllPossibleMoves, getLastMove, isBlackKingChecked, isWhiteKingChecked, pieceAvailable, playMove, whitePieceAvailable } from '../utils/CommonFunctions';
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
import socket from '../socket';
export default function Board() {
    const { board, setBoard, availableMoves, activeSquare, playerColor, flipped, spectatorMode, curTurn, setCurTurn, moves, setMoves, setActiveSquare, setPromotionPiece, setAvailableMoves, setMessage, setGameOver } = useGame();
    const renderBoard = flipped ? flipBoard(board) : board;
    const handleClick = ({ row, col, piece }) => {
        const coordinate = { row, col };
        if (curTurn === WHITE) {
            //Handle First White Tap
            if (whitePieceAvailable(row, col, board)) {
                setActiveSquare({ row, col });
                let allPossibleMoves = getAllPossibleMoves({ row, col, piece }, board, moves);
                if (flipped) allPossibleMoves = allPossibleMoves.map(item => flipCoordinates(item));
                setAvailableMoves(allPossibleMoves);
                return;
            }
        }
        if (curTurn === BLACK) {
            //Handle First Black Tap
            if (blackPieceAvailable(row, col, board)) {
                setActiveSquare({ row, col });
                let allPossibleMoves = getAllPossibleMoves({ row, col, piece }, board, moves);
                if (flipped) allPossibleMoves = allPossibleMoves.map(item => flipCoordinates(item));
                setAvailableMoves(allPossibleMoves);
                return;
            }
        }
        const isPlayable = availableMoves.some(move => areCoordinatesEqual(move, flipped ? flipCoordinates(coordinate) : coordinate));

        if (isPlayable) {
            piece=board[activeSquare.row][activeSquare.col];
            const lastMove = getLastMove(moves);
            const isCaptured = (curTurn === WHITE && blackPieceAvailable(row, col, board)) || (curTurn === BLACK && whitePieceAvailable(row, col, board));
            const capturedPiece = isCaptured ? board[row][col] : null;
            const isPromotion =
                (curTurn === WHITE && board[activeSquare.row][activeSquare.col] === PIECES.WHITE.PAWN && row === 0) ||
                (curTurn === BLACK && board[activeSquare.row][activeSquare.col] === PIECES.BLACK.PAWN && row === 7);
            const isCastling = (curTurn === WHITE && board[activeSquare.row][activeSquare.col] === PIECES.WHITE.KING && Math.abs(activeSquare.col - col) === 2) || ((curTurn === BLACK && board[activeSquare.row][activeSquare.col] === PIECES.BLACK.KING && Math.abs(activeSquare.col - col) === 2));
            const isEnPassant = (lastMove && (lastMove.piece === PIECES.WHITE.PAWN || lastMove.piece === PIECES.BLACK.PAWN)) && (piece === PIECES.WHITE.PAWN || piece === PIECES.BLACK.PAWN) && (Math.abs(col - activeSquare.col) === 1) && !pieceAvailable(row, col, board);
            let updatedBoard = board;
            if (isEnPassant) {
                updatedBoard = playMove({ from: { row: activeSquare.row, col: activeSquare.col }, to: { row, col } }, board, null, false, col);
            }
            else {

                updatedBoard = isCastling ? playMove({ from: { row: activeSquare.row, col: activeSquare.col }, to: { row, col } }, board, null, true) : playMove({ from: { row: activeSquare.row, col: activeSquare.col }, to: { row, col } }, board);
            }

            const curMove = { from: { row: activeSquare.row, col: activeSquare.col }, piece, to: { row, col }, isCaptured: isCaptured, promotedTo: null, capturedPiece: capturedPiece, isCastling, isPromotion, turn: curTurn, board: updatedBoard };

            if (isPromotion) {
                setPromotionPiece({ move: curMove, turn: curTurn });
            }
            else setPromotionPiece(null);

            setBoard(updatedBoard);
            if (!isPromotion) {
                setMoves(move=>addMove(curMove,move));
                socket.emit("make_move", { move: curMove });
            }
            setCurTurn(cur => flipTurn(cur));
            const { state, message } = checkGameOver(updatedBoard);
            setGameOver(state);
            setMessage(message);
        }
        setActiveSquare({ row: null, col: null });
        setAvailableMoves([]);
    }
    const getBackground = (isWhiteSquare, row, col) => {
        const coordinate = { row, col };
        if (board[row][col] === PIECES.WHITE.KING && isWhiteKingChecked(board))
            return "bg-red-500";
        if (board[row][col] === PIECES.BLACK.KING && isBlackKingChecked(board))
            return "bg-red-500";
        const lastMove = moves.length > 0 ? moves[0] : null;
        const shouldHover = (curTurn === WHITE && whitePieceAvailable(row, col, board)) || (availableMoves.some((item) => areCoordinatesEqual(item, coordinate)));

        if (lastMove && (areCoordinatesEqual(lastMove.from, coordinate) || areCoordinatesEqual(lastMove.to, coordinate))) {
            return `${isWhiteSquare ? "bg-amber-300" : "bg-amber-400"}`;
        }
        if (areCoordinatesEqual(coordinate, activeSquare))
            return `bg-yellow-200 ${shouldHover && "hover:bg-[#fde047]"}`;
        else
            return isWhiteSquare ? `bg-[#f0d9b5] ${shouldHover && "hover:bg-[#e6cfa5]"}` : `bg-[#b58863] ${shouldHover && "hover:bg-[#a07556]"}`;
    }
    const mapSymbolToPiece = (symbol) => {
        let result = null;
        switch (symbol) {
            case PIECES.BLACK.ROOK: result = blackRook; break;
            case PIECES.BLACK.KNIGHT: result = blackKnight; break;
            case PIECES.BLACK.BISHOP: result = blackBishop; break;
            case PIECES.BLACK.QUEEN: result = blackQueen; break;
            case PIECES.BLACK.KING: result = blackKing; break;
            case PIECES.BLACK.PAWN: result = blackPawn; break;
            case PIECES.WHITE.ROOK: result = whiteRook; break;
            case PIECES.WHITE.KNIGHT: result = whiteKnight; break;
            case PIECES.WHITE.BISHOP: result = whiteBishop; break;
            case PIECES.WHITE.QUEEN: result = whiteQueen; break;
            case PIECES.WHITE.KING: result = whiteKing; break;
            case PIECES.WHITE.PAWN: result = whitePawn; break;
            default: result = null;
        }
        return result;
    }
    return (
        <div className={`flex flex-col ${curTurn !== playerColor && "pointer-events-none"} ${spectatorMode && "pointer-events-none"}`}>
            {renderBoard.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center items-center cursor-pointer">
                    {row.map((item, colIndex) => {
                        const piece = mapSymbolToPiece(item);
                        const isWhiteSquare = (rowIndex + colIndex) % 2 == 0;
                        const isAvailableMove = availableMoves.some(move => move.row === rowIndex && move.col === colIndex);
                        const isActiveSquare = activeSquare.row === (flipped ? flip(rowIndex) : rowIndex) && activeSquare.col === (flipped ? flip(colIndex) : colIndex);
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
        </div>)
}
