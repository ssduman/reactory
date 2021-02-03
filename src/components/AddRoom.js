import React from 'react'
import { useState } from "react"

const AddRoom = ({ onCreate }) => {
    // let next_id = 4
    // const [id, setId] = useState(next_id)
    const [name, setName] = useState("")
    const [capacity, setCapacity] = useState(16)
    const [current_player, setCurrentPlayer] = useState(0)
    const [password, setPassword] = useState("")

    const onSubmit = (e) => {
        e.preventDefault()

        if (!name || !capacity) {
            alert("fill name")
            return
        }

        onCreate({ name, capacity, current_player, password })

        // setId(++next_id)
        setName("")
        setCapacity(14)
        setCurrentPlayer(0)
        setPassword("")
    }

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label>Room Name: </label>
                <input type="text" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} ></input>
            </div>
            <div>
                <label>Capacity: </label>
                <input type="number" placeholder="max" min="1" max="64" value={capacity} onChange={(e) => setCapacity(e.target.value)} ></input>
            </div>
            <div>
                <label>Password: </label>
                <input type="text" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} ></input>
            </div>

            <input type="submit" value="create room" ></input>
        </form>
    )
}

export default AddRoom
