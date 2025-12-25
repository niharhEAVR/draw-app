"use client";

import Link from "next/link";
import { useState } from "react";
import { HTTP_URL } from "@/config";
import axios from "axios";
import { redirect } from "next/navigation";

export function AuthPage({ isSignin }: { isSignin: boolean }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-neutral-800">
            <div className="bg-white shadow-lg rounded-lg p-8 w-96">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
                    {isSignin ? "Sign In" : "Sign Up"}
                </h2>

                {isSignin ? <div className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Email"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                </div> : <div className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Email"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="name"
                            placeholder="Name"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                </div>}

                <div className="pt-4">
                    {isSignin ? <button
                        className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
                        onClick={async () => {
                            const response = await axios.post(`${HTTP_URL}/signin`, {
                                email,
                                password
                            });
                            alert(response.data.message || response.data.token);
                            redirect(`/`)
                        }}
                    >Sign In</button> : <button
                        className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
                        onClick={async () => {
                            const response = await axios.post(`${HTTP_URL}/signup`, {
                                email,
                                name,
                                password
                            });
                            alert(response.data.message);
                            redirect("/signin")
                        }}
                    >Sign Up</button>}
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                    {isSignin ? "Don't have an account?" : "Already have an account?"}{" "}
                    {isSignin ? <Link href="/signup" className="text-blue-500 hover:underline">
                        {isSignin ? "Sign up" : "Sign in"}
                    </Link> : <Link href="/signin" className="text-blue-500 hover:underline">
                        {isSignin ? "Sign up" : "Sign in"}
                    </Link>}
                </p>
            </div>
        </div>
    );
}
