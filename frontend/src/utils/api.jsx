import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = {
  // Channels
  getChannels: () => axios.get(`${API_BASE_URL}/channels`),
  createChannel: (name) => axios.post(`${API_BASE_URL}/channels/create`, { name }),
  deleteChannel: (name) => axios.delete(`${API_BASE_URL}/channels/delete/${name}`),
  listChannels: (filter = '') => axios.get(`${API_BASE_URL}/channels/list/${filter}`),
  joinChannel: (name, username) => axios.post(`${API_BASE_URL}/channels/join`, { name, username }),
  quitChannel: (name, username) => axios.post(`${API_BASE_URL}/channels/quit`, { name, username }),

  // Messages
  sendMessage: (message) => axios.post(`${API_BASE_URL}/messages`, message),
  listMessages: (channelName) => axios.get(`${API_BASE_URL}/messages/${channelName}`),

  // Users in Channel
  listUsersInChannel: (channelName) => axios.get(`${API_BASE_URL}/channels/users/${channelName}`),
};

export default api;
