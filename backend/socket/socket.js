import { Server } from 'socket.io'
import express from 'express'
import http from 'http'

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.URL,
        methods: ['GET', 'POST']
    }
});

const userSocketMap = {}; // this map stores socket id corresponding to a user

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`User connected: User id = ${userId}, Socket id = ${socket.id} .`);
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        if (userId) {
            console.log(`User connected: User id = ${userId}, Socket id = ${socket.id} .`);
            delete userSocketMap[userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

export { app, server, io }