import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import whiteKing from "../assets/whiteKing.png"
import blackKing from "../assets/blackKing.png"
import { BLACK, WHITE } from '../constants/constants';
import { customAlphabet } from 'nanoid';
import socket from '../socket';
import useMobileView from '../hooks/useMobileView';
export default function Options() {
    const timeModes = [{ name: "initial", value: 5, title: "Initial Time" }, { name: "increment", value: 2, title: "Increment" }, { name: "delay", value: 0, title: "Delay" }]
    const [input, setInput] = useState({ color: WHITE, time: { initial: 5, increment: 2, delay: 0 } });
    const generateRoomId = customAlphabet(`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`, 7);
    const nav = useNavigate();
    const generateRandomColor = () => {
        let cur = Math.floor(Math.random() * 2);
        return cur === 0 ? WHITE : BLACK
    }
    const handleBackPress = () => {
        nav("/");
    }
    const isMobile=useMobileView();
    const handleRoomCreation = () => {
        const id = generateRoomId();
        socket.emit("create_room", { id, color: input.color === "Random" ? generateRandomColor() : input.color });
        nav(`/room/${id}`);
    }
    const handleTimeChange = (e) => {
        if (Number(e.target.value) >= 60) {
            return;
        }
        if (!isNaN(Number(e.target.value))) {
            setInput(ip => ({ ...ip, time: { ...ip.time, [e.target.name]: (Number(e.target.value)) } }))
        }
    }
    const handleIncrement = ({ name, value }) => {
        value++;
        if (value >= 60) return;
        setInput(ip => ({ ...ip, time: { ...ip.time, [name]: value } }));
    }
    const handleDecrement = ({ name, value }) => {
        value--;
        if (value <= 0) return;
        setInput(ip => ({ ...ip, time: { ...ip.time, [name]: value } }));
    }
    return (
        <div className='h-[100dvh] w-full flex justify-center items-center ' style={{ backgroundImage: `url("/icon.jpeg")` }}>
            <div className='h-auto bg-[#444] text-white rounded-2xl px-4 py-4 flex flex-col gap-y-4'>
            <button className="flex justify-start text-white bg-[#444] md:text-2xl text-xl pr-4" onClick={handleBackPress}>{"< Back"}</button>
                <div className='flex items-center justify-between'>
                    <p className='text-xl md:text-2xl font-semibold'>Color</p>
                    <div className='flex gap-x-4 items-center'>
                        <div>
                            <button className={`h-[60px] md:h-[110px] aspect-square flex justify-center items-center relative border-4 ${input.color === WHITE ? "border-green-600" : "border-[#444]"} bg-white`} onClick={() => setInput(input => ({ ...input, color: WHITE }))}>
                                <img src={whiteKing} alt='whiteKing'></img>
                            </button>
                        </div>
                        <div>
                            <button className={`h-[60px] md:h-[110px] aspect-square flex justify-center items-center relative border-4 ${input.color !== WHITE && input.color !== BLACK ? "border-green-600" : "border-[#444]"} bg-white`} onClick={() => {
                                setInput(input => ({ ...input, color: "Random" }));
                            }}>
                                <div className="max-w-[50%] max-h-full bg-white translate-x-0 h-full overflow-hidden absolute left-0 top-0">
                                    <img src={whiteKing} className='min-w-[200%] max-w-[200%] aspect-square'></img>
                                </div>
                                <div className='max-w-[50%] max-h-full bg-[#444] h-full overflow-hidden absolute right-0 bottom-0'>
                                    <img src={blackKing} className='min-w-[200%] max-w-[200%] -translate-x-[50%] aspect-square'></img>
                                </div>
                            </button>
                        </div>
                        <div>
                            <button className={`h-[60px] md:h-[110px] aspect-square flex justify-center items-center relative border-4 ${input.color === BLACK ? "border-green-600" : "border-[#444]"} bg-[#444]`} onClick={() => setInput(input => ({ ...input, color: BLACK }))}>
                                <img src={blackKing} alt={"blackKing"}></img>
                            </button>
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-x-4'>
                    <p className='text-xl md:text-2xl font-semibold'>Time Control</p>
                    <div className='flex gap-x-4 md:flex-row flex-col'>
                        {timeModes.map((item, index) => (
                            <div className='w-[110px] aspect-square flex flex-col items-center' key={index}>
                                <p className='text-xl'>{item.title}</p>
                                <div className='flex md:flex-col flex-row items-center'>
                                    <button onClick={() => {
                                        const val = { name: item.name, value: input["time"][item.name] };
                                        isMobile ? handleDecrement(val) : handleIncrement(val);
                                    }} className='cursor-pointer hover:bg-amber-100 p-2 rounded-full hover:text-[#444] aspect-square'><i className={`fas ${isMobile ? "fa-angle-left" : "fa-angle-up"}`}></i></button>
                                    <input className='px-2 py-2 outline-none max-w-full text-center font-bold text-2xl w-[50px]' name={item.name} value={input.time[item.name]} maxLength={2} onChange={handleTimeChange}></input>
                                    <button onClick={() => {
                                        const val = { name: item.name, value: input["time"][item.name] };
                                        isMobile ? handleIncrement(val) : handleDecrement(val);
                                    }} className='cursor-pointer hover:bg-amber-100 p-2 rounded-full hover:text-[#444] aspect-square'><i className={`fas ${isMobile ? "fa-angle-right" : "fa-angle-down"}`}></i></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button className='text-2xl bg-purple-700 py-2 rounded-xl font-semibold mt-4 cursor-pointer' onClick={handleRoomCreation}>Start the game</button>
            </div>
        </div>
    )
}
