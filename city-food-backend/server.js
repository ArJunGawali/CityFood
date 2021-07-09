const http = require("http");
const app = require("./App");

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Shop = require("./models/Shops");

io.on("connection", (socket) => {
  console.log("user Connected");
});

server.listen(3000, () => {
  console.log("server is running on 3000...");
});
