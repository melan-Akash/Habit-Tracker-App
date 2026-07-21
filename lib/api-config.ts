import { Platform } from 'react-native';

// Local PC IP Address for Expo Go physical mobile testing
export const LOCAL_IP = '192.168.8.101';
export const PORT = 5000;

// Dynamic API Base URL
export const API_BASE_URL =
  Platform.OS === 'web'
    ? `http://localhost:${PORT}/api`
    : `http://${LOCAL_IP}:${PORT}/api`;

console.log('📡 API Base URL configured:', API_BASE_URL);
