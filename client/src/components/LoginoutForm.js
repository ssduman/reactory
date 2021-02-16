import React from 'react'
import { useState } from 'react'

const LoginoutForm = (props) => {

    const [details, setDetails] = useState({ name: "", email: "", password: "", isLogin: true })

    const submitHandler = (e) => {
        e.preventDefault()

        props.onLogin(details)
    }

    return (
        <>
            {props.user.email !== ""
                ?
                <>
                    <h2> Welcome {props.user.name}</h2>
                    <form onSubmit={props.onLogout}>
                        <input
                            type="submit"
                            value="Logout"
                            onClick={(e) => setDetails({ name: "", email: "", password: "", isLogin: true })}
                        />
                    </form>
                </>
                :
                <form onSubmit={submitHandler} >
                    <h2
                        style={props.onError.wrongAcc || props.onError.takenAcc ? { color: "red" } : { color: "black" }} >
                        
                        {props.onError.wrongAcc ? <> Account is wrong </> : <></>}
                        {props.onError.takenAcc ? <> Account is taken </> : <></>}
                    </h2>

                    <div>
                        <label htmlFor="name">Name: </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={(e) => setDetails({ ...details, name: e.target.value })}
                            value={details.name}
                        />
                    </div>

                    <div>
                        <label htmlFor="email">Email: </label>
                        <input
                            type="text"
                            name="email"
                            id="email"
                            onChange={(e) => setDetails({ ...details, email: e.target.value })}
                            value={details.email}
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password: </label>
                        <input
                            type="text"
                            name="password"
                            id="password"
                            onChange={(e) => setDetails({ ...details, password: e.target.value })}
                            value={details.password}
                        />
                    </div>

                    <input
                        type="submit"
                        name="loginbutton"
                        value="Login"
                        onClick={(e) => setDetails({ ...details, isLogin: true })}
                    />
                    <input
                        type="submit"
                        name="registerbutton"
                        value="Register"
                        onClick={(e) => setDetails({ ...details, isLogin: false })}
                    />

                </form>
            }
        </>
    )
}

export default LoginoutForm
