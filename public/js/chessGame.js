const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

// socket.emit("Emitting");

// // //receiving from backend
// // socket.on("sending from backend", ()=> {
// //   console.log("received from backend");
// // })

//little variables
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null; //Jab aap initally game mein enter hote ho to na aapke pass white hota hai aur na he black so thats why null

//functions
const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      //creating basing building block of chess
      const squareElement = document.createElement("div");

      //adding css to sqElem
      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );

      //assinging info to each sqauare element
      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squareIndex;

      //Now each some sq. elems have piece and some are null
      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );

        pieceElement.innerHTML = getPieceUnicode(square);

        //adding dragging property
        //this makes sure jika chance ho wahi pieces ko move krr paae
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          draggedPiece = pieceElement;
          sourceSquare = { row: rowIndex, col: squareIndex };
          event.dataTransfer.setData("text/plain", "");
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement); //iss ka mtlb square pr humne piece rakh diya
      }

      squareElement.addEventListener("dragover", function (e) {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", function (e) {
        e.preventDefault();
        if (draggedPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };

          handleMove(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });

  //flipping the board for different users
  if (playerRole === "b") {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };

  socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
  const unicodePieces = {
    P: "♙",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
  };

  return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function (role) {
  playerRole = role;
  renderBoard();
});

socket.on("spectatorRole", function () {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", function (fen) {
  chess.load(fen);
  renderBoard();
});

socket.on("move", function (move) {
  chess.move(move);
  renderBoard();
});

renderBoard();
