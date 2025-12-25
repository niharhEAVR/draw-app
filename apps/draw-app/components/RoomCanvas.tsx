"use client"

import { redirect } from "next/navigation";
import { useWindowSize } from "usehooks-ts"; // Library for accessing the window's width and height
import { useState, useEffect } from "react";
import { WS_URL, DEMO_TOKEN } from "@/config";
import { Canvas } from "./Canvas";
import { Button } from "./Button";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const { width, height } = useWindowSize();

    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [clearCanvas, setClearCanvas] = useState<boolean>(false)


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
            ws.close();
        };
    }, [roomId]);

    if (!socket) {
        return <div>Connecting to Server...</div>;
    }

    if (clearCanvas) {

        socket.send(
            JSON.stringify({
                type: "clearCanvas",
                roomId
            })
        );
        setClearCanvas(false)
        console.log(clearCanvas);
        redirect("/canvas/1")
    }


    return (<>
        <div className="bg-gray-900 h-screen overflow-hidden">
            <Canvas roomId={roomId} socket={socket} width={width} height={height} />
            <div className="fixed bottom-4 right-16"><Button onClick={() => { setClearCanvas(!clearCanvas) }} activated={false} icon={"Clear Canvas"} /> {/*make this button as admin specific that only admind can see this button and click its*/}</div>
        </div>
    </>)
}
