import React from 'react'
import { useState } from "react"

const Chat = ({ onSend }) => {
    const [message, setMessage] = useState("")

    const onSubmit = (e) => {
        e.preventDefault()

        if (!message) {
            alert("fill text")
            return
        }

        onSend(message)

        setMessage("")
    }

    return (
        <form onSubmit={onSubmit}>
            <div
                className="chat-box"
                id="chatbox">
            </div>
            <div>
                <textarea
                    name="text-area"
                    id="text-area"
                    placeholder="Type your message"
                    rows="5"
                    cols="50"
                    value={message} onChange={(e) => setMessage(e.target.value)}
                >
                </textarea>
            </div>
            <input type="submit" value="Send" ></input>
        </form>
    )
}

export default Chat
