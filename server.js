const path = require("path")
const express = require("express")
const http = require("http")
// const https = require('https').createServer({
//     key: fs.readFileSync('cert/key.pem'),
//     cert: fs.readFileSync('cert/cert.cert')
// }, app).listen(3443)
const app = express()
const server = http.createServer(app)
const socket = require("socket.io")
const io = socket(server, {
    cors: {
        origin: '*',
    }
})

const bodyParser = require("body-parser")
const cors = require('cors')
const bcrypt = require('bcrypt')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken")

require('dotenv').config()

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
}));

const { Pool, Client } = require('pg')
// const config = {
//     user: process.env.PGUSER,
//     password: process.env.PGPASSWORD,
//     host: process.env.PGHOST,
//     port: process.env.PGPORT,
//     database: process.env.PGDATABASE
// }
// const pool = new Pool()
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})
client.connect()

// const connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME
// })
// connection.connect()
// const sqlQuery = (query, callback) => {
//     connection.query(query, (error, results, fields) => {
//         if (error) {
//             throw error
//         }
//         return callback(results)
//     })
// }

const generateAccessToken = (name) => {
    return jwt.sign(name, process.env.TOKEN_SECRET, { expiresIn: '1800s' })
}

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']
    if (token == null) {
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
        if (error) {
            return res.sendStatus(401)
        }
        req.user = user
        next()
    })
}

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

        socket.emit("getRoomName", roomNameMap[room])
        let clients = io.sockets.adapter.rooms.get(room)
        let numClients = clients ? clients.size : 0

        if (numClients > 0) {
            let pList = []
            let allC = Array.from(clients)
            for (let i = 0; i < numClients; i++) {
                pList.push(io.sockets.sockets.get(allC[i]).playerName)
            }
            socket.emit("playersInTheRoom", pList, roomNameMap[room])
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
        io.to(room + "temp").emit("playersInTheRoom", pList)

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

app.get('/api', authenticateToken, (req, res) => {
    res.json(req.user)
})

app.post('/api/login', async (req, res, next) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password

    try {
        const queryResult = await client.query("SELECT * FROM users WHERE name = ($1)", [name])
        results = queryResult["rows"]
        console.log("queryResult:", results)
        if (!results || results === [] || results.length === 0) {
            console.log("no user found")
            res.status(401).json({ error: 'no user found' })
        }
        else {
            try {
                if (await bcrypt.compare(password, results[0].password)) {
                    req.session.regenerate(() => {
                        req.session.user = results[0]
                    })
                    res.status(200)
                    res.json(generateAccessToken({ name: name }))
                    console.log("success")
                }
                else {
                    console.log("hash wrong")
                    res.status(401).json({ error: 'hash wrong' })
                }
            }
            catch {
                console.log("catchin")
                res.status(401).json({ error: 'try catch error' })
            }
        }
    } catch (error) {
        console.error("api/login error:", error)
    }
})

app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
})

app.post('/api/signin', async (req, res) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const regdate = req.body.regdate
    try {
        const hash = await bcrypt.hash(password, 10)

        const chechUserExists = await client.query("SELECT * FROM users WHERE name = ($1)", [name])
        if (chechUserExists["rows"].length > 0) {
            res.status(401).json({ error: 'user already exists' })
        }
        else {
            const insertUser = await client.query(
                "INSERT INTO users (name, email, regdate, isadmin, password) VALUES (($1), ($2), ($3), ($4), ($5)) RETURNING *",
                [name, email, regdate, 0, hash]
            )

            const token = generateAccessToken({ name: name })
            res.status(201)
            res.json(token)
        }
    }
    catch {
        res.status(401).json({ error: 'singin catch' })
    }
})

app.get('/api/users', async (req, res) => {
    const allUsers = await client.query("SELECT name FROM users")

    res.json(allUsers["rows"])
})

app.get('/api/users/:id', async (req, res) => {
    const id = req.params.id
    const requestUser = await client.query("SELECT name FROM users WHERE id = ($1)", [id])

    res.json(requestUser["rows"])
})

app.get('/api/rooms', async (req, res) => {
    const allRooms = await client.query("SELECT * FROM rooms")

    res.json(allRooms["rows"])
})

app.get('/api/rooms/:id', async (req, res) => {
    const getRoom = await client.query("SELECT * FROM rooms WHERE id = ($1)", [req.params.id])

    res.json(getRoom["rows"][0])
})

app.post('/api/rooms', async (req, res) => {
    const name = req.body.name
    const capacity = req.body.capacity
    const current_player = req.body.current_player
    const password = req.body.password

    const insertRoom = await client.query(
        "INSERT INTO rooms (name, capacity, current_player, password) VALUES (($1), ($2), ($3), ($4)) RETURNING *",
        [name, capacity, current_player, password]
    )

    res.json({ ...req.body, id: insertRoom["rows"][0].id });

    io.emit("db", insertRoom["rows"][0])
})

app.put('/api/rooms/:id', async (req, res) => {
    const updateRoom = await client.query("UPDATE rooms SET current_player = current_player + 1 WHERE id = ($1) RETURNING *", [req.params.id])

    res.json(updateRoom["rows"][0])

    io.emit("db", updateRoom["rows"][0])
})

app.delete('/api/rooms/:id', async (req, res) => {
    const deleteRoom = await client.query("DELETE FROM rooms WHERE id = ($1) RETURNING *", [req.params.id])

    res.json(deleteRoom["rows"][0])

    io.emit("db", deleteRoom["rows"][0])
})

app.use(express.static(path.join(__dirname, "/client/build")))

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
})

const port = process.env.PORT || 8000

server.listen(port, () => console.log('server is running on port ' + port));
