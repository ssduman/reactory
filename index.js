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

var allRooms = {}
var roomNameMap = {}

io.on("connection", (socket) => {
    // console.log("a user connected:", allRooms)

    socket.on("joinRoom", (name, room, roomName) => {
        socket.join(room + "temp")

        if (!(roomName in roomNameMap) && roomName) {
            roomNameMap[room] = roomName
        }

        if (room in allRooms) {
            allRooms[room][socket.id] = 0
        }
        else {
            allRooms[room] = {}
            allRooms[room][socket.id] = 0
        }
        socket.broadcast.emit("getAllRoomsNew", allRooms, room, roomNameMap[room])

        let clients = io.sockets.adapter.rooms.get(room)
        let numClients = clients ? clients.size : 0

        if (numClients > 0) {
            let pList = []
            let allC = Array.from(clients)
            for (let i = 0; i < numClients; i++) {
                pList.push(io.sockets.sockets.get(allC[i]).playerName)
            }
            socket.emit("playersInTheRoom", pList)
        }
    })

    socket.on("requestAllRoom", () => {
        io.to(socket.id).emit("getAllRooms", allRooms, roomNameMap)
    })

    socket.on("leftRoom", (name, room) => {
        socket.leave(room)
        // socket.to(room).emit("userDisconnected", socket.id)
    })

    socket.on("messageSend", (from, message, room) => {
        socket.to(room + "temp").emit("messageSend", from, message)
    })

    socket.on("imready", (user, room, name) => {
        socket.playerName = name
        socket.join(room)

        if (room in allRooms) {
            allRooms[room][socket.id] = 1
            socket.broadcast.emit("getAllRoomsUpd", allRooms, room)
        }
        else {
            allRooms[room] = {}
            allRooms[room][socket.id] = 1
            socket.broadcast.emit("getAllRoomsNew", allRooms, room, roomNameMap[room])
        }

        let clients = io.sockets.adapter.rooms.get(room)
        let numClients = clients ? clients.size : 0

        let pList = []
        let allC = Array.from(clients)
        for (let i = 0; i < numClients; i++) {
            pList.push(io.sockets.sockets.get(allC[i]).playerName)
        }
        socket.to(room + "temp").emit("playersInTheRoom", pList)

        if (numClients === 4) {
            let others = Array.from(clients)
            let tableMap = {
                "0": {
                    "my": others[0],
                    "myName": io.sockets.sockets.get(others[0]).playerName,
                    "left": others[1],
                    "leftName": io.sockets.sockets.get(others[1]).playerName,
                    "right": others[3],
                    "rightName": io.sockets.sockets.get(others[3]).playerName,
                    "middle": others[2],
                    "middleName": io.sockets.sockets.get(others[2]).playerName,
                },
                "1": {
                    "my": others[1],
                    "myName": io.sockets.sockets.get(others[1]).playerName,
                    "left": others[2],
                    "leftName": io.sockets.sockets.get(others[2]).playerName,
                    "right": others[0],
                    "rightName": io.sockets.sockets.get(others[0]).playerName,
                    "middle": others[3],
                    "middleName": io.sockets.sockets.get(others[3]).playerName,
                },
                "2": {
                    "my": others[2],
                    "myName": io.sockets.sockets.get(others[2]).playerName,
                    "left": others[3],
                    "leftName": io.sockets.sockets.get(others[3]).playerName,
                    "right": others[1],
                    "rightName": io.sockets.sockets.get(others[1]).playerName,
                    "middle": others[0],
                    "middleName": io.sockets.sockets.get(others[0]).playerName,
                },
                "3": {
                    "my": others[3],
                    "myName": io.sockets.sockets.get(others[3]).playerName,
                    "left": others[0],
                    "leftName": io.sockets.sockets.get(others[0]).playerName,
                    "right": others[2],
                    "rightName": io.sockets.sockets.get(others[2]).playerName,
                    "middle": others[1],
                    "middleName": io.sockets.sockets.get(others[1]).playerName,
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

    socket.on("requestTableTile", (client, leader, room) => {
        socket.to(room).emit("decreaseTableTiles")
        io.to(leader).emit("pickTableTile", client, leader)
    })

    socket.on("sendTableTile", (client, leader, tile) => {
        io.to(client).emit("getTableTile", client, leader, tile)
    })

    socket.on("sendToRight", (room, client, leader, left, right, middle, tile) => {
        socket.to(room).emit("sendRight", client, leader, left, right, middle, tile)
    })

    socket.on("nextTurn", (right) => {
        io.to(right).emit("myTurn")
    })

    socket.on("myLeftChanged", (client, leader, number, color) => {
        socket.broadcast.emit("leftChanged", client, number, color)
    })

    socket.on("requestForOpenTable", (room, pName, point) => {
        socket.to(room).emit("sendTable", pName, point)
    })

    socket.on("myTable", (r1n, r1c, r2n, r2c, name, room) => {
        socket.to(room).emit("openTables", r1n, r1c, r2n, r2c, name)
    })

    socket.on("gosterge", (room, pName) => {
        socket.to(room).emit("decreaseGosterge", pName)
    })

    socket.on('disconnect', () => {
        socket.broadcast.emit("userDisconnected", socket.id)

        for (const [room, people] of Object.entries(allRooms)) {
            for (const [player, ready] of Object.entries(people)) {
                if (socket.id === player) {
                    delete allRooms[room][player]
                    if (Object.keys(allRooms[room]).length === 0) {
                        delete allRooms[room]
                        socket.broadcast.emit("getAllRoomsDeleted", room)
                    }
                    else {
                        socket.broadcast.emit("getAllRoomsUpd", allRooms, room)
                    }
                }
            }
        }
        
        socket.removeAllListeners()
    })
})

app.use(express.static(path.join(__dirname, "/clienth/build")))

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/clienth/build', 'index.html'));
})

const port = process.env.PORT || 8000

server.listen(port, () => console.log('server is running on port ' + port));
