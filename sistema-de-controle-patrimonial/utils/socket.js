// utils/socket.js
let io;

module.exports = {
  setIO: (serverIO) => {
    io = serverIO;
  },

  getIO: () => {
    if (!io) {
      throw new Error('❌ Socket.IO ainda não foi inicializado.');
    }
    return io;
  }
};
