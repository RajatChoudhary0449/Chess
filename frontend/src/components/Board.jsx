import { BLACK, INITIALBOARDSETUP, MESSAGE_TYPES, PIECES, POSITIONS, WHITE } from '../constants/constants';
import useGame from '../hooks/useGame';
import { addMove, areCoordinatesEqual, blackPieceAvailable, canBlackKingCastleLongRight, canBlackKingCastleShortRight, canWhiteKingCastleLongRight, canWhiteKingCastleShortRight, checkGameOver, decode, encode, flip, flipBoard, flipCoordinates, flipTurn, getAllCapturedWhitePieces, getAllPossibleMoves, getFenPosition, getLastMove, isBlackKingChecked, isWhiteKingChecked, pieceAvailable, playMove, whitePieceAvailable } from '../utils/CommonFunctions';
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
import { useEffect, useState } from 'react';
import { fetchEvaluation } from '../services/fetchEvaluation';
import useNotification from '../hooks/useNotification';
export default function Board({ onePlayer }) {
    const { board, setBoard, availableMoves, activeSquare, playerColor, flipped, spectatorMode, curTurn, setCurTurn, moves, setMoves, setActiveSquare, setPromotionPiece, setAvailableMoves, setMessage, setGameOver, activeMoveIndex, whitePlayerTimerRef, blackPlayerTimerRef, gameStarted } = useGame();
    const [pendingClick, setPendingClick] = useState(null);
    const [renderBoard, setRenderBoard] = useState(flipped ? flipBoard(board) : board);
    const [premove, setPremove] = useState({ from: null, to: null });
    const { showNotification } = useNotification();

    useEffect(() => {
        // Start with the base board from the current active move
        const currentBoard = moves?.[activeMoveIndex]?.board || INITIALBOARDSETUP;
        let updatedBoard = currentBoard;

        // Show premove only when viewing the latest move
        if (activeMoveIndex === moves.length - 1) {
            updatedBoard = currentBoard.map(row => [...row]);
            const { from, to } = premove;
            if (from && to) {
                const piece = updatedBoard[from.row][from.col];
                if (piece) {
                    updatedBoard[from.row][from.col] = "";
                    updatedBoard[to.row][to.col] = piece;
                }
            }
            else if (from) {
                let { row, col, piece } = from;
                let allPossibleMoves = getAllPossibleMoves({ row, col, piece, board: updatedBoard, moves, premove: true });
                // if (flipped) allPossibleMoves = allPossibleMoves.map((item) => flipCoordinates(item));
                setAvailableMoves(allPossibleMoves);
            }
        }

        // Apply flipping logic for player perspective
        setRenderBoard(flipped ? flipBoard(updatedBoard) : updatedBoard);
    }, [activeMoveIndex, premove, flipped, moves]);
    useEffect(() => {
        if (curTurn === playerColor) {
            const { from, to } = premove;
            if (from)
                handleClick(from);
            if (to) {
                setPendingClick({ row: to.row, col: to.col, piece: to.piece });
            }
            setPremove(_ => ({ from: null, to: null }));
        }
    }, [curTurn]);
    useEffect(() => {
        async function abc() {
            const lastMove = getLastMove(moves);
            try {
                const response = await fetchEvaluation({ fen: getFenPosition(lastMove) });
                const data = response;
                // console.log(data)
                const { row: fromRow, col: fromCol } = decode(data?.from);
                const { row: toRow, col: toCol } = decode(data?.to);

                const from = { row: fromRow, col: fromCol };
                const to = { row: toRow, col: toCol };
                const piece = board[from.row][from.col];
                // const promotedTo = data?.promotion;
                handleClick({ ...from, piece, bot: true });

                const availableMoves = [to];
                const activeSquare = from;

                await new Promise((resolve) => setTimeout(resolve, 1000));

                const toPiece = board[to.row][to.col];

                handleClick({ ...to, piece: toPiece, bot: true }, true, { piece, availableMoves, activeSquare });
            }
            catch (err) {
                console.log(err);
            }
        }
        const isItBotTurn = playerColor && onePlayer && playerColor !== curTurn;
        if (onePlayer && isItBotTurn && gameStarted)
            abc();
    }, [curTurn, gameStarted]);
    useEffect(() => {
        if (pendingClick) {
            if (availableMoves.length === 0) {
                setPendingClick(null);
                setPremove({ from: null, to: null });
                return;
            }
            const movePossible = availableMoves.some(move => move.row === pendingClick.row && move.col === pendingClick.col);
            if (movePossible) {
                handleClick(pendingClick);
            }
            else {
                showNotification({ message: `Invalid Premove`, type: MESSAGE_TYPES.WARNING, position: POSITIONS.TOP_RIGHT });
            }
            setPendingClick(null);
            setPremove({ from: null, to: null });
        }
    }, [availableMoves]);
    const getActiveSquare = () => {
        return activeSquare;
    }
    const handleClick = ({ row, col, piece, bot = false }, shouldPlayWithoutCheck = null, overridingParams = {}) => {
        const board = getLastMove(moves)?.board || INITIALBOARDSETUP;

        if (curTurn !== playerColor && !bot) {
            if (!premove.from &&
                ((playerColor === WHITE && !whitePieceAvailable(row, col, board)) || (playerColor === BLACK && !blackPieceAvailable(row, col, board))))
                return;
            const curClickInfo = { row, col, piece };
            if (!premove.from) {
                setPremove(_ => ({ from: curClickInfo, to: null }));
            }
            else if (!premove.to) {
                if (availableMoves.some(moves => moves.row === curClickInfo.row && moves.col === curClickInfo.col)) {
                    setAvailableMoves([]);
                    setPremove(pm => ({ from: pm.from, to: curClickInfo }));
                }
                else if (!pieceAvailable(curClickInfo.row, curClickInfo.col, board)) {
                    setAvailableMoves([]);
                    setPremove(_ => ({ from: null, to: null }));
                }
                else if ((playerColor === WHITE && whitePieceAvailable(curClickInfo.row, curClickInfo.col, board)) || (playerColor === BLACK && blackPieceAvailable(curClickInfo.row, curClickInfo.col, board))) {
                    setPremove(_ => ({ from: curClickInfo, to: null }));
                }
            }
            else {
                if (
                    (playerColor === WHITE && whitePieceAvailable(curClickInfo.row, curClickInfo.col, board)) ||
                    (playerColor === BLACK && blackPieceAvailable(curClickInfo.row, curClickInfo.col, board))
                )
                    setPremove(_ => ({ from: curClickInfo, to: null }));
            }
            if (!onePlayer) return;
        }
        const coordinate = { row, col };
        if (!shouldPlayWithoutCheck) {
            if (curTurn === WHITE) {
                //Handle First White Tap
                if (whitePieceAvailable(row, col, board)) {
                    setActiveSquare({ row, col });
                    let allPossibleMoves = getAllPossibleMoves({ row, col, piece, board, moves });
                    // if (flipped) allPossibleMoves = allPossibleMoves.map(item => flipCoordinates(item));
                    setAvailableMoves(allPossibleMoves);
                    return;
                }
            }
            if (curTurn === BLACK) {
                //Handle First Black Tap
                if (blackPieceAvailable(row, col, board)) {
                    setActiveSquare({ row, col });
                    let allPossibleMoves = getAllPossibleMoves({ row, col, piece, board, moves });
                    // if (flipped) allPossibleMoves = allPossibleMoves.map(item => flipCoordinates(item));
                    setAvailableMoves(allPossibleMoves);
                    return;
                }
            }
        }
        const isPlayable = shouldPlayWithoutCheck || availableMoves.some(move => areCoordinatesEqual(move, coordinate));

        if (isPlayable) {
            let activeSquare = shouldPlayWithoutCheck ? overridingParams.activeSquare : getActiveSquare();
            let piece = shouldPlayWithoutCheck ? overridingParams.piece : board[activeSquare.row][activeSquare.col];
            // let botPromotion = shouldPlayWithoutCheck && overridingParams.promotedTo;
            const lastMove = getLastMove(moves);
            const isPromotion =
                (curTurn === WHITE && board[activeSquare.row][activeSquare.col] === PIECES.WHITE.PAWN && row === 0) ||
                (curTurn === BLACK && board[activeSquare.row][activeSquare.col] === PIECES.BLACK.PAWN && row === 7);
            const isCastling = (curTurn === WHITE && board[activeSquare.row][activeSquare.col] === PIECES.WHITE.KING && Math.abs(activeSquare.col - col) === 2) || ((curTurn === BLACK && board[activeSquare.row][activeSquare.col] === PIECES.BLACK.KING && Math.abs(activeSquare.col - col) === 2));
            const isEnPassant = (lastMove && (lastMove.piece === PIECES.WHITE.PAWN || lastMove.piece === PIECES.BLACK.PAWN)) && (piece === PIECES.WHITE.PAWN || piece === PIECES.BLACK.PAWN) && (Math.abs(col - activeSquare.col) === 1) && !pieceAvailable(row, col, board);
            const isCapturing = isEnPassant || (curTurn === WHITE && blackPieceAvailable(row, col, board)) || (curTurn === BLACK && whitePieceAvailable(row, col, board));

            const lastPawnMoveOrCapture = (isCapturing || (piece === PIECES.BLACK.PAWN || piece === PIECES.WHITE.PAWN)) ? 0 : (moves.length > 0 ? getLastMove(moves)?.lastPawnMoveOrCapture : 0) + 1;

            let enPassantTarget = ((piece === PIECES.WHITE.PAWN || piece === PIECES.BLACK.PAWN) && Math.abs(row - activeSquare.row) === 2) ? encode((row + activeSquare.row) / 2, col) : "-";
            let updatedBoard = board;
            if (isEnPassant) {
                updatedBoard = playMove({ from: { row: activeSquare.row, col: activeSquare.col }, to: { row, col } }, board, null, false, col);
            }
            else {
                updatedBoard = isCastling ? playMove({ from: { row: activeSquare.row, col: activeSquare.col }, to: { row, col } }, board, null, true) : playMove({ from: { row: activeSquare.row, col: activeSquare.col }, to: { row, col } }, board);
            }

            let castlingRights = '';
            if (canWhiteKingCastleShortRight(updatedBoard, moves)) castlingRights += 'K';
            if (canWhiteKingCastleLongRight(updatedBoard, moves)) castlingRights += 'Q';
            if (canBlackKingCastleShortRight(updatedBoard, moves)) castlingRights += 'k';
            if (canBlackKingCastleLongRight(updatedBoard, moves)) castlingRights += 'q';
            if (castlingRights === "") castlingRights = "-";

            const fullMove = Math.ceil((moves.length + 1) / 2);
            const whiteTime = whitePlayerTimerRef?.current?.getTime();
            const blackTime = blackPlayerTimerRef?.current?.getTime();
            const curMove = { from: { row: activeSquare.row, col: activeSquare.col }, piece, to: { row, col }, isCapturing, promotedTo: null, isCastling, isPromotion, turn: curTurn, board: updatedBoard, castlingRights, enPassantTarget, lastPawnMoveOrCapture, fullMove, whiteTime, blackTime };
            if (isPromotion) {
                setPromotionPiece({ move: curMove, turn: curTurn });
            }
            else setPromotionPiece(null);

            setBoard(updatedBoard);
            if (!isPromotion) {
                setMoves(move => addMove(curMove, move));
                socket.emit("make_move", { move: curMove });
                // getFenPosition(curMove);
            }
            setCurTurn(cur => flipTurn(cur));
            const { state, message } = checkGameOver(updatedBoard);
            setGameOver(state);
            setMessage(message);
            setActiveSquare({ row: null, col: null });
            setAvailableMoves([]);
        }
    }
    const getBackground = (isWhiteSquare, row, col) => {
        const coordinate = { row, col };
        const lastMove = moves?.[activeMoveIndex];
        const shouldHover = (curTurn === WHITE && whitePieceAvailable(row, col, board)) || (curTurn === BLACK && blackPieceAvailable(row, col, board)) || (availableMoves.some((item) => areCoordinatesEqual(item, coordinate)));
        if (premove.from) {
            const { row: firstRow, col: firstCol } = premove.from;
            const { row: secondRow, col: secondCol } = premove.to || {};
            if (row === firstRow && col === firstCol) {
                return isWhiteSquare ? `bg-purple-300 ${shouldHover && "bg-purple-350"}` : `bg-purple-400 ${shouldHover && "bg-purple-450"}`;
            }
            else if (premove.to && row === secondRow && col === secondCol) {
                return isWhiteSquare ? "bg-purple-600" : "bg-purple-700";
            }
        }

        if (board[row][col] === PIECES.WHITE.KING && isWhiteKingChecked(board))
            return "bg-red-500";
        if (board[row][col] === PIECES.BLACK.KING && isBlackKingChecked(board))
            return "bg-red-500";


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
        <div className={`flex flex-col ${(spectatorMode || !gameStarted) && "pointer-events-none"}`}>
            {renderBoard.map((row, rowIndex) => (
                <div key={rowIndex} className={`flex justify-center items-center cursor-pointer ${activeMoveIndex === moves?.length - 1 ? "" : "pointer-events-none"}`}>
                    {row.map((item, colIndex) => {
                        const piece = mapSymbolToPiece(item);
                        const isWhiteSquare = (rowIndex + colIndex) % 2 == 0;
                        const isAvailableMove = availableMoves.some(move => (flipped ? flip(move.row) : move.row) === rowIndex && (flipped ? flip(move.col) : move.col) === colIndex);
                        const isActiveSquare = activeSquare.row === (flipped ? flip(rowIndex) : rowIndex) && activeSquare.col === (flipped ? flip(colIndex) : colIndex);
                        return (<button key={`${rowIndex},${colIndex}`} onClick={() => {
                            handleClick({ row: flipped ? flip(rowIndex) : rowIndex, col: flipped ? flip(colIndex) : colIndex, piece: flipped ? board[flip(rowIndex)][flip(colIndex)] : item })
                        }
                        }
                            className={`max-h-[min(10vh,10vw)] max-w-[min(10vh,10vw)] md:w-[min(9vh,9vw)] md:h-[min(9vh,9vw)] lg:w-[min(10vh,10vw)] lg:h-[min(10vh,10vw)] w-[50px] h-[50px] flex justify-center items-center relative outline-none ${getBackground(isWhiteSquare, flipped ? flip(rowIndex) : rowIndex, flipped ? flip(colIndex) : colIndex)} ${isWhiteSquare ? "text-[#5c3a1e]" : "text-[#fdf6e3]"} md:text-[16px] text-[10px]`}
                            aria-label={`Square ${String.fromCharCode(97 + (flipped ? 7 - colIndex : colIndex))}${flipped ? (rowIndex + 1) : (8 - rowIndex)}${item ? ` with ${item}` : ''}`}
                        >

                            {colIndex === 0 && <div className="absolute md:left-1 md:top-1 left-0.5 top-0.5">{flipped ? (rowIndex + 1) : (8 - rowIndex)}</div>}

                            {rowIndex === 7 && <div className="absolute md:right-1 ,md:bottom-1 right-0.5 bottom-0.5">{flipped ? String.fromCharCode('a'.charCodeAt(0) + 7 - colIndex) : String.fromCharCode('a'.charCodeAt(0) + colIndex)}</div>}

                            {piece ?
                                <img src={piece} className={`w-[90%]  transition-transform duration-300 ease-in-out mb-2 
                            ${isAvailableMove && "border-6 !mb-0 border-red-500 rounded-full"} ${isActiveSquare && "scale-110"}`} alt={item} />
                                : isAvailableMove && <div className={`w-[30%] h-[30%] ${premove?.from ? "bg-purple-500" : "bg-[#769656]"} rounded-full`}></div>}
                        </button>)
                    })}
                </div>
            ))}
        </div>)
}
