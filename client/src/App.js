import "./App.css"
import { BrowserRouter as Router, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import cookie from 'js-cookie'
import { io } from "socket.io-client"

import Header from "./components/Header"
import Navbar from "./components/Navbar"
import Home from "./components/Home"
import About from "./components/About"
import Blog from "./components/Blog"
import Drawing from "./components/Drawing"
import Rooms from "./components/Rooms"
import Footer from "./components/Footer"
import PlayRoom from "./components/PlayRoom"
import Okey from "./components/Okey"
import AmongTurrets from "./components/AmongTurrets"

var socket = io("http://localhost:4000/") // http://localhost:4000/ or "/"
function App() {
    const [rooms, setRooms] = useState([])
    const [error, setError] = useState({ wrongAcc: false, takenAcc: false })
    const [user, setUser] = useState({ name: "", email: "" })

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

    const fetchRooms = async () => {
        const res = await fetch("http://localhost:4000/api/rooms")
        const data = await res.json()

        return data
    }

    const fetchRoom = async (id) => {
        const res = await fetch(`http://localhost:4000/api/rooms/${id}`)
        const data = await res.json()

        return data
    }

    const playRoom = async (id) => {
        const roomToPlay = await fetchRoom(id)
        const updRoom = { ...roomToPlay, current_player: roomToPlay.current_player + 1 }

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

    const deleteRoom = async (id) => {
        const res = await fetch(`http://localhost:4000/api/rooms/${id}`, { method: "DELETE" })
        await res.json()

        setRooms(rooms.filter((room) => room.id !== id))
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

        setRooms([...rooms, data])
    }

    const fetchUsers = async () => {
        const res = await fetch("http://localhost:4000/api/users")
        const data = await res.json()

        return data
    }

    const fetchUser = async (id) => {
        const res = await fetch(`http://localhost:4000/api/users${id}`)
        const data = await res.json()

        return data
    }

    useEffect(() => {
        const getRooms = async () => {
            const roomFromServer = await fetchRooms()
            setRooms(roomFromServer)
        }

        getRooms()

        checkToken()

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
    }, []
    )

    return (
        <Router>

            <Route path="/" exact render={(probs) => (

                <div className="uk-background-muted">
                    <div className="uk-container">

                        <Header error={error} setError={setError} user={user} setUser={setUser} />

                        <Navbar />

                        <main className="uk-background-default samd-border samd-rounded test">
                            <div className="uk-padding">
                                <ul className="uk-switcher" id="pages">
                                    <Home />
                                    <About />
                                    <Blog />
                                    <PlayRoom socket={socket} />
                                    <AmongTurrets />
                                    <Drawing />
                                </ul>
                            </div>
                        </main>

                        <Footer />
                    </div>
                </div>
            )} />

            <Route path="/okey" exact render={(probs) =>
            (
                <>
                    <Okey socket={socket} />
                    {rooms.length > 0 ? <Rooms rooms={rooms} onDelete={deleteRoom} onPlay={playRoom} /> : "No room"}
                </>
            )} />

            <Route path="/about" exact render={(probs) =>
            (
                <>
                    <About />
                </>
            )} />

        </Router >
    );
}

export default App;
