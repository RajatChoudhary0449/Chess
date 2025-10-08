const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

// Create socket server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://chess-ten-beta.vercel.app"], // allow React frontend
    methods: ["GET", "POST"],
  },
});
/* Room structure:
  id,
  gameState,{player1,player2,moves}
  spectators
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
  socket.on("create_room", ({ id, color }) => {
    if (rooms.find((room) => room.id === id)) {
      console.log("Room id already available");
      socket.emit("room_creation_status",{status:false,id});
      return;
    }
    rooms.push({
      id,
      white: color === "white" ? socket.id : null,
      black: color === "black" ? socket.id : null,
      moves: [],
      spectators: [],
    });
    socket.emit("player_assignment", color);
    socket.emit("update_game_state",[]);
    socket.emit("room_creation_status",{status:true,id});
  });
  socket.on("join_room", ({ id, color }) => {
    const room = rooms.find((room) => room.id === id);
    if (!room) return;
    if (color === "spectator") {
      socket.emit("player_assignment", color);
      if (!room.spectators.includes(socket.id)) room.spectators.push(socket.id);
      return;
    }
    if (room[color]) return;
    if (!["white", "black"].includes(color)) return;
    room[color] = socket.id;
    socket.emit("player_assignment", color);
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
