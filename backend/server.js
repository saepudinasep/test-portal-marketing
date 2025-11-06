import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("message", (msg) => {
    console.log("Received:", msg);
    io.emit("broadcast", msg); // kirim ke semua client
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("WebSocket server is running!");
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`✅ WebSocket running on port ${PORT}`));
