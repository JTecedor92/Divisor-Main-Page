const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust as necessary
        methods: ["GET", "POST"]
    }
})

const keys = [];
const docs = [];

app.use(express.static(path.join(__dirname, 'build')));


app.get("*", (req, res) =>{
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

io.on('connection', (socket) =>{
    console.log("A user connected")
    socket.on('create', (msg) =>{
        if(!keys.includes(msg.id)){       
            docs.push(msg.value);
            keys.push(msg.id);
        }
    });
    socket.on('delete', (msg) =>{
        const index = keys.indexOf(msg.id);
        if(index !== -1){
            keys.splice(index);
            docs.splice(index);
        }
    });
    socket.on('update', (msg) =>{
        console.log('message: ' + msg.message);
        console.log('senderID: ' + msg.senderID);
        console.log('recieverID: ' + msg.recieverID);
        io.emit(msg.recieverID, {message: msg.message.toString(), senderID:msg.senderID.toString(), recieverID:msg.recieverID.toString()})
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Listening on 3k");
});