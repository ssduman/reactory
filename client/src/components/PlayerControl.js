import React from 'react'
import { FaTimes, FaPlay, FaStar } from "react-icons/fa"


const PlayerControl = (props) => {
    const dragstart = (e) => {
        const target = e.target

        e.dataTransfer.setData("id", target.id)

        // setTimeout(() => {target.style.display = "none"}, 0)
    }

    const dragover = (e) => {
        // e.stopPropagation()
    }

    return (
        <div id={props.id} draggable={true} onDragStart={dragstart} onDragOver={dragover}>
            {props.name}
            {props.isAdmin && <FaStar style={{ color: "yellowgreen", cursor: "pointer" }} />}
            <FaTimes style={{ color: "red", cursor: "pointer" }} />
            <FaPlay style={{ color: "green", cursor: "pointer" }} />
        </div>
    )
}

export default PlayerControl
