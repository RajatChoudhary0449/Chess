import { BLACK, WHITE } from "../constants/constants";

export default function JoinChoiceModal({ onClose, availableRights, onJoinWhite, onJoinBlack, onSpectate }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[90%] max-w-md p-6 rounded-lg shadow-lg relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-xl"
        >
          ✕
        </button>

        {/* Modal Title */}
        <h2 className="text-xl font-semibold text-center text-[#a07556] mb-4">
          How would you like to join?
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {availableRights.includes(WHITE) &&
            <button
              onClick={onJoinWhite}
              className="w-full bg-[#a07556] hover:bg-[#8a5e46] text-white font-semibold py-2 rounded"
            >
              Join as White
            </button>
          }
          {availableRights.includes(BLACK) &&
          <button
            onClick={onJoinBlack}
            className="w-full bg-[#a07556] hover:bg-[#8a5e46] text-white font-semibold py-2 rounded"
          >
            Join as Black
          </button>
          }
          <button
            onClick={onSpectate}
            className="w-full border border-[#a07556] text-[#a07556] hover:bg-[#f5f0eb] font-semibold py-2 rounded"
          >
            Watch as Spectator
          </button>
        </div>
      </div>
    </div>
  );
}
