const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://community-pulse-frontend.onrender.com",
        "https://hopeverse01.web.app",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
  const { userId, role } = socket.handshake.query;
  if (userId) socket.join(userId);
  if (role) socket.join(role); 
});
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
