import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
    | {
        type: "rect";
        x: number;
        y: number;
        width: number;
        height: number;
    }
    | {
        type: "circle";
        centerX: number;
        centerY: number;
        radius: number;
    }
    | {
        type: "pencil";
        points: { x: number; y: number }[];
    };

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[] = [];
    private roomId: string;
    private clicked = false;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private currentPencilPoints: { x: number; y: number }[] = [];

    private socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.roomId = roomId;
        this.socket = socket;

        this.initSocketHandler();
        this.initMouseHandlers();

        this.init();   // call last

    }

    // ===============================
    // Cleanup
    // ===============================
    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.socket.removeEventListener("message", this.socketHandler);
    }

    // ===============================
    // Tool Setter
    // ===============================
    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    // ===============================
    // Initial Load
    // ===============================
    async init() {
        console.log("INIT CALLED with roomId:", this.roomId);

        try {
            this.existingShapes = await getExistingShapes(this.roomId);
            console.log("LOADED SHAPES:", this.existingShapes);
        } catch (err) {
            console.error("Failed to load shapes:", err);
            this.existingShapes = [];
        }

        this.clearCanvas();   // keep this
    }


    // ===============================
    // WebSocket Handling
    // ===============================
    private socketHandler = (event: MessageEvent) => {
        const message = JSON.parse(event.data);

        if (message.type === "shape") {
            const parsedShape: Shape = JSON.parse(message.shape);
            this.existingShapes.push(parsedShape);
            this.clearCanvas();
        }
    };

    private initSocketHandler() {
        this.socket.addEventListener("message", this.socketHandler);
    }

    // ===============================
    // Canvas Drawing
    // ===============================
    private clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (const shape of this.existingShapes) {
            this.drawShape(shape);
        }
    }

    private drawShape(shape: Shape) {
        this.ctx.strokeStyle = "#ffffff";

        if (shape.type === "rect") {
            this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }

        if (shape.type === "circle") {
            this.ctx.beginPath();
            this.ctx.arc(
                shape.centerX,
                shape.centerY,
                Math.abs(shape.radius),
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
            this.ctx.closePath();
        }

        if (shape.type === "pencil") {
            this.ctx.beginPath();
            for (let i = 0; i < shape.points.length - 1; i++) {
                this.ctx.moveTo(shape.points[i].x, shape.points[i].y);
                this.ctx.lineTo(shape.points[i + 1].x, shape.points[i + 1].y);
            }
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    // ===============================
    // Mouse Handling
    // ===============================
    private getMousePos(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    private mouseDownHandler = (e: MouseEvent) => {
        const { x, y } = this.getMousePos(e);

        this.clicked = true;
        this.startX = x;
        this.startY = y;

        if (this.selectedTool === "pencil") {
            this.currentPencilPoints = [{ x, y }];
        }
    };

    private mouseMoveHandler = (e: MouseEvent) => {
        if (!this.clicked) return;

        const { x, y } = this.getMousePos(e);

        this.clearCanvas();
        this.ctx.strokeStyle = "#ffffff";

        if (this.selectedTool === "rect") {
            this.ctx.strokeRect(
                this.startX,
                this.startY,
                x - this.startX,
                y - this.startY
            );
        }

        if (this.selectedTool === "circle") {
            const radius =
                Math.sqrt(
                    Math.pow(x - this.startX, 2) +
                    Math.pow(y - this.startY, 2)
                ) / 2;

            const centerX = (this.startX + x) / 2;
            const centerY = (this.startY + y) / 2;

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        if (this.selectedTool === "pencil") {
            this.currentPencilPoints.push({ x, y });

            this.ctx.beginPath();
            for (let i = 0; i < this.currentPencilPoints.length - 1; i++) {
                this.ctx.moveTo(
                    this.currentPencilPoints[i].x,
                    this.currentPencilPoints[i].y
                );
                this.ctx.lineTo(
                    this.currentPencilPoints[i + 1].x,
                    this.currentPencilPoints[i + 1].y
                );
            }
            this.ctx.stroke();
            this.ctx.closePath();
        }
    };

    private mouseUpHandler = (e: MouseEvent) => {
        if (!this.clicked) return;

        this.clicked = false;

        const { x, y } = this.getMousePos(e);
        let shape: Shape | null = null;

        if (this.selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width: x - this.startX,
                height: y - this.startY,
            };
        }

        if (this.selectedTool === "circle") {
            const radius =
                Math.sqrt(
                    Math.pow(x - this.startX, 2) +
                    Math.pow(y - this.startY, 2)
                ) / 2;

            shape = {
                type: "circle",
                centerX: (this.startX + x) / 2,
                centerY: (this.startY + y) / 2,
                radius,
            };
        }

        if (this.selectedTool === "pencil") {
            shape = {
                type: "pencil",
                points: [...this.currentPencilPoints],
            };
        }

        if (!shape) return;

        this.existingShapes.push(shape);
        this.clearCanvas();

        this.socket.send(
            JSON.stringify({
                type: "shape",
                shape: JSON.stringify(shape),
                roomId: this.roomId,
            })
        );

        this.currentPencilPoints = [];
    };

    private initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
}
