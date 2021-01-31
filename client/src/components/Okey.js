import React from 'react'
import _, { map } from 'underscore';

const Okey = () => {
    /*
    red
    yellow
    blue
    black
    2 fake okey
    */

    const allTiles = [
        { "red-1a": 1 },
        { "red-1b": 1 },
        { "red-2a": 2 },
        { "red-2b": 2 },
        { "red-3a": 3 },
        { "red-3b": 3 },
        { "red-4a": 4 },
        { "red-4b": 4 },
        { "red-5a": 5 },
        { "red-5b": 5 },
        { "red-6a": 6 },
        { "red-6b": 6 },
        { "red-7a": 7 },
        { "red-7b": 7 },
        { "red-8a": 8 },
        { "red-8b": 8 },
        { "red-9a": 9 },
        { "red-9b": 9 },
        { "red-10a": 10 },
        { "red-10b": 10 },
        { "red-11a": 11 },
        { "red-11b": 11 },
        { "red-12a": 12 },
        { "red-12b": 12 },
        { "red-13a": 13 },
        { "red-13b": 13 },
        { "yellow-1a": 1 },
        { "yellow-1b": 1 },
        { "yellow-2a": 2 },
        { "yellow-2b": 2 },
        { "yellow-3a": 3 },
        { "yellow-3b": 3 },
        { "yellow-4a": 4 },
        { "yellow-4b": 4 },
        { "yellow-5a": 5 },
        { "yellow-5b": 5 },
        { "yellow-6a": 6 },
        { "yellow-6b": 6 },
        { "yellow-7a": 7 },
        { "yellow-7b": 7 },
        { "yellow-8a": 8 },
        { "yellow-8b": 8 },
        { "yellow-9a": 9 },
        { "yellow-9b": 9 },
        { "yellow-10a": 10 },
        { "yellow-10b": 10 },
        { "yellow-11a": 11 },
        { "yellow-11b": 11 },
        { "yellow-12a": 12 },
        { "yellow-12b": 12 },
        { "yellow-13a": 13 },
        { "yellow-13b": 13 },
        { "blue-1a": 1 },
        { "blue-1b": 1 },
        { "blue-2a": 2 },
        { "blue-2b": 2 },
        { "blue-3a": 3 },
        { "blue-3b": 3 },
        { "blue-4a": 4 },
        { "blue-4b": 4 },
        { "blue-5a": 5 },
        { "blue-5b": 5 },
        { "blue-6a": 6 },
        { "blue-6b": 6 },
        { "blue-7a": 7 },
        { "blue-7b": 7 },
        { "blue-8a": 8 },
        { "blue-8b": 8 },
        { "blue-9a": 9 },
        { "blue-9b": 9 },
        { "blue-10a": 10 },
        { "blue-10b": 10 },
        { "blue-11a": 11 },
        { "blue-11b": 11 },
        { "blue-12a": 12 },
        { "blue-12b": 12 },
        { "blue-13a": 13 },
        { "blue-13b": 13 },
        { "black-1a": 1 },
        { "black-1b": 1 },
        { "black-2a": 2 },
        { "black-2b": 2 },
        { "black-3a": 3 },
        { "black-3b": 3 },
        { "black-4a": 4 },
        { "black-4b": 4 },
        { "black-5a": 5 },
        { "black-5b": 5 },
        { "black-6a": 6 },
        { "black-6b": 6 },
        { "black-7a": 7 },
        { "black-7b": 7 },
        { "black-8a": 8 },
        { "black-8b": 8 },
        { "black-9a": 9 },
        { "black-9b": 9 },
        { "black-10a": 10 },
        { "black-10b": 10 },
        { "black-11a": 11 },
        { "black-11b": 11 },
        { "black-12a": 12 },
        { "black-12b": 12 },
        { "black-13a": 13 },
        { "black-13b": 13 },
        { "fake-1": -1 },
        { "fake-2": -2 },
    ]

    var a = _.sample(allTiles, 15)
    var b = _.sample(_.without(allTiles, ...a), 14)
    var c = _.sample(_.without(_.without(allTiles, ...a), ...b), 14)
    var d = _.sample(_.without(_.without(_.without(allTiles, ...a), ...b), ...c), 14)
    console.log("a:", a)
    console.log("b:", b)
    console.log("c:", c)
    console.log("d:", ...d)
    console.log(Object.keys({...d}))

    return (
        <div>

        </div>
    )
}

export default Okey
