import { ReactNode } from "react";

export function Button({
    icon, onClick, activated
}: {
    icon: ReactNode | string,
    onClick: () => void,
    activated: boolean
}) {
    return <button className={`rounded-full border-gray-500 border p-2 bg-black hover:bg-gray-700 ${activated ? "text-red-400" : "text-white"}`} onClick={onClick}>
        {icon}
    </button>
}
