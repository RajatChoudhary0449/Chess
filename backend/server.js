const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Create socket server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","https://chess-ten-beta.vercel.app"], // allow React frontend
    methods: ["GET", "POST"],
  },
});

let player1 = null;
let player2 = null;
// Handle connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id,player1?.id,player2?.id);
  if (!player1) {
    player1 = socket;
    socket.emit("player_assignment", "white");
    console.log("Assigned as Player 1 (White):", socket.id);
  } else if (!player2) {
    player2 = socket;
    socket.emit("player_assignment", "black");
    console.log("Assigned as Player 2 (Black):", socket.id);
  } else {
    // Reject third+ player
    socket.emit("game_full");
    socket.disconnect();
    return;
  }


  // Receive move and send to opponent
  socket.on("make_move", ({move}) => {
    const opponent=(socket===player1?player2:player1);
    if(opponent)
    {
        opponent.emit("opponent_move",move);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    player1=null;
    player2=null;
    // if (socket === player1) {
    //   player1 = null;
    //   console.log("Player 1 disconnected");
    // } else if (socket === player2) {
    //   player2 = null;
    //   console.log("Player 2 disconnected");
    // }
  });
});

const port=process.env.PORT || 5000;
server.listen(port, () => {
  console.log("Server running on somewhere");
});
