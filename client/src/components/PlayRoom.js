import React from 'react'
import '../App.css';
import PlayerBoard from "./PlayerBoard"
import PlayerControl from "./PlayerControl"

const PlayRoom = (props) => {

    return (
        <div>
            <p>team A</p>
            <PlayerBoard id="team-1">
                <PlayerControl id="player-1" name="p1" />
                <PlayerControl id="player-2" name="p2" isAdmin={true} />
                <PlayerControl id="player-3" name="p3" />
            </PlayerBoard>
            <p>team B</p>
            <PlayerBoard id="team-2">
                <PlayerControl id="player-4" name="p4" />
                <PlayerControl id="player-5" name="p5" />
                <PlayerControl id="player-6" name="p6" />
            </PlayerBoard>
        </div>
    )
}

export default PlayRoom
