import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import useTimer from '../hooks/useTimer'
import { WHITE } from '../constants/constants';

const TimerWindow = forwardRef(({ time = 100, color, onTimerUp }, ref) => {
    const { timeLeft, setTimeLeft, setIsRunning, isRunning } = useTimer({ time, onTimerUp });
    const latestTimeRef = useRef(timeLeft);
    useEffect(() => {
        latestTimeRef.current = timeLeft;
    }, [timeLeft]);
    
    useImperativeHandle(ref, () => (
        {
            resumeTimer: () => setIsRunning(true),
            getTime: () => latestTimeRef.current,
            setTime: (time) => setTimeLeft(time),
            stopTimer: () => setIsRunning(false),
            isRunning: ()=> isRunning,
            incrementTimer: (timeToIncrease)=>{setTimeLeft(time=>time+timeToIncrease)},
        }
    ))
    const { hour, min, sec } = timeLeft;
    return (
        <div className={`flex gap-x-4 ${color === WHITE ? "bg-white text-[#444]" : "bg-black text-white border-white border"} p-2 font-bold md:text-lg`}>
            {isRunning && <div className='animate-spin'><i className="fa-regular fa-clock"></i></div>}
            <div className={``}>
                {String(hour).padStart(2, '0')}:
                {String(min).padStart(2, '0')}:
                {String(sec).padStart(2, '0')}
            </div>
        </div>
    )
});
export default TimerWindow;