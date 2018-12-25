import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "antd/dist/antd.css";
import firebase from "firebase/app";

const config = {
  apiKey: "AIzaSyB3j4KnNW2kcbQdPF33KZKScw-wrxl3qLk",
  authDomain: "jyouth-ticketing.firebaseapp.com",
  databaseURL: "https://jyouth-ticketing.firebaseio.com",
  projectId: "jyouth-ticketing"
};

firebase.initializeApp(config);

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
