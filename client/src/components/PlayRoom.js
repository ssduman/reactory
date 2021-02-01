import React from 'react'
import { useState, useEffect } from "react"
import _ from 'underscore'
import '../App.css'
import PlayerBoard from "./PlayerBoard"
import PlayerControl from "./PlayerControl"
import queryString from 'query-string'
import { io } from "socket.io-client"

const allTiles = [
    { "red-1a": 1 },
    { "red-1b": 1 },
    { "red-2a": 2 },
    { "red-2b": 2 },
    { "red-3a": 3 },
    { "red-3b": 3 },
    { "red-4a": 4 },
    { "red-4b": 4 },
    { "red-5a": 5 },
    { "red-5b": 5 },
    { "red-6a": 6 },
    { "red-6b": 6 },
    { "red-7a": 7 },
    { "red-7b": 7 },
    { "red-8a": 8 },
    { "red-8b": 8 },
    { "red-9a": 9 },
    { "red-9b": 9 },
    { "red-10a": 10 },
    { "red-10b": 10 },
    { "red-11a": 11 },
    { "red-11b": 11 },
    { "red-12a": 12 },
    { "red-12b": 12 },
    { "red-13a": 13 },
    { "red-13b": 13 },
    { "yellow-1a": 1 },
    { "yellow-1b": 1 },
    { "yellow-2a": 2 },
    { "yellow-2b": 2 },
    { "yellow-3a": 3 },
    { "yellow-3b": 3 },
    { "yellow-4a": 4 },
    { "yellow-4b": 4 },
    { "yellow-5a": 5 },
    { "yellow-5b": 5 },
    { "yellow-6a": 6 },
    { "yellow-6b": 6 },
    { "yellow-7a": 7 },
    { "yellow-7b": 7 },
    { "yellow-8a": 8 },
    { "yellow-8b": 8 },
    { "yellow-9a": 9 },
    { "yellow-9b": 9 },
    { "yellow-10a": 10 },
    { "yellow-10b": 10 },
    { "yellow-11a": 11 },
    { "yellow-11b": 11 },
    { "yellow-12a": 12 },
    { "yellow-12b": 12 },
    { "yellow-13a": 13 },
    { "yellow-13b": 13 },
    { "blue-1a": 1 },
    { "blue-1b": 1 },
    { "blue-2a": 2 },
    { "blue-2b": 2 },
    { "blue-3a": 3 },
    { "blue-3b": 3 },
    { "blue-4a": 4 },
    { "blue-4b": 4 },
    { "blue-5a": 5 },
    { "blue-5b": 5 },
    { "blue-6a": 6 },
    { "blue-6b": 6 },
    { "blue-7a": 7 },
    { "blue-7b": 7 },
    { "blue-8a": 8 },
    { "blue-8b": 8 },
    { "blue-9a": 9 },
    { "blue-9b": 9 },
    { "blue-10a": 10 },
    { "blue-10b": 10 },
    { "blue-11a": 11 },
    { "blue-11b": 11 },
    { "blue-12a": 12 },
    { "blue-12b": 12 },
    { "blue-13a": 13 },
    { "blue-13b": 13 },
    { "black-1a": 1 },
    { "black-1b": 1 },
    { "black-2a": 2 },
    { "black-2b": 2 },
    { "black-3a": 3 },
    { "black-3b": 3 },
    { "black-4a": 4 },
    { "black-4b": 4 },
    { "black-5a": 5 },
    { "black-5b": 5 },
    { "black-6a": 6 },
    { "black-6b": 6 },
    { "black-7a": 7 },
    { "black-7b": 7 },
    { "black-8a": 8 },
    { "black-8b": 8 },
    { "black-9a": 9 },
    { "black-9b": 9 },
    { "black-10a": 10 },
    { "black-10b": 10 },
    { "black-11a": 11 },
    { "black-11b": 11 },
    { "black-12a": 12 },
    { "black-12b": 12 },
    { "black-13a": 13 },
    { "black-13b": 13 },
    { "fake-1": -1 },
    { "fake-2": -2 },
]

var socket;
const PlayRoom = (props) => {
    var user;
    var room;

    const drop = (e) => {
        e.preventDefault()

        var data = e.dataTransfer.getData("id");
        var s = document.getElementById(data);
        var tempNumber = e.target.innerHTML
        var tempColor = e.target.style.color
        e.target.innerHTML = s.innerHTML
        e.target.style.color = s.style.color
        s.innerHTML = tempNumber
        s.style.color = tempColor

        e.target.src = s.src;
    }

    useEffect(() => {
        user = props.user
        room = queryString.parse(window.location.search).room

        if (props.user) {
            localStorage.setItem("name", user)
        }
        else {
            user = localStorage.getItem("name")
        }

        socket = io("http://localhost:4000/", {
            transports: ['websocket', 'polling', 'flashsocket'],
            upgrade: false
        })

        socket.on("getTile", (myTile) => {
            console.log("getTile:", myTile)

            myTile.map((tile, index) => {
                let i = index + 1
                let entry = document.getElementById(i.toString())
                let split = tile.split("-")
                let color = split[0]
                let number = split[1]
                entry.innerHTML = number.substring(0, number.length - 1)
                if (color === "fake") {
                    entry.style.color = "green"
                    entry.innerHTML = "Fake"
                }
                else if (color === "red") {
                    entry.style.color = "red"
                }
                else if (color === "yellow") {
                    entry.style.color = "#d6bc13"
                }
                else if (color === "blue") {
                    entry.style.color = "blue"
                }
                else if (color === "black") {
                    entry.style.color = "black"
                }
            })
        })

        socket.on("leader", (otherClients, room) => {
            console.log("I'm leader", otherClients, "...room:", room, "...")

            var a = _.sample(allTiles, 15)
            var b = _.sample(_.without(allTiles, ...a), 14)
            var c = _.sample(_.without(_.without(allTiles, ...a), ...b), 14)
            var d = _.sample(_.without(_.without(_.without(allTiles, ...a), ...b), ...c), 14)
            const a_table = a.map(e => Object.keys(e)[0])
            const b_table = b.map(e => Object.keys(e)[0])
            const c_table = c.map(e => Object.keys(e)[0])
            const d_table = d.map(e => Object.keys(e)[0])

            a_table.map((tile, index) => {
                let i = index + 1
                let entry = document.getElementById(i.toString())
                let split = tile.split("-")
                let color = split[0]
                let number = split[1]
                entry.innerHTML = number.substring(0, number.length - 1)
                if (color === "fake") {
                    entry.style.color = "green"
                    entry.innerHTML = "Fake"
                }
                else if (color === "red") {
                    entry.style.color = "red"
                }
                else if (color === "yellow") {
                    entry.style.color = "#d6bc13"
                }
                else if (color === "blue") {
                    entry.style.color = "blue"
                }
                else if (color === "black") {
                    entry.style.color = "black"
                }
            })

            socket.emit("tilesReady", otherClients, room, [b_table, c_table, d_table])
        })

        console.log("user: " + user + ", roomID: " + room)
    }, [])

    // <form onSubmit={(e) => socket.emit("imready", { user, room })}>
    // </form>
    return (
        <div>
            <input type="submit" value="I'm ready" onClick={() => socket.emit("imready", { user, room })} />

            <div className="okeyTable">

                <div className="rectangleA"></div>
                <div className="rectangleB"></div>
                <div className="rectangleC"></div>

                <table className="myTable" onDrop={drop} onDragOver={(e) => e.stopPropagation()}>
                    <thead key="thead">
                        <tr>
                            <th>1</th>
                            <th>2</th>
                            <th>3</th>
                            <th>4</th>
                            <th>5</th>
                            <th>6</th>
                            <th>7</th>
                            <th>8</th>
                            <th>9</th>
                            <th>10</th>
                            <th>11</th>
                            <th>12</th>
                            <th>13</th>
                            <th>14</th>
                        </tr>
                    </thead>
                    <tbody key={"d"}>
                        <tr>
                            <td
                                id="1"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="2"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="3"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="4"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="5"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="6"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="7"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="8"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="9"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="10"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="11"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="12"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="13"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="14"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                        </tr>
                        <tr>
                            <td
                                id="15"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="16"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="17"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="18"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="19"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="20"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="21"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="22"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="23"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="24"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="25"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="26"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="27"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                            <td
                                id="28"
                                draggable={true}
                                onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                onDragOver={(e) => e.preventDefault()}
                            />
                        </tr>
                    </tbody>
                </table>
            </div>

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
