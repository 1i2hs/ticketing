import React, { Component } from "react";
import { Button } from "antd";
import TicketList from "./component/TicketList";
import logo from "./logo.svg";
import "./App.css";

const AppHeader = ({ onClickQRCodeButton }) => {
  return (
    <div className="App-header">
      <h1>Ticket Managment</h1>
      <Button icon="qrcode" onClick={onClickQRCodeButton} size="large">
        티켓 체크인
      </Button>
    </div>
  );
};

class App extends Component {
  handleQRCodeButtonClick = () => {
    console.log("clicked");
  };

  render() {
    return (
      <div className="App">
        <AppHeader onClickQRCodeButton={this.handleQRCodeButtonClick} />
        <TicketList />
      </div>
    );
  }
}

export default App;
