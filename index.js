require('dotenv').config()
const path = require("path")
const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const socket = require("socket.io")
const io = socket(server, {
    cors: {
        origin: '*',
    }
})

io.on('connection', (socket) => {
    console.log('a user connected')
    // console.log("all room:", io.sockets.adapter.rooms)
    // console.log("socket.rooms:", socket.rooms)

    const roomObj = {}
    const roomList = io.sockets.adapter.rooms
    for (r of roomList) {
        if (r[0].length === 8) {
            roomObj[r[0]] = Array.from(r[1])
        }
    }
    console.log("1) roomObj:", roomObj)
    socket.broadcast.emit("getAllRooms", roomObj)

    socket.on("joinRoom", (name, room) => {
        console.log("i joined", room)
        // socket.join(room)
    })

    socket.on("left", (name) => {
        console.log(name + " is left")
    })

    socket.on("messageSend", ({ from, message }) => {
        socket.broadcast.emit("messageSend", message)
    })

    socket.on("imready", (user, room) => {
        console.log("imready:", user, " joined in ", room)
        socket.join(room)

        const roomObj = {}
        const roomList = io.sockets.adapter.rooms
        for (r of roomList) {
            if (r[0].length === 8) {
                roomObj[r[0]] = Array.from(r[1])
            }
        }
        console.log("1) roomObj:", roomObj)
        socket.broadcast.emit("getAllRooms", roomObj)

        const clients = io.sockets.adapter.rooms.get(room);
        // console.log("clients in the room:", clients)
        const numClients = clients ? clients.size : 0

        if (numClients === 4) {
            let others = Array.from(clients)
            let tableMap = {
                "0": {
                    "left": others[1],
                    "right": others[3],
                    "middle": others[2]
                },
                "1": {
                    "left": others[2],
                    "right": others[0],
                    "middle": others[3]
                },
                "2": {
                    "left": others[3],
                    "right": others[1],
                    "middle": others[0]
                },
                "3": {
                    "left": others[0],
                    "right": others[2],
                    "middle": others[1]
                }
            }
            let leader = Array.from(clients)[2]
            others.splice(2, 1)
            io.to(leader).emit("leader", others, room, leader, tableMap)
        }
    })

    socket.on("tilesReady", (otherClients, room, tiles, lName, tableMap, okey) => {
        io.to(otherClients[0]).emit("getTile", tiles[0], "a_table", otherClients[0], lName, tableMap["0"], okey)
        io.to(otherClients[1]).emit("getTile", tiles[1], "b_table", otherClients[1], lName, tableMap["1"], okey)
        io.to(otherClients[2]).emit("getTile", tiles[2], "d_table", otherClients[2], lName, tableMap["3"], okey)
    })

    socket.on("requestTableTile", (client, leader) => {
        console.log("requestTableTile", client, leader)
        io.to(leader).emit("pickTableTile", client, leader)
    })

    socket.on("sendTableTile", (client, leader, tile) => {
        console.log("sendTableTile", client, leader, tile)
        io.to(client).emit("getTableTile", client, leader, tile)
    })

    socket.on("sendToRight", (client, leader, left, right, middle, tile) => {
        console.log("sendToRight", client, leader, left, right, middle, tile)
        socket.broadcast.emit("sendRight", client, leader, left, right, middle, tile)
    })

    socket.on("nextTurn", (right) => {
        io.to(right).emit("myTurn")
    })

    socket.on("myLeftChanged", (client, leader, number, color) => {
        socket.broadcast.emit("leftChanged", client, number, color)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
        socket.removeAllListeners()
    })
})

app.use(express.static(path.join(__dirname, "/clienth/build")))

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/clienth/build', 'index.html'));
})

const port = process.env.PORT || 8000

server.listen(port, () => console.log('server is running on port ' + port));
