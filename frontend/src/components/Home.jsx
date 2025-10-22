import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const nav = useNavigate();

  const handleEnter = () => {
    nav("/room"); 
  };

  return (
    <div
      className="h-[100dvh] w-full flex justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: `url("/icon.jpeg")` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-[#222]/90 text-white rounded-3xl px-10 py-12 flex flex-col items-center shadow-2xl"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold text-center mb-4"
        >
          Welcome to Chess Arena ♟️
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg md:text-xl text-gray-300 text-center max-w-md mb-10"
        >
          Sharpen your mind, outwit your opponent, and master the timeless game of chess.
        </motion.p>

        <motion.button
          onClick={handleEnter}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-purple-700 hover:bg-purple-600 text-white text-xl font-semibold px-8 py-3 rounded-full shadow-lg cursor-pointer"
        >
          Play Now
        </motion.button>

        <p className="text-sm text-gray-400 mt-8 italic text-center">
          “The game is a struggle against your own mistakes.” — Bobby Fischer
        </p>
      </motion.div>
    </div>
  );
}
