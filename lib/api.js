import axios from 'axios';
export const api = axios.create({
  baseURL: 'http://192.168.100.9:5288/api', // usa http, no https
  headers: {
    Accept: '*/*',
    'Content-Type': 'application/json',
  },
});
