export const PIECES = {
  BLACK: {
    ROOK: "r",
    KNIGHT: "n",
    BISHOP: "b",
    QUEEN: "q",
    KING: "k",
    PAWN: "p",
  },
  WHITE: {
    ROOK: "R",
    KNIGHT: "N",
    BISHOP: "B",
    QUEEN: "Q",
    KING: "K",
    PAWN: "P",
  },
};
export const INITIALBOARDSETUP = [
  [PIECES.BLACK.ROOK, PIECES.BLACK.KNIGHT, PIECES.BLACK.BISHOP, PIECES.BLACK.QUEEN, PIECES.BLACK.KING, PIECES.BLACK.BISHOP, PIECES.BLACK.KNIGHT, PIECES.BLACK.ROOK],
  Array.from({ length: 8 }, () => PIECES.BLACK.PAWN),
  ...Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => "")),
  Array.from({ length: 8 }, () => PIECES.WHITE.PAWN),
  [PIECES.WHITE.ROOK, PIECES.WHITE.KNIGHT, PIECES.WHITE.BISHOP, PIECES.WHITE.QUEEN, PIECES.WHITE.KING, PIECES.WHITE.BISHOP, PIECES.WHITE.KNIGHT, PIECES.WHITE.ROOK],
];
