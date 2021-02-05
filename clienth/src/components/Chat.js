import React from 'react'
import { useState } from "react"
import "../../node_modules/uikit/dist/js/uikit.min.js"
import "../../node_modules/uikit/dist/js/uikit-icons.min.js"
import "../../node_modules/uikit/dist/css/uikit.min.css"
import '../App.css'

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
                    className="a"
                    name="text-area"
                    id="text-area"
                    placeholder="Type your message"
                    rows="5"
                    cols="50"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && e.shiftKey === false) {
                            e.preventDefault()
                            onSubmit(e)
                        }
                    }}
                >
                </textarea>
            </div>
            <input type="submit" value="Send" ></input>
        </form>
    )
}

export default Chat
