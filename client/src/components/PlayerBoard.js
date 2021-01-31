import React from 'react'
import '../App.css';

const PlayerBoard = (props) => {

    const drop = (e) => {
        e.preventDefault()
        const playerID = e.dataTransfer.getData("id")

        const player = document.getElementById(playerID)
        player.style.display = "block"

        e.target.appendChild(player)
    }

    const dragover = (e) => {
        e.preventDefault()
    }

    return (
        <div className="rectangle" id={props.id} onDrop={drop} onDragOver={dragover}>
            {props.children} 
        </div>
    )
}

export default PlayerBoard
