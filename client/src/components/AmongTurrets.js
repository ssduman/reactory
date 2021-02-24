import React from 'react'
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
        <li className="uk-animation-fade" id="amongTurret">
            <div className="" uk-height-viewport="expand: true;" id="amongTurret">
                <h2 id="amongTurret">Among Turrets</h2>
                <iframe
                    src="https://perought.github.io/pages-demo/"
                    style={{ width: "100%", height: "700px" }}
                />
                {/* <Unity unityContent={props.unityContent} id="amongTurret" /> */}
            </div>
        </li>
    )
}

export default AmongTurrets
