import { useEffect, useState } from "react";
import { POSITIONS, MESSAGE_TYPES } from "../constants/constants";
const positionMap = {
  [POSITIONS.TOP_LEFT]: "top-4 left-4",
  [POSITIONS.TOP_CENTER]: "top-4 left-1/2 transform -translate-x-1/2",
  [POSITIONS.TOP_RIGHT]: "top-4 right-4",

  [POSITIONS.MIDDLE_LEFT]: "top-1/2 left-4 transform -translate-y-1/2",
  [POSITIONS.MIDDLE_CENTER]: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
  [POSITIONS.MIDDLE_RIGHT]: "top-1/2 right-4 transform -translate-y-1/2",

  [POSITIONS.BOTTOM_LEFT]: "bottom-4 left-4",
  [POSITIONS.BOTTOM_CENTER]: "bottom-4 left-1/2 transform -translate-x-1/2",
  [POSITIONS.BOTTOM_RIGHT]: "bottom-4 right-4",
};
const typeColorMap = {
  [MESSAGE_TYPES.INFO]: "bg-amber-400",
  [MESSAGE_TYPES.WARNING]: "bg-red-500",
  [MESSAGE_TYPES.SUCCESS]: "bg-green-500",
};
export default function InformationModal({ hide, message, position = POSITIONS.TOP_CENTER, messageType = MESSAGE_TYPES.INFO, duration }) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  useEffect(() => {
    setSecondsLeft(duration);

    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [message]);

  useEffect(() => {
    if (secondsLeft === 0) setTimeout(()=>hide(),1000);
  }, [secondsLeft, hide]);

  const positionClass = positionMap[position] || positionMap["top-center"];
  const progressPercent = ((duration - secondsLeft) / 10) * 100;

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
          <p className="font-semibold text-xs md:text-[16px]">{message}</p>
          <button
            onClick={hide}
            className="ml-4 text-gray-400 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}