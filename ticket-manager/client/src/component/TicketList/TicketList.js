import React, { Component } from "react";
import { Table, Button, Icon, Divider } from "antd";
import moment from "moment";
import AddTicketForm from "../AddTicketForm";
import ModifyTicketModal from "../ModifyTicketModal";
import service from "../../util/service";
import "./TicketList.css";

class TicketList extends Component {
  columns = [
    {
      title: "이름",
      dataIndex: "name",
      align: "center"
    },
    {
      title: "연락처",
      dataIndex: "contact",
      align: "center"
    },
    {
      title: "티켓 생성 날짜",
      dataIndex: "dateCreated",
      align: "center"
    },
    {
      title: "티켓 QR코드",
      dataIndex: "svg",
      render: (svgString, row, index) => {
        if (svgString) {
          return (
            <div
              dangerouslySetInnerHTML={{ __html: svgString }}
              style={{ width: "80px" }}
            />
          );
        }
        return "No QR code";
      }
    },
    {
      title: "티켓 사용여부\n(사용날짜)",
      dataIndex: "used",
      render: (used, record, index) => {
        return used ? (
          <div style={{ textAlign: "center" }}>
            <Icon
              type="check-circle"
              theme="filled"
              twoToneColor="#52c41a"
              style={{ color: "#52c41a", fontSize: "20px" }}
            />
            <div>({moment(record.timeUsed).format("YY/MM/DD HH:mm")})</div>
          </div>
        ) : (
          <Icon
            type="close-circle"
            theme="filled"
            style={{ color: "#f81d22", fontSize: "20px" }}
          />
        );
      },
      align: "center"
    },
    {
      title: "액션",
      key: "action",
      render: (text, record) => {
        return (
          <span>
            <span
              style={{ cursor: "pointer", color: "#40a9ff" }}
              onClick={() => {
                this.setState({
                  currentTicket: record
                });
                this.showModal();
              }}
            >
              수정
            </span>
            {/* <Divider type="vertical" />
            <span style={{ cursor: "pointer", color: "#40a9ff" }}>
              QR코드 받기
            </span> */}
          </span>
        );
      },
      align: "center"
    }
  ];

  state = {
    tickets: [],
    selectedRowKeys: [], // Check here to configure the default column
    loading: false,
    ticketFetchedTime: Date.now(),
    isModalVisible: false,
    currentTicket: {}
  };

  setTickets = response => {
    this.setState({
      tickets: response.data.tickets
        .sort((ticketA, ticketB) => ticketB.dateCreated - ticketA.dateCreated)
        .map(ticket => ({
          key: ticket.id,
          ...ticket,
          dateCreated: moment(ticket.dateCreated).format("YY/MM/DD HH:mm")
        }))
    });
    return response;
  };

  setTicketFetchedTime = () => {
    const ticketFetchedTime = Date.now();
    this.setState({
      ticketFetchedTime
    });
    return ticketFetchedTime;
  };

  toggleLoading = () => {
    this.setState((state, props) => ({ loading: !state.loading }));
  };

  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  deleteTickets = () => {
    this.toggleLoading();
    service.deleteTicket(this.state.selectedRowKeys)
      .then(() => {
        this.toggleLoading();
        this.fetchTickets();
        this.setState({ selectedRowKeys: [] });
      })
      .catch(error => {
        if (this.state.loading) this.toggleLoading();
        console.error(error.message);
        console.error(error.stack);
      });
  };

  fetchTickets = () => {
    this.toggleLoading();
    service.fetchTickets()
      .then(this.setTickets)
      .then(this.setTicketFetchedTime)
      .then(this.toggleLoading)
      .catch(error => {
        if (this.state.loading) this.toggleLoading();
        console.error(error.message);
        console.error(error.stack);
      });
  };

  showModal = () => {
    this.setState({
      isModalVisible: true
    });
  };

  handleModalOk = e => {
    this.setState({
      isModalVisible: false
    });
    this.fetchTickets();
  };

  handleModalCancel = e => {
    this.setState({
      isModalVisible: false
    });
  };

  handleAddedTicket = ticket => {
    this.fetchTickets();
  };

  componentDidMount() {
    this.fetchTickets();
  }

  render() {
    const {
      tickets,
      loading,
      selectedRowKeys,
      ticketFetchedTime,
      isModalVisible,
      currentTicket
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div>
        <h2>티켓 리스트</h2>
        <AddTicketForm onTicketAdded={this.handleAddedTicket} />
        <div className="TicketList-control">
          <div>
            <span style={{ fontSize: 16 }}>
              업데이트 시간: {moment(ticketFetchedTime).format("HH:mm:ss")}
            </span>
            <Button
              type="primary"
              onClick={this.fetchTickets}
              icon="sync"
              loading={loading}
              style={{ marginLeft: 8 }}
            />
          </div>
          <div>
            <span style={{ marginRight: 8 }}>
              {hasSelected ? `${selectedRowKeys.length}개의 티켓이 선택됨` : ""}
            </span>
            <Button
              type="danger"
              onClick={this.deleteTickets}
              disabled={!hasSelected}
            >
              티켓 삭제
            </Button>
          </div>
        </div>
        <Table
          rowSelection={rowSelection}
          columns={this.columns}
          dataSource={tickets}
          loading={loading}
          pagination={{ pageSize: 50 }}
        />
        <ModifyTicketModal
          visible={isModalVisible}
          afterModify={this.handleModalOk}
          onClose={this.handleModalCancel}
          ticket={currentTicket}
        />
      </div>
    );
  }
}

export default TicketList;
