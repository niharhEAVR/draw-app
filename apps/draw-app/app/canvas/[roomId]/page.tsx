import { RoomCanvas } from "@/components/RoomCanvas";

export default async function Draw({ params }: { params: { roomId: string } }) {
    const roomId = (await params).roomId;
    console.log(roomId, typeof roomId);
    return <RoomCanvas roomId={roomId} />;
}
