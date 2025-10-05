import { useState } from 'react'
import { customAlphabet } from 'nanoid';
import { useNavigate } from "react-router-dom"
import whiteKing from "../assets/whiteKing.png"
import blackKing from "../assets/blackKing.png"
import socket from "../socket"
import { BLACK, WHITE } from '../constants/constants';
import useMobileView from '../hooks/useMobileView';
import useGame from '../hooks/useGame';
import InformationModal from "./InformationModal";
export default function CreateRoom() {
    const timeModes = [{ name: "initial", value: 5, title: "Initial Time" }, { name: "increment", value: 2, title: "Increment" }, { name: "delay", value: 0, title: "Delay" }]
    //const colours=[WHITE,BLACK,"Random"];
    const generateRoomId = customAlphabet(`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`, 6);
    const [input, setInput] = useState({ id: generateRoomId(), color: WHITE, time: { initial: 5, increment: 2, delay: 0 } });
    const isMobile = useMobileView();
    const nav = useNavigate();
    const { infoMessage, setInfoMessage, showInfoModal, setShowInfoModal } = useGame();
    const [messageType, setMessageType] = useState("warning");
    const validateRoomId = () => {
        const { id } = input;
        if (id.length < 6) {
            return { status: false, message: "Id length cannot be less than 6 alphanumeric characters", messageType: "danger" };
        }
        return { status: true, message: "Copy the room ID or share this URL to invite your opponent.", messageType: "Success" };
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
        setMessageType(mt);
        setShowInfoModal(true);
        setInfoMessage(message);
        if (!status) return;
        socket.emit("create_room", { id: input.id, color: input.color === "Random" ? generateRandomColor() : input.color });
        nav(`/room/${input.id}`);
    }
    const handleTimeChange = (e) => {
        if (Number(e.target.value) >= 60) {
            setShowInfoModal(true);
            setInfoMessage(`${e.target.name} cannot be greater than or equal to 60`);
            setInput(ip => ({ ...ip, time: { ...ip.time, [e.target.name]: 59 } }));
        }
        else
            setInput(ip => ({ ...ip, time: { ...ip.time, [e.target.name]: (Number(e.target.value)) } }))
    }
    const handleIncrement = ({ name, value }) => {
        value++;
        if (value >= 60) {
            setShowInfoModal(true);
            setInfoMessage(`${name} cannot be greater than or equal to 60`);
            value = 59;
        }
        setInput(ip => ({ ...ip, time: { ...ip.time, [name]: value } }));
    }
    const handleDecrement = ({ name, value }) => {
        value--;
        if (value < 0) {
            setShowInfoModal(true);
            setInfoMessage(`${name} cannot be less than 0`);
            value = 0;
        }
        setInput(ip => ({ ...ip, time: { ...ip.time, [name]: value } }));
    }
    return (
        <div className='h-[100dvh] w-full flex justify-center items-center ' style={{ backgroundImage: `url("/icon.jpeg")` }}>
            {showInfoModal && <InformationModal setShow={setShowInfoModal} message={infoMessage} position='top-right' messageType={messageType} />}
            <button className="absolute top-0 left-0 text-white bg-[#e0c097] md:text-2xl text-xl pr-4" onClick={handleBackPress}>{"< Back"}</button>
            <div className='h-auto bg-[#e0c097] text-white rounded-2xl px-2 md:px-4 py-4 flex flex-col gap-y-4 max-w-[90dvw]'>
                <div className='flex items-center gap-x-4'>
                    <p className='md:text-2xl font-semibold text-xl text-nowrap'>Room ID</p>
                    <input value={input.id} onChange={(e) => setInput(input => ({ ...input, id: e.target.value }))} className="outline-none px-4 py-4 text-xl" spellCheck={false} maxLength={6}></input>
                </div>
                <div className='flex items-center gap-x-4'>
                    <p className='text-xl md:text-2xl font-semibold'>Color</p>
                    <div className='flex gap-x-4 items-center'>
                        <div>
                            <button className={`h-[60px] md:h-[110px] aspect-square flex justify-center items-center relative border-4 ${input.color === WHITE ? "border-green-600" : "border-[#e0c097]"} bg-white`} onClick={() => setInput(input => ({ ...input, color: WHITE }))}>
                                <img src={whiteKing} alt='whiteKing'></img>
                            </button>
                        </div>
                        <div>
                            <button className={`h-[60px] md:h-[110px] aspect-square flex justify-center items-center relative border-4 ${input.color !== WHITE && input.color !== BLACK ? "border-green-600" : "border-[#e0c097]"} bg-white`} onClick={() => {
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
                            <button className={`h-[60px] md:h-[110px] aspect-square flex justify-center items-center relative border-4 ${input.color === BLACK ? "border-green-600" : "border-[#e0c097]"} bg-[#444]`} onClick={() => setInput(input => ({ ...input, color: BLACK }))}>
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
                <button className='text-2xl bg-green-600 py-2 rounded-xl font-semibold mt-4 cursor-pointer' onClick={handleRoomCreation}>Start the game</button>
            </div>
        </div>
    )
}
