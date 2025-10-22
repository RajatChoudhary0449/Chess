const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:5173", "https://chess-ten-beta.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Create socket server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://chess-ten-beta.vercel.app"], // allow React frontend
    methods: ["GET", "POST"],
  },
});
/* Room structure:
  id,
  white: socket.id || null,
  black: socket.id || null,
  gameStarted: boolean,
  moves: [objects],
  players: 1|2
  time: Object with mode:None | Blitz | Rapid | Bullet | Custom, hr, min, sec,
  spectators: [socket.id],
*/

const spreadToAll = ({ event, payload = "" }, socket) => {
  const room = getRoomFromSocket(socket);
  if (!room) {
    console.log("No room found");
    return;
  }
  const opponent = io.sockets.sockets.get(
    socket.id === room.white ? room.black : room.white
  );
  if (opponent) {
    opponent.emit(event, payload);
  }
  for (let it of room.spectators) {
    const socketIT = io.sockets.sockets.get(it);
    if (socketIT) socketIT.emit(event, payload);
    else room.spectators = room.spectators.filter((id) => id != it);
  }
};

const sendToOpponent = ({ event, payload = "" }, socket) => {
  const room = getRoomFromSocket(socket);
  if (!room) {
    console.log("Couldn't find a room");
    return;
  }
  const opponent = io.sockets.sockets.get(
    socket.id === room.white ? room.black : room.white
  );
  if (opponent) {
    opponent.emit(event, payload);
  }
};
// const getTimeFromTimeMode = (mode) => {
//   if (mode === "Custom" || mode === "None")
//     return { initial: 10, increment: 0, delay: Infinity };
//   else if (mode === "Bullet(2+1)") {
//     return { initial: 2, increment: 1, delay: 0 };
//   } else if (mode === "Blitz(5+5)") {
//     return { initial: 5, increment: 5, delay: 0 };
//   } //mode=Rapid(15+10)
//   else {
//     return { initial: 15, increment: 10, delay: 0 };
//   }
// };
const handleGameOver = (socket) => {
  const room = getRoomFromSocket(socket);
  if (room) deleteRoom(room.id);
};
let rooms = [];
const getRoomFromSocket = (socket) => {
  const id = socket?.id;
  const filteredResult = rooms.filter(
    (room) =>
      room.white === id || room.black === id || room.spectators.includes(id)
  );
  if (filteredResult.length > 0) return filteredResult[0];
  else return null;
};
const updateRoom = (room) => {
  rooms = rooms.map((allRooms) => (allRooms.id === room.id ? room : allRooms));
};
const deleteRoom = (id) => {
  rooms = rooms.filter((allRoom) => allRoom.id !== id);
};
const isRoomFull = (room) => {
  return room.white && room.black;
};
const removeFromRoom = (socket) => {
  const room = getRoomFromSocket(socket);
  if (!room) return;
  if (room.white === socket.id) room.white = null;
  if (room.black === socket.id) room.black = null;
  if (room.spectators.includes(socket.id))
    room.spectators = room.spectators.filter((rId) => rId != socket.id);
  updateRoom(room);
};

// Handle connections
io.on("connection", (socket) => {
  socket.on("create_room", ({ id, color, time, players }) => {
    if (rooms.find((room) => room.id === id)) {
      console.log("Room id already available");
      socket.emit("room_creation_status", { status: false, id, time });
      return;
    }
    const curRoom = {
      id,
      white: color === "white" ? socket.id : null,
      black: color === "black" ? socket.id : null,
      gameStarted: false,
      moves: [],
      time,
      players,
      spectators: [],
      lastUpdatedTime: new Date(),
    };
    socket.emit("player_assignment", color);
    socket.emit("update_game_state", []);
    socket.emit("room_creation_status", { status: true, id, time, players});
    if(players===1){
      curRoom.gameStarted = true;
      socket.emit("start_clock", {
        color: "white",
        increment: curRoom.time.increment,
        delay: curRoom.time.delay,
      });
      spreadToAll(
        {
          event: "start_clock",
          payload: {
            color: "white",
            increment: curRoom.time.increment,
            delay: curRoom.time.delay,
          },
        },
        socket
      );
    }
    rooms.push(curRoom);
  });
  socket.on("join_room", ({ id, color }) => {
    const room = rooms.find((room) => room.id === id);
    if (!room) return;
    if (color === "spectator") {
      socket.emit("player_assignment", color);
      if (!room.spectators.includes(socket.id)) room.spectators.push(socket.id);
    }
    else
    {
      if (room[color]) return;
      if (!["white", "black"].includes(color)) return;
      room[color] = socket.id;
      socket.emit("player_assignment", color);
    }
    socket.emit("set_time", room.time);
    const curTurn = room.moves?.length % 2 === 0 ? "white" : "black";
    let whiteTime = room.time.initial * 60,
      blackTime = room.time.initial * 60;
    if (room.moves.length > 0) {
      const { whiteTime: wt, blackTime: bt } =
        room.moves[room.moves.length - 1];
      whiteTime = wt.hour * 3600 + wt.min * 60 + wt.sec;
      blackTime = bt.hour * 3600 + bt.min * 60 + bt.sec;
    }
    if (room.gameStarted) {
      if (curTurn === "white") {
        whiteTime -= Math.floor((new Date() - room.lastUpdatedTime) / 1000);
      } else {
        blackTime -= Math.floor((new Date() - room.lastUpdatedTime) / 1000);
      }
    }
    socket.emit("set_clock", { whiteTime, blackTime });
    if (isRoomFull(room) && !room.gameStarted) {
      room.gameStarted = true;
      socket.emit("show_preparing_window", 10);
      sendToOpponent({ event: "show_preparing_window", payload: 10 }, socket);
      setTimeout(() => {
        socket.emit("start_clock", {
          color: "white",
          increment: room.time.increment,
          delay: room.time.delay,
        });
        spreadToAll(
          {
            event: "start_clock",
            payload: {
              color: "white",
              increment: room.time.increment,
              delay: room.time.delay,
            },
          },
          socket
        );
        room.lastUpdatedTime = new Date();
      }, 10000);
    } else {
      socket.emit("start_clock", {
        color: curTurn,
        increment: room.time.increment,
        delay: room.time.delay,
      });
    }
    updateRoom(room);
  });

  socket.on("check_for_room", ({ id, source }) => {
    const room = rooms.find((room) => room.id === id);
    if (!room) {
      socket.emit("availability_response", {
        access: false,
        message: "Room not available",
        source,
      });
      return;
    }
    socket.emit("availability_response", {
      access: true,
      message: "Good to go",
      room,
      source,
    });
    return;
  });

  socket.on("delete_room", (roomId) => {
    deleteRoom(roomId);
  });

  // Receive move and send to opponent
  socket.on("make_move", ({ move }) => {
    spreadToAll({ event: "opponent_move", payload: move }, socket);
    const room = getRoomFromSocket(socket);
    if (!room) return;
    room.moves = [...room.moves, move];
    // console.log(move, new Date() - room.lastUpdatedTime);
    const { whiteTime: wt, blackTime: bt } = move;
    const whiteTime = wt.hour * 3600 + wt.min * 60 + wt.sec;
    const blackTime = bt.hour * 3600 + bt.min * 60 + bt.sec;
    if (move.turn === "white")
      sendToOpponent({ event: "set_clock", payload: { whiteTime } }, socket);
    else sendToOpponent({ event: "set_clock", payload: { blackTime } }, socket);
    room.lastUpdatedTime = new Date();
    const opponentTurn = move.turn === "white" ? "black" : "white";
    socket.emit("start_clock", {
      color: opponentTurn,
      increment: room.time.increment,
      delay: room.time.delay,
    });
    spreadToAll(
      {
        event: "start_clock",
        payload: {
          color: opponentTurn,
          increment: room.time.increment,
          delay: room.time.delay,
        },
      },
      socket
    );
    updateRoom(room);
  });

  socket.on("game_over", handleGameOver);

  socket.on("offer_draw", () => {
    sendToOpponent({ event: "draw_offered" }, socket);
  });

  socket.on("draw_accepted", () => {
    sendToOpponent({ event: "draw_accepted" }, socket);
  });

  socket.on("draw_rejected", () => {
    sendToOpponent({ event: "draw_rejected" }, socket);
  });

  socket.on("draw", ({ message }) => {
    spreadToAll({ event: "drawn", payload: message }, socket);
    handleGameOver(socket);
  });

  socket.on("remove_from_room", removeFromRoom);

  socket.on("move_undo", (moves) => {
    spreadToAll({ event: "undo_move", payload: moves }, socket);
    const room = getRoomFromSocket(socket);
    room.moves = moves;
    updateRoom(room);
  });

  socket.on("resign", (payload) => {
    spreadToAll({ event: "resign", payload }, socket);
    removeFromRoom(socket);
    // handleGameOver(socket);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const room = getRoomFromSocket(socket);
    if (!room) {
      return;
    }
    if (room.white === socket.id) room.white = null;
    else if (room.black === socket.id) room.black = null;
    else room.spectators = room.spectators.filter((id) => id != socket.id);
    updateRoom(room);
    if (!room.white && !room.black && room.spectators.length === 0)
      deleteRoom(room?.id);
    console.log("User disconnected:", socket.id);
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log("Server running somewhere");
});
