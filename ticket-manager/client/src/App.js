import React, { Component } from "react";
import { Button } from "antd";
import firebase from "firebase/app";
import TicketList from "./component/TicketList";
import QRCodeScannerModal from "./component/QRCodeScannerModal";
import SignIn from "./component/SignIn";
import logo from "./logo.png";
import "./App.css";
import service from "./util/service";

const AppHeader = ({ onClickSignOutButton, onClickQRCodeButton }) => {
  return (
    <div className="App-header">
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center"
        }}
      >
        <img src={logo} width={40} height={40} />
        <h1 style={{ marginBottom: 0 }}>Ticket Managment</h1>
        <Button
          onClick={onClickSignOutButton}
          type="danger"
          style={{ marginLeft: 8 }}
          size="small"
        >
          로그아웃
        </Button>
      </div>

      <Button icon="qrcode" onClick={onClickQRCodeButton} size="large">
        티켓 체크인
      </Button>
    </div>
  );
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSignedIn: false
    };
  }
  state = {
    isQRCodeScannerModalVisible: false
  };

  handleSignOutButtonClick = () => {
    // sign out
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("Signed out successfully");
      })
      .catch(error => {
        console.error(error);
      });
  };

  handleQRCodeButtonClick = () => {
    this.showQRCodeScannerModal();
  };

  handleQRCodeScannerModalClose = () => {
    this.setState({
      isQRCodeScannerModalVisible: false
    });
  };

  showQRCodeScannerModal = () => {
    this.setState({
      isQRCodeScannerModalVisible: true
    });
  };

  // TODO make another class to manipulate localSotrage
  getStoredIdToken = () => {
    return localStorage.getItem("it");
  };

  storeIdTokenInLocalStorage = idToken => {
    localStorage.setItem("it", idToken);
    return Promise.resolve(idToken);
  };

  checkIdTokenChange = idToken => {
    console.log(idToken, service.getAuthBearerToken().split(" ")[1]);
    if (idToken !== service.getAuthBearerToken().split(" ")[1]) {
      return Promise.resolve(idToken);
    }
    return Promise.reject("Token not change");
  };

  initializeFirebaseIdToken = () => {
    let idToken = this.getStoredIdToken();
    if (idToken) {
      service.setAuthBearerToken(idToken);
    } else if (firebase.auth().currentUser) {
      firebase
        .auth()
        .currentUser.getIdToken()
        .then(idToken => {
          // Send token to your backend via HTTPS
          this.storeIdTokenInLocalStorage(idToken);
          service.setAuthBearerToken(idToken);
        })
        .catch(error => {
          console.error(error.message);
          console.error(error.stack);
        });
    }
  };

  componentDidMount() {
    this.initializeFirebaseIdToken();
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        user
          .getIdToken()
          .then(this.checkIdTokenChange)
          .then(this.storeIdTokenInLocalStorage)
          .then(idToken => service.setAuthBearerToken(idToken))
          .catch(error => {
            console.error(error.message);
            console.error(error.stack);
          })
          .then(() => {
            // User is signed in
            this.setState({
              isSignedIn: true
            });
          });
      } else {
        // No user is signed in.
        this.setState({
          isSignedIn: false
        });
      }
    });
  }

  render() {
    const { isQRCodeScannerModalVisible, isSignedIn } = this.state;
    return (
      <div className="App">
        {isSignedIn ? (
          <>
            <AppHeader
              onClickQRCodeButton={this.handleQRCodeButtonClick}
              onClickSignOutButton={this.handleSignOutButtonClick}
            />
            <TicketList />
            <QRCodeScannerModal
              visible={isQRCodeScannerModalVisible}
              onClose={this.handleQRCodeScannerModalClose}
            />
          </>
        ) : (
          <SignIn />
        )}
      </div>
    );
  }
}

export default App;
