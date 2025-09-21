import React from "react";

function GameOverModal({ gameOver,message }) {
  return (
    <>
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded shadow-lg text-center w-[300px]">
            <h2 className="text-2xl font-bold mb-4">Game Over</h2>
            <p className="text-lg mb-6">
              {message}
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()} // reload to reset game
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default GameOverModal;
