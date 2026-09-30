import "dotenv/config"; // Must be the absolute first line!

// ... rest of your imports
import app from './src/app.js'
import http from "http";
import { initializeSocket } from "./src/config/websockets.js";

// your existing Express app
const server = http.createServer(app);

initializeSocket(server);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});

