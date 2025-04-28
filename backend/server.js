import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoute from "./routes/userRoute.js";
import cors from "cors";
import templateRoutes from "./routes/templateRoutes.js";
import responseRouter from "./routes/responseRoutes.js";
import { Server } from "socket.io";
import { createServer } from "http";
import authRouter from "./routes/authRoutes.js";
import Template from "./models/templateModel.js";
dotenv.config();
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://forms-app-frontend-o1c1.onrender.com",
    ], // keep localhost for dev!
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://forms-app-frontend-o1c1.onrender.com",
    ],
    methods: ["GET", "POST"],
  }, //correct port (the frontend port) here
});

export { io };

const templateRooms = new Set(); // Set to store template rooms
// Socket.io connection
io.on("connection", (socket) => {
  console.log(`New WebSocket (Socket: ${socket.id}) connected`);

  // Join template-specific room
  socket.on("join-room", (templateId) => {
    socket.join(templateId);
    templateRooms.add(templateId); // Add the room to the set
    console.log(`Socket (${socket.id}) joined room -> ${templateId}`);
  });

  // Leave template-specific room
  socket.on("disconnect", () => {
    templateRooms.forEach((room) => {
      socket.leave(room);
      console.log(`Socket (${socket.id}) left room -> ${room}`);
    });
  });
});

const PORT = process.env.PORT || 5001;
app.use(express.json()); // Parses incoming JSON requests
app.use("/", userRoute);
app.use("/templates", templateRoutes);
app.use("/response", responseRouter);
app.use("/", authRouter);

// Connect to MongoDB and start server
connectDB().then(async () => {
  await Template.syncIndexes();
  server.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Server started on port ${PORT}`)
  );
});
