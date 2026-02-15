"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { HTTP_URL } from "@/config";

export default function CreateRoomPage() {
    const [loaded, setLoaded] = useState(false);
    const [isCreate, setIsCreate] = useState(false);
    const [roomName, setRoomName] = useState("");

    const token = localStorage.getItem("token");
    const router = useRouter();

    useEffect(() => {
        setLoaded(true);
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">

            {/* Floating Glow Blobs */}
            <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-pink-300/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>

            {/* Glass Card for Create Room */}
            <div
                className={`backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-10 w-96 transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <h2 className="text-3xl font-bold text-white text-center mb-6">
                    {isCreate ? "Create a Room 🎨" : "Join a Room 🎨"}
                </h2>

                <input
                    type="text"
                    placeholder="Enter Room Name"
                    className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                />

                <button
                    className="w-full mt-6 bg-white text-purple-700 font-semibold p-3 rounded-xl hover:bg-gray-200 transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={async () => {

                        try {
                            if (!roomName.trim()) {
                                alert("Please enter room name");
                                return;
                            }

                            if (isCreate) {
                                const response = await axios.post(
                                    `${HTTP_URL}/room`,
                                    { roomName },
                                    {
                                        headers: {
                                            Authorization: `${token}`
                                        }
                                    }
                                );

                                if (!response.data.roomId) {
                                    alert(response.data.message || "Failed to create room");
                                    return;
                                }

                                localStorage.setItem("roomId", response.data.roomId);
                                localStorage.setItem("roomSlug", response.data.slug);
                                router.push(`/canvas/${response.data.roomId}`);

                            } else {
                                const response = await axios.get(
                                    `${HTTP_URL}/room/${roomName}`,
                                    {
                                        headers: {
                                            Authorization: `${token}`
                                        }
                                    }
                                );

                                if (!response.data.room) {
                                    alert(response.data.message || "Failed to join room");
                                    return;
                                }

                                localStorage.setItem("roomId", response.data.room.id);
                                localStorage.setItem("roomSlug", response.data.room.slug);
                                router.push(`/canvas/${response.data.room.id}`);
                            }

                        } catch (err: any) {
                            alert(err.response?.data?.message || "Something went wrong");
                        }
                    }}
                >
                    {isCreate ? "Create Room" : "Join Room"}
                </button>

                {/* Toggle Button */}
                <div className="text-center mt-6 text-white">
                    {isCreate ? (
                        <p>
                            Already have a room?{" "}
                            <span
                                className="underline cursor-pointer font-semibold"
                                onClick={() => {
                                    setRoomName("");
                                    setIsCreate(false);

                                }}
                            >
                                Join instead
                            </span>
                        </p>
                    ) : (
                        <p>
                            Want to create a new room?{" "}
                            <span
                                className="underline cursor-pointer font-semibold"
                                onClick={() => {
                                    setRoomName("");
                                    setIsCreate(true);
                                }}
                            >
                                Create instead
                            </span>
                        </p>
                    )}
                </div>
            </div>

        </div>
    );
}
