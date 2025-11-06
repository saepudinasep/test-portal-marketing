import { io } from "socket.io-client";

// Ganti URL di bawah dengan alamat backend kamu (yang pakai vercel atau localhost)
const SOCKET_URL = "https://backend-pelaporan-issue.vercel.app";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});
