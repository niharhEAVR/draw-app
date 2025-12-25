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

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {

    const dbShapes = await getExistingShapes(roomId)
    console.log(dbShapes);
    const parsedShapes = dbShapes.map((rects: string) => eval(`(${rects})`));
    const ExistingShapes: Shape[] = parsedShapes
    console.log(ExistingShapes);


    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    socket.onmessage = (e) => {
        const parsedData = JSON.parse(e.data);
        if (parsedData.type === "shape") {
            const parsedShape = JSON.parse(parsedData.shape)
            ExistingShapes.push(parsedShape)
            clearCanvas(ExistingShapes, ctx, canvas)
        }
    }

    let isDrawing = false;
    let startX = 0;
    let startY = 0;
    clearCanvas(ExistingShapes, ctx, canvas);
    
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
        const shape: Shape = {
            type: "rectangle",
            x: startX,
            y: startY,
            w: width,
            h: height
        }
        ExistingShapes.push(shape)
        console.log(ExistingShapes);
        const stringShape = JSON.stringify(shape)
        console.log(stringShape);
        
        socket.send(JSON.stringify({
            type: "shape",
            shape: stringShape,
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
    const res = await axios.get(`${HTTP_URL}/shapes/${roomId}`);
    const messages = res.data.shapes;
    console.log(messages);


    const shapes = messages.map((x: { shape: any }) => {
        try {
            console.log(x.shape, typeof x.shape);
            return x.shape;
        } catch (error) {
            console.error("Error parsing shape:", x.shape, error);
            return null;
        }
    }).filter(Boolean);

    console.log(typeof shapes, shapes);



    return shapes;
}