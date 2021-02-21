import React from 'react'

const AmongTurrets = (props) => {
    var enabled = true

    const focusCanvas = (e) => {
        if (enabled) {
            console.log("click 1")
            props.unityContent.send("Player", "DisableKeyboardControl")
        }
        else {
            console.log("click 2")
            props.unityContent.send("Player", "EnableKeyboardControl")
        }
        enabled = !enabled
    }

    return (
        <li className="uk-animation-fade" id="amongTurret">
            <div className="" uk-height-viewport="expand: true;" id="amongTurret" onClick={(e) => focusCanvas(e)} >
                <h2 id="amongTurret">Among Turrets</h2>
                <iframe src="https://perought.github.io/pages-demo/"
                style={{width: "100%", height: "700px"}} />
            </div>
        </li>
        // <Unity unityContent={props.unityContent} id="amongTurret" />
    )
}

export default AmongTurrets
