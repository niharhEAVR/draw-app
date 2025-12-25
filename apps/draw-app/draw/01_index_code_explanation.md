```ts
export function initDraw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#1F2937"
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#ffffff"; // White outline
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, width, height);
    };

    const handleMouseUp = () => {
        isDrawing = false;
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
```

### Upto this point you have to visit the *02-canvas app* and read documents there and then read the *09_basic-canvas.md* in the *01_notes* folder understanding this specific code 

---

## After that we include some `Existingshapes` array for storing all the shapes we will create on the websites:

```ts
type Shape = {
    type:"rectangle";
    x:number;
    y:number;
    w:number;
    h:number;
} | {
    type: "circle";
    x:number;
    y:number;
    r:number;
    sa:number;
    ea:number;
}

const ExistingShapes:Shape[]= []
```

so that when we will create another shape the previous shapes will still remains - withour doing this the previous was erased everytime we creates a new shape


--- 

## After that we will implement it in the code

```ts
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

export function initDraw(canvas: HTMLCanvasElement) {

    const ExistingShapes: Shape[] = []

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
        ExistingShapes.push({
            type: "rectangle",
            x: startX,
            y: startY,
            w: width,
            h: height
        })
        console.log(ExistingShapes);
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
```