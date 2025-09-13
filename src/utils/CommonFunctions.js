import { PIECES } from "../constants/constants.js";
export const getAllPossibleMoves = ({ row, col, piece }, board) => {
  switch (piece) {
    // 🔲 Black pieces
    case PIECES.BLACK.ROOK:
      return getAllBlackRook({ row, col }, board);
    case PIECES.BLACK.KNIGHT:
      return getAllBlackKnight({ row, col }, board);
    case PIECES.BLACK.BISHOP:
      return getAllBlackBishop({ row, col }, board);
    case PIECES.BLACK.QUEEN:
      return getAllBlackQueen({ row, col }, board);
    case PIECES.BLACK.KING:
      return getAllBlackKing({ row, col }, board);
    case PIECES.BLACK.PAWN:
      return getAllBlackPawn({ row, col }, board);

    // ⚪ White pieces
    case PIECES.WHITE.ROOK:
      return getAllWhiteRook({ row, col }, board);
    case PIECES.WHITE.KNIGHT:
      return getAllWhiteKnight({ row, col }, board);
    case PIECES.WHITE.BISHOP:
      return getAllWhiteBishop({ row, col }, board);
    case PIECES.WHITE.QUEEN:
      return getAllWhiteQueen({ row, col }, board);
    case PIECES.WHITE.KING:
      return getAllWhiteKing({ row, col }, board);
    case PIECES.WHITE.PAWN:
      return getAllWhitePawn({ row, col }, board);

    default:
      return [];
  }
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
export const getAllWhiteRook = ({ row, col }, board) => {
  const allAvailableMoves = [];
  for (let i = row - 1; i >= 0; i--) {
    if (!pieceAvailable(i, col, board)) allAvailableMoves.push({ row: i, col });
    else if (blackPieceAvailable(i, col, board)) {
      allAvailableMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = row + 1; i < 8; i++) {
    if (!pieceAvailable(i, col, board)) allAvailableMoves.push({ row: i, col });
    else if (blackPieceAvailable(i, col, board)) {
      allAvailableMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = col - 1; i >= 0; i--) {
    if (!pieceAvailable(row, i, board)) allAvailableMoves.push({ col: i, row });
    else if (blackPieceAvailable(row, i, board)) {
      allAvailableMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = col + 1; i < 8; i++) {
    if (!pieceAvailable(row, i, board)) allAvailableMoves.push({ col: i, row });
    else if (blackPieceAvailable(row, i, board)) {
      allAvailableMoves.push({ row: i, col });
      break;
    } else break;
  }
  console.log(allAvailableMoves);
  return allAvailableMoves;
};
export const getAllBlackRook = ({ row, col }, board) => {
  const allAvailableMoves = [];
  for (let i = row - 1; i >= 0; i--) {
    if (!pieceAvailable(i, col, board)) allAvailableMoves.push({ row: i, col });
    else if (whitePieceAvailable(i, col, board)) {
      allAvailableMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = row + 1; i < 8; i++) {
    if (!pieceAvailable(i, col, board)) allAvailableMoves.push({ row: i, col });
    else if (whitePieceAvailable(i, col, board)) {
      allAvailableMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = col - 1; i >= 0; i--) {
    if (!pieceAvailable(row, i, board)) allAvailableMoves.push({ col: i, row });
    else if (whitePieceAvailable(row, i, board)) {
      allAvailableMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = col + 1; i < 8; i++) {
    if (!pieceAvailable(row, i, board)) allAvailableMoves.push({ col: i, row });
    else if (whitePieceAvailable(row, i, board)) {
      allAvailableMoves.push({ row: i, col });
      break;
    } else break;
  }
  return allAvailableMoves;
};
export const getAllWhiteKnight = ({ row, col }, board) => {
  const allAvailableMoves = [];

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
        blackPieceAvailable(newRow, newCol, board)
      )
        allAvailableMoves.push({ row: newRow, col: newCol });
    }
  }

  return allAvailableMoves;
};
export const getAllBlackKnight = ({ row, col }, board) => {
  const allAvailableMoves = [];

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
        whitePieceAvailable(newRow, newCol, board)
      )
        allAvailableMoves.push({ row: newRow, col: newCol });
    }
  }

  return allAvailableMoves;
};
export const getAllBlackBishop = ({ row, col }, board) => {
  const allMoves = [];
  for (
    let i = 1;
    Math.min(row - i, col - i) >= 0 && Math.max(row - i, col - i) < 8;
    i++
  ) {
    if (!pieceAvailable(row - i, col - i, board))
      allMoves.push({ row: row - i, col: col - i });
    else if (whitePieceAvailable(row - i, col - i, board)) {
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
    else if (whitePieceAvailable(row - i, col + i, board)) {
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
    else if (whitePieceAvailable(row + i, col - i, board)) {
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
    else if (whitePieceAvailable(row + i, col + i, board)) {
      allMoves.push({ row: row + i, col: col + i });
      break;
    } else break;
  }
  return allMoves;
};
export const getAllWhiteBishop = ({ row, col }, board) => {
  const allMoves = [];
  for (
    let i = 1;
    Math.min(row - i, col - i) >= 0 && Math.max(row - i, col - i) < 8;
    i++
  ) {
    if (!pieceAvailable(row - i, col - i, board))
      allMoves.push({ row: row - i, col: col - i });
    else if (blackPieceAvailable(row - i, col - i, board)) {
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
    else if (blackPieceAvailable(row - i, col + i, board)) {
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
    else if (blackPieceAvailable(row + i, col - i, board)) {
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
    else if (blackPieceAvailable(row + i, col + i, board)) {
      allMoves.push({ row: row + i, col: col + i });
      break;
    } else break;
  }
  return allMoves;
};
export const getAllBlackQueen = ({ row, col }, board) => {
  return [
    ...getAllBlackBishop({ row, col }, board),
    ...getAllBlackRook({ row, col }, board),
  ];
};
export const getAllWhiteQueen = ({ row, col }, board) => {
  return [
    ...getAllWhiteBishop({ row, col }, board),
    ...getAllWhiteRook({ row, col }, board),
  ];
};
export const getAllBlackKing = ({ row, col }, board) => {
  const allMoves = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let curRow = row + i,
        curCol = col + j;
      if (i === 0 && j === 0) continue;
      if (Math.min(curRow, curCol) >= 0 && Math.max(curRow, curCol) < 8) {
        if (
          !pieceAvailable(curRow, curCol, board) ||
          whitePieceAvailable(curRow, curCol, board)
        ) {
          allMoves.push({ row: curRow, col: curCol });
        }
      }
    }
  }
  return allMoves;
};
export const getAllWhiteKing = ({ row, col }, board) => {
  const allMoves = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let curRow = row + i,
        curCol = col + j;
      if (i === 0 && j === 0) continue;
      if (Math.min(curRow, curCol) >= 0 && Math.max(curRow, curCol) < 8) {
        if (
          !pieceAvailable(curRow, curCol, board) ||
          blackPieceAvailable(curRow, curCol, board)
        ) {
          allMoves.push({ row: curRow, col: curCol });
        }
      }
    }
  }
  return allMoves;
};
export const getAllBlackPawn = ({ row, col }, board) => {
  const allMoves = [];
  if (row + 1 < 8 && !pieceAvailable(row + 1, col, board))
    allMoves.push({ row: row + 1, col });
  if (row === 1 && !pieceAvailable(3, col, board))
    allMoves.push({ row: 3, col });
  if (row + 1 < 8) {
    if (col - 1 >= 0 && whitePieceAvailable(row + 1, col - 1, board))
      allMoves.push({ row: row + 1, col: col - 1 });
    if (col + 1 < 8 && whitePieceAvailable(row + 1, col + 1, board))
      allMoves.push({ row: row + 1, col: col + 1 });
  }
  return allMoves;
};
export const getAllWhitePawn = ({ row, col }, board) => {
  const allMoves = [];
  if (row - 1 >= 0 && !pieceAvailable(row - 1, col, board))
    allMoves.push({ row: row - 1, col });
  if (row === 6 && !pieceAvailable(4, col, board))
    allMoves.push({ row: 4, col });
  if (row - 1 >= 0) {
    if (col - 1 >= 0 && blackPieceAvailable(row - 1, col - 1, board))
      allMoves.push({ row: row - 1, col: col - 1 });
    if (col + 1 < 8 && blackPieceAvailable(row - 1, col + 1, board))
      allMoves.push({ row: row - 1, col: col + 1 });
  }
  return allMoves;
};
