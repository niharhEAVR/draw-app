import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface ConnectedUser {
  ws: WebSocket;
  rooms: number[];
  userId: string;
}

const users: ConnectedUser[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") return null;
    if (!decoded || !decoded.userId) return null;

    return decoded.userId;
  } catch {
    return null;
  }
}


wss.on('connection', function connection(ws, request) {

  const url = request.url; // ws:localhost:8080?token=123123
  if (!url) return;

  // url.split is actually splits the link into an array = ["ws:localhost:8080","token=123123"]
  const queryParams = new URLSearchParams(url.split('?')[1]); // token=123123
  const token = queryParams.get('token') || "";
  const userId = checkUser(token);

  if (!userId) {
    ws.close()
    return;
  }

  const currentUser: ConnectedUser = {
    userId,
    rooms: [],
    ws,
  };
  users.push(currentUser)


  ws.on('message', async function message(data) {

    let parsedData = JSON.parse(data.toString()); // {"type":"join_room","slug":"room-1"}
    console.log(parsedData);


    // =============================
    // JOIN ROOM (by slug)
    // =============================
    /*{"type":"join_room","roomId":"1"}*/
    if (parsedData.type === "join_room") {
      const roomId = parsedData.roomId;

      if (!roomId) return;

      // Find or create room
      let room = await prismaClient.room.findUnique({
        where: { id: Number(roomId) },
      });

      if (!room) {
        return;
      }

      if (!currentUser.rooms.includes(room.id)) {
        currentUser.rooms.push(room.id);
      }

      // Send previous shapes to user
      const shapes = await prismaClient.shapes.findMany({
        where: { roomId: room.id },
      });

      ws.send(
        JSON.stringify({
          type: "init_shapes",
          shapes,
          roomId: room.id,
        })
      );

      console.log(currentUser.userId, currentUser.rooms);

    }

    // =============================
    // LEAVE ROOM
    // =============================
    /*{"type":"leave_room","roomId":1}*/
    if (parsedData.type === "leave_room") {
      const roomId = Number(parsedData.roomId);
      currentUser.rooms = currentUser.rooms.filter(id => id !== roomId);
    }

    // =============================
    // DRAW SHAPE
    // =============================
    /*{"type":"shape","shape":"{json}","roomId":1}*/
    if (parsedData.type === "shape") {
      const roomId = Number(parsedData.roomId);
      const shape = parsedData.shape;

      if (!currentUser.rooms.includes(roomId)) return;

      await prismaClient.shapes.create({
        data: {
          roomId,
          shape: JSON.stringify(shape),
          userId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "shape",
              shape,
              roomId,
            })
          );
        }
      });
    }

    // =============================
    // CLEAR CANVAS
    // =============================
    /*{"type":"clearCanvas","roomId":1}*/
    if (parsedData.type === "clearCanvas") {
      const roomId = Number(parsedData.roomId);

      if (!currentUser.rooms.includes(roomId)) return;

      await prismaClient.shapes.deleteMany({
        where: { roomId },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "admin_status",
              isAdmin: true,
            })
          );
        }
      });
    }


    // =============================
    // CHAT
    // =============================
    /*{"type":"chat","message":"Hello","roomId":1}*/
    if (parsedData.type === "chat") {
      const roomId = Number(parsedData.roomId);
      const message = parsedData.message;

      if (!currentUser.rooms.includes(roomId)) return;

      await prismaClient.chat.create({
        data: {
          roomId,
          message,
          userId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message,
              roomId,
              userId,
            })
          );
        }
      });
    }

    ws.on("close", () => {
      const index = users.findIndex((u) => u.ws === ws);
      if (index !== -1) {
        users.splice(index, 1);
      }
    });

  });
});
