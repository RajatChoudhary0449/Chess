const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { INITIALBOARDSETUP } = require("../src/constants/constants");

const app = express();
const server = http.createServer(app);

// Create socket server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","https://chess-ten-beta.vercel.app"], // allow React frontend
    methods: ["GET", "POST"],
  },
});
let gameState={
    board:INITIALBOARDSETUP,
    player1:null,
    player2:null,
    moves:[]
}

// Handle connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id,gameState?.player1,gameState?.player2);
  if (!gameState.player1) {
    gameState.player1 = socket.id;
    socket.emit("player_assignment", "white");
    socket.emit("game_state",gameState);
    console.log("Assigned as Player 1 (White):", socket.id);
  } else if (!gameState.player2) {
    gameState.player2 = socket.id;
    socket.emit("player_assignment", "black");
    socket.emit("game_state",gameState);
    console.log("Assigned as Player 2 (Black):", socket.id);
  } else {
    // Reject third+ player
    socket.emit("game_full");
    socket.disconnect();
    return;
  }

  // Receive move and send to opponent
  socket.on("make_move", ({move}) => {
    const opponent=io.sockets.sockets.get(socket.id===gameState.player1?gameState.player2:gameState.player1);
    if(opponent)
    {
        opponent.emit("opponent_move",move);
    }
    gameState.moves=[move,...gameState.moves];
    gameState.board=move.board;
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (socket.id === gameState.player1) {
      gameState.player1 = null;
      console.log("Player 1 disconnected");
    } else if (socket.id === gameState.player2) {
      gameState.player2 = null;
      console.log("Player 2 disconnected");
    }
  });
});

const port=process.env.PORT || 5000;
server.listen(port, () => {
  console.log("Server running on somewhere");
});
