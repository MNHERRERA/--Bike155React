// lib/api.ts

import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://localhost:7170/api', // cámbialo a tu IP local si usas Android
  headers: {
    Accept: '*/*',
    'Content-Type': 'application/json',
  },
});
