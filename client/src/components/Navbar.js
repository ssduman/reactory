import React from 'react'
import queryString from 'query-string'

const Navbar = (props) => {

    return (
        <nav className="uk-background-transparent uk-padding-small">
                <div className="uk-container uk-flex uk-flex-center uk-flex-middle">
                    <ul className="uk-subnav uk-subnav-divider" uk-switcher="connect: #pages" active={queryString.parse(window.location.search).room ? "4" : "3"} uk-margin="true">
                        <li><a href="/#">Home</a></li>
                        <li><a href="/#">About</a></li>
                        <li><a href="/#">Blog</a></li>
                        <li><a href="/#">Rooms</a></li>
                        <li><a href="/#">Okey</a></li>
                        <li><a href="/#">Drawing Board</a></li>
                    </ul>
                </div>
            </nav>
    )
}

export default Navbar
