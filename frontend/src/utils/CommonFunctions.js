import { BLACK, PIECES, WHITE } from "../constants/constants.js";
import socket from "../socket.js";
export const getAllPossibleMoves = ({ row, col, piece }, board, moves) => {
  const lastMove = getLastMove(moves);
  switch (piece) {
    // Black pieces
    case PIECES.BLACK.ROOK:
      return getAllRookMovements(false, { row, col }, board);
    case PIECES.BLACK.KNIGHT:
      return getAllKnightMovements(false, { row, col }, board);
    case PIECES.BLACK.BISHOP:
      return getAllBishopMovements(false, { row, col }, board);
    case PIECES.BLACK.QUEEN:
      return getAllQueenMovements(false, { row, col }, board);
    case PIECES.BLACK.KING:
      return getAllKingMovements(false, { row, col }, board, true, moves);
    case PIECES.BLACK.PAWN:
      return getAllPawnMovements(false, { row, col }, board, true, lastMove);

    // White pieces
    case PIECES.WHITE.ROOK:
      return getAllRookMovements(true, { row, col }, board);
    case PIECES.WHITE.KNIGHT:
      return getAllKnightMovements(true, { row, col }, board);
    case PIECES.WHITE.BISHOP:
      return getAllBishopMovements(true, { row, col }, board);
    case PIECES.WHITE.QUEEN:
      return getAllQueenMovements(true, { row, col }, board);
    case PIECES.WHITE.KING:
      return getAllKingMovements(true, { row, col }, board, true, moves);
    case PIECES.WHITE.PAWN:
      return getAllPawnMovements(true, { row, col }, board, true, lastMove);

    default:
      return [];
  }
};
export const encode = (row, col) => {
  return `${String.fromCharCode("a".charCodeAt(0) + col)}${8 - row}`;
};
export const flip = (entity) => {
  return 7 - entity;
};
export const flipCoordinates = ({ row, col }) => {
  return { row: flip(row), col: flip(col) };
};
export const areCoordinatesEqual = (
  { row: row1, col: col1 },
  { row: row2, col: col2 }
) => {
  return row1 === row2 && col1 === col2;
};
export const flipTurn = (curTurn) => {
  return curTurn === WHITE ? BLACK : WHITE;
};
export const inRange = (item) => {
  return item >= 0 && item < 8;
};
export const addMove = (move, moves) => {
  return [move, ...moves];
};
export const canEnPassant = (lastMove, { curRow, curCol }) => {
  if (!lastMove) return false;
  return (
    (lastMove.piece === PIECES.WHITE.PAWN ||
      lastMove.piece === PIECES.BLACK.PAWN) &&
    Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
    Math.abs(lastMove.from.col - curCol) === 1 &&
    lastMove.to.row === curRow
  );
};
export const pieceAvailable = (row, col, board) => {
  return (
    Math.min(row, col) >= 0 &&
    Math.max(row, col) < 8 &&
    board[row][col].length > 0
  );
};
export const whitePieceAvailable = (row, col, board) => {
  return (
    pieceAvailable(row, col, board) &&
    board[row][col] === board[row][col].toUpperCase()
  );
};
export const blackPieceAvailable = (row, col, board) => {
  return (
    pieceAvailable(row, col, board) &&
    board[row][col] === board[row][col].toLowerCase()
  );
};
export const flipBoard = (board) => {
  return [...board.map((item) => [...item].reverse())].reverse();
};
export const getAllRookMovements = (
  isWhite,
  { row, col },
  board,
  validateKingSafety = true
) => {
  const allMoves = [];
  for (let i = row - 1; i >= 0; i--) {
    if (!pieceAvailable(i, col, board)) allMoves.push({ row: i, col });
    else if (
      isWhite
        ? blackPieceAvailable(i, col, board)
        : whitePieceAvailable(i, col, board)
    ) {
      allMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = row + 1; i < 8; i++) {
    if (!pieceAvailable(i, col, board)) allMoves.push({ row: i, col });
    else if (
      isWhite
        ? blackPieceAvailable(i, col, board)
        : whitePieceAvailable(i, col, board)
    ) {
      allMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = col - 1; i >= 0; i--) {
    if (!pieceAvailable(row, i, board)) allMoves.push({ row, col: i });
    else if (
      isWhite
        ? blackPieceAvailable(row, i, board)
        : whitePieceAvailable(row, i, board)
    ) {
      allMoves.push({ row, col: i });
      break;
    } else break;
  }
  for (let i = col + 1; i < 8; i++) {
    if (!pieceAvailable(row, i, board)) allMoves.push({ row, col: i });
    else if (
      isWhite
        ? blackPieceAvailable(row, i, board)
        : whitePieceAvailable(row, i, board)
    ) {
      allMoves.push({ row, col: i });
      break;
    } else break;
  }
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut(
    { row, col },
    allMoves,
    board,
    isWhite
  );
  return selectedMove;
};
export const getAllKnightMovements = (
  isWhite,
  { row, col },
  board,
  validateKingSafety = true
) => {
  const allMoves = [];

  const knightMoves = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];

  for (const [dx, dy] of knightMoves) {
    const newRow = row + dx;
    const newCol = col + dy;

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      if (
        !pieceAvailable(newRow, newCol, board) ||
        (isWhite
          ? blackPieceAvailable(newRow, newCol, board)
          : whitePieceAvailable(newRow, newCol, board))
      )
        allMoves.push({ row: newRow, col: newCol });
    }
  }
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut(
    { row, col },
    allMoves,
    board,
    isWhite
  );
  return selectedMove;
};
export const getAllBishopMovements = (
  isWhite,
  { row, col },
  board,
  validateKingSafety = true
) => {
  const allMoves = [];
  for (
    let i = 1;
    Math.min(row - i, col - i) >= 0 && Math.max(row - i, col - i) < 8;
    i++
  ) {
    if (!pieceAvailable(row - i, col - i, board))
      allMoves.push({ row: row - i, col: col - i });
    else if (
      isWhite
        ? blackPieceAvailable(row - i, col - i, board)
        : whitePieceAvailable(row - i, col - i, board)
    ) {
      allMoves.push({ row: row - i, col: col - i });
      break;
    } else break;
  }
  for (
    let i = 1;
    Math.min(row - i, col + i) >= 0 && Math.max(row - i, col + i) < 8;
    i++
  ) {
    if (!pieceAvailable(row - i, col + i, board))
      allMoves.push({ row: row - i, col: col + i });
    else if (
      isWhite
        ? blackPieceAvailable(row - i, col + i, board)
        : whitePieceAvailable(row - i, col + i, board)
    ) {
      allMoves.push({ row: row - i, col: col + i });
      break;
    } else break;
  }
  for (
    let i = 1;
    Math.min(row + i, col - i) >= 0 && Math.max(row + i, col - i) < 8;
    i++
  ) {
    if (!pieceAvailable(row + i, col - i, board))
      allMoves.push({ row: row + i, col: col - i });
    else if (
      isWhite
        ? blackPieceAvailable(row + i, col - i, board)
        : whitePieceAvailable(row + i, col - i, board)
    ) {
      allMoves.push({ row: row + i, col: col - i });
      break;
    } else break;
  }
  for (
    let i = 1;
    Math.min(row + i, col + i) >= 0 && Math.max(row + i, col + i) < 8;
    i++
  ) {
    if (!pieceAvailable(row + i, col + i, board))
      allMoves.push({ row: row + i, col: col + i });
    else if (
      isWhite
        ? blackPieceAvailable(row + i, col + i, board)
        : whitePieceAvailable(row + i, col + i, board)
    ) {
      allMoves.push({ row: row + i, col: col + i });
      break;
    } else break;
  }
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut(
    { row, col },
    allMoves,
    board,
    isWhite
  );
  return selectedMove;
};
export const getAllQueenMovements = (
  isWhite,
  { row, col },
  board,
  validateKingSafety = true
) => {
  return [
    ...getAllBishopMovements(isWhite, { row, col }, board, validateKingSafety),
    ...getAllRookMovements(isWhite, { row, col }, board, validateKingSafety),
  ];
};
export const getAllKingMovements = (
  isWhite,
  { row, col },
  board,
  validateKingSafety = true,
  moves
) => {
  const allMoves = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let curRow = row + i;
      let curCol = col + j;
      if (i === 0 && j === 0) continue;
      if (Math.min(curRow, curCol) >= 0 && Math.max(curRow, curCol) < 8) {
        if (
          !pieceAvailable(curRow, curCol, board) ||
          (isWhite
            ? blackPieceAvailable(curRow, curCol, board)
            : whitePieceAvailable(curRow, curCol, board))
        ) {
          allMoves.push({ row: curRow, col: curCol });
        }
      }
    }
  }
  if (!validateKingSafety) return allMoves;
  if (isWhite) {
    if (canWhiteKingCastleShort(board, moves))
      allMoves.push({ row: 7, col: 6 });
    if (canWhiteKingCastleLong(board, moves)) allMoves.push({ row: 7, col: 2 });
  } else {
    if (canBlackKingCastleShort(board, moves))
      allMoves.push({ row: 0, col: 6 });
    if (canBlackKingCastleLong(board, moves)) allMoves.push({ row: 0, col: 2 });
  }
  const selectedMove = filterCheckMovesOut(
    { row, col },
    allMoves,
    board,
    isWhite
  );
  return selectedMove;
};
export const getAllPawnMovements = (
  isWhite,
  { row, col },
  board,
  validateKingSafety = true,
  lastMove
) => {
  const allMoves = [];
  if (
    inRange(isWhite ? row - 1 : row + 1) &&
    !pieceAvailable(isWhite ? row - 1 : row + 1, col, board)
  )
    allMoves.push({ row: isWhite ? row - 1 : row + 1, col });
  if (
    (isWhite ? row === 6 : row === 1) &&
    !pieceAvailable(isWhite ? row - 1 : row + 1, col, board) &&
    !pieceAvailable(isWhite ? row - 2 : row + 2, col, board)
  )
    allMoves.push({ row: isWhite ? row - 2 : row + 2, col });
  if (inRange(isWhite ? row - 1 : row + 1)) {
    if (
      inRange(col - 1) && isWhite
        ? blackPieceAvailable(isWhite ? row - 1 : row + 1, col - 1, board)
        : whitePieceAvailable(isWhite ? row - 1 : row + 1, col - 1, board)
    )
      allMoves.push({ row: isWhite ? row - 1 : row + 1, col: col - 1 });
    if (
      inRange(col + 1) && isWhite
        ? blackPieceAvailable(isWhite ? row - 1 : row + 1, col + 1, board)
        : whitePieceAvailable(isWhite ? row - 1 : row + 1, col + 1, board)
    )
      allMoves.push({ row: isWhite ? row - 1 : row + 1, col: col + 1 });
  }
  if (canEnPassant(lastMove, { curRow: row, curCol: col })) {
    allMoves.push({
      row: isWhite ? row - 1 : row + 1,
      col: lastMove.to.col,
    });
  }
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut(
    { row, col },
    allMoves,
    board,
    isWhite
  );
  return selectedMove;
};
export const getPieceCoordinates = (piece, board) => {
  const allSquares = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++)
      if (board[i][j] === piece) allSquares.push({ row: i, col: j });
  }
  return allSquares;
};
export const getAllWhiteMoves = (board, validateKingSafety = true) => {
  let allAvailableMoves = [];
  for (let it of Object.values(PIECES.WHITE)) {
    switch (it) {
      case PIECES.WHITE.PAWN:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.WHITE.PAWN, board).map((item) =>
            getAllPawnMovements(
              true,
              { row: item.row, col: item.col },
              board,
              validateKingSafety
            )
          )
        );
        break;
      case PIECES.WHITE.ROOK:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.WHITE.ROOK, board).map((item) =>
            getAllRookMovements(
              true,
              { row: item.row, col: item.col },
              board,
              validateKingSafety
            )
          )
        );
        break;
      case PIECES.WHITE.KNIGHT:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.WHITE.KNIGHT, board).map((item) =>
            getAllKnightMovements(
              true,
              { row: item.row, col: item.col },
              board,
              validateKingSafety
            )
          )
        );
        break;
      case PIECES.WHITE.BISHOP:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.WHITE.BISHOP, board).map((item) =>
            getAllBishopMovements(
              true,
              { row: item.row, col: item.col },
              board,
              validateKingSafety
            )
          )
        );
        break;
      case PIECES.WHITE.QUEEN:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.WHITE.QUEEN, board).map((item) =>
            getAllQueenMovements(
              true,
              { row: item.row, col: item.col },
              board,
              validateKingSafety
            )
          )
        );
        break;
      case PIECES.WHITE.KING:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.WHITE.KING, board).map((item) =>
            getAllKingMovements(
              true,
              { row: item.row, col: item.col },
              board,
              validateKingSafety
            )
          )
        );
        break;
    }
  }
  const uniqueMoves = Array.from(
    new Set(allAvailableMoves.map((move) => JSON.stringify(move)))
  ).map((str) => JSON.parse(str));
  return uniqueMoves;
};
export const getAllBlackMoves = (board, validateKingSafety = true) => {
  let allAvailableMoves = [];
  for (let it of Object.values(PIECES.BLACK)) {
    switch (it) {
      case PIECES.BLACK.PAWN:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.BLACK.PAWN, board).map((item) =>
            getAllPawnMovements(
              false,
              { row: item.row, col: item.col },
              board,
              validateKingSafety
            )
          )
        );
        break;
      case PIECES.BLACK.ROOK:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.BLACK.ROOK, board).map((item) =>
            getAllRookMovements(
              false,
              { row: item.row, col: item.col },
              board,
              validateKingSafety
            )
          )
        );
        break;
      case PIECES.BLACK.KNIGHT:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.BLACK.KNIGHT, board).map((item) =>
            getAllKnightMovements(
              false,
              { row: item.row, col: item.col },
              board,
              validateKingSafety
            )
          )
        );
        break;
      case PIECES.BLACK.BISHOP:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.BLACK.BISHOP, board).map((item) =>
            getAllBishopMovements(
              false,
              { row: item.row, col: item.col },
              board,
              validateKingSafety
            )
          )
        );
        break;
      case PIECES.BLACK.QUEEN:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.BLACK.QUEEN, board).map((item) =>
            getAllQueenMovements(
              false,
              { row: item.row, col: item.col },
              board,
              validateKingSafety
            )
          )
        );
        break;
      case PIECES.BLACK.KING:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.BLACK.KING, board).map((item) =>
            getAllKingMovements(
              false,
              { row: item.row, col: item.col },
              board,
              validateKingSafety
            )
          )
        );
        break;
    }
  }
  const uniqueMoves = Array.from(
    new Set(allAvailableMoves.map((move) => JSON.stringify(move)))
  ).map((str) => JSON.parse(str));
  return uniqueMoves;
};
export const filterCheckMovesOut = (from, allMoves, board, isWhite) => {
  const { row, col } = from;
  const selectedMove = [];
  for (let it of allMoves) {
    const curBoard = board;
    const updatedBoard = playMove(
      { from: { row, col }, to: { row: it.row, col: it.col } },
      curBoard
    );
    if (
      (isWhite && !isWhiteKingChecked(updatedBoard)) ||
      (!isWhite && !isBlackKingChecked(updatedBoard))
    )
      selectedMove.push(it);
  }
  return selectedMove;
};
export const getAllWhitePieces = (board) => {
  const allPieces = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (whitePieceAvailable(i, j, board)) {
        allPieces.push({ row: i, col: j, piece: board[i][j] });
      }
    }
  }
  return allPieces;
};
export const getAllBlackPieces = (board) => {
  const allPieces = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (blackPieceAvailable(i, j, board)) {
        allPieces.push({ row: i, col: j, piece: board[i][j] });
      }
    }
  }
  return allPieces;
};
export const isWhiteKingChecked = (board) => {
  const [kingCoordinate] = getPieceCoordinates(PIECES.WHITE.KING, board);
  return getAllBlackMoves(board, false).some((item) =>
    areCoordinatesEqual(item, kingCoordinate)
  );
};
export const isBlackKingChecked = (board) => {
  const [kingCoordinate] = getPieceCoordinates(PIECES.BLACK.KING, board);
  return getAllWhiteMoves(board, false).some((item) =>
    areCoordinatesEqual(item, kingCoordinate)
  );
};
export const getLastMove = (moves) => {
  return moves.length > 0 ? moves[0] : null;
};
export const checkForInsufficientMaterial = (whitePieces, blackPieces) => {
  //King vs King
  if (whitePieces.length === 1 && blackPieces.length === 1) return true;
  if (whitePieces.length === 2 && whitePieces[0].piece !== PIECES.WHITE.KING)
    whitePieces = [whitePieces[1], whitePieces[0]];
  if (blackPieces.length === 2 && blackPieces[0].piece !== PIECES.BLACK.KING)
    blackPieces = [blackPieces[1], blackPieces[0]];
  //King+Bishop vs King
  if (
    (whitePieces.length === 2 &&
      whitePieces[1].piece === PIECES.WHITE.BISHOP) ||
    (blackPieces.length === 2 && blackPieces[1].piece === PIECES.BLACK.BISHOP)
  )
    return true;
  //King+Knight vs King
  if (
    (whitePieces.length === 2 &&
      whitePieces[1].piece === PIECES.WHITE.KNIGHT) ||
    (blackPieces.length === 2 && blackPieces[1].piece === PIECES.BLACK.KNIGHT)
  )
    return true;
  //King+Bishop vs King+Bishop(same colour)
  if (
    whitePieces.length === 2 &&
    blackPieces.length === 2 &&
    whitePieces[1].piece === PIECES.WHITE.BISHOP &&
    blackPieces[1].piece === PIECES.BLACK.BISHOP &&
    (whitePieces[1].row + whitePieces[1].col) % 2 ===
      (blackPieces[1].row + blackPieces[1].col) % 2
  )
    return true;

  return false;
};
export const checkGameOver = (updatedBoard) => {
  if (getAllWhiteMoves(updatedBoard).length === 0) {
    if (isWhiteKingChecked(updatedBoard)) {
      socket.emit("game_over");
      return { state: true, message: "Black wins!!!" };
    } else if (curTurn === WHITE) {
      socket.emit("game_over");
      return { state: true, message: "Draw by stalemate" };
    }
  }
  if (getAllBlackMoves(updatedBoard).length === 0) {
    if (isBlackKingChecked(updatedBoard)) {
      socket.emit("game_over");
      return { state: true, message: "White wins!!!" };
    } else if (curTurn === BLACK) {
      socket.emit("game_over");
      return { state: true, message: "Draw by stalemate" };
    }
  }
  const allWhitePieces = getAllWhitePieces(updatedBoard);
  const allBlackPieces = getAllWhitePieces(updatedBoard);
  if (allWhitePieces.length <= 2 && allBlackPieces.length <= 2) {
    if (checkForInsufficientMaterial(allWhitePieces, allBlackPieces)) {
      return { state: true, message: "Draw by insufficient material" };
    }
  }
  return { state: false, message: "" };
};
export const playMove = (
  move,
  board,
  promoteTo = null,
  castling = false,
  enPassantCol = null
) => {
  const curBoard = [...board.map((item) => [...item])];
  const { from, to } = move;
  if (castling) {
    const row = from.row;

    // Determine if it's short or long castling
    const isShortCastle = to.col === 6;
    const isLongCastle = to.col === 2;

    // Move king
    curBoard[to.row][to.col] = board[from.row][from.col];
    curBoard[from.row][from.col] = "";

    // Move rook
    if (isShortCastle) {
      curBoard[row][5] = curBoard[row][7];
      curBoard[row][7] = "";
    } else if (isLongCastle) {
      curBoard[row][3] = curBoard[row][0];
      curBoard[row][0] = "";
    }

    return curBoard;
  }
  if (enPassantCol) {
    curBoard[from.row][enPassantCol] = "";
  }
  if (promoteTo) {
    curBoard[to.row][to.col] = promoteTo;
  } else {
    curBoard[to.row][to.col] = board[from.row][from.col];
  }
  curBoard[from.row][from.col] = "";
  return curBoard;
};
export const canWhiteKingCastleShort = (board, moves) => {
  // King and rook must be in starting positions
  if (board[7][4] !== PIECES.WHITE.KING || board[7][7] !== PIECES.WHITE.ROOK) {
    return false;
  }
  //Testing squares in between
  if (pieceAvailable(7, 5, board) || pieceAvailable(7, 6, board)) return false;
  //Testing the king safety
  if (isWhiteKingChecked(board)) return false;
  //Testing the threat for between squares
  if (
    getAllBlackMoves(board, false).some(
      (item) => item.row === 7 && (item.col === 5 || item.col === 6)
    )
  )
    return false;
  //Testing if the rook or king had ever moved
  const kingMoved = moves?.some(
    (move) => move.from.row === 7 && move.from.col === 4
  );
  const rookMoved = moves?.some(
    (move) => move.from.row === 7 && move.from.col === 7
  );
  if (kingMoved || rookMoved) return false;
  return true;
};
export const canWhiteKingCastleLong = (board, moves) => {
  // King and rook must be in starting positions
  if (board[7][4] !== PIECES.WHITE.KING || board[7][0] !== PIECES.WHITE.ROOK) {
    return false;
  }
  // Squares between king and rook (b1, c1, d1) must be empty
  if (
    pieceAvailable(7, 1, board) ||
    pieceAvailable(7, 2, board) ||
    pieceAvailable(7, 3, board)
  ) {
    return false;
  }
  // King must not be in check
  if (isWhiteKingChecked(board)) return false;

  // Squares king passes through (d1, c1) must not be under attack
  if (
    getAllBlackMoves(board, false).some(
      (item) => item.row === 7 && (item.col === 3 || item.col === 2)
    )
  )
    return false;

  // Check if king or rook has moved
  const kingMoved = moves?.some(
    (move) => move.from.row === 7 && move.from.col === 4
  );
  const rookMoved = moves?.some(
    (move) => move.from.row === 7 && move.from.col === 0
  );
  if (kingMoved || rookMoved) return false;

  return true;
};
export const canBlackKingCastleShort = (board, moves) => {
  if (board[0][4] !== PIECES.BLACK.KING || board[0][7] !== PIECES.BLACK.ROOK) {
    return false;
  }
  if (pieceAvailable(0, 5, board) || pieceAvailable(0, 6, board)) return false;
  if (isBlackKingChecked(board)) return false;

  if (
    getAllWhiteMoves(board, false).some(
      (item) => item.row === 0 && (item.col === 5 || item.col === 6)
    )
  )
    return false;

  const kingMoved = moves?.some(
    (move) => move.from.row === 0 && move.from.col === 4
  );
  const rookMoved = moves?.some(
    (move) => move.from.row === 0 && move.from.col === 7
  );
  if (kingMoved || rookMoved) return false;

  return true;
};
export const canBlackKingCastleLong = (board, moves) => {
  if (board[0][4] !== PIECES.BLACK.KING || board[0][0] !== PIECES.BLACK.ROOK) {
    return false;
  }
  if (
    pieceAvailable(0, 1, board) ||
    pieceAvailable(0, 2, board) ||
    pieceAvailable(0, 3, board)
  ) {
    return false;
  }
  if (isBlackKingChecked(board)) return false;

  if (
    getAllWhiteMoves(board, false).some(
      (item) => item.row === 0 && (item.col === 3 || item.col === 2)
    )
  )
    return false;

  const kingMoved = moves?.some(
    (move) => move.from.row === 0 && move.from.col === 4
  );
  const rookMoved = moves?.some(
    (move) => move.from.row === 0 && move.from.col === 0
  );
  if (kingMoved || rookMoved) return false;

  return true;
};
