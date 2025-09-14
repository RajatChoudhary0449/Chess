import blackRook from "../assets/blackRook.png";
import blackKnight from "../assets/blackKnight.png";
import blackBishop from "../assets/blackBishop.png";
import blackQueen from "../assets/blackQueen.png";
import whiteRook from "../assets/whiteRook.png";
import whiteKnight from "../assets/whiteKnight.png";
import whiteBishop from "../assets/whiteBishop.png";
import whiteQueen from "../assets/whiteQueen.png";
import { PIECES } from "../constants/constants";
function PromotionModal({ curTurn,handlePromotion }) {
    curTurn=curTurn==="white"?curTurn="black":curTurn="white";
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-8 rounded shadow-lg text-center w-[300px]">
                    <h2 className="text-2xl font-bold mb-4">Choose the promotion piece: </h2>
                    <div className="grid grid-cols-2 cursor-pointer">
                        <div onClick={() => handlePromotion(curTurn === "white" ? PIECES.WHITE.QUEEN : PIECES.BLACK.QUEEN)}><img src={curTurn === "white" ? whiteQueen : blackQueen}></img></div>
                        <div onClick={() => handlePromotion(curTurn === "white" ? PIECES.WHITE.ROOK : PIECES.BLACK.ROOK)}><img src={curTurn === "white" ? whiteRook : blackRook}></img></div>
                        <div onClick={() => handlePromotion(curTurn === "white" ? PIECES.WHITE.KNIGHT : PIECES.BLACK.KNIGHT)}><img src={curTurn === "white" ? whiteKnight : blackKnight}></img></div>
                        <div onClick={() => handlePromotion(curTurn === "white" ? PIECES.WHITE.BISHOP : PIECES.BLACK.BISHOP)}><img src={curTurn === "white" ? whiteBishop : blackBishop}></img></div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PromotionModal;
