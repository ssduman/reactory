import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import Header from "./components/Header"
import LoginoutForm from "./components/LoginoutForm"
import Footer from "./components/Footer"
import About from "./components/About"
import Rooms from "./components/Rooms"
import AddRoom from "./components/AddRoom"
import PlayRoom from "./components/PlayRoom"
import Chat from "./components/Chat"
import Okey from "./components/Okey"
import cookie from 'js-cookie'
import { io } from "socket.io-client"

var socket;
function App() {
    const [rooms, setRooms] = useState([])
    const [user, setUser] = useState({ name: "", email: "" })
    const [error, setError] = useState({ wrongAcc: false, takenAcc: false })
    const [message, setMessage] = useState({ from: "", message: "" })
    const [messages, setMessages] = useState([])

    const checkToken = async () => {
        const token = cookie.get("token")
        if (token) {
            const res = await fetch("http://localhost:4000/api/",
                {
                    method: "GET",
                    headers: {
                        "Content-type": "application/json",
                        "Accept": "application/json",
                        "authorization": token
                    }
                }
            )

            const data = await res.json()

            if (res.status === 200) {
                socket.emit("join", data.name)
                setUser({ name: data.name, email: "details.email" })
            }
            else {
                console.log("token auth failed")
            }
        }
    }

    const loginFunc = async (details) => {
        try {
            if (details.isLogin) {
                const res = await fetch("http://localhost:4000/api/login/",
                    {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify(details)
                    }
                )

                const data = await res.json()

                if (res.status === 200) {
                    cookie.set("token", data)
                    setUser({ name: details.name, email: details.email })
                    socket.emit("join", details.name)
                    setError({ wrongAcc: false, takenAcc: false })
                }
                else {
                    setError({ wrongAcc: true, takenAcc: false })
                }
            }

            else {
                const date = new Date().toISOString().slice(0, 19).replace('T', ' ')
                const newUser = { "name": details.name, "email": details.email, "password": details.password, regdate: date }
                registerUser(newUser)
            }
        }
        catch {
            console.log("catch")
        }
    }

    const logoutFunc = () => {
        cookie.remove("token")
        socket.emit("left", user.name)
        setUser({ name: "", email: "" })

        setError({ wrongAcc: false, takenAcc: false })
    }

    const registerUser = async (user) => {
        try {
            const res = await fetch("http://localhost:4000/api/signin/",
                {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(user)
                }
            )

            const data = await res.json()

            if (res.status === 201) {
                cookie.set("token", data)
                user["isLogin"] = true
                loginFunc(user)
            }
            else {
                setError({ wrongAcc: false, takenAcc: true })
            }
        }
        catch {
            console.log("catch")
        }
    }

    const deleteRoom = async (id) => {
        const res = await fetch(`http://localhost:4000/api/rooms/${id}`, { method: "DELETE" })
        await res.json()

        setRooms(rooms.filter((room) => room.id !== id))
    }

    const playRoom = async (id) => {
        const roomToPlay = await fetchRoom(id)
        const updRoom = { ...roomToPlay[0], current_player: roomToPlay[0].current_player + 1 }

        const res = await fetch(`http://localhost:4000/api/rooms/${id}`,
            {
                method: "PUT",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(updRoom)
            }

        )
        await res.json()

        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].id === id) {
                rooms[i].current_player = updRoom.current_player
                setRooms(rooms)
            }
        }
        setRooms(rooms.filter((room) => room.id === id ? { ...room, current_player: updRoom.current_player } : room))
    }

    const createRoom = async (room) => {
        const res = await fetch("http://localhost:4000/api/rooms/",
            {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(room)
            }
        )

        const data = await res.json()

        setRooms([...rooms, data["room"]])
    }

    const fetchRooms = async () => {
        const res = await fetch("http://localhost:4000/api/rooms")
        const data = await res.json()

        return data["rooms"]
    }

    const fetchRoom = async (id) => {
        const res = await fetch(`http://localhost:4000/api/rooms/${id}`)
        const data = await res.json()

        return data["room"]
    }

    const fetchUsers = async () => {
        const res = await fetch("http://localhost:4000/api/users")
        const data = await res.json()

        return data["users"]
    }

    const fetchUser = async (id) => {
        const res = await fetch(`http://localhost:4000/api/users${id}`)
        const data = await res.json()

        return data["user"]
    }

    const onMessageSend = (m, me) => {
        const div = document.createElement("div")
        div.innerHTML = m
        document.getElementById("chatbox").appendChild(div)
        setMessage({ from: user.name, message: m })

        if (me) {
            socket.emit("messageSend", { from: user.name, message: m })
        }

        return { u: user.name, m: m }
    }

    useEffect(() => {
        const getRooms = async () => {
            const roomFromServer = await fetchRooms()
            setRooms(roomFromServer)
        }

        getRooms()

        checkToken()

        socket = io("http://localhost:4000/", {
            transports: ['websocket', 'polling', 'flashsocket'],
            upgrade: false
        })

        socket.on('join', (m) => {
            console.log("join broadcast:", m)
        })

        socket.on('messageSend', (m) => {
            onMessageSend(m, false)
        })

        socket.on("db", (m) => {
            getRooms()
        })

        socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
        })

        return () => {
            socket.emit("disconnet")
            socket.off()
        }
    }, ["http://localhost:4000/"]
    )

    return (
        <Router>
            <Header title="there" />

            <LoginoutForm onLogin={loginFunc} onLogout={logoutFunc} onError={error} user={user} />

            {user.name && <Chat onSend={(m) => { onMessageSend(user.name + ": " + m, true) }} />}

            <Route path="/" exact render={(probs) =>
            (
                <>
                    {rooms.length > 0 ? <Rooms rooms={rooms} onDelete={deleteRoom} onPlay={playRoom} /> : "No room"}
                    <AddRoom onCreate={createRoom} />
                    <Footer />
                </>
            )} />

            <Route path="/okey" exact render={(probs) =>
            (
                <>
                    <Okey socket={socket} />
                </>
            )} />

            <Route path="/play" exact render={(probs) =>
            (
                <>
                    <PlayRoom user={user.name} socket={socket} />
                    <Footer />
                </>
            )} />

            <Route path="/about" exact render={(probs) =>
            (
                <>
                    <About />
                </>
            )} />
        </Router>
    );
}

export default App;
