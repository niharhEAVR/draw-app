import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import { middleware } from "./middleware";
import { prismaClient } from "@repo/db/client";
import { JWT_SECRET } from '@repo/backend-common/config';
import { SignupSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";


declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}


const app = express();
app.use(express.json());
app.use(cors())

app.post("/signup", async (req, res) => {

    const parsedData = SignupSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.email,
                // TODO: Hash the pw
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id, // c2714a10-27dd-44f6-8bee-4550c77b823d
            message: "You have successfully signed up."
        })
    } catch (e) {
        res.status(411).json({
            message: "This email address already registered."
        })
    }
})

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }

    // TODO: Compare the hashed pws here
    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email,
            password: parsedData.data.password
        }
    })

    if (!user) {
        res.status(403).json({
            message: "Not authorized"
        })
        return;
    }

    const token = jwt.sign({
        userId: user.id // c2714a10-27dd-44f6-8bee-4550c77b823d
    }, JWT_SECRET);

    res.json({
        token: token
    })
})

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }

    const userId = req.userId;

    if (!userId) {
        res.status(401).json({
            message: "Unauthorized"
        })
        return;
    }

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.roomName,
                adminId: userId
            }
        })

        res.json({
            roomId: room.id, //1,2,3
            slug: room.slug //room-1, room-2
        })
    } catch (e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

app.get("/room/:slug", middleware, async (req, res) => {
    const slug = req.params.slug;

    if (!slug) {
        res.status(400).json({
            message: "Invalid slug"
        })
        return;
    }


    try {

        const room = await prismaClient.room.findFirst({
            where: {
                slug
            }
        });

        if(!room) {
            res.status(404).json({
                message: "Room not found"
            })
            return;
        }

        res.json({
            room
        })
    } catch (error) {
        res.status(500).json({
            message: "Error fetching room details"
        })
    }
})

app.get("/shapes/:roomId", middleware, async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);

        const shapes = await prismaClient.shapes.findMany({
            where: {
                roomId: roomId
            }
        });
        console.log(shapes);

        res.json({
            shapes
        })
    } catch (e) {
        console.log(e);
        res.json({
            shapes: []
        })
    }

})


app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);

        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc" // this means show all the messeges in decending order by id number
            },
            take: 1000 // this means find the latest 1000 chats
        });

        res.json({
            messages
        })
    } catch (e) {
        console.log(e);
        res.json({
            messages: []
        })
    }

})



app.listen(3001, () => [
    console.log("Http Server is running on port 3001")
]);