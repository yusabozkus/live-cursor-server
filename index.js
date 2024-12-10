const http = require("http");
const { WebSocketServer } = require("ws");

const url = require("url");

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;

const connections = {};
const users = {};

const broadcastMessage = () => {
  Object.keys(connections).forEach((id) => {
    const connection = connections[id];

  });
};

const broadcastUsers = () => {
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    const message = JSON.stringify(users);
    connection.send(message);
  });
};

const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString());
  const user = users[uuid];
  user.state = message;

  broadcastUsers();

  console.log(
    `${user.username} updated their state: ${JSON.stringify(user.state)}`
  );
};

const handleClose = (uuid) => {
  console.log(`${users[uuid].username} disconnected`);

  delete connections[uuid];
  delete users[uuid];

  broadcastUsers();
};

wsServer.on("connection", (connection, request) => {
  const { username } = url.parse(request.url, true).query;
  const { id } = url.parse(request.url, true).query;

  console.log(`${username} has connected to ${id} on server`);

  connections[id] = connection;

  users[id] = {
    username,
    state: {},
  };

  connection.on("message", (message) => handleMessage(message, id));
  connection.on("close", () => handleClose(id));
});

server.listen(port, () => {
  console.log(`WebSocket server listening on port ${port}`);
});
