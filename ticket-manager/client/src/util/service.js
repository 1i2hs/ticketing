import axios from "axios";

axios.defaults.baseURL =
  process.env.NODE_ENV !== "production" ? "http://localhost:5000" : "";
// axios.defaults.headers.common["Authorization"] = AUTH_TOKEN;

const createTicket = (username, userContact) =>
  axios.post(`/tickets`, {
    username,
    userContact
  });

const fetchTickets = () => axios.get("/tickets");

const updateTicket = (ticketId, username, userContact, ticketUsed) =>
  axios.put(`/tickets/${ticketId}`, {
    username,
    userContact,
    ticketUsed
  });

const deleteTicket = ticketIds => {
  let ticketIdList = [];
  // single deletion
  if (typeof ticketIdList === "string") {
    ticketIdList.push(ticketIds);
  } else {
    ticketIdList = ticketIdList.concat(ticketIds);
  }
  console.log(ticketIdList);
  //   return axios.delete(`/tickets`, {
  //     ticketIdList
  //   });
  return axios({
    method: "delete",
    url: "/tickets",
    data: {
      ticketIdList
    }
  });
};

export { createTicket, fetchTickets, updateTicket, deleteTicket };
