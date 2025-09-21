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
let gameState={
    player1:null,
    player2:null,
    moves:[]
}
let spectators=[];
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
    if(gameState.player1)
    {
      io.sockets.sockets.get(gameState.player1).emit("opponent_join","Your opponent has joined");
    }
    console.log("Assigned as Player 2 (Black):", socket.id);
  } else {
    // Reject third+ player
    if(spectators.includes(socket.id)) return;
    spectators.push(socket.id);
    socket.emit("game_state",gameState);
    socket.emit("player_assignment","spectator");
    return;
  }

  // Receive move and send to opponent
  socket.on("make_move", ({move}) => {
    const opponent=io.sockets.sockets.get(socket.id===gameState.player1?gameState.player2:gameState.player1);
    if(opponent)
    {
      opponent.emit("opponent_move",move);
    }
    for(let it of spectators)
    {
      const socketIT=io.sockets.sockets.get(it);
      if(socketIT)
      socketIT.emit("opponent_move",move);
      else
      spectators=spectators.filter(id=>id!=it);
    }
    gameState.moves=[move,...gameState.moves];
  });

  socket.on("game_over",()=>{
    if(gameState.player1) gameState.player1=null;
    if(gameState.player2) gameState.player2=null;
    if(gameState.moves) gameState.moves=[];
    if(spectators.length) spectators=[];
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (socket.id === gameState.player1) {
      gameState.player1 = null;
      if(!gameState.player2)
      {
        gameState.moves=[];
      }
      console.log("Player 1 disconnected");
    } else if (socket.id === gameState.player2) {
      gameState.player2 = null;
      if(!gameState.player1)
      {
        gameState.moves=[];
      }
      console.log("Player 2 disconnected");
    }
    else
    {
      if (spectators.includes(socket.id)) {
          spectators = spectators.filter(id => id !== socket.id);
          console.log("Spectator disconnected:", socket.id);
      }
    }
  });
});

const port=process.env.PORT || 5000;
server.listen(port, () => {
  console.log("Server running on somewhere");
});
