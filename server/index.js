const fs = require('fs')
const app = require("express")()
const http = require('http').createServer(app)
const https = require('https').createServer({
    key: fs.readFileSync('cert/key.pem'),
    cert: fs.readFileSync('cert/cert.cert')
}, app).listen(3443)
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
    }
})
const bodyParser = require("body-parser")
const cors = require('cors')
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken")

require('dotenv').config()

// const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'Usq23A1d8Fyy'
}));

const port = process.env.PORT || 4000

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})
connection.connect()

const sqlQuery = (query, callback) => {
    connection.query(query, (error, results, fields) => {
        if (error) {
            throw error
        }

        return callback(results)
    })
}

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

io.on('connection', (socket) => {
    console.log('a user connected')

    socket.on("join", (name) => {
        socket.broadcast.emit("join", name + " is joined from broadcast")
    })

    socket.on("left", (name) => {
        console.log(name + " is left")
    })

    socket.on("messageSend", ({ from, message }) => {
        socket.broadcast.emit("messageSend", message)
    })

    socket.on("imready", (user, room) => {
        console.log(user + " joined in " + room)
        socket.join(room)

        const clients = io.sockets.adapter.rooms.get(room);
        const numClients = clients ? clients.size : 0

        if (numClients === 4) {
            let others =  Array.from(clients)
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

    socket.on('disconnect', () => {
        console.log('user disconnected')
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
    sqlQuery('SELECT * FROM react_web.users WHERE name = "' + name + '"', async (results) => {
        if (!results || results === [] || results.length === 0) {
            res.status(501).send("cannot find user")
        }
        else {
            try {
                if (await bcrypt.compare(password, results[0].password)) {
                    req.session.regenerate(() => {
                        req.session.user = results[0]
                    })
                    res.status(200)
                    // res.append('Set-Cookie', 'divehours=fornightly')
                    res.json(generateAccessToken({ name: name }))
                }
                else {
                    console.log("hash wrong")
                    res.status(502).send("not correct")
                }
            }
            catch {
                console.log("catchin")
                res.status(500).send()
            }
        }
    })
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

        sqlQuery('SELECT * FROM react_web.users WHERE name = "' + name + '"', (results) => {
            if (results.length > 0) {
                res.status(501).send()
            }
            else {
                const query = 'INSERT INTO react_web.users (name, email, password, regdate) VALUES ' +
                    '(\"' + name + '\", \"' + email + '\", \"' + hash + '\", \"' + regdate + '\")';

                sqlQuery(query, (results) => {
                    console.log("inserted new user: ", name)
                })

                const token = generateAccessToken({ name: name })
                res.status(201)
                res.json(token)
            }
        })
    }
    catch {
        res.status(500).send()
    }
})

app.post('/api/users', (req, res) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const regdate = req.body.regdate
    const query = 'INSERT INTO react_web.users (name, email, password, regdate) VALUES ' +
        '(\"' + name + '\", \"' + email + '\", \"' + password + '\", \"' + regdate + '\")';

    sqlQuery(query, (results) => {
        res.json({ users: req.body })
    })
})

app.get('/api/users', (req, res) => {
    sqlQuery('SELECT * FROM react_web.users', (results) => {
        res.json({ users: results })
    })
})

app.get('/api/users/:id', (req, res) => {
    const id = req.params.id
    sqlQuery('SELECT * FROM react_web.users WHERE id = ' + id, (results) => {
        res.json({ user: results })
    })
})

app.get('/api/rooms', (req, res) => {
    sqlQuery('SELECT * FROM react_web.room_table', (results) => {
        res.json({ rooms: results })
    })
})

app.post('/api/rooms', (req, res) => {
    const name = req.body.name
    const capacity = req.body.capacity
    const current_player = req.body.current_player
    const password = req.body.password
    let query = 'INSERT INTO react_web.room_table (name, capacity, current_player, password) VALUES ' +
        '(\"' + name + '\", \"' + capacity + '\", \"' + current_player + '\", \"' + password + '\")'

    sqlQuery(query, (results) => {
        res.json({ room: { ...req.body, id: results.insertId } });

        io.emit("db", results)
    })
})

app.put('/api/rooms/:id', (req, res) => {
    let query = 'UPDATE react_web.room_table SET current_player = current_player + 1 WHERE id = ' + req.params.id

    sqlQuery(query, (results) => {
        res.json({ put: results })

        io.emit("db", results)
    })
})

app.delete('/api/rooms/:id', (req, res) => {
    let query = 'DELETE FROM react_web.room_table WHERE id = ' + req.params.id

    sqlQuery(query, (results) => {
        res.json({ deleted: results })

        io.emit("db", results)
    })
})

app.get('/api/rooms/:id', (req, res) => {
    const id = req.params.id
    sqlQuery('SELECT * FROM react_web.room_table WHERE id = ' + id, (results) => {
        res.json({ room: results })
    })
})

http.listen(port, () => {
    console.log("server listening on " + port)
})

// app.use(express.static('./public'))
