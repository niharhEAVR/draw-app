## The issues i have gone through when creating the draw-app frontend:

canvas>[roomId]>page.tsx:
```tsx
import { RoomCanvas } from "@/components/RoomCanvas";

export default async function Draw({ params }: {
    params: { roomId: string }
}) {
    const roomId = (await params).roomId
    console.log(roomId, typeof roomId);
    return <RoomCanvas roomId={roomId} />
}

```

components>RoomCanvas.tsx:
```tsx
"use client"

import { useState, useEffect } from "react";
import { WS_URL,DEMO_TOKEN } from "@/config";
import { Canvas } from "./Canvas";

export async function RoomCanvas({ roomId }: { roomId: string }) {


    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=${DEMO_TOKEN}`)
        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log(data);
            ws.send(data)
        }
    }, [])



    if (!socket) {
        return <div>Connecting to Server...</div>
    }

    return (<>
        <Canvas roomId={roomId} socket={socket} />
    </>);
}

```

components>Canvas.tsx:
```tsx
import { useEffect, useRef, useState } from "react";
import { initDraw, removeDrawListeners } from "@/draw";


export async function Canvas({ roomId, socket }: { roomId: string; socket: WebSocket }) {

    // For understanding this specific code first visit the 02-canvas app and read documents there and then read the 09_basic-canvas.md
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return;
        initDraw(canvas, roomId, socket)

        return () => {
            removeDrawListeners(canvas)
        };
    }, []);

    return (<>
        <div className="flex justify-center items-center flex-col  h-screen bg-gray-900">
            <div className="flex gap-x-5 mt-5">
                <button className="rounded bg-white text-black p-2">Text</button>
                <button className="rounded bg-white text-black p-2">Circle</button>
                <button className="rounded bg-white text-black p-2">Pencil</button>
                <button className="rounded bg-white text-black p-2">Rectangle</button>
            </div>
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <canvas
                    ref={canvasRef}
                    className="border-2 border-gray-700 rounded-lg shadow-lg"
                    width={900}
                    height={700}
                ></canvas>
            </div>
        </div>
    </>)
}
```

draw>index.ts:

```ts
// For understanding this specific code first visit the 02-canvas app and read documents there and then read the 09_basic-canvas.md


import axios from "axios";
import { HTTP_URL } from "@/config";


type Shape = {
    type: "rectangle";
    x: number;
    y: number;
    w: number;
    h: number;
} | {
    type: "circle";
    x: number;
    y: number;
    r: number;
    sa: number;
    ea: number;
}

export async function initDraw(canvas: HTMLCanvasElement, roomId:string, socket:WebSocket) {

    const ExistingShapes: Shape[] = await getExistingShapes(roomId)

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    socket.onmessage = (e)=>{
        const parsedData = JSON.parse(e.data);
        if(parsedData.type === "shape"){
            const parsedShape = JSON.parse(parsedData.shape)
            ExistingShapes.push(parsedShape)
            clearCanvas(ExistingShapes,ctx,canvas)
        }
    }

    let isDrawing = false;
    let startX = 0;
    let startY = 0;

    const handleMouseDown = (event: MouseEvent) => {
        isDrawing = true;
        startX = event.offsetX;
        startY = event.offsetY;
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isDrawing) return;
        const width = event.offsetX - startX;
        const height = event.offsetY - startY;

        clearCanvas(ExistingShapes, ctx, canvas);
        ctx.strokeStyle = "#ffffff"; // White outline
        ctx.strokeRect(startX, startY, width, height);

    };

    const handleMouseUp = (event: MouseEvent) => {
        isDrawing = false;
        const width = event.offsetX - startX;
        const height = event.offsetY - startY;
        const shape:Shape = {
            type: "rectangle",
            x: startX,
            y: startY,
            w: width,
            h: height
        }
        ExistingShapes.push(shape)
        console.log(ExistingShapes);
        socket.send(JSON.stringify({
            type: "shape",
            shape: JSON.stringify({
                shape
            }),
            roomId
        }))
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    (canvas as any)._handlers = { handleMouseDown, handleMouseMove, handleMouseUp };
}


export function removeDrawListeners(canvas: HTMLCanvasElement) {
    const handlers = (canvas as any)._handlers;
    if (!handlers) return;

    canvas.removeEventListener("mousedown", handlers.handleMouseDown);
    canvas.removeEventListener("mousemove", handlers.handleMouseMove);
    canvas.removeEventListener("mouseup", handlers.handleMouseUp);
}

function clearCanvas(ExistingShapes: Shape[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1F2937";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ExistingShapes.map(shape => {
        if (shape.type == "rectangle") {
            ctx.lineWidth = 2;
            ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
        }
    })
}

async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_URL}/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message)
        return messageData.shape;
    })

    return shapes;
}
```


## Now see the Solutions: 


Your code has multiple issues related to **async components, useEffect dependencies, WebSocket handling, and state updates**. I'll go through them one by one and provide solutions.

---

### **Issues and Fixes**

### **1. `Draw` Component: `RoomCanvas` is Async but Used as a JSX Component**
#### **Problem**:
Your `RoomCanvas` function is `async`, which is not allowed for React components.

#### **Fix**:
Remove `async` from `RoomCanvas`. If data fetching is needed, use `useEffect` and `useState`.

```tsx
export default function Draw({ params }: { params: { roomId: string } }) {
    const roomId = params.roomId;
    console.log(roomId, typeof roomId);
    return <RoomCanvas roomId={roomId} />;
}
```

---

### **2. `RoomCanvas` Component: Async Components and Missing Cleanup**
#### **Problems**:
1. **`RoomCanvas` is async**: It cannot be used directly inside JSX.
2. **WebSocket Cleanup Missing**: `useEffect` creates a WebSocket, but there's no cleanup when the component unmounts.
3. **`useEffect` Missing Dependencies**: The effect runs only once, but it should depend on `roomId`.

#### **Fix**:
- Convert `RoomCanvas` into a **normal functional component**.
- Use **state for WebSocket** and properly clean it up.

```tsx
"use client"

import { useState, useEffect } from "react";
import { WS_URL, DEMO_TOKEN } from "@/config";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=${DEMO_TOKEN}`);

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({ type: "join_room", roomId });
            console.log("Sending:", data);
            ws.send(data);
        };

        ws.onclose = () => {
            console.log("WebSocket Closed");
        };

        return () => {
            ws.close(); // Cleanup WebSocket on unmount
        };
    }, [roomId]); // Ensure effect re-runs if `roomId` changes

    if (!socket) {
        return <div>Connecting to Server...</div>;
    }

    return <Canvas roomId={roomId} socket={socket} />;
}
```

---

### **3. `Canvas` Component: Async Component & Missing Cleanup**
#### **Problems**:
1. **`Canvas` is async**, which is not allowed.
2. **Missing WebSocket message cleanup**: Messages persist even after unmounting.
3. **Effect Missing Dependencies**: `roomId` and `socket` are not dependencies.

#### **Fix**:
- Remove `async` from `Canvas`.
- Use `useEffect` to properly initialize event listeners and cleanup.

```tsx
import { useEffect, useRef } from "react";
import { initDraw, removeDrawListeners } from "@/draw";

export function Canvas({ roomId, socket }: { roomId: string; socket: WebSocket }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        initDraw(canvas, roomId, socket);

        return () => {
            removeDrawListeners(canvas);
        };
    }, [roomId, socket]); // Dependencies added

    return (
        <div className="flex justify-center items-center flex-col h-screen bg-gray-900">
            <div className="flex gap-x-5 mt-5">
                <button className="rounded bg-white text-black p-2">Text</button>
                <button className="rounded bg-white text-black p-2">Circle</button>
                <button className="rounded bg-white text-black p-2">Pencil</button>
                <button className="rounded bg-white text-black p-2">Rectangle</button>
            </div>
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <canvas
                    ref={canvasRef}
                    className="border-2 border-gray-700 rounded-lg shadow-lg"
                    width={900}
                    height={700}
                />
            </div>
        </div>
    );
}
```

---

### **4. `initDraw` Issues: WebSocket & Async Handling**
#### **Problems**:
1. **Does Not Handle WebSocket Disconnection Properly**.
2. **Potential Memory Leak**: Event listeners on `canvas` are not cleaned up.
3. **Inefficient State Updates**: Using `ExistingShapes.push()` directly may cause unexpected behavior.

#### **Fix**:
- Move `ExistingShapes` inside the function scope.
- Ensure WebSocket events are cleaned up.
- Use a more predictable state update approach.

```tsx
import axios from "axios";
import { HTTP_URL } from "@/config";

type Shape = { type: "rectangle"; x: number; y: number; w: number; h: number } |
             { type: "circle"; x: number; y: number; r: number; sa: number; ea: number };

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    let ExistingShapes: Shape[] = await getExistingShapes(roomId);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const clearCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#1F2937";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ExistingShapes.forEach(shape => {
            if (shape.type === "rectangle") {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
            }
        });
    };

    socket.onmessage = (e) => {
        const parsedData = JSON.parse(e.data);
        if (parsedData.type === "shape") {
            const parsedShape = JSON.parse(parsedData.shape);
            ExistingShapes = [...ExistingShapes, parsedShape]; // Avoid direct mutation
            clearCanvas();
        }
    };

    let isDrawing = false;
    let startX = 0, startY = 0;

    const handleMouseDown = (event: MouseEvent) => {
        isDrawing = true;
        startX = event.offsetX;
        startY = event.offsetY;
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isDrawing) return;
        const width = event.offsetX - startX;
        const height = event.offsetY - startY;
        clearCanvas();
        ctx.strokeRect(startX, startY, width, height);
    };

    const handleMouseUp = (event: MouseEvent) => {
        isDrawing = false;
        const width = event.offsetX - startX;
        const height = event.offsetY - startY;

        const shape: Shape = { type: "rectangle", x: startX, y: startY, w: width, h: height };
        ExistingShapes = [...ExistingShapes, shape];

        socket.send(JSON.stringify({ type: "shape", shape: JSON.stringify(shape), roomId }));
        clearCanvas();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    (canvas as any)._handlers = { handleMouseDown, handleMouseMove, handleMouseUp };
}

export function removeDrawListeners(canvas: HTMLCanvasElement) {
    const handlers = (canvas as any)._handlers;
    if (!handlers) return;

    canvas.removeEventListener("mousedown", handlers.handleMouseDown);
    canvas.removeEventListener("mousemove", handlers.handleMouseMove);
    canvas.removeEventListener("mouseup", handlers.handleMouseUp);
}

async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_URL}/chats/${roomId}`);
    return res.data.messages.map((x: { message: string }) => JSON.parse(x.message).shape);
}
```

---

### **Final Thoughts**
🔹 **Fixed async issues** in components.  
🔹 **Added cleanup for WebSocket and event listeners**.  
🔹 **Optimized state updates** for better performance.

This should make your drawing app **more stable and maintainable**! 🚀 Let me know if you need more refinements. 😊