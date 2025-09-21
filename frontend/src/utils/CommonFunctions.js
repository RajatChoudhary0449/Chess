import {  PIECES } from "../constants/constants.js";
export const getAllPossibleMoves = ({ row, col, piece }, board, moves) => {
  const lastMove = moves?.length > 0 ? moves[0] : null;
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
      return getAllBlackKing({ row, col }, board, true, moves);
    case PIECES.BLACK.PAWN:
      return getAllBlackPawn({ row, col }, board, true, lastMove);

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
      return getAllWhiteKing({ row, col }, board, true, moves);
    case PIECES.WHITE.PAWN:
      return getAllWhitePawn({ row, col }, board, true, lastMove);

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
export const flipBoard=(board)=>{
  return [...board.map(item=>[...item].reverse())].reverse();
}
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
    if (!pieceAvailable(row, i, board)) allMoves.push({ row, col: i });
    else if (blackPieceAvailable(row, i, board)) {
      allMoves.push({ row, col: i });
      break;
    } else break;
  }
  for (let i = col + 1; i < 8; i++) {
    if (!pieceAvailable(row, i, board)) allMoves.push({ row, col: i });
    else if (blackPieceAvailable(row, i, board)) {
      allMoves.push({ row, col: i });
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
    if (!pieceAvailable(row, i, board)) allMoves.push({ row, col: i });
    else if (whitePieceAvailable(row, i, board)) {
      allMoves.push({ row, col: i });
      break;
    } else break;
  }
  for (let i = col + 1; i < 8; i++) {
    if (!pieceAvailable(row, i, board)) allMoves.push({ row, col: i });
    else if (whitePieceAvailable(row, i, board)) {
      allMoves.push({ row, col: i });
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
  validateKingSafety = true,
  moves
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
  if (canBlackKingCastleShort(board, moves)) allMoves.push({ row: 0, col: 6 });
  if (canBlackKingCastleLong(board, moves)) allMoves.push({ row: 0, col: 2 });
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
  validateKingSafety = true,
  moves
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
  if (canWhiteKingCastleShort(board, moves)) allMoves.push({ row: 7, col: 6 });
  if (canWhiteKingCastleLong(board, moves)) allMoves.push({ row: 7, col: 2 });
  const selectedMove = filterCheckMovesOut({ row, col }, allMoves, board, true);
  return selectedMove;
};
export const getAllBlackPawn = (
  { row, col },
  board,
  validateKingSafety = true,
  lastMove
) => {
  const allMoves = [];
  if (row + 1 < 8 && !pieceAvailable(row + 1, col, board))
    allMoves.push({ row: row + 1, col });
  if (
    row === 1 &&
    !pieceAvailable(row + 1, col, board) &&
    !pieceAvailable(row + 2, col, board)
  )
    allMoves.push({ row: row + 2, col });
  if (row + 1 < 8) {
    if (col - 1 >= 0 && whitePieceAvailable(row + 1, col - 1, board))
      allMoves.push({ row: row + 1, col: col - 1 });
    if (col + 1 < 8 && whitePieceAvailable(row + 1, col + 1, board))
      allMoves.push({ row: row + 1, col: col + 1 });
  }
  // if(canEnPassant(lastMove,{currow:row,curCol:col}))
  // {
  //   //ToDo
  // }
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
  validateKingSafety = true,
  lastMove
) => {
  const allMoves = [];
  if (row - 1 >= 0 && !pieceAvailable(row - 1, col, board))
    allMoves.push({ row: row - 1, col });
  if (
    row === 6 &&
    !pieceAvailable(row - 1, col, board) &&
    !pieceAvailable(row - 2, col, board)
  )
    allMoves.push({ row: row - 2, col });
  if (row - 1 >= 0) {
    if (col - 1 >= 0 && blackPieceAvailable(row - 1, col - 1, board))
      allMoves.push({ row: row - 1, col: col - 1 });
    if (col + 1 < 8 && blackPieceAvailable(row - 1, col + 1, board))
      allMoves.push({ row: row - 1, col: col + 1 });
  }
  // if(canEnPassant(lastMove,{curRow,curCol}))
  // {
  //   //ToDo
  // }
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
          ...getPieceCoordinates(PIECES.WHITE.PAWN, board).map((item) =>
            getAllWhitePawn(
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
            getAllWhiteRook(
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
            getAllWhiteKnight(
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
            getAllWhiteBishop(
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
            getAllWhiteQueen(
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
            getAllWhiteKing(
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
export const getAllBlackMoves = (board, validateKingSafety = true) => {
  let allAvailableMoves = [];
  for (let it of Object.values(PIECES.BLACK)) {
    switch (it) {
      case PIECES.BLACK.PAWN:
        allAvailableMoves = allAvailableMoves.concat(
          ...getPieceCoordinates(PIECES.BLACK.PAWN, board).map((item) =>
            getAllBlackPawn(
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
            getAllBlackRook(
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
            getAllBlackKnight(
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
            getAllBlackBishop(
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
            getAllBlackQueen(
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
            getAllBlackKing(
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
// export const canEnPassant=(lastMove,{curRow,curCol})=>{
//   if(!lastMove) return false;
//   return ((lastMove.piece===PIECES.WHITE.PAWN || lastMove.piece===PIECES.BLACK.PAWN) && Math.abs(lastMove.from.row-lastMove.to.row)===2 && Math.abs(lastMove.from.col-curCol)===1 &&
//   lastMove.to.row === curRow)
// }
export const playMove = (move, board, promoteTo = null, castling = false) => {
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
