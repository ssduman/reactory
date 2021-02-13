import React from 'react'
import LoginoutForm from "./LoginoutForm"
import { useState, useEffect } from "react"
import cookie from 'js-cookie'

const Header = (props) => {
    const [error, setError] = useState({ wrongAcc: false, takenAcc: false })
    const [user, setUser] = useState({ name: "", email: "" })

    const loginFunc = async (details) => {
        try {
            if (details.isLogin) {
                const res = await fetch("http://localhost:4000/api/login/",
                    {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify(details)
                    }
                )

                const data = await res.json()

                if (res.status === 200) {
                    cookie.set("token", data)
                    setUser({ name: details.name, email: details.email })
                    setError({ wrongAcc: false, takenAcc: false })
                }
                else {
                    setError({ wrongAcc: true, takenAcc: false })
                }
            }

            else {
                const date = new Date().toISOString().slice(0, 19).replace('T', ' ')
                const newUser = { "name": details.name, "email": details.email, "password": details.password, regdate: date }
                registerUser(newUser)
            }
        }
        catch {
            console.log("catch")
        }
    }

    const logoutFunc = () => {
        cookie.remove("token")
        setUser({ name: "", email: "" })

        setError({ wrongAcc: false, takenAcc: false })
    }

    const registerUser = async (user) => {
        try {
            const res = await fetch("http://localhost:4000/api/signin/",
                {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(user)
                }
            )

            const data = await res.json()

            if (res.status === 201) {
                cookie.set("token", data)
                user["isLogin"] = true
                loginFunc(user)
            }
            else {
                setError({ wrongAcc: false, takenAcc: true })
            }
        }
        catch {
            console.log("catch")
        }
    }

    return (
        <header className="uk-section-xsmall uk-section-default samd-border samd-rounded-bottom">
            <div className="uk-container">
                <h1 className="uk-text-center">samd</h1>
                <LoginoutForm onLogin={loginFunc} onLogout={logoutFunc} onError={error} user={user} />
            </div>
        </header>
    )
}

Header.defaultProps = {
    title: "default"
}

export default Header
