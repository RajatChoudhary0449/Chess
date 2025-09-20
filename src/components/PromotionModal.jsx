import blackRook from "../assets/blackRook.png";
import blackKnight from "../assets/blackKnight.png";
import blackBishop from "../assets/blackBishop.png";
import blackQueen from "../assets/blackQueen.png";
import whiteRook from "../assets/whiteRook.png";
import whiteKnight from "../assets/whiteKnight.png";
import whiteBishop from "../assets/whiteBishop.png";
import whiteQueen from "../assets/whiteQueen.png";
import { PIECES } from "../constants/constants";
function PromotionModal({ curTurn, handlePromotion }) {
    curTurn=curTurn==="white"?"black":"white";
    const data={
        "white":[{piece:PIECES.WHITE.QUEEN,img:whiteQueen},{piece:PIECES.WHITE.ROOK,img:whiteRook},{piece:PIECES.WHITE.KNIGHT,img:whiteKnight},{piece:PIECES.WHITE.BISHOP,img:whiteBishop}],
        "black":[{piece:PIECES.BLACK.QUEEN,img:blackQueen},{piece:PIECES.BLACK.ROOK,img:blackRook},{piece:PIECES.BLACK.KNIGHT,img:blackKnight},{piece:PIECES.BLACK.BISHOP,img:blackBishop}]
    }
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-[300px]">
                    <h2 className="text-2xl font-bold mb-4">Choose the promotion piece: </h2>
                    <div className="grid grid-cols-2 gap-2 cursor-pointer">
                        {data[curTurn].map((({piece,img})=>(
                            <div key={piece} className="hover:bg-amber-300 hover:scale-110 p-2" onClick={() => handlePromotion(piece)}><img src={img} className="w-full h-full"></img></div>
                        )))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default PromotionModal;
