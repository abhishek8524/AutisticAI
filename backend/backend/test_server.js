import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.get('/', (req, res) => res.send('OK'));
const server = app.listen(5002, () => console.log('Test server with dotenv on 5002'));
server.on("close", () => console.log("HTTP Server closed."));
process.on("exit", (code) => console.log(`Process exiting with code ${code}`));
