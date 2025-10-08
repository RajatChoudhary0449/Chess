import { useEffect, useState } from 'react'
import useGame from '../hooks/useGame';
import { getFenPosition, getLastMove } from '../utils/CommonFunctions';
import { fetchEvaluation } from '../services/fetchEvaluation';
import useMobileView from '../hooks/useMobileView';

export default function EvaluationBar({val,setVal}) {
  const { moves, activeMoveIndex } = useGame();
  const isMobile = useMobileView();

  useEffect(() => {
    async function abc() {
      const lastMove = moves?.[activeMoveIndex];
      try {
        const response = await fetchEvaluation({ fen: getFenPosition(lastMove) });
        const data = response;
        setVal(data);
      }
      catch (err) {
        console.log(err);
      }
    }
    abc();
  }, [moves?.length,activeMoveIndex]);
  return (
    <div className="md:h-full h-[30px] w-full md:w-[30px] relative rounded overflow-hidden">
      <div
        className="absolute left-0 top-0 md:h-[] w-full bg-white transition-all duration-300"
        style={{ height: isMobile ? `100%` : `${val?.winChance}%`, width: isMobile ? `${val?.winChance}%` : `100%`, top: 0 }}
      />
      <div className='text-[#444] flex z-50 absolute top-0 text-[12px] md:items-end items-center md:justify-center justify-end w-full' style={{ height: isMobile ? `100%` : `${val?.winChance}%`, width: isMobile ? `${val?.winChance}%` : `100%`, top: 0 }}>{val?.eval >= 0 ? `+${val?.eval}` : val?.eval}
      </div>
      <div
        className="absolute bottom-0 right-0 w-full bg-[#444] transition-all duration-300"
        style={{ height: isMobile ? `100%` : `${100 - val?.winChance}%`, width: isMobile ? `${100 - val?.winChance}%` : `100%` }}
      />
    </div>
  )
}
