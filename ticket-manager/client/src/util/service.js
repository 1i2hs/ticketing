import axios from "axios";

class Service {
  constructor(axios) {
    this.axios = axios;
    this.axios.defaults.baseURL =
      process.env.NODE_ENV !== "production"
        ? "http://localhost:5000"
        : process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL;
    this.axios.defaults.headers.common["Authorization"] = "";
  }

  setBaseURL = baseURL => {
    this.axios.defaults.baseURL = baseURL;
  };

  setAuthBearerToken = token => {
    this.axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  getAuthBearerToken = () =>
    this.axios.defaults.headers.common["Authorization"];

  createTicket = (username, userContact) =>
    this.axios.post(`/tickets`, {
      username,
      userContact
    });

  fetchTicket = ticketId => this.axios.get(`/tickets/${ticketId}`);

  fetchTickets = () => this.axios.get("/tickets");

  updateTicket = (ticketId, username, userContact, ticketUsed) =>
    this.axios.put(`/tickets/${ticketId}`, {
      username,
      userContact,
      ticketUsed
    });

  deleteTicket = ticketIds => {
    let ticketIdList = [];
    // single deletion
    if (typeof ticketIdList === "string") {
      ticketIdList.push(ticketIds);
    } else {
      ticketIdList = ticketIdList.concat(ticketIds);
    }

    return this.axios({
      method: "delete",
      url: "/tickets",
      data: {
        ticketIdList
      }
    });
  };
}

// using singleton pattern
export default new Service(axios);
