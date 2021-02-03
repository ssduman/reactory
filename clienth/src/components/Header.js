import React from 'react'
import Button from "./Button"

const Header = (props) => {
    const onClickCreate = () => (
        console.log("create button clicked")
    )
    const onClickJoin = () => (
        console.log("join button clicked")
    )

    return (
        <div>
            <h1 style={{color: 'red'}}>Hello, {props.title}</h1>
            <Button color="red" text="Create Room" onClick={onClickCreate}/>
            <Button color="magenta" text="Join Room" onClick={onClickJoin}/>
        </div>
    )
}

Header.defaultProps = {
    title: "default"
}

export default Header
