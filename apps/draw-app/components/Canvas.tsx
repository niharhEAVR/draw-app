
import { useEffect, useRef, useState } from "react";
import { initDraw, removeDrawListeners } from "@/draw";
import { Pencil } from "lucide-react";
import { Button } from "./Button";
import { Game } from "@/draw/Game";

export type Tool = "circle" | "rect" | "pencil";

export function Canvas({ roomId, socket, width, height }: { roomId: string; socket: WebSocket, width: number | undefined, height: number | undefined }) {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");


    const [game, setGame] = useState<Game>();

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);



    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
        }
    }, [canvasRef]);


    return (<>
        <canvas
            ref={canvasRef}
            className="border-2 border-gray-700 rounded-lg shadow-lg"
            width={width}
            height={height}
        />
        <ButtonBar activeTool={activeTool} setActiveTool={setActiveTool} />
    </>
    );
}


function ButtonBar({ activeTool, setActiveTool }: {
    activeTool: string | null,
    setActiveTool: React.Dispatch<React.SetStateAction<string | null>>
}) {

    return (<>
        <div className="fixed top-4 left-4 flex gap-2 text-xl">
            {["Text", "Circle", "Rectangle"].map((tool) => (
                <button
                    key={tool}
                    className={`rounded-4xl p-2 ${activeTool === tool ? "bg-green-300 text-black" : "bg-white text-black hover:bg-gray-300"
                        }`}
                    onClick={() => setActiveTool((prev) => (prev === tool ? null : tool))}
                >{tool}</button>
            ))}
        </div>
        <div className="fixed bottom-4 right-4 text-xl">
            <Button onClick={() => {
                setActiveTool((prev) => (prev === "pencil" ? null : "pencil"))
            }} activated={activeTool === "pencil"} icon={<Pencil />} />
        </div>
    </>)
}