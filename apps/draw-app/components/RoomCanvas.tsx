"use client"

import { useWindowSize } from "usehooks-ts";
import { useState, useEffect } from "react";

import { WS_URL } from "@/config";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string })
{

    // 📏 Get live window size for full-screen canvas
    const { width, height } = useWindowSize();

    // 🔌 WebSocket state
    const [socket, setSocket] = useState<WebSocket | null>(null);

    // 👑 Example admin flag (replace with real logic from backend)
    const [isAdmin, setIsAdmin] = useState(false);

    /**
     * 🔹 Establish WebSocket connection when roomId changes
     */
    useEffect(() => {

        const ws = new WebSocket(`${WS_URL}?token=${localStorage.getItem("token")}`);

        ws.onopen = () => {

            console.log("WebSocket Connected");

            // Save socket
            setSocket(ws);

            // Join the room after connection
            ws.send(JSON.stringify({
                type: "join_room",
                roomId: parseInt(roomId)
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Example: server sends admin status
            if (data.type === "admin_status") {
                setIsAdmin(data.isAdmin);
            }
            console.log(data);
            
        };

        ws.onclose = () => {
            ws.send(JSON.stringify({
                type: "leave_room",
                roomId: parseInt(roomId)
            }));
            console.log("WebSocket Closed");
        };

        // Cleanup on unmount
        return () => {
            ws.close();
        };

    }, [roomId]);

    /**
     * 🔹 Clear canvas handler
     * This should be triggered only by button click,
     * NOT inside render.
     */
    const handleClearCanvas = () => {

        if (!socket) return;

        socket.send(JSON.stringify({
            type: "clearCanvas",
            roomId: parseInt(roomId)
        }));

        console.log("Clear canvas requested");
    };

    /**
     * 🔹 If socket not ready
     */
    if (!socket) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white text-xl">
                Connecting to Server...
            </div>
        );
    }

    return (
        <div className="bg-[#121212] h-screen w-screen overflow-hidden relative">

            {/* 🖌️ Main Canvas */}
            <Canvas
                roomId={roomId}
                socket={socket}
                width={width}
                height={height}
            />

            {/* 👑 Admin Only Clear Button (Bottom Right like Excalidraw) */}
            {isAdmin && (
                <div className="fixed bottom-6 right-6">
                    <button
                        onClick={handleClearCanvas}
                        className="bg-red-600 hover:bg-red-700 
                                   text-white px-4 py-2 
                                   rounded-lg shadow-lg 
                                   transition-all duration-200"
                    >
                        Clear Canvas
                    </button>
                </div>
            )}

        </div>
    );
}
