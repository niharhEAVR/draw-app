import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="w-screen h-screen flex justify-center items-center flex-col">
        Draw-app Landing page
        <Link href="/signin">
          <button className="bg-blue-500 rounded p-2 m-4 text-2xl font-semibold text-center mb-6" >Signin</button>
        </Link>
        <Link href="/signup">
          <button className="bg-white rounded p-2 text-2xl font-semibold text-gray-700 text-center mb-6">Signup</button>
        </Link>
        <Link href="/canvas/1">
          <button className="bg-pink-300 rounded p-2 text-2xl font-semibold text-gray-900 text-center mb-6">Goto Canvas</button>
        </Link>
      </div>
    </>
  );
}
