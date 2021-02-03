import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom"
import Header from "./components/Header"
import Footer from "./components/Footer"
import PlayRoom from "./components/PlayRoom"

function App() {

    return (
        <Router>
            <Header title="there" />

            <Route path="/" exact render={(probs) =>
            (
                <>
                    <PlayRoom />
                    <Footer />
                </>
            )} />

            <Route path="/play" exact render={(probs) =>
            (
                <>
                </>
            )} />
        </Router>
    );
}

export default App;
