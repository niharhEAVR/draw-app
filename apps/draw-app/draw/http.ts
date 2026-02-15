import { HTTP_URL } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {

    const token = localStorage.getItem("token");

    const res = await axios.get(`${HTTP_URL}/shapes/${roomId}`,
        {
            headers: {
                Authorization: `${token}`
            }
        });
    const shapes = res.data.shapes;

    const parsedShapes = shapes.map((x: { shape: string }) => {
        return JSON.parse(x.shape);
    });

    return parsedShapes;
}
