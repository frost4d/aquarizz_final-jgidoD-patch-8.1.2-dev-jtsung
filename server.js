// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (if any)
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New client connected');

  // Listen for call events
  socket.on('call', (data) => {
    const { signalData, to } = data;
    socket.broadcast.emit('callIncoming', { signalData, from: socket.id });
  });

  // Handle call acceptance
  socket.on('acceptCall', (data) => {
    const { signalData, to } = data;
    socket.to(to).emit('callAccepted', signalData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
