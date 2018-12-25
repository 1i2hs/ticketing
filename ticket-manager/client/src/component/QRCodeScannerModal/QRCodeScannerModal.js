import React, { Component } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Input, Icon } from "antd";
import QrReader from "react-qr-reader";
import service from "../../util/service";
import "./QRCodeScannerModal.css";

class QRCodeScannerModal extends Component {
  state = {
    delay: 1000,
    loading: false,
    notificationMessage: "",
    currentTicket: {
      name: "",
      contact: ""
    }
  };

  handleScan = data => {
    if (data) {
      const ticketId = data.split("jtm://tickets/")[1];
      this.fetchTicket(ticketId);
    }
  };

  handleError = error => {
    console.error(error);
  };

  verifyTicket = response => {
    const ticket = response.data.ticket;
    if (Object.keys(ticket).length === 0) {
      this.setNotificationMessage("유효하지 않은 티켓입니다.", "ERROR");
      return Promise.reject(new Error("Invalid ticket."));
    }
    if (ticket && !ticket.used) {
      return Promise.resolve(ticket);
    } else {
      this.setNotificationMessage("이미 체크인한 티켓입니다.", "ERROR");
      return Promise.reject(new Error("Used ticket."));
    }
  };

  setTicket = ticket => {
    this.setState({ currentTicket: ticket });
    return ticket;
  };

  setNotificationMessage = (message, status) => {
    switch (status) {
      case "OK":
        return this.setState(
          {
            notificationMessage: (
              <div>
                <Icon
                  type="check-circle"
                  theme="filled"
                  style={{ color: "#52c41a", marginRight: 4 }}
                />
                {message}
              </div>
            )
          },
          () => {
            setTimeout(() => this.setNotificationMessage(), 5000);
          }
        );
      case "ERROR":
        return this.setState(
          {
            notificationMessage: (
              <div>
                <Icon
                  type="close-circle"
                  theme="filled"
                  style={{ color: "#f81d22", marginRight: 4 }}
                />
                {message}
              </div>
            )
          },
          () => {
            setTimeout(() => this.setNotificationMessage(), 5000);
          }
        );
      case "INFO":
        return this.setState(
          {
            notificationMessage: (
              <div>
                <Icon
                  type="info-circle"
                  theme="filled"
                  style={{ color: "#1890ff", marginRight: 4 }}
                />
                {message}
              </div>
            )
          },
          () => {
            setTimeout(() => this.setNotificationMessage(), 5000);
          }
        );

      default:
        return this.setState({
          notificationMessage: ""
        });
    }
  };

  checkinTicket = (ticketId, username, contact) => {
    this.toggleLoading();
    service
      .updateTicket(ticketId, username, contact, true)
      .then(() => {
        this.resetTicketInfoField();
        this.setNotificationMessage("체크인이 완료되었습니다.", "OK");
      })
      .then(this.toggleLoading)
      .catch(error => {
        if (this.state.loading) this.toggleLoading();
        console.error(error.message);
        console.error(error.stack);
      });
  };

  fetchTicket = ticketId => {
    this.toggleLoading();
    service
      .fetchTicket(ticketId)
      .then(this.verifyTicket)
      .then(this.setTicket)
      .then(this.toggleLoading)
      .catch(error => {
        if (this.state.loading) this.toggleLoading();
        console.error(error.message);
        console.error(error.stack);
      });
  };

  toggleLoading = () => {
    this.setState((state, props) => ({ loading: !state.loading }));
  };

  resetTicketInfoField = () => {
    this.setState({
      currentTicket: {
        name: "",
        contact: ""
      }
    });
  };

  handleModalClose = () => {
    this.resetTicketInfoField();
    this.props.onClose();
  };

  handleCheckIn = () => {
    if (this.state.currentTicket) {
      const { id, name, contact } = this.state.currentTicket;
      this.checkinTicket(id, name, contact);
    }
  };

  render() {
    const { visible } = this.props;
    const { delay, loading, currentTicket, notificationMessage } = this.state;
    const isTicketRead = currentTicket.name ? true : false;
    return (
      <Modal
        title="티켓 확인"
        visible={visible}
        onCancel={this.handleModalClose}
        footer={null}
      >
        {visible && (
          <QrReader
            delay={delay}
            onError={this.handleError}
            onScan={this.handleScan}
            style={{ width: "100%", marginBottom: 16 }}
          />
        )}
        <div style={{ marginBottom: 8 }}>
          <Input
            placeholder="티켓 소유자명"
            value={currentTicket.name}
            readOnly
            style={{ marginBottom: 8 }}
          />
          <Input
            placeholder="연락처"
            value={currentTicket.contact}
            readOnly
            style={{ marginBottom: 8 }}
          />
        </div>
        {notificationMessage && (
          <div
            className="QRCodeScannerModal-message"
            style={{ textAlign: "center", marginBottom: 8 }}
          >
            {notificationMessage}
          </div>
        )}
        <div style={{ textAlign: "center" }}>
          <Button
            type="primary"
            loading={loading}
            disabled={!isTicketRead}
            onClick={this.handleCheckIn}
          >
            체크인
          </Button>
        </div>
      </Modal>
    );
  }
}

QRCodeScannerModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func
};

QRCodeScannerModal.defaultProps = {
  visible: false,
  onClose: () => {}
};

export default QRCodeScannerModal;
