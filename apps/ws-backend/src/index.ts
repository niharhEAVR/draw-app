import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (e) {
    return null;
  }
}



// so what are we doing here is that `ws` server has two functions parameter = one is `ws` object and another one is `request` object, in here the request.url is the object values which contains the current link of the server (ws:localhost:8080?token=123123)
wss.on('connection', function connection(ws, request) {
  const url = request.url; // ws:localhost:8080?token=123123
  if (!url) {
    return;
  }
  // url.split is actually splits the link into an array = ["ws:localhost:8080","token=123123"]
  const queryParams = new URLSearchParams(url.split('?')[1]); // token=123123
  const token = queryParams.get('token') || "";
  const userId = checkUser(token);

  if (userId == null) {
    ws.close()
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws
  })



  ws.on('message', async function message(data) {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
    }

    if (parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
      // {  
      //    userId:"c2714a10-27dd-44f6-8bee-4550c77b823d", 
      //    rooms:[{roomId:1}],
      //    ws:websocketConnection
      // }
    }

    if (parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter(x => x === parsedData.room);
      // {  
      //    userId:"c2714a10-27dd-44f6-8bee-4550c77b823d", 
      //    rooms:[],
      //    ws:websocketConnection
      // }
    }

    console.log("message received")
    console.log(parsedData);

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          message,
          userId
        }
      });

      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "chat",
            message: message,
            roomId
          }))
        }
      })
    }

    if (parsedData.type === "shape") {
      const roomId = parsedData.roomId;
      const shape = parsedData.shape;
      console.log(parsedData);

      await prismaClient.shapes.create({
        data: {
          roomId: Number(roomId),
          shape: String(shape),
          userId
        }
      });

      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "shape",
            shape: shape,
            roomId
          }))
        }
      })
    }


    if (parsedData.type === "clearCanvas") {
      const roomId = parsedData.roomId;

      await prismaClient.shapes.deleteMany({
        where: {
          roomId: Number(roomId)
        }
      });

      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "clearCanvas",
            roomId
          }))
        }
      })
    }

  });

});
