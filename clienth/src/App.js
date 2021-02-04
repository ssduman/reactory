import { BrowserRouter as Router, Route } from "react-router-dom"
// import Header from "./components/Header"
// import Footer from "./components/Footer"
import PlayRoom from "./components/PlayRoom"
import "../node_modules/uikit/dist/js/uikit.min.js"
import "../node_modules/uikit/dist/js/uikit-icons.min.js"
import "../node_modules/uikit/dist/css/uikit.min.css"
import "./App.css";

function App() {

    return (
        <Router>
            {/* <Header title="there" /> */}

            <Route path="/" exact render={(probs) =>
            (
                <div className="uk-background-muted">
                    <PlayRoom />
                    {/* <Footer /> */}
                </div>
            )} />

            <Route path="/play" exact render={(probs) =>
            (
                <>
                    <PlayRoom />
                </>
            )} />
        </Router>
    );
}

export default App;
