import React, { createContext, useContext, useState } from "react";
import { BLACK, INITIALBOARDSETUP, WHITE } from "../constants/constants.js";

export const GameContext = createContext();

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
  const [spectatorMode, setSpectatorMode] = useState(false);
  const flipped = playerColor === BLACK;
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
    flipped
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};