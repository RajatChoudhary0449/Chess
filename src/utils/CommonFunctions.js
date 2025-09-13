import { PIECES } from "../constants/constants.js";
export const getAllPossibleMoves = ({ row, col, piece }, board) => {
  switch (piece) {
    // Black pieces
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

    // White pieces
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
export const encode = (row, col) => {
  return `${String.fromCharCode("a".charCodeAt(0) + col)}${8 - row}`;
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
export const getAllWhiteRook = (
  { row, col },
  board,
  validateKingSafety = true
) => {
  const allMoves = [];
  for (let i = row - 1; i >= 0; i--) {
    if (!pieceAvailable(i, col, board)) allMoves.push({ row: i, col });
    else if (blackPieceAvailable(i, col, board)) {
      allMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = row + 1; i < 8; i++) {
    if (!pieceAvailable(i, col, board)) allMoves.push({ row: i, col });
    else if (blackPieceAvailable(i, col, board)) {
      allMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = col - 1; i >= 0; i--) {
    if (!pieceAvailable(row, i, board)) allMoves.push({ col: i, row });
    else if (blackPieceAvailable(row, i, board)) {
      allMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = col + 1; i < 8; i++) {
    if (!pieceAvailable(row, i, board)) allMoves.push({ col: i, row });
    else if (blackPieceAvailable(row, i, board)) {
      allMoves.push({ row: i, col });
      break;
    } else break;
  }
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut({ row, col }, allMoves, board, true);
  return selectedMove;
};
export const getAllBlackRook = (
  { row, col },
  board,
  validateKingSafety = true
) => {
  const allMoves = [];
  for (let i = row - 1; i >= 0; i--) {
    if (!pieceAvailable(i, col, board)) allMoves.push({ row: i, col });
    else if (whitePieceAvailable(i, col, board)) {
      allMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = row + 1; i < 8; i++) {
    if (!pieceAvailable(i, col, board)) allMoves.push({ row: i, col });
    else if (whitePieceAvailable(i, col, board)) {
      allMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = col - 1; i >= 0; i--) {
    if (!pieceAvailable(row, i, board)) allMoves.push({ col: i, row });
    else if (whitePieceAvailable(row, i, board)) {
      allMoves.push({ row: i, col });
      break;
    } else break;
  }
  for (let i = col + 1; i < 8; i++) {
    if (!pieceAvailable(row, i, board)) allMoves.push({ col: i, row });
    else if (whitePieceAvailable(row, i, board)) {
      allMoves.push({ row: i, col });
      break;
    } else break;
  }
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut(
    { row, col },
    allMoves,
    board,
    false
  );
  return selectedMove;
};
export const getAllWhiteKnight = (
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
        blackPieceAvailable(newRow, newCol, board)
      )
        allMoves.push({ row: newRow, col: newCol });
    }
  }
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut({ row, col }, allMoves, board, true);
  return selectedMove;
};
export const getAllBlackKnight = (
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
        whitePieceAvailable(newRow, newCol, board)
      )
        allMoves.push({ row: newRow, col: newCol });
    }
  }
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut(
    { row, col },
    allMoves,
    board,
    false
  );
  return selectedMove;
};
export const getAllBlackBishop = (
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
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut(
    { row, col },
    allMoves,
    board,
    false
  );
  return selectedMove;
};
export const getAllWhiteBishop = (
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
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut({ row, col }, allMoves, board, true);
  return selectedMove;
};
export const getAllBlackQueen = (
  { row, col },
  board,
  validateKingSafety = true
) => {
  return [
    ...getAllBlackBishop({ row, col }, board, validateKingSafety),
    ...getAllBlackRook({ row, col }, board, validateKingSafety),
  ];
};
export const getAllWhiteQueen = (
  { row, col },
  board,
  validateKingSafety = true
) => {
  return [
    ...getAllWhiteBishop({ row, col }, board, validateKingSafety),
    ...getAllWhiteRook({ row, col }, board, validateKingSafety),
  ];
};
export const getAllBlackKing = (
  { row, col },
  board,
  validateKingSafety = true
) => {
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
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut(
    { row, col },
    allMoves,
    board,
    false
  );
  return selectedMove;
};
export const getAllWhiteKing = (
  { row, col },
  board,
  validateKingSafety = true
) => {
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
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut({ row, col }, allMoves, board, true);
  return selectedMove;
};
export const getAllBlackPawn = (
  { row, col },
  board,
  validateKingSafety = true
) => {
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
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut(
    { row, col },
    allMoves,
    board,
    false
  );
  return selectedMove;
};
export const getAllWhitePawn = (
  { row, col },
  board,
  validateKingSafety = true
) => {
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
  if (!validateKingSafety) return allMoves;
  const selectedMove = filterCheckMovesOut({ row, col }, allMoves, board, true);
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
          ...getPieceCoordinates(
            PIECES.WHITE.PAWN,
            board
          ).map((item) =>
            getAllWhitePawn({ row: item.row, col: item.col }, board,
            validateKingSafety)
          )
        );
        break;
      case PIECES.WHITE.ROOK:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(
            PIECES.WHITE.ROOK,
            board
          ).map((item) =>
            getAllWhiteRook({ row: item.row, col: item.col }, board,
            validateKingSafety)
          )
        );
        break;
      case PIECES.WHITE.KNIGHT:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(
            PIECES.WHITE.KNIGHT,
            board
          ).map((item) =>
            getAllWhiteKnight({ row: item.row, col: item.col }, board,
            validateKingSafety)
          )
        );
        break;
      case PIECES.WHITE.BISHOP:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(
            PIECES.WHITE.BISHOP,
            board
          ).map((item) =>
            getAllWhiteBishop({ row: item.row, col: item.col }, board,
            validateKingSafety)
          )
        );
        break;
      case PIECES.WHITE.QUEEN:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(
            PIECES.WHITE.QUEEN,
            board
          ).map((item) =>
            getAllWhiteQueen({ row: item.row, col: item.col }, board,
            validateKingSafety)
          )
        );
        break;
      case PIECES.WHITE.KING:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(
            PIECES.WHITE.KING,
            board
          ).map((item) =>
            getAllWhiteKing({ row: item.row, col: item.col }, board,
            validateKingSafety)
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
export const getAllBlackMoves = (board, validateKingSafety = true) => {
  let allAvailableMoves = [];
  for (let it of Object.values(PIECES.BLACK)) {
    switch (it) {
      case PIECES.BLACK.PAWN:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(
            PIECES.BLACK.PAWN,
            board
          ).map((item) =>
            getAllBlackPawn({ row: item.row, col: item.col }, board,
            validateKingSafety)
          )
        );
        break;
      case PIECES.BLACK.ROOK:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(
            PIECES.BLACK.ROOK,
            board
          ).map((item) =>
            getAllBlackRook({ row: item.row, col: item.col }, board,
            validateKingSafety)
          )
        );
        break;
      case PIECES.BLACK.KNIGHT:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(
            PIECES.BLACK.KNIGHT,
            board
          ).map((item) =>
            getAllBlackKnight({ row: item.row, col: item.col }, board,
            validateKingSafety)
          )
        );
        break;
      case PIECES.BLACK.BISHOP:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(
            PIECES.BLACK.BISHOP,
            board
          ).map((item) =>
            getAllBlackBishop({ row: item.row, col: item.col }, board,
            validateKingSafety)
          )
        );
        break;
      case PIECES.BLACK.QUEEN:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(
            PIECES.BLACK.QUEEN,
            board
          ).map((item) =>
            getAllBlackQueen({ row: item.row, col: item.col }, board,
            validateKingSafety)
          )
        );
        break;
      case PIECES.BLACK.KING:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(
            PIECES.BLACK.KING,
            board
          ).map((item) =>
            getAllBlackKing({ row: item.row, col: item.col }, board,
            validateKingSafety)
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
export const isWhiteKingChecked = (board) => {
  const [{ row: kingRow, col: kingCol }] = getPieceCoordinates(
    PIECES.WHITE.KING,
    board
  );
  return getAllBlackMoves(board, false).some(
    (item) => item.row === kingRow && item.col === kingCol
  );
};
export const isBlackKingChecked = (board) => {
  const [{ row: kingRow, col: kingCol }] = getPieceCoordinates(
    PIECES.BLACK.KING,
    board
  );
  return getAllWhiteMoves(board, false).some(
    (item) => item.row === kingRow && item.col === kingCol
  );
};
export const playMove = (move, board) => {
  const curBoard = [...board.map((item) => [...item])];
  const { from, to } = move;
  curBoard[to.row][to.col] = board[from.row][from.col];
  curBoard[from.row][from.col] = "";
  return curBoard;
};
