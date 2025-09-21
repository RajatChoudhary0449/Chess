import { io } from "socket.io-client";

const socket = io("https://chess-hxg7.onrender.com");

export default socket;