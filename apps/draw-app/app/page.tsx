"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">

      {/* Floating Animated Shapes */}
      <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-pink-300/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>

      {/* Glass Card */}
      <div
        className={`backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-12 flex flex-col items-center transition-all duration-1000 ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">
          🎨 Draw App
        </h1>

        <p className="text-white/80 text-lg mb-8 text-center max-w-md">
          Create, collaborate and chat in real-time.  
          A powerful canvas built with WebSockets + Prisma.
        </p>

        <div className="flex flex-col gap-4 w-full">

          <Link href="/signin">
            <button className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 rounded-xl p-3 text-xl font-semibold text-white shadow-lg hover:scale-105">
              Sign In
            </button>
          </Link>

          <Link href="/signup">
            <button className="w-full bg-white hover:bg-gray-200 transition-all duration-300 rounded-xl p-3 text-xl font-semibold text-gray-800 shadow-lg hover:scale-105">
              Sign Up
            </button>
          </Link>


        </div>
      </div>
    </div>
  );
}
