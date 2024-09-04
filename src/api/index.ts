let username = localStorage.getItem("chatUserName") || "Anonymous";
let socket = new WebSocket(
  `ws://localhost:8080/ws?username=${encodeURIComponent(username)}`
);

let connect = (cb: Function) => {
  console.log("Attempting Connection...");

  socket.onopen = () => {
    console.log("Successfully Connected");
  };

  socket.onmessage = (msg) => {
    console.log("Message from websocket:", msg);
    cb(msg);
  };

  socket.onclose = (event) => {
    console.log("Socket Closed Connection: ", event);
  };

  socket.onerror = (error) => {
    console.log("Socket Error: ", error);
  };
};

let sendMsg = (msg: { user: string; body: string }) => {
  console.log("sending msg: ", msg);
  socket.send(JSON.stringify(msg));
};

export { connect, sendMsg };
