import useGame from "../hooks/useGame";
import socket from "../socket"
function DrawWindowModal({setShowModal}) {
    const {setGameOver,setMessage}=useGame();
    const handleAccept = () => {
        setShowModal(false);
        setGameOver(true);
        setMessage("Draw by mutual agreement");
        socket.emit("draw_accepted");
    }
    const handleReject = () => {
        setShowModal(false);
        socket.emit("draw_rejected");
    }
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-8 rounded shadow-lg text-center w-[300px]">
                    <p className="text-lg mb-6">
                        Your opponent is claiming a draw
                    </p>
                    <div className="flex justify-between">
                        <button
                            className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-2 rounded font-bold"
                            onClick={handleAccept}
                        >
                            Accept
                        </button>
                        <button
                            className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded font-bold"
                            onClick={handleReject}
                        >
                            Reject
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
}

export default DrawWindowModal;
