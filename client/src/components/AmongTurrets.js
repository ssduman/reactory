import React from 'react'
import { useEffect } from "react"
// import Unity, { UnityContent } from "react-unity-webgl"

const AmongTurrets = (props) => {
    // var enabled = true
    // const unityContent = new UnityContent(
    //     "Build/Builds.json",
    //     "Build/UnityLoader.js"
    // )
    // const focusCanvas = (e) => {
    //     if (enabled) {
    //         props.unityContent.send("Menu", "DisableKeyboardControl")
    //         props.unityContent.send("Player", "DisableKeyboardControl")
    //     }
    //     else {
    //         props.unityContent.send("Menu", "EnableKeyboardControl")
    //         props.unityContent.send("Player", "EnableKeyboardControl")
    //     }
    //     enabled = !enabled
    // }
    // const click = (e) => {
    //     if (e.target.id !== "amongTurret" && e.target.id !== "#canvas") {
    //         unityContent.send("Menu", "DisableKeyboardControl")
    //         unityContent.send("Player", "DisableKeyboardControl")
    //     }
    // }

    return (
        <li className="uk-animation-fade">
            <div className="" uk-height-viewport="expand: true;">
                <h2>Among Turrets</h2>
                <iframe
                    src="https://ssduman.github.io/among-turrets/"
                    style={{ width: "100%", height: "600px" }}
                />
                {/* <Unity unityContent={props.unityContent} id="amongTurret" /> */}
            </div>
        </li>
    )
}

export default AmongTurrets
