import React from 'react'
import { FaTimes, FaPlay } from "react-icons/fa"
import { Link } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const Rooms = ({ rooms, onDelete, onPlay }) => {

    return (
        <table>
            <thead key="thead">
                <tr>
                    <th>Room ID</th>
                    <th>Room Name</th>
                    <th>Player</th>
                    <th>Password</th>
                    <th>Delete</th>
                    <th>Play</th>
                </tr>
            </thead>
            {
                rooms.map((room) => (
                    <tbody key={room.id}>
                        <tr>
                            <th> {room.id} </th>
                            <th> {room.name} </th>
                            <th> {room.current_player + "/" + room.capacity} </th>
                            <th> {room.password ? "Yes" : "No"} </th>
                            <th> <FaTimes style={{ color: "red", cursor: "pointer" }} onClick={() => onDelete(room.id)} /></th>
                            <th>
                                <Link to={"/play?room=" + uuidv4().split("-")[0]}>
                                    <FaPlay style={{ color: "green", cursor: "pointer" }} onClick={() => onPlay(room.id)} />
                                </Link>
                            </th>
                        </tr>
                    </tbody>
                ))
            }
        </table>
    )
}

export default Rooms
