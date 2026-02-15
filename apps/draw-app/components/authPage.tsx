"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { HTTP_URL } from "@/config";
import { useRouter } from "next/navigation";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const router = useRouter();

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">

      {/* Floating Glow Blobs */}
      <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-pink-300/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>

      {/* Glass Card */}
      <div
        className={`backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-10 w-96 transition-all duration-1000 ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          {isSignin ? "Welcome Back 👋" : "Create Account 🚀"}
        </h2>

        <div className="space-y-4">

          {!isSignin && (
            <input
              type="text"
              placeholder="Name"
              className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="w-full mt-6 bg-white text-purple-700 font-semibold p-3 rounded-xl hover:bg-gray-200 transition-all duration-300 hover:scale-105 shadow-lg"
          onClick={async () => {
            try {
              if (isSignin) {
                const response = await axios.post(`${HTTP_URL}/signin`, {
                  email,
                  password,
                });

                localStorage.setItem("token", response.data.token);
                router.push("/room");
              } else {
                await axios.post(`${HTTP_URL}/signup`, {
                  email,
                  name,
                  password,
                });

                router.push("/signin");
              }
            } catch (err) {
              alert("Something went wrong");
            }
          }}
        >
          {isSignin ? "Sign In" : "Sign Up"}
        </button>

        <p className="text-center text-white/80 text-sm mt-6">
          {isSignin ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link
            href={isSignin ? "/signup" : "/signin"}
            className="text-white font-semibold hover:underline"
          >
            {isSignin ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
