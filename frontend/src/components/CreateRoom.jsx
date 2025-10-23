import { useState } from 'react'
import { customAlphabet } from 'nanoid';
import { useNavigate } from "react-router-dom"
import whiteKing from "../assets/whiteKing.png"
import blackKing from "../assets/blackKing.png"
import socket from "../socket"
import { BLACK, MESSAGE_TYPES, WHITE } from '../constants/constants';
import { convertToPascal } from '../utils/CommonFunctions';
import useNotification from '../hooks/useNotification';
import one from "../assets/1pchess.jpeg"
import two from "../assets/2pchess.webp"
import FullScreenContainer from './common/FullScreenContainer';
export default function CreateRoom() {
    const timeModesCustom = [{ name: "initial", value: 5, title: "Initial(min)" }, { name: "increment", value: 2, title: "Increment(sec)" }, { name: "delay", value: 0, title: "Delay(sec)" }]
    const listOfAlphabets = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`;
    //const colours=[WHITE,BLACK,"Random"];
    const timeModesData = [{ name: "None", value: "None" }, { name: "Bullet", value: "Bullet(2+1)" }, { name: "Blitz", value: "Blitz(5+5)" }, { name: "Rapid", value: "Rapid(15+10)" }, { name: "Custom", value: "Custom" }];
    const playersData = [{ name: "One Player", value: 1, imageSrc: one }, { name: "Two Player", value: 2, imageSrc: two }];
    const generateRoomId = customAlphabet(listOfAlphabets, 6);
    const [input, setInput] = useState({ id: generateRoomId(), mode: 1, color: WHITE, timeMode: "Blitz(5+5)", time: { initial: 5, increment: 5, delay: 0 } });
    const nav = useNavigate();
    const { showNotification } = useNotification();
    const validateRoomId = () => {
        const { id } = input;
        if (id.length !== 6) {
            return { status: false, message: "Id should be of 6 alphanumeric characters", messageType: MESSAGE_TYPES.WARNING };
        }
        else if (![...id].every(item => listOfAlphabets.includes(item))) {
            return { status: false, message: "Id should only contain alphanumeric characters", messageType: MESSAGE_TYPES.WARNING };
        }
        return { status: true, message: "Copy the room ID or share this URL to invite your opponent.", messageType: MESSAGE_TYPES.INFO };
    }
    const generateRandomColor = () => {
        let cur = Math.floor(Math.random() * 2);
        return cur === 0 ? WHITE : BLACK
    }
    const handleBackPress = () => {
        nav("/room");
    }
    const handleRoomCreation = () => {
        const { status, message, messageType: mt } = validateRoomId();
        showNotification({ message, type: mt })
        if (!status) return;
        socket.emit("create_room", { id: input.id, players: input.mode, color: input.color === "Random" ? generateRandomColor() : input.color, time: { mode: input.timeMode, ...input.time } });
    }
    const handleTimeChange = (e) => {
        if (Number(e.target.value) >= 60) {
            showNotification({ message: `${convertToPascal(e.target.name)} cannot be greater than or equal to 60`, type: MESSAGE_TYPES.WARNING });
            setInput(ip => ({ ...ip, time: { ...ip.time, [e.target.name]: 59 } }));
        }
        else
            setInput(ip => ({ ...ip, time: { ...ip.time, [e.target.name]: (Number(e.target.value)) } }))
    }
    const handleIncrement = ({ name, value }) => {
        value++;
        if (value >= 60) {
            showNotification({ message: `${convertToPascal(name)} cannot be greater than or equal to 60`, type: MESSAGE_TYPES.WARNING });
            value = 59;
        }
        setInput(ip => ({ ...ip, time: { ...ip.time, [name]: value } }));
    }
    const handleDecrement = ({ name, value }) => {
        value--;
        if (value < 0) {
            showNotification({ message: `${convertToPascal(name)} cannot be less than 0`, type: MESSAGE_TYPES.WARNING });
            value = 0;
        }
        setInput(ip => ({ ...ip, time: { ...ip.time, [name]: value } }));
    }
    const handleTimeModeChange = (e) => {
        const val = e.target.value;
        if (val === "Custom" || val === "None") {
            setInput({ ...input, timeMode: val });
        }
        else {
            let initialTime = 0, increment = 0, delay = 0;
            switch (val) {
                case 'Bullet(2+1)': initialTime = 2; increment = 1; break;
                case 'Blitz(5+5)': initialTime = 5; increment = 5; break;
                case 'Rapid(15+10)': initialTime = 15; increment = 10; break;
                default: delay = -1;
            }
            setInput({ ...input, time: { ...input.time, initial: initialTime, increment, delay: delay !== -1 ? delay : input.time.delay }, timeMode: val });
        }
    }
    return (
        <FullScreenContainer>
            <div className='h-auto bg-[#444] text-white rounded-2xl px-2 md:px-4 py-4 flex flex-col gap-y-4 max-w-[90dvw]'>
                <button className={`text-white flex gap-x-2 md:text-2xl text-xl cursor-pointer`} onClick={handleBackPress}>
                    <span><i className="fas fa-arrow-left"></i></span>Back
                </button>
                <div className='flex gap-x-4'>
                    <p className='md:text-2xl font-semibold text-xl text-nowrap flex items-center'>Mode</p>
                    <div className='flex w-full md:w-auto md:gap-x-4 justify-between md:justify-start'>
                        {playersData.map((item) => {
                            const selected = item.value === input.mode;
                            return <div key={item.value} className={`md:p-4 p-2 flex flex-col justify-center items-center text-xl border-4 text-center md:text-nowrap gap-2 ${selected ? "border-purple-700" : "border-[#444]"} cursor-pointer hover:scale-105`} onClick={() => { setInput((ip) => ({ ...ip, mode: item.value })) }}>
                                <div><img src={item.imageSrc} className='w-[50px] h-[50px]'></img></div>
                                <div>{item.name}</div>
                            </div>
                        }
                        )}
                    </div>
                </div>
                <div className='flex items-center gap-x-4'>
                    <p className='md:text-2xl font-semibold text-xl text-nowrap'>Room ID</p>
                    <input value={input.id} onChange={(e) => setInput(input => ({ ...input, id: e.target.value }))} className="outline-none px-4 py-4 text-xl" spellCheck={false} maxLength={6}></input>
                </div>
                <div className='flex items-center gap-x-4'>
                    <p className='text-xl md:text-2xl font-semibold'>Color</p>
                    <div className='flex gap-x-4 items-center'>
                        <div>
                            <button className={`h-[60px] md:h-[110px] aspect-square flex justify-center items-center relative border-4 ${input.color === WHITE ? "border-purple-700" : "border-[#444] hover:scale-105"} bg-white`} onClick={() => setInput(input => ({ ...input, color: WHITE }))}>
                                <img src={whiteKing} alt='whiteKing'></img>
                            </button>
                        </div>
                        <div>
                            <button className={`h-[60px] md:h-[110px] aspect-square flex justify-center items-center relative border-4 ${input.color !== WHITE && input.color !== BLACK ? "border-purple-700" : "border-[#444] hover:scale-105"} bg-white`} onClick={() => {
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
                            <button className={`h-[60px] md:h-[110px] aspect-square flex justify-center items-center relative border-4 ${input.color === BLACK ? "border-purple-700" : "border-[#444] hover:border-white hover:scale-105"} bg-[#444]`} onClick={() => setInput(input => ({ ...input, color: BLACK }))}>
                                <img src={blackKing} alt={"blackKing"}></img>
                            </button>
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-x-4'>
                    <p className='text-xl md:text-2xl font-semibold'>Time Control</p>
                    <select className='text-xl outline-none py-2' onChange={handleTimeModeChange} value={input.timeMode}>
                        {timeModesData.map(item => (
                            <option key={item.value} className='text-[#444] text-xl' value={item.value}>{item.value}</option>
                        ))}
                    </select>
                </div>
                {input.timeMode === "Custom" &&
                    <div className='grid grid-cols-3 gap-x-4 mt-4'>
                        {timeModesCustom.map((item, index) => (
                            <div className='w-[140px] aspect-square flex flex-col items-center text-white' key={index}>
                                <p className='text-xl text-nowrap'>{item.title}</p>
                                <div className='flex items-center'>
                                    <button onClick={() => {
                                        const val = { name: item.name, value: input["time"][item.name] };
                                        handleDecrement(val);
                                    }} className='cursor-pointer hover:bg-amber-100 p-2 rounded-full hover:text-[#444] aspect-square'><i className={`fas fa-angle-left`}></i></button>
                                    <input className='px-2 py-2 outline-none max-w-full text-center font-bold text-2xl w-[50px]' name={item.name} value={input.time[item.name]} maxLength={2} onChange={handleTimeChange}></input>
                                    <button onClick={() => {
                                        const val = { name: item.name, value: input["time"][item.name] };
                                        handleIncrement(val);
                                    }} className='cursor-pointer hover:bg-amber-100 p-2 rounded-full hover:text-[#444] aspect-square'><i className={`fas fa-angle-right`}></i></button>
                                </div>
                            </div>
                        ))}
                    </div>
                }
                <button className='text-2xl bg-purple-700 py-2 rounded-xl font-semibold mt-4 cursor-pointer' onClick={handleRoomCreation}>Start the game</button>
            </div>
        </FullScreenContainer>

    )
}
