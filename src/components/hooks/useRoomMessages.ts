// useRoomMessages.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type Message = { id: string; roomId: string; text: string; authorId: string; createdAt: number };

export function useRoomMessages(roomId: string, token: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token },
      transports: ["websocket"]
    });
    socketRef.current = socket;

    // Join once per room
    socket.emit("room:join", { roomId });

    // Deduplicate by id
    const seen = new Set<string>();
    const onMsg = (m: Message) => {
      if (m.roomId !== roomId) return;
      if (seen.has(m.id)) return;
      seen.add(m.id);
      setMessages(prev => {
        if (prev.some(p => p.id === m.id)) return prev;
        return [...prev, m].sort((a, b) => a.createdAt - b.createdAt);
      });
    };

    socket.on("room:message", onMsg);

    // Request recent only once
    socket.emit("room:fetchRecent", { roomId });

    socket.on("room:recent", (initial: Message[]) => {
      const sorted = initial.sort((a, b) => a.createdAt - b.createdAt);
      sorted.forEach(m => seen.add(m.id));
      setMessages(sorted);
    });

    return () => {
      socket.off("room:message", onMsg);
      socket.emit("room:leave", { roomId });
      socket.disconnect();
    };
  }, [roomId, token]); // <- stable deps; guarantees proper cleanup

  const send = (text: string) => {
    const id = crypto.randomUUID();
    socketRef.current?.emit("room:send", { id, roomId, text });
    // Optimistic UI (optional): add then rely on ack/dedupe
  };

  return { messages, send };
}
