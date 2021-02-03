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
            <div className="rectangle chat-box" id="chatbox">
                <div>test</div>
            </div>
        </form>
    )
}

export default Chat
