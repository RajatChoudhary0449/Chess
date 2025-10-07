import React, { createContext, useContext, useState } from "react";
import { BLACK, INITIALBOARDSETUP, WHITE } from "../constants/constants.js";

export const GameContext = createContext();
import socket from "../socket.js";
import { useEffect } from "react";
import { addMove, checkGameOver, flipTurn, getLastMove } from "../utils/CommonFunctions.js";
import { useNavigate } from "react-router-dom";
export const GameProvider = ({ children }) => {
  const [board, setBoard] = useState(INITIALBOARDSETUP);
  const [moves, setMoves] = useState([]);
  const [curTurn, setCurTurn] = useState(WHITE);
  const [activeSquare, setActiveSquare] = useState({ row: null, col: null });
  const [availableMoves, setAvailableMoves] = useState([]);
  const [promotionPiece, setPromotionPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [playerColor, setPlayerColor] = useState(null);
  const [drawWindow, showDrawWindow] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [availableRights, setAvailableRights] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const flipped = playerColor === BLACK;
  const nav = useNavigate();
  const updateGameState = (moves) => {
    setMoves(_ => moves);
    const updatedBoard = getLastMove(moves)?.board || INITIALBOARDSETUP;
    setBoard(_ => updatedBoard);
    setCurTurn(moves?.length % 2 === 0 ? WHITE : BLACK);
  }
  useEffect(() => {
    const onAvailabilityResponse = ({ access, message, room, source }) => {
      const curRights = [];
      if (!access) {
        setTimeout(() => {
          setShowInfoModal(true);
          setInfoMessage(message);
        }, 0);
        nav("/room/create");
      }
      else {
        if (room?.id?.length===6 && (!room[WHITE] || room[WHITE] === socket.id)) curRights.push(WHITE);
        if(room?.id?.length!==6 && room.moves.length%2===0 && !room[WHITE]) curRights.push(WHITE);
        if (room?.id?.length===6 && (!room[BLACK] || room[BLACK] === socket.id)) curRights.push(BLACK);
        if(room?.id?.length!==6 && room.moves.length%2===1 && !room[BLACK]) curRights.push(BLACK);
        setAvailableRights(curRights);
      }
      if (source === "Screen") {
        if (!room) return;
        updateGameState(room?.moves);
        if (room[WHITE] === socket.id || room[BLACK] === socket.id) {
          return;
        }
        if (curRights.length === 0) {
          socket.emit("join_room", { id: room.id, color: "spectator" });
          setShowInfoModal(true);
          setInfoMessage(`Congrats, you are joined as a spectator`);
        }
        else setShowJoinModal(true);
      }
    }
    const onPlayerAssignment = (color) => {
      console.log("color", color);
      if (color === "spectator") {
        setSpectatorMode(true);
      }
      else {
        setSpectatorMode(false);
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
    const onUpdateGameState = (moves) => {
      updateGameState(moves)
    }
    const onOpponentMove = (move) => {
      if (move.turn === playerColor) return; // Prevent duplicate move
      setMoves((moves) => addMove(move, moves));
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
    const onDrawn = (message) => {
      setGameOver(true);
      setMessage(message);
    }
    const onDrawOffered = () => {
      showDrawWindow(true);
    }
    const onDrawAccepted = () => {
      let message = `Draw by mutual agreement`;
      setGameOver(true);
      setMessage(message);
      socket.emit("draw", { state: true, message });
    }
    const onDrawRejected = () => {
      alert("Draw rejected");
    }
    socket.on("player_assignment", onPlayerAssignment);
    socket.on("opponent_move", onOpponentMove);
    socket.on("update_game_state", onUpdateGameState);
    socket.on("undo_move", onUndoMove)
    socket.on("opponent_join", onOpponentJoin);
    socket.on("resign", onRecievingResign);
    socket.on("drawn", onDrawn);
    socket.on("draw_offered", onDrawOffered);
    socket.on("draw_accepted", onDrawAccepted);
    socket.on("draw_rejected", onDrawRejected);
    socket.on("availability_response", onAvailabilityResponse);
    return () => {
      socket.off("player_assignment", onPlayerAssignment);
      socket.off("opponent_move", onOpponentMove);
      socket.off("update_game_state", onUpdateGameState);
      socket.off("undo_move", onUndoMove);
      socket.off("opponent_join", onOpponentJoin);
      socket.off("resign", onRecievingResign);
      socket.off("drawn", onDrawn);
      socket.off("draw_offered", onDrawOffered);
      socket.off("draw_accepted", onDrawAccepted);
      socket.off("draw_rejected", onDrawRejected);
      socket.off("availability_response", onAvailabilityResponse);
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
  const value = {
    board,
    setBoard,
    moves,
    setMoves,
    curTurn,
    setCurTurn,
    activeSquare,
    setActiveSquare,
    availableMoves,
    setAvailableMoves,
    promotionPiece,
    setPromotionPiece,
    gameOver,
    setGameOver,
    message,
    setMessage,
    playerColor,
    setPlayerColor,
    spectatorMode,
    setSpectatorMode,
    drawWindow,
    showDrawWindow,
    showInfoModal,
    setShowInfoModal,
    infoMessage,
    setInfoMessage,
    availableRights,
    setAvailableRights,
    showJoinModal,
    setShowJoinModal,
    flipped
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};