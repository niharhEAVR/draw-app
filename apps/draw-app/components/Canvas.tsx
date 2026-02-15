import { useEffect, useRef, useState } from "react";
import { Pencil, RectangleHorizontal, Circle } from "lucide-react";
import { Game } from "../draw/game";

export type Tool = "circle" | "rect" | "pencil";

export function Canvas({
    roomId,
    socket,
    width,
    height
}: {
    roomId: string;
    socket: WebSocket;
    width: number | undefined;
    height: number | undefined;
}) {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // ✅ Single source of truth for tool
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");

    const [game, setGame] = useState<Game | null>(null);

    /**
     * 🎮 Initialize Game when canvas + socket + roomId ready
     */
    useEffect(() => {

        if (!canvasRef.current) return;

        const g = new Game(canvasRef.current, roomId, socket);
        setGame(g);

        return () => {
            g.destroy();
        };

    }, [roomId, socket]); // ✅ Correct dependencies


    /**
     * 🔄 Update tool inside Game when selectedTool changes
     */
    useEffect(() => {
        if (game) {
            game.setTool(selectedTool);
        }
    }, [selectedTool, game]);



    return (
        <>
            <canvas
                ref={canvasRef}
                className="bg-[#1e1e1e]"
                width={width}
                height={height}
            />

            <ButtonBar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
            />
        </>
    );
}


function ButtonBar({
    selectedTool,
    setSelectedTool
}: {
    selectedTool: Tool;
    setSelectedTool: React.Dispatch<React.SetStateAction<Tool>>;
}) {

    return (
        <>
            {/* Top Left Tools */}
            <div className="fixed top-4 left-4 flex gap-3">

                <button
                    className={`px-3 py-2 rounded-full ${
                        selectedTool === "circle"
                            ? "text-red-700 bg-white"
                            : "bg-white text-black hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedTool("circle")}
                >
                    <Circle />
                </button>

                <button
                    className={`px-3 py-2 rounded-full ${
                        selectedTool === "rect"
                            ? "text-red-700 bg-white"
                            : "bg-white text-black hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedTool("rect")}
                >
                    <RectangleHorizontal />
                </button>

                <button
                    className={`px-3 py-2 rounded-full ${
                        selectedTool === "pencil"
                            ? "text-red-700 bg-white"
                            : "bg-white text-black hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedTool("pencil")}
                >
                    <Pencil />
                </button>
            </div>

        </>
    );
}
