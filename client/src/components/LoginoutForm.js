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
            <form onSubmit={submitHandler} >
                <h2
                    style={props.onError.wrongAcc || props.onError.takenAcc ? { color: "red" } : { color: "black" }} >
                    Login
                        {props.onError.wrongAcc ? <> Account is wrong </> : <></>}
                    {props.onError.takenAcc ? <> Account is taken </> : <></>}
                </h2>

                <div className="uk-margin-small">
                    <label className="uk-form-label" htmlFor="name">Name</label>
                    <div className="uk-form-controls">
                        <div className="uk-inline">
                            <span className="uk-form-icon" uk-icon="icon: user"></span>
                            <input
                                className="uk-input"
                                type="text"
                                name="name"
                                id="name"
                                onChange={(e) => setDetails({ ...details, name: e.target.value })}
                                value={details.name}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="uk-margin-small">
                    <label className="uk-form-label" htmlFor="email">Email</label>
                    <div className="uk-form-controls">
                        <div className="uk-inline">
                            <span className="uk-form-icon" uk-icon="icon: mail"></span>
                            <input
                                className="uk-input"
                                type="text"
                                name="email"
                                id="email"
                                onChange={(e) => setDetails({ ...details, email: e.target.value })}
                                value={details.email}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="uk-margin-small">
                    <label className="uk-form-label" htmlFor="password">Password</label>
                    <div className="uk-form-controls">
                        <div className="uk-inline">
                            <span className="uk-form-icon" uk-icon="icon: lock"></span>
                            <input
                                className="uk-input"
                                type="password"
                                name="password"
                                id="password"
                                onChange={(e) => setDetails({ ...details, password: e.target.value })}
                                value={details.password}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="uk-margin uk-grid uk-grid-small">
                    <div className="uk-width-1-2@m">
                        <button
                            className="uk-button uk-button-default uk-button-small uk-width-1-1"
                            type="submit"
                            name="loginbutton"
                            value="Login"
                            onClick={(e) => setDetails({ ...details, isLogin: true })}>
                            Login
                            </button>
                    </div>
                    <div className="uk-width-1-2@m">
                        <button
                            className="uk-button uk-button-default uk-button-small uk-width-1-1"
                            type="submit"
                            name="registerbutton"
                            value="Register"
                            onClick={(e) => setDetails({ ...details, isLogin: false })}>
                            Register
                            </button>
                    </div>
                </div>
            </form>
        </>
    )
}

export default LoginoutForm

/**

<div className="uk-card uk-card-body uk-card-small uk-card-default samd-border">

    <div className="uk-margin-small">
        <label className="uk-form-label">Name</label>
        <div className="uk-form-controls">
            <div className="uk-inline">
                <span className="uk-form-icon" uk-icon="icon: user"></span>
                <input className="uk-input" type="text" />
            </div>
        </div>
    </div>

    <div className="uk-margin-small">
        <label className="uk-form-label">Email</label>
        <div className="uk-form-controls">
            <div className="uk-inline">
                <span className="uk-form-icon" uk-icon="icon: mail"></span>
                <input className="uk-input" type="text" />
            </div>
        </div>
    </div>

    <div className="uk-margin-small">
        <label className="uk-form-label">Password</label>
        <div className="uk-form-controls">
            <div className="uk-inline">
                <span className="uk-form-icon" uk-icon="icon: lock"></span>
                <input className="uk-input" type="password" />
            </div>
        </div>
    </div>

    <div className="uk-margin uk-grid uk-grid-small">
        <div className="uk-width-1-2@m">
            <button className="uk-button uk-button-default uk-button-small uk-width-1-1">login</button>
        </div>
        <div className="uk-width-1-2@m">
            <button className="uk-button uk-button-default uk-button-small uk-width-1-1">register</button>
        </div>
    </div>
</div>

 */