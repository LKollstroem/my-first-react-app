//add all imports and bootstrap links
//import $ from 'jquery';
//import Popper from 'popper.js';
import React from "react";
import ReactDOM from 'react-dom/client'
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

//ReactDOM.render(
//    <React.StrictMode>
//        <App />
//    </React.StrictMode>,
//    document.getElementById("root")
//);

//const container = document.getElementById('app');
//const root = createRoot(container); // createRoot(container!) if you use TypeScript
//root.render(<App tab="home" />);

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
