import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on("close", () => console.log("HTTP Server closed."));
process.on("exit", (code) => console.log(`Process exiting with code ${code}`));
process.on("uncaughtException", (err) => console.log(`Uncaught Exception: ${err.message}`));
process.on("unhandledRejection", (err) => console.log(`Unhandled Rejection: ${err.message}`));