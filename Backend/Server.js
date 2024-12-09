import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import SocketInit from "./Services/Socket/Socket.js";
import connectDB from "./DB/ConnectDB.js";
import router from "./Routes/Routes.js";

dotenv.config();

const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/Public", express.static(path.join(__dirname, "./Public")));

SocketInit(server);

app.use("/api/user", router);

server.listen(process.env.PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});
