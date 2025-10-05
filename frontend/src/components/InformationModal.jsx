import { useEffect, useState } from "react";
const positionMap = {
  "top-center": "top-4 left-1/2 transform -translate-x-1/2",
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
};

export default function InformationModal({ setShow, message, position = "top-center", messageType = "info" }) {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === 1) {
          clearInterval(timer);
          setShow(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setShow]);

  const positionClass = positionMap[position] || positionMap["top-center"];
  const progressPercent = ((10 - secondsLeft) / 10) * 100;

  const typeColorMap = {
    info: "bg-amber-400",
    warning: "bg-red-500",
    success: "bg-green-500",
  };

  const barColorClass = typeColorMap[messageType] || "bg-amber-400";

  return (
    <div className='flex flex-col'>
      <div
        className={`
          fixed z-50 ${positionClass}
          bg-white text-[#a07556] px-6 py-4 
          rounded-lg shadow-lg border border-[#e0c097]
          min-w-[250px] flex flex-col gap-2
          transition duration-300
        `}
      >
        <div className="w-full h-[5px] bg-gray-200 rounded">
          <div
            className={`h-full ${barColorClass} rounded transition-all duration-1000 ease-linear`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center max-w-[200px]">
          <p className="font-semibold">{message}</p>
          <button
            onClick={() => setShow(false)}
            className="ml-4 text-gray-400 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}