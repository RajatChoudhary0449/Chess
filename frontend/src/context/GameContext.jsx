import { createContext, useRef, useState } from "react";
import { BLACK, INITIALBOARDSETUP, MESSAGE_TYPES, WHITE } from "../constants/constants.js";

export const GameContext = createContext();
import socket from "../socket.js";
import { useEffect } from "react";
import { addMove, checkGameOver, flipTurn, getLastMove } from "../utils/CommonFunctions.js";
import { useNavigate } from "react-router-dom";
import useNotification from "../hooks/useNotification.js";
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
  const { showNotification } = useNotification();
  const [availableRights, setAvailableRights] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeMoveIndex, setActiveMoveIndex] = useState(-1);
  const [showModes, setShowModes] = useState(false);
  const [players, setPlayers] = useState(1);
  const flipped = playerColor === BLACK;
  const blackPlayerTimerRef = useRef();
  const whitePlayerTimerRef = useRef();
  const delayTimerRef = useRef();
  const [gameStarted, setGameStarted] = useState(false);
  const nav = useNavigate();
  const [pendingStart, setPendingStart] = useState(null);
  const [timeMode, setTimeMode] = useState({ initial: 0, increment: 0, delay: 0 });
  const updateGameState = (moves) => {
    setMoves(_ => moves);
    const updatedBoard = getLastMove(moves)?.board || INITIALBOARDSETUP;
    setBoard(_ => updatedBoard);
    setCurTurn(moves?.length % 2 === 0 ? WHITE : BLACK);
  }
  useEffect(() => {
    if (gameOver) {
      whitePlayerTimerRef?.current?.stopTimer();
      blackPlayerTimerRef?.current?.stopTimer();
    }
  }, [gameOver])
  useEffect(() => {
    if (whitePlayerTimerRef.current && pendingStart) {
      onStartClock({ ...pendingStart });
    }
  }, [whitePlayerTimerRef.current, pendingStart]);
  const onStartClock = ({ color, increment = timeMode?.increment, delay = timeMode?.delay }) => {
    if (!gameStarted) setGameStarted(true);
    if (!whitePlayerTimerRef?.current || !blackPlayerTimerRef?.current) {
      setPendingStart({ color, increment, delay });
      return;
    }
    if (pendingStart) setPendingStart(null);
    if (delayTimerRef?.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if ((color === WHITE && whitePlayerTimerRef?.current?.isRunning()) || (color === BLACK && blackPlayerTimerRef?.current?.isRunning())) {
      return;
    }
    if (color === WHITE) {
      blackPlayerTimerRef.current.stopTimer();
      whitePlayerTimerRef.current.incrementTimer(increment);
      delayTimerRef.current = setTimeout(
        () => {
          whitePlayerTimerRef.current.resumeTimer();
          delayTimerRef.current = null;
        }, delay * 1000
      )
    }
    else {
      whitePlayerTimerRef.current.stopTimer();
      blackPlayerTimerRef.current.incrementTimer(increment);
      delayTimerRef.current = setTimeout(
        () => {
          blackPlayerTimerRef.current.resumeTimer();
          delayTimerRef.current = null;
        }, delay * 1000
      )
    }
  }
  useEffect(() => {
    const onAvailabilityResponse = ({ access, message, room, source }) => {
      const curRights = [];
      if (!access) {
        setTimeout(() => {
          showNotification({ message, type: MESSAGE_TYPES.WARNING });
        }, 0);
        if (source !== "Room") nav("/room/create");
        return;
      }
      else {
        const onePlayer = (room.players === 1);
        if (!onePlayer && (!room[WHITE] || room[WHITE] === socket.id)) curRights.push(WHITE);
        if (onePlayer && room.moves.length % 2 === 0 && !room[WHITE]) curRights.push(WHITE);
        if (!onePlayer && (!room[BLACK] || room[BLACK] === socket.id)) curRights.push(BLACK);
        if (onePlayer && room.moves.length % 2 === 1 && !room[BLACK]) curRights.push(BLACK);
        setAvailableRights(curRights);
      }
      if (source === "Screen") {
        if (!room) return;
        updateGameState(room?.moves);
        if (room[WHITE] === socket.id || room[BLACK] === socket.id) {
          return;
        }
        if (curRights.length === 0 || players === 1) {
          socket.emit("join_room", { id: room.id, color: "spectator" });
          showNotification({ message: `Congrats, you are joined as a spectator`, type: MESSAGE_TYPES.SUCCESS })
        }
        else setShowJoinModal(true);
      }
      else {
        if (curRights.length > 0) {
          setShowModes(cur => !cur);
        }
        else {
          socket.emit("join_room", { id: room.id, color: "spectator" });
          showNotification({ message: `Congrats, you are joined as a spectator`, type: MESSAGE_TYPES.SUCCESS })
          nav(`/room/${room.id}`);
        }
      }
    }

    const onShowPreparationWindow = (time) => {
      // console.log(time);
      showNotification({ message: `Your match will be starting soon, Prepare yourself`, type: MESSAGE_TYPES.SUCCESS, duration: time });
    }
    const onSetTime = ({ mode, initial, increment, delay }) => {
      if (mode === "None") {
        setTimeMode((_) => ({ mode, initial: -1, increment: 0, delay: Infinity }))
      }
      else {
        setTimeMode((_) => ({ mode, initial, increment, delay }));
        whitePlayerTimerRef.current.setTime(initial * 60);
        blackPlayerTimerRef.current.setTime(initial * 60);
      }
    }
    const onSetClock = ({ whiteTime, blackTime }) => {
      if (whiteTime) {
        whitePlayerTimerRef?.current?.setTime(whiteTime);
      }
      if (blackTime) {
        blackPlayerTimerRef?.current?.setTime(blackTime);
      }
    }
    const onRoomCreationStatus = ({ status, id, time, players }) => {
      setTimeMode(time);
      setPlayers(_ => players);
      if (status) {
        nav(`/room/${id}`);
      }
      else {
        showNotification({ message: "Room already exist", type: MESSAGE_TYPES.WARNING });
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
    socket.on("room_creation_status", onRoomCreationStatus)
    socket.on("start_clock", onStartClock);
    socket.on("set_time", onSetTime);
    socket.on("show_preparing_window", onShowPreparationWindow);
    socket.on("set_clock", onSetClock);
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
      socket.off("room_creation_status", onRoomCreationStatus);
      socket.off("start_clock", onStartClock);
      socket.off("set_time", onSetTime);
      socket.off("show_preparing_window", onShowPreparationWindow);
      socket.off("set_clock", onSetClock);
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
    availableRights,
    setAvailableRights,
    showJoinModal,
    setShowJoinModal,
    flipped,
    activeMoveIndex,
    setActiveMoveIndex,
    showModes,
    setShowModes,
    blackPlayerTimerRef,
    whitePlayerTimerRef,
    gameStarted,
    setGameStarted,
    timeMode,
    setTimeMode,
    players,
    setPlayers,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};