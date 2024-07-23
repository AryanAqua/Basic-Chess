//Requiring all the neccessary
const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const { title } = require("process");

//Create express app instance
const app = express();

//create a server using http
const server = http.createServer(app);

//Creating socket server based on http
const io = socket(server);

//Creating chess obj
const chess = new Chess();

//Initializing Players
let players = {};
let currentPlayer = "w"; //let white is currPlayer

//Configuring EJS
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

//Creating the routes
app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

//Socket.io conncections
//if you just write the io.on then it wont work because you haven't set it up in forntend side

io.on("connection", function (socket) {
  console.log("a user connected");

  //Understanding the socket.io
  //receives from frontend
  // socket.on("Emitting", function(){
  //   //abb yaha se humare pass do option hai 1st ki hum subko data bhej sakte hai by using io.emit
  //   io.emit("sending from backend");
  //   console.log("Churan");
  // })

  // //Jab v hum socket io se dissconnect hote hai tab frontend se socket ek event bhejta hai uss mein se ek dissconnected hota hai
  // socket.on("disconnect", function(){
  //   console.log("disconnected")
  // })

  //Jab hum io use krr rahe hai tho hum sabko bta rahe hai but jab hum socket use krr rahe hai tho hum khud ko bta rahe hai


  //Now assigning roles to server
  if (!players.white) {
    players.white = socket.id;
    socket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
  } else {
    socket.emit("spectatorRole");
  }
  //if koi game chorr k chala jaata hai tho
  socket.on("disconnect", function () {
    console.log("Player left the match");
    if (socket.id === players.white) {
      delete players.white;
    } else if (socket.id === players.black) {
      delete players.black;
    }
  });

  //Listening for moves as well as validating them
  socket.on("move", (move) => {
    try{
      //validating ki sahi bandi sahi side se khel raha hai
      if(chess.turn() === 'w' && socket.id != players.white) return;
      if(chess.turn() === 'b' && socket.id != players.black) return; 

      const result = chess.move(move);
      if(result){
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("bordState", chess.fen());
      }else{
        console.log("Invalid move");
        socket.emit("invalidMove", move);
      }

    } catch (err){
      console.log(err)
      socket.emit("Error caught");
    }
  })
});

//starting a server
server.listen(3000, function () {
  console.log("listening on port: 3000");
});
