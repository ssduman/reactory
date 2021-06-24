import React from 'react'
import { useEffect } from "react"
import ReactDOMServer from 'react-dom/server'
import _ from 'underscore'
import queryString from 'query-string'
import { v4 as uuidv4 } from 'uuid'
import Chat from "./Chat.js"
import '../App.css'

var allTiles = require("./allTiles").allTiles
var socket;
var myTile;
var tableTile;
var mySocketName;
var myLeaderName;
var myLeftName;
var myRightName;
var myOppositeName;
var playerName;
var myLeftPlayerName;
var myRightPlayerName;
var myOppositePlayerName;
var okeyNumberColor;
var myTurn = false
var tileAllowed = false
var playerPointMap = {}
var myLeftTileStack = []
var totalPerCount;
var totalReadyPlayer = 0
var totalReadyPlayerName = []
var totalOnlinePlayers = 1
var user;
var room;
var limit = 9
const PlayRoom = (props) => {

    const drop = (e) => {
        e.preventDefault()

        checkFinish()

        var data = e.dataTransfer.getData("id")
        var s = document.getElementById(data)
        var tempNumber;
        var tempColor;
        var tempTransform;
        if (!s) {
            return
        }
        if (s.id === "left" && myTurn) {
            if (tileAllowed && myLeftTileStack.length > 0) {
                if (e.target.id === "middle" || e.target.id === "right" || e.target.innerHTML) {
                    return
                }

                tempNumber = e.target.innerHTML
                tempColor = e.target.style.color
                e.target.innerHTML = s.innerHTML
                e.target.style.color = s.style.color

                myLeftTileStack.pop()
                if (myLeftTileStack.length === 0) {
                    s.innerHTML = ""
                    s.style.color = "black"
                    document.getElementsByClassName("cell2")[0].style.color = "black"
                }
                else {
                    s.innerHTML = myLeftTileStack[myLeftTileStack.length - 1][0]
                    s.style.color = myLeftTileStack[myLeftTileStack.length - 1][1]
                    document.getElementsByClassName("cell2")[0].style.color = myLeftTileStack[myLeftTileStack.length - 1][1]
                }

                if (document.getElementById("gostergeButton")) {
                    document.getElementById("gostergeButton").style.display = "none"
                }

                socket.emit("myLeftChanged", mySocketName, myLeaderName, s.innerHTML, s.style.color)

                e.target.src = s.src

                tileAllowed = false
            }
            if (myLeftTileStack.length === 0) {
                s.innerHTML = ""
                s.style.color = "black"
            }
        }
        else if (s.id === "left" && !myTurn) {
            return
        }
        else if (s.id === "middle" && myTurn) {
            if (e.target.id === "left" || e.target.id === "right" || e.target.id === "middle") {
                return
            }

            if (e.target.innerHTML) {
                return
            }

            if (tileAllowed) {
                tempNumber = e.target.innerHTML
                tempColor = e.target.style.color

                socket.emit("pickedTableTile", room)

                var tile = tableTile.shift()
                let split = tile.split("-")
                let color = split[0]
                let number = split[1]

                e.target.innerHTML = number.substring(0, number.length - 1)
                if (color === "fake") {
                    e.target.style.color = "green"
                    e.target.innerHTML = "✿"
                }
                else if (color === "red") {
                    e.target.style.color = "red"
                }
                else if (color === "yellow") {
                    e.target.style.color = "#d6bc13"
                }
                else if (color === "blue") {
                    e.target.style.color = "blue"
                }
                else if (color === "black") {
                    e.target.style.color = "black"
                }

                e.target.src = s.src
                tileAllowed = false

                var currTableTiles = document.getElementsByClassName("remainingTiles")[0]
                currTableTiles.innerHTML = parseInt(currTableTiles.innerHTML) - 1

                if (document.getElementById("gostergeButton")) {
                    document.getElementById("gostergeButton").style.display = "none"
                }
            }
        }
        else if (s.id === "middle" && !myTurn) {
            return
        }
        else if (s.id === "right") {
            return
        }
        else {
            if (e.target.id === "left") {
                return
            }
            else if (e.target.id === "right" && myTurn) {
                if (!tileAllowed && s.innerHTML) {
                    e.target.innerHTML = s.innerHTML
                    e.target.style.color = s.style.color
                    s.style.transform = ""

                    document.getElementsByClassName("cell1")[0].style.color = e.target.style.color

                    socket.emit("sendToRight", room, mySocketName, myLeaderName, myLeftName, myRightName, myOppositeName, s.style.color + "-" + s.innerHTML)

                    var divRectA = document.getElementsByClassName("rectangleA")[0]
                    divRectA.style.boxShadow = ""
                    divRectA.style.color = "black"

                    var divRectB = document.getElementsByClassName("rectangleB")[0]
                    divRectB.style.boxShadow = ""
                    divRectB.style.color = "black"

                    var divRectC = document.getElementsByClassName("rectangleC")[0]
                    divRectC.style.boxShadow = "0px 0px 5px 4px rgba(51,136,86,0.64)"
                    divRectC.style.color = "rgba(51,136,86,0.64)"

                    var divRectD = document.getElementsByClassName("rectangleD")[0]
                    divRectD.style.boxShadow = ""
                    divRectD.style.color = "black"
                    divRectD = document.getElementsByClassName("rectangleD")[1]
                    divRectD.style.boxShadow = ""
                    divRectD.style.color = "black"

                    s.innerHTML = ""
                    s.style.color = ""

                    e.target.src = s.src

                    myTurn = false

                    if (document.getElementById("gostergeButton")) {
                        document.getElementById("gostergeButton").style.display = "none"
                    }

                    socket.emit("nextTurn", myRightName, (res) => {
                        if (!res || res !== 1) {
                            console.log("res:", res)
                        }
                    })

                    checkFinish()

                    return
                }
                else {
                    return
                }
            }
            else if (e.target.id === "right" && !myTurn) {
                return
            }
            else if (e.target.id === "middle" && socket && myTurn) {
                var perCount = checkFinish()
                if (perCount >= limit && s.innerHTML) {
                    var number = s.innerHTML
                    var color = s.style.color
                    if (color === "rgb(214, 188, 19)") {
                        color = "#d6bc13"
                    }
                    let point = 4
                    let oN = parseInt(okeyNumberColor[0]) + 1 === 14 ? 1 : parseInt(okeyNumberColor[0]) + 1
                    if (parseInt(number) === oN && color === okeyNumberColor[1]) {
                        point *= 2
                    }
                    socket.emit("requestForOpenTable", room, playerName, point)

                    let myPoint = document.getElementById("pPoint-" + playerName)
                    document.getElementById("pPoint-" + playerName).innerHTML = parseInt(myPoint.innerHTML) - point

                    var [row1number, row1color, row2number, row2color] = getMyTable()
                    socket.emit("myTable", row1number, row1color, row2number, row2color, mySocketName, room)
                    setTimeout(() => socket.emit("leftRoom", mySocketName, room), 1000)

                    totalReadyPlayer = 0
                    var readyButton = document.getElementById("readyButton")
                    readyButton.innerHTML = "Ready ✖"
                    readyButton.style.backgroundColor = ""
                    readyButton.style.cursor = "pointer"

                    document.getElementById("readyPlayerDiv").innerHTML = "Ready Players: " + totalReadyPlayer + "/4"
                    document.getElementById("readyPlayerDiv1").innerHTML = ""
                    document.getElementById("readyPlayerDiv2").innerHTML = ""
                    document.getElementById("readyPlayerDiv3").innerHTML = ""
                    document.getElementById("readyPlayerDiv4").innerHTML = ""

                    // document.getElementById("readyButton").remove()
                    document.getElementsByClassName("rectangleA")[0].style.border = "0px"
                    document.getElementsByClassName("rectangleB")[0].style.border = "0px"
                    document.getElementsByClassName("rectangleC")[0].style.border = "0px"
                    document.getElementsByClassName("rectangleA")[0].style.top = "-100px"
                    document.getElementsByClassName("rectangleB")[0].style.top = "-100px"
                    document.getElementsByClassName("rectangleC")[0].style.top = "-100px"
                }
                else if (perCount >= limit && !s.innerHTML) {
                    document.getElementById("perCount").innerHTML = "Drop a tile"
                }
                else {
                    document.getElementById("perCount").innerHTML = "Per count is low!"
                }
                return
            }
            else if (e.target.id === "middle" && socket && !myTurn) {
                document.getElementById("perCount").innerHTML = "Not your turn"
                return
            }

            tempNumber = e.target.innerHTML
            tempColor = e.target.style.color
            tempTransform = e.target.style.transform
            e.target.innerHTML = s.innerHTML
            e.target.style.color = s.style.color
            e.target.style.transform = s.style.transform
            s.innerHTML = tempNumber
            s.style.color = tempColor
            s.style.transform = tempTransform

            e.target.src = s.src
        }

        checkFinish()
    }

    const fillTable = (tiles) => {
        var index = 0
        var nextRow = true
        var curr_color = tiles[0].split("-")[0]
        tiles.map((tile) => {
            let split = tile.split("-")
            let color = split[0]
            let number = split[1]
            if (curr_color !== color) {
                index += 1
                if (index >= 7 && nextRow) {
                    index = 14
                    nextRow = false
                }
            }
            curr_color = color
            index += 1
            let entry = document.getElementById(index.toString())
            entry.innerHTML = number.substring(0, number.length - 1)
            if (color === "fake") {
                entry.style.color = "green"
                entry.innerHTML = "✿"
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

        checkFinish()
    }

    const commands = (m) => {
        var command = m.split(" ")
        if (command.length == 3 && command[1] == "/limit" && !isNaN(command[2])) {
            limit = parseInt(command[2])
            return true;
        }

        return false
    }

    const onMessageSend = (m, me) => {
        if (!commands(m)) {
            const div = document.createElement("div")
            div.innerHTML = m
            document.getElementById("chatbox").prepend(div)
            
            if (me) {
                socket.emit("messageSend", playerName, m, room)
            }
        }
    }

    const reverseOkeyTile = (e) => {
        if (!okeyNumberColor) {
            return
        }

        var number = e.target.innerHTML
        var color = e.target.style.color
        if (color === "rgb(214, 188, 19)") {
            color = "#d6bc13"
        }
        let oN = parseInt(okeyNumberColor[0]) + 1 === 14 ? 1 : parseInt(okeyNumberColor[0]) + 1
        if (parseInt(number) === oN && color === okeyNumberColor[1]) {
            if (!e.target.style.transform) {
                e.target.style.transform = "rotate(90deg)"
            }
            else {
                e.target.style.transform = ""
            }
        }
    }

    const getMyTable = () => {
        var row1number = []
        var row1color = []
        var row2number = []
        var row2color = []
        for (var i = 1; i < 15; i++) {
            let cell = document.getElementById(i.toString())
            let number = cell.innerHTML ? cell.innerHTML : 0
            let color = cell.style.color === "rgb(214, 188, 19)" ? "#d6bc13" : cell.style.color
            row1number.push(number === "✿" ? "✿" : parseInt(number))
            row1color.push(color)
        }
        for (var i = 15; i < 29; i++) {
            let cell = document.getElementById(i.toString())
            let number = cell.innerHTML ? cell.innerHTML : 0
            let color = cell.style.color === "rgb(214, 188, 19)" ? "#d6bc13" : cell.style.color
            row2number.push(number === "✿" ? "✿" : parseInt(number))
            row2color.push(color)
        }

        return [row1number, row1color, row2number, row2color]
    }

    const checkFinish = () => {
        var [row1number, row1color, row2number, row2color] = getMyTable()

        totalPerCount = 0
        for (var [row, rowc] of [[row1number, row1color], [row2number, row2color]]) {
            var currPerCount = row[0] !== 0 ? 1 : 0
            var oldNumber = row[0]
            var oldColor = rowc[0]
            var track13 = 0
            for (var i = 1; i < row.length; i++) {
                if (row[i] !== 0) {
                    if (oldNumber !== 0) {
                        if (track13 !== 0) {
                            track13 += 1
                        }
                        var n = oldNumber + 1
                        if (n === row[i] && oldColor === rowc[i]) {
                            currPerCount += 1
                        }
                        else if (n === 14 && row[i] === 1 && oldColor === rowc[i]) {
                            currPerCount += 1
                            track13 += 1
                        }
                        else if (oldNumber === row[i] && oldColor !== rowc[i]) {
                            for (var rev1 = i - currPerCount; rev1 < i; rev1++) {
                                for (var rev2 = rev1 + 1; rev2 < i; rev2++) {
                                    if (rowc[rev1] === rowc[rev2]) {
                                        currPerCount = 1
                                        continue
                                    }
                                }
                            }
                            currPerCount += 1
                        }
                        else {
                            if (currPerCount >= 3) {
                                totalPerCount += currPerCount
                                currPerCount = 1
                            }
                        }
                    }
                    else {
                        currPerCount = 1
                    }
                }
                else {
                    if (track13 !== 0) {
                        totalPerCount -= track13
                        totalPerCount += 1
                        track13 = 0
                    }
                    if (currPerCount >= 3) {
                        totalPerCount += currPerCount
                    }
                    currPerCount = 0
                }

                oldNumber = row[i]
                oldColor = rowc[i]
            }
            if (currPerCount >= 3) {
                totalPerCount += currPerCount
            }
        }

        document.getElementById("perCount").innerHTML = "Total per: " + totalPerCount

        return totalPerCount
    }

    const constructTable = (row1number, row1color, row2number, row2color, order, rotate, top, left) => {
        row1number = row1number.map((t) => {
            if (t === 0) {
                return ""
            }
            else if (t === -1) {
                return "✿"
            }
            else {
                return t
            }
        })
        row2number = row2number.map((t) => {
            if (t === 0) {
                return ""
            }
            else if (t === -1) {
                return "✿"
            }
            else {
                return t
            }
        })

        const t =
            <table
                className="uk-table uk-table-small uk-table-middle .uk-width-20 myTable1"
                id={"constructed" + order}
                style={{
                    transform: rotate,
                    width: "80%",
                    position: "absolute",
                    top: top,
                    left: left,
                }}>
                <tr>
                    <td id={"0" + order} style={{ color: row1color[0] }}>{row1number[0]}</td>
                    <td id={"1" + order} style={{ color: row1color[1] }}>{row1number[1]}</td>
                    <td id={"2" + order} style={{ color: row1color[2] }}>{row1number[2]}</td>
                    <td id={"3" + order} style={{ color: row1color[3] }}>{row1number[3]}</td>
                    <td id={"4" + order} style={{ color: row1color[4] }}>{row1number[4]}</td>
                    <td id={"5" + order} style={{ color: row1color[5] }}>{row1number[5]}</td>
                    <td id={"6" + order} style={{ color: row1color[6] }}>{row1number[6]}</td>
                    <td id={"7" + order} style={{ color: row1color[7] }}>{row1number[7]}</td>
                    <td id={"8" + order} style={{ color: row1color[8] }}>{row1number[8]}</td>
                    <td id={"9" + order} style={{ color: row1color[9] }}>{row1number[9]}</td>
                    <td id={"10" + order} style={{ color: row1color[10] }}>{row1number[10]}</td>
                    <td id={"11" + order} style={{ color: row1color[11] }}>{row1number[11]}</td>
                    <td id={"12" + order} style={{ color: row1color[12] }}>{row1number[12]}</td>
                    <td id={"13" + order} style={{ color: row1color[13] }}>{row1number[13]}</td>
                </tr>
                <tr>
                    <td id={"14" + order} style={{ color: row2color[0] }}>{row2number[0]}</td>
                    <td id={"15" + order} style={{ color: row2color[1] }}>{row2number[1]}</td>
                    <td id={"16" + order} style={{ color: row2color[2] }}>{row2number[2]}</td>
                    <td id={"17" + order} style={{ color: row2color[3] }}>{row2number[3]}</td>
                    <td id={"18" + order} style={{ color: row2color[4] }}>{row2number[4]}</td>
                    <td id={"19" + order} style={{ color: row2color[5] }}>{row2number[5]}</td>
                    <td id={"20" + order} style={{ color: row2color[6] }}>{row2number[6]}</td>
                    <td id={"21" + order} style={{ color: row2color[7] }}>{row2number[7]}</td>
                    <td id={"22" + order} style={{ color: row2color[8] }}>{row2number[8]}</td>
                    <td id={"23" + order} style={{ color: row2color[9] }}>{row2number[9]}</td>
                    <td id={"24" + order} style={{ color: row2color[10] }}>{row2number[10]}</td>
                    <td id={"25" + order} style={{ color: row2color[11] }}>{row2number[11]}</td>
                    <td id={"26" + order} style={{ color: row2color[12] }}>{row2number[12]}</td>
                    <td id={"27" + order} style={{ color: row2color[13] }}>{row2number[13]}</td>
                </tr>
            </table>
        return ReactDOMServer.renderToStaticMarkup(t)
    }

    const createRoomEntry = (room, people, roomName) => {
        let sum = people && Object.keys(people).length !== 0 ? Object.values(people).reduce((a, b) => a + b) : 0
        totalOnlinePlayers += sum
        document.getElementById("onlinePlayers").innerHTML = totalOnlinePlayers
        const nEnrty =
            <li uk-scrollspy="cls:uk-animation-fade" id={"listhead-" + room}>
                <div className="uk-grid uk-flex uk-flex-middle">
                    <div className="uk-text-lead" id={"listname-" + room}>
                        {roomName && roomName[room] ? roomName[room] : room}
                    </div>
                    <div className="uk-width-expand"> </div>
                    <div className="uk-text-lead" id={"listcount-" + room}>
                        {sum + "/4"}
                    </div>
                    <div>
                        <button
                            className="uk-button uk-button-danger uk-width-small"
                            id={"join-" + room}>
                            Join
                    </button>
                    </div>
                </div>
            </li>
        const roomHTML = document.getElementsByClassName("uk-list uk-list-divider")[0]
        roomHTML.insertAdjacentHTML('beforeend', ReactDOMServer.renderToStaticMarkup(nEnrty))
        document.getElementById("join-" + room).onclick = () => {
            const addURL = "?room=" + room
            window.location.href += addURL
            socket.emit("joinRoom", user, room)
        }
    }

    const gosterge = () => {
        for (let i = 1; i <= 28; i++) {
            let cell = document.getElementById(i.toString())
            if (cell.innerHTML && parseInt(cell.innerHTML) === parseInt(okeyNumberColor[0])) {
                let color = cell.style.color
                if (color === "rgb(214, 188, 19)") {
                    color = "#d6bc13"
                }
                if (color === okeyNumberColor[1]) {
                    socket.emit("gosterge", room, playerName)

                    let myPoint = document.getElementById("pPoint-" + playerName)
                    document.getElementById("pPoint-" + playerName).innerHTML = parseInt(myPoint.innerHTML) - 2
                }
            }
        }
        if (document.getElementById("gostergeButton")) {
            document.getElementById("gostergeButton").style.display = "none"
        }
    }

    useEffect(() => {
        room = queryString.parse(window.location.search).room

        socket = props.socket

        socket.emit("requestAllRoom")

        if (room) {
            socket.emit("joinRoom", user, room)
            if (!document.getElementById("listcount-" + room)) {
                createRoomEntry(room, { "me": 0 })
            }
        }

        socket.on("playersInTheRoom", (pList, rName) => {
            if (rName) {
                document.getElementsByClassName("roomName")[0].innerHTML = "Room name: " + rName
            }
            if (pList.length > 4) {
                return
            }
            totalReadyPlayerName = pList
            totalReadyPlayer = pList.length
            document.getElementById("readyPlayerDiv").innerHTML = "Ready Players: " + totalReadyPlayer + "/4"
            const tableHTML = document.getElementById("pointTablePlayer")
            for (let i = 0; i < pList.length; i++) {
                if (!(pList[i] in playerPointMap)) {
                    playerPointMap[pList[i]] = 20

                    document.getElementById("readyPlayerDiv" + (i + 1)).innerHTML = pList[i]
                    let nPlayerPoint =
                        <tr>
                            <td>{totalReadyPlayerName[i]}</td>
                            <td id={"pPoint-" + totalReadyPlayerName[i]}>20</td>
                        </tr>
                    tableHTML.insertAdjacentHTML('beforeend', ReactDOMServer.renderToStaticMarkup(nPlayerPoint))
                }

                document.getElementById("readyPlayerDiv" + (i + 1)).innerHTML = pList[i]
            }
        })

        socket.on("getRoomName", (rName) => {
            if (rName) {
                document.getElementsByClassName("roomName")[0].innerHTML = "Room name: " + rName
            }
        })

        socket.on("userDisconnected", (socketid) => {
            if (socketid === myLeftName) {
                totalReadyPlayer -= 1
                document.getElementById("readyPlayerDiv").innerHTML = "Ready Players: " + totalReadyPlayer + "/4"
                let index = totalReadyPlayerName.indexOf(myLeftPlayerName)
                totalReadyPlayerName.splice(index, 1)
                document.getElementById("readyPlayerDiv" + (index + 1)).innerHTML = ""
            }
            else if (socketid === myRightName) {
                totalReadyPlayer -= 1
                document.getElementById("readyPlayerDiv").innerHTML = "Ready Players: " + totalReadyPlayer + "/4"
                let index = totalReadyPlayerName.indexOf(myRightPlayerName)
                totalReadyPlayerName.splice(index, 1)
                document.getElementById("readyPlayerDiv" + (index + 1)).innerHTML = ""
            }
            else if (socketid === myOppositeName) {
                totalReadyPlayer -= 1
                document.getElementById("readyPlayerDiv").innerHTML = "Ready Players: " + totalReadyPlayer + "/4"
                let index = totalReadyPlayerName.indexOf(myOppositePlayerName)
                totalReadyPlayerName.splice(index, 1)
                document.getElementById("readyPlayerDiv" + (index + 1)).innerHTML = ""
            }
        })

        socket.on("getAllRooms", (rooms, roomNames) => {
            for (const [room, people] of Object.entries(rooms)) {
                createRoomEntry(room, people, roomNames)
            }
        })

        socket.on("getAllRoomsNew", (rooms, room, roomName) => {
            if (!document.getElementById("listcount-" + room)) {
                createRoomEntry(room, rooms[room], roomName)
            }
        })

        socket.on("getAllRoomsUpd", (rooms, room) => {
            let sum = rooms[room] && Object.keys(rooms[room]).length !== 0 ? Object.values(rooms[room]).reduce((a, b) => a + b) : 0
            if (!document.getElementById("listcount-" + room)) {
                return
            }
            let old = document.getElementById("listcount-" + room).innerHTML
            let oldN = parseInt(old.split("/")[0])
            totalOnlinePlayers += (sum - oldN)
            document.getElementById("onlinePlayers").innerHTML = totalOnlinePlayers
            document.getElementById("listcount-" + room).innerHTML = sum + "/4"
        })

        socket.on("getAllRoomsDeleted", (room) => {
            document.getElementById("listhead-" + room).remove()
        })

        socket.on("getTile", (mTile, tName, sName, lName, tableMap, okey, tTile) => {
            myTile = mTile
            mySocketName = sName
            myLeaderName = lName
            myLeftName = tableMap["left"]
            myLeftPlayerName = tableMap["leftName"]
            var lRect = document.getElementsByClassName("rectangleA")[0]
            lRect.innerHTML = myLeftPlayerName
            myRightName = tableMap["right"]
            myRightPlayerName = tableMap["rightName"]
            var rRect = document.getElementsByClassName("rectangleC")[0]
            rRect.innerHTML = myRightPlayerName
            myOppositeName = tableMap["middle"]
            myOppositePlayerName = tableMap["middleName"]
            var oRect = document.getElementsByClassName("rectangleB")[0]
            oRect.innerHTML = myOppositePlayerName
            tableTile = tTile

            if (myLeaderName === myLeftName) {
                lRect.style.boxShadow = "0px 0px 5px 4px rgba(51,136,86,0.64)"
                lRect.style.color = "rgba(51,136,86,0.64)"
            }
            if (myLeaderName === myRightName) {
                rRect.style.boxShadow = "0px 0px 5px 4px rgba(51,136,86,0.64)"
                rRect.style.color = "rgba(51,136,86,0.64)"
            }
            if (myLeaderName === myOppositeName) {
                oRect.style.boxShadow = "0px 0px 5px 4px rgba(51,136,86,0.64)"
                oRect.style.color = "rgba(51,136,86,0.64)"
            }

            okeyNumberColor = okey
            var okeyTile = document.getElementsByClassName("okeyTile")
            okeyTile["0"].innerHTML = okey[0]
            okeyTile["0"].style.color = okey[1]

            fillTable(myTile)

            if (document.getElementById("gostergeButton")) {
                document.getElementById("gostergeButton").style.display = "block"
            }
        })

        socket.on("leader", (otherClients, room, sName, tableMap) => {
            mySocketName = sName
            myLeaderName = sName
            myLeftName = tableMap["2"]["left"]
            myLeftPlayerName = tableMap["2"]["leftName"]
            var lRect = document.getElementsByClassName("rectangleA")[0]
            lRect.innerHTML = myLeftPlayerName
            myRightName = tableMap["2"]["right"]
            myRightPlayerName = tableMap["2"]["rightName"]
            var rRect = document.getElementsByClassName("rectangleC")[0]
            rRect.innerHTML = myRightPlayerName
            myOppositeName = tableMap["2"]["middle"]
            myOppositePlayerName = tableMap["2"]["middleName"]
            var oRect = document.getElementsByClassName("rectangleB")[0]
            oRect.innerHTML = myOppositePlayerName
            myTurn = true
            tileAllowed = false

            var okeyNumber = Math.floor(Math.random() * 13 + 1)
            var colors = ["red", "#d6bc13", "blue", "black"]
            var i = Math.floor(Math.random() * 4)
            var okey = [okeyNumber, colors[i]]
            okeyNumberColor = [okeyNumber, colors[i]]
            var okeyTile = document.getElementsByClassName("okeyTile")
            okeyTile["0"].innerHTML = okeyNumber
            okeyTile["0"].style.color = colors[i]
            var cObj = (colors[i] === "#d6bc13" ? "yellow" : colors[i]) + "-" + okeyNumber + "a"
            var dObj = {}
            dObj[cObj] = okeyNumber

            var remaining = _.without(allTiles, _.findWhere(allTiles, dObj))

            var a = _.sample(remaining, 15)
            var b = _.sample(_.without(remaining, ...a), 14)
            var c = _.sample(_.without(_.without(remaining, ...a), ...b), 14)
            var d = _.sample(_.without(_.without(_.without(remaining, ...a), ...b), ...c), 14)
            var other = _.without(_.without(_.without(_.without(remaining, ...a), ...b), ...c), ...d)
            const a_tile = a.map(e => Object.keys(e)[0]).sort()
            const b_tile = b.map(e => Object.keys(e)[0]).sort()
            const c_tile = c.map(e => Object.keys(e)[0]).sort()
            const d_tile = d.map(e => Object.keys(e)[0]).sort()

            a_tile.sort((a, b) => (a.split("-")[0] > b.split("-")[0]) ? -1 : 1)
            a_tile.sort((a, b) => (parseInt(a.split("-")[1]) > parseInt(b.split("-")[1]) && a.split("-")[0] === b.split("-")[0]) ? 1 : -1)

            b_tile.sort((a, b) => (a.split("-")[0] > b.split("-")[0]) ? -1 : 1)
            b_tile.sort((a, b) => (parseInt(a.split("-")[1]) > parseInt(b.split("-")[1]) && a.split("-")[0] === b.split("-")[0]) ? 1 : -1)

            c_tile.sort((a, b) => (a.split("-")[0] > b.split("-")[0]) ? -1 : 1)
            c_tile.sort((a, b) => (parseInt(a.split("-")[1]) > parseInt(b.split("-")[1]) && a.split("-")[0] === b.split("-")[0]) ? 1 : -1)

            d_tile.sort((a, b) => (a.split("-")[0] > b.split("-")[0]) ? -1 : 1)
            d_tile.sort((a, b) => (parseInt(a.split("-")[1]) > parseInt(b.split("-")[1]) && a.split("-")[0] === b.split("-")[0]) ? 1 : -1)

            tableTile = _.shuffle(other.map(e => Object.keys(e)[0]))

            fillTable(a_tile)

            var divRectD = document.getElementsByClassName("rectangleD")[0]
            divRectD.style.boxShadow = "0px 0px 5px 4px rgba(51,136,86,0.64)"
            divRectD.style.color = "rgba(51,136,86,0.64)"
            divRectD = document.getElementsByClassName("rectangleD")[1]
            divRectD.style.boxShadow = "0px 0px 5px 4px rgba(51,136,86,0.64)"
            divRectD.style.color = "rgba(51,136,86,0.64)"

            if (document.getElementById("gostergeButton")) {
                document.getElementById("gostergeButton").style.display = "block"
            }

            socket.emit("tilesReady", otherClients, room, [b_tile, c_tile, d_tile], sName, tableMap, okey, tableTile)
        })

        socket.on("pickTableTile", (client, leader) => {
            var tile = tableTile.shift()

            socket.emit("sendTableTile", client, leader, tile)
        })

        socket.on("sendRight", (client, leader, left, right, middle, tile) => {
            var color = tile.split("-")[0]
            var number = tile.split("-")[1]
            var cell;
            var divRectA;
            var divRectB;
            var divRectC;
            var divRectD;
            if (myLeftName === right) {
                divRectA = document.getElementsByClassName("rectangleA")[0]
                divRectA.style.boxShadow = "0px 0px 5px 4px rgba(51,136,86,0.64)"
                divRectA.style.color = "rgba(51,136,86,0.64)"

                divRectB = document.getElementsByClassName("rectangleB")[0]
                divRectB.style.boxShadow = ""
                divRectB.style.color = "black"

                divRectC = document.getElementsByClassName("rectangleC")[0]
                divRectC.style.boxShadow = ""
                divRectC.style.color = "black"

                divRectD = document.getElementsByClassName("rectangleD")[0]
                divRectD.style.boxShadow = ""
                divRectD.style.color = "black"
                divRectD = document.getElementsByClassName("rectangleD")[1]
                divRectD.style.boxShadow = ""
                divRectD.style.color = "black"
            }
            else if (myRightName === right) {
                divRectA = document.getElementsByClassName("rectangleA")[0]
                divRectA.style.boxShadow = ""
                divRectA.style.color = "black"

                divRectB = document.getElementsByClassName("rectangleB")[0]
                divRectB.style.boxShadow = "0px 0px 5px 4px rgba(51,136,86,0.64)"
                divRectB.style.color = "rgba(51,136,86,0.64)"

                divRectC = document.getElementsByClassName("rectangleC")[0]
                divRectC.style.boxShadow = ""
                divRectC.style.color = "black"

                divRectD = document.getElementsByClassName("rectangleD")[0]
                divRectD.style.boxShadow = ""
                divRectD.style.color = "black"
                divRectD = document.getElementsByClassName("rectangleD")[1]
                divRectD.style.boxShadow = ""
                divRectD.style.color = "black"
            }
            else if (myOppositeName === right) {
                divRectA = document.getElementsByClassName("rectangleA")[0]
                divRectA.style.boxShadow = ""
                divRectA.style.color = "black"

                divRectB = document.getElementsByClassName("rectangleB")[0]
                divRectB.style.boxShadow = "0px 0px 5px 4px rgba(51,136,86,0.64)"
                divRectB.style.color = "rgba(51,136,86,0.64)"

                divRectC = document.getElementsByClassName("rectangleC")[0]
                divRectC.style.boxShadow = ""
                divRectC.style.color = "black"

                divRectD = document.getElementsByClassName("rectangleD")[0]
                divRectD.style.boxShadow = ""
                divRectD.style.color = "black"
                divRectD = document.getElementsByClassName("rectangleD")[1]
                divRectD.style.boxShadow = ""
                divRectD.style.color = "black"
            }
            else if (mySocketName === right) {
                divRectA = document.getElementsByClassName("rectangleA")[0]
                divRectA.style.boxShadow = ""
                divRectA.style.color = "black"

                divRectB = document.getElementsByClassName("rectangleB")[0]
                divRectB.style.boxShadow = ""
                divRectB.style.color = "black"

                divRectC = document.getElementsByClassName("rectangleC")[0]
                divRectC.style.boxShadow = ""
                divRectC.style.color = "black"

                divRectD = document.getElementsByClassName("rectangleD")[0]
                divRectD.style.boxShadow = "0px 0px 5px 4px rgba(51,136,86,0.64)"
                divRectD.style.color = "rgba(51,136,86,0.64)"
                divRectD = document.getElementsByClassName("rectangleD")[1]
                divRectD.style.boxShadow = "0px 0px 5px 4px rgba(51,136,86,0.64)"
                divRectD.style.color = "rgba(51,136,86,0.64)"
            }

            if (mySocketName === client) {
                var entry = document.getElementById("right")
                entry.innerHTML = number
                entry.style.color = color
                document.getElementsByClassName("cell1")[0].style.color = color
            }
            else if (mySocketName === left) {
                cell = document.getElementById("tableCell0")
                cell.innerHTML = number
                cell.style.color = color
                document.getElementsByClassName("cell0")[0].style.color = color
            }
            else if (mySocketName === right) {
                myLeftTileStack.push([number, color])

                entry = document.getElementById("left")
                entry.innerHTML = number
                entry.style.color = color
                document.getElementsByClassName("cell2")[0].style.color = color
            }
            else if (mySocketName === middle) {
                cell = document.getElementById("tableCell3")
                cell.innerHTML = number
                cell.style.color = color
                document.getElementsByClassName("cell3")[0].style.color = color
            }
        })

        socket.on("myTurn", () => {
            myTurn = true
            tileAllowed = true
        })

        socket.on("leftChanged", (client, number, color) => {
            var cell;
            if (client === myLeftName) {
                cell = document.getElementById("tableCell3")
                cell.innerHTML = number
                cell.style.color = color
                document.getElementsByClassName("cell3")[0].style.color = color
            }
            else if (client === myRightName) {
                cell = document.getElementById("right")
                cell.innerHTML = number
                cell.style.color = color
                document.getElementsByClassName("cell1")[0].style.color = color
            }
            else if (client === myOppositeName) {
                cell = document.getElementById("tableCell0")
                cell.innerHTML = number
                cell.style.color = color
                document.getElementsByClassName("cell0")[0].style.color = color
            }
        })

        socket.on("decreaseTableTiles", () => {
            tableTile.shift()
            var currTableTiles = document.getElementsByClassName("remainingTiles")[0]
            currTableTiles.innerHTML = parseInt(currTableTiles.innerHTML) - 1
        })

        socket.on("sendTable", (pName, point) => {
            let itsPoint = document.getElementById("pPoint-" + pName)
            document.getElementById("pPoint-" + pName).innerHTML = parseInt(itsPoint.innerHTML) - parseInt(point)

            var [row1number, row1color, row2number, row2color] = getMyTable()
            socket.emit("myTable", row1number, row1color, row2number, row2color, mySocketName, room)
        })

        socket.on("openTables", (row1number, row1color, row2number, row2color, sender) => {
            var div = document.getElementsByClassName("okeyTable")[0]
            var t;
            if (sender === myLeftName) {
                t = constructTable(row1number, row1color, row2number, row2color, "d", "rotate(270deg)", "100px", "-290px")
                div.insertAdjacentHTML('beforeend', t)
            }
            else if (sender === myRightName) {
                t = constructTable(row1number, row1color, row2number, row2color, "b", "rotate(90deg)", "100px", "412px")
                div.insertAdjacentHTML('beforeend', t)
            }
            else if (sender === myOppositeName) {
                t = constructTable(row1number, row1color, row2number, row2color, "a", "rotate(0deg)", "-90px", "50px")
                div.insertAdjacentHTML('beforeend', t)
            }

            setTimeout(() => socket.emit("leftRoom", mySocketName, room), 1000)

            var readyButton = document.getElementById("readyButton")
            readyButton.innerHTML = "Ready ✖"
            readyButton.style.backgroundColor = ""
            readyButton.style.cursor = "pointer"

            totalReadyPlayer = 0
            document.getElementById("readyPlayerDiv").innerHTML = "Ready Players: " + totalReadyPlayer + "/4"
            document.getElementById("readyPlayerDiv1").innerHTML = ""
            document.getElementById("readyPlayerDiv2").innerHTML = ""
            document.getElementById("readyPlayerDiv3").innerHTML = ""
            document.getElementById("readyPlayerDiv4").innerHTML = ""

            // if (document.getElementById("readyButton")) {
            //     document.getElementById("readyButton").remove()
            // }
            document.getElementsByClassName("rectangleA")[0].style.border = "0px"
            document.getElementsByClassName("rectangleB")[0].style.border = "0px"
            document.getElementsByClassName("rectangleC")[0].style.border = "0px"

            document.getElementsByClassName("rectangleA")[0].style.top = "-100px"
            document.getElementsByClassName("rectangleB")[0].style.top = "-100px"
            document.getElementsByClassName("rectangleC")[0].style.top = "-100px"

            document.getElementsByClassName("rectangleA")[0].style.height = "510px"
            document.getElementsByClassName("rectangleB")[0].style.height = "130px"
            document.getElementsByClassName("rectangleC")[0].style.height = "510px"

            document.getElementsByClassName("rectangleB")[0].style.width = "480px"
        })

        socket.on("decreaseGosterge", (pName) => {
            let itsPoint = document.getElementById("pPoint-" + pName)
            document.getElementById("pPoint-" + pName).innerHTML = parseInt(itsPoint.innerHTML) - 2

            if (document.getElementById("gostergeButton")) {
                document.getElementById("gostergeButton").style.display = "none"
            }
        })

        socket.on("messageSend", (from, message) => {
            onMessageSend(message, false)
        })
    }, [])

    return (
        <>
            <li className="uk-animation-fade" >
                <div className="" uk-height-viewport="expand: true;">
                    <h2>Okey</h2>
                    <ul className="uk-list uk-list-divider" uk-height-match=".test;">
                        <li uk-scrollspy="cls:uk-animation-fade">
                            <div className="uk-grid uk-flex uk-flex-middle">
                                <div className="uk-text-lead">
                                    Your Room
                                </div>
                                <div className="uk-width-expand"> </div>
                                <input
                                    className="uk-input uk-form-width-small"
                                    id="roomName"
                                    type="text"
                                    placeholder="name"
                                    style={{ margin: "10px", paddingLeft: "10px" }}>
                                </input>
                                <div className="uk-text-lead">
                                    0/4
                                </div>
                                <div>
                                    <button
                                        className="uk-button uk-button-primary uk-width-small"
                                        onClick={() => {
                                            let roomName = document.getElementById("roomName").value
                                            if (!roomName) {
                                                alert("fill name")
                                                return
                                            }
                                            const randomURL = uuidv4().split("-")[0]
                                            const addURL = "?room=" + randomURL
                                            window.location.href += addURL
                                            socket.emit("joinRoom", user, randomURL, roomName)
                                            createRoomEntry(randomURL, { "me": 0 })
                                            setTimeout(document.getElementsByClassName("roomName")[0].innerHTML = "Room name: " + roomName, 300)
                                        }}>
                                        Create
                                    </button>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="uk-flex uk-flex-bottom" >Total Players: <span className="uk-label uk-label-warning" id="onlinePlayers"> 1</span></div>
            </li>

            <li className="uk-animation-fade">
                <div>
                    <input
                        className="uk-input uk-form-width-small"
                        id="playerName"
                        type="text"
                        placeholder="name"
                        style={{ margin: "10px" }}>
                    </input>
                </div>

                <div className="uk-flex uk-flex-middle uk-flex-center">
                    <div className="okeyTable">
                        <div className="playerInput">
                            <button
                                className="uk-button uk-button-danger"
                                id="readyButton"
                                onClick={() => {
                                    playerName = document.getElementById("playerName").value
                                    if (!playerName) {
                                        alert("fill name")
                                        return
                                    }
                                    var readyButton = document.getElementById("readyButton")
                                    if (readyButton.innerHTML === "Ready ✖") {
                                        document.getElementById("playerName").disabled = true
                                        if (totalReadyPlayer < 4) {
                                            readyButton.style.backgroundColor = "rgb(89, 147, 97)"
                                            readyButton.style.cursor = "default"
                                            readyButton.innerHTML = "Ready ✓"
                                            totalReadyPlayer += 1
                                            document.getElementById("readyPlayerDiv").innerHTML = "Ready Players: " + totalReadyPlayer + "/4"
                                            document.getElementById("readyPlayerDiv" + totalReadyPlayer).innerHTML = playerName
                                            socket.emit("imready", user, room, playerName)

                                            document.getElementsByClassName("rectangleA")[0].style.border = "solid"
                                            document.getElementsByClassName("rectangleB")[0].style.border = "solid"
                                            document.getElementsByClassName("rectangleC")[0].style.border = "solid"

                                            document.getElementsByClassName("rectangleA")[0].style.top = "50px"
                                            document.getElementsByClassName("rectangleB")[0].style.top = "-60px"
                                            document.getElementsByClassName("rectangleC")[0].style.top = "50px"

                                            document.getElementsByClassName("rectangleA")[0].style.height = "250px"
                                            document.getElementsByClassName("rectangleB")[0].style.height = "100px"
                                            document.getElementsByClassName("rectangleC")[0].style.height = "250px"

                                            document.getElementsByClassName("rectangleB")[0].style.width = "500px"

                                            document.getElementsByClassName("rectangleA")[0].style.boxShadow = ""
                                            document.getElementsByClassName("rectangleB")[0].style.boxShadow = ""
                                            document.getElementsByClassName("rectangleC")[0].style.boxShadow = ""
                                            document.getElementsByClassName("rectangleA")[0].style.color = "black"
                                            document.getElementsByClassName("rectangleB")[0].style.color = "black"
                                            document.getElementsByClassName("rectangleC")[0].style.color = "black"
                                            document.getElementsByClassName("rectangleD")[0].style.boxShadow = ""
                                            document.getElementsByClassName("rectangleD")[1].style.boxShadow = ""

                                            document.getElementById("tableCell0").innerHTML = ""
                                            document.getElementById("tableCell0").style.color = "black"
                                            document.getElementById("tableCell3").innerHTML = ""
                                            document.getElementById("tableCell3").style.color = "black"
                                            document.getElementById("right").innerHTML = ""
                                            document.getElementById("right").style.color = "black"
                                            document.getElementById("left").innerHTML = ""
                                            document.getElementById("left").style.color = "black"
                                            document.getElementsByClassName("okeyTile")[0].style.color = "purple"
                                            document.getElementsByClassName("okeyTile")[0].innerHTML = ""
                                            document.getElementsByClassName("cell0")[0].style.color = "black"
                                            document.getElementsByClassName("cell1")[0].style.color = "black"
                                            document.getElementsByClassName("cell2")[0].style.color = "black"
                                            document.getElementsByClassName("cell3")[0].style.color = "black"

                                            myLeftTileStack = []

                                            document.getElementsByClassName("remainingTiles")[0].innerHTML = 48

                                            for (let i = 1; i <= 28; i++) {
                                                document.getElementById(i.toString()).innerHTML = ""
                                                document.getElementById(i.toString()).style.color = "black"
                                                document.getElementById(i.toString()).style.transform = ""
                                            }

                                            if (document.getElementById("constructeda")) {
                                                document.getElementById("constructeda").remove()
                                            }
                                            if (document.getElementById("constructedb")) {
                                                document.getElementById("constructedb").remove()
                                            }
                                            if (document.getElementById("constructedc")) {
                                                document.getElementById("constructedc").remove()
                                            }
                                            if (document.getElementById("constructedd")) {
                                                document.getElementById("constructedd").remove()
                                            }
                                        }
                                    }
                                }}>
                                Ready ✖
                            </button>
                            <div className="pointTable">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Player</th>
                                            <th>Point</th>
                                        </tr>
                                    </thead>
                                    <tbody id="pointTablePlayer">
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="cell0" style={{ color: "black" }}></div>
                        <div className="cell1" style={{ color: "black" }}></div>
                        <div className="cell2" style={{ color: "black" }}></div>
                        <div className="cell3" style={{ color: "black" }}></div>

                        <div className="okeyTile" style={{ color: "purple" }}></div>
                        <div className="remainingTiles">48</div>

                        <div className="rectangleA"></div>
                        <div className="rectangleB"></div>
                        <div className="rectangleC"></div>

                        <table className="uk-table uk-table-small uk-table-middle .uk-width-20 myTable" onDrop={drop} onDragOver={(e) => e.stopPropagation()}>
                            <tbody key={"d"}>

                                <tr className="gamePlay">
                                    <td></td>
                                    <td
                                        id="tableCell3"
                                        colSpan="2"
                                        rowSpan="2"
                                        style={{ textAlign: "center" }}>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td
                                        id="tableCell0"
                                        colSpan="2"
                                        rowSpan="2"
                                        style={{ textAlign: "center" }}>
                                    </td>
                                    <td></td>
                                </tr>

                                <tr className="gamePlay">
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                </tr>

                                <tr className="gamePlay">
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td
                                        id="middle"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                        colSpan="2"
                                        rowSpan="2"
                                        style={{ textAlign: "center" }}>
                                    </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                </tr>

                                <tr className="gamePlay">
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                </tr>

                                <tr className="gamePlay">
                                    <td></td>
                                    <td
                                        id="left"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                        colSpan="2"
                                        rowSpan="2"
                                        style={{ textAlign: "center" }}>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td
                                        id="right"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                        colSpan="2"
                                        rowSpan="2"
                                        style={{ textAlign: "center" }}>
                                    </td>
                                    <td></td>
                                </tr>

                                <tr className="gamePlay">
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>

                                </tr>

                                <tr className="rectangleD">
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="1"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="2"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="3"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="4"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="5"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="6"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="7"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="8"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="9"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="10"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="11"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="12"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="13"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="14"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                </tr>

                                <tr className="rectangleD">
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="15"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="16"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="17"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="18"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="19"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="20"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="21"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="22"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="23"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="24"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="25"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="26"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="27"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                    <td onDoubleClick={(e) => reverseOkeyTile(e)}
                                        id="28"
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("id", e.target.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    />
                                </tr>
                            </tbody>
                        </table>

                        <div className="rectangleChat">
                            <Chat onSend={(m) => { onMessageSend(playerName + ": " + m, true) }} />
                            <span className="roomName">Room name: </span>
                            <div id="readyPlayerDiv"> Ready Players: {totalReadyPlayer}/4 </div>
                            <div id="readyPlayerDiv1" className="readyPlayerList"></div>
                            <div id="readyPlayerDiv2" className="readyPlayerList"></div>
                            <div id="readyPlayerDiv3" className="readyPlayerList"></div>
                            <div id="readyPlayerDiv4" className="readyPlayerList"></div>
                        </div>

                        <button className="uk-button uk-button-primary gostergeBtn"
                            id="gostergeButton"
                            onClick={() => { gosterge() }}>
                            Gösterge
                        </button>

                    </div>
                </div>

                <button className="uk-button uk-button-primary"
                    id="calculateButton"
                    onClick={() => { checkFinish() }}>
                    Calculate
                </button>
                <span id="perCount" style={{ marginLeft: "4px" }}>Total per: </span>
            </li>

        </>
    )
}

export default PlayRoom
