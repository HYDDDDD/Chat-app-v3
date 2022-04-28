const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

let POST = process.env.PORT || 3001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const formatMessage = require("./utils/messages");
const { userJoin, userLeave, getRoomUsers } = require("./utils/users");

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    const user = userJoin(socket.id, data.userName, data.room);

    socket.join(user.room);

    // Wellcome current user
    socket.emit("message", formatMessage("robot", "Wellcome to Chat App !!!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("robot", `${user.username} has joined the chat.`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    // io.emit("data_user", data);
  });

  socket.on("send_message", (msg) => {
    io.emit("receive_message", msg);
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("robot", `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }

    console.log(`User Disconected: ${socket.id}`);
    io.emit("user_leave", socket.id);
  });
});

server.listen(POST, () => {
  console.log("SERVER RUNNING");
});
