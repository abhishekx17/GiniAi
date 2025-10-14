'use client';

import { assets } from "../../assets/assets";
import Message from "../../components/Message";
import PromptBox from "../../components/PromptBox";
import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2, Edit, ClipboardCopy } from "lucide-react";

export default function Home() {
    const { id } = useParams();
    const [expand, setExpand] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [sessionId, setSessionId] = useState(id);
    const [sessions, setSessions] = useState([]);
    const [editingMessage, setEditingMessage] = useState(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch sessions
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch("/api/chat");
                const data = await res.json();
                if (data.sessions) setSessions(data.sessions);
            } catch (err) {
                console.error("Error fetching sessions:", err);
            }
        };
        fetchSessions();
    }, []);

    // Fetch messages
    useEffect(() => {
        if (!sessionId) {
            setMessages([]);
            setIsFetching(false);
            return;
        }

        const fetchMessages = async () => {
            setIsFetching(true);
            try {
                const res = await fetch(`/api/chat/${sessionId}`);
                const data = await res.json();
                if (data.messages) setMessages(data.messages);
            } catch (err) {
                console.error("Error fetching messages:", err);
            } finally {
                setIsFetching(false);
            }
        };
        fetchMessages();
    }, [sessionId]);

    // Send message
    const handleSendMessage = async (prompt) => {
        if (!prompt) return;
        setIsLoading(true);

        try {
            let updatedMessages = [...messages];

            // If editing, replace existing message
            if (editingMessage) {
                updatedMessages[editingMessage.index] = {
                    role: "user",
                    content: prompt,
                };
                setEditingMessage(null);
            } else {
                updatedMessages.push({ role: "user", content: prompt });
            }

            setMessages(updatedMessages);

            const res = await fetch(`/api/chat/${sessionId || ""}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, sessionId }),
            });

            const data = await res.json();
            if (data.message) {
                setMessages((prev) => [
                    ...prev,
                    { role: "model", content: data.message },
                ]);
                if (data.sessionId && data.sessionId !== sessionId)
                    setSessionId(data.sessionId);
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "⚠️ Error processing request." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setSessionId(null);
        setMessages([]);
    };

    return (
        <div className="flex h-screen bg-[#1e1f22] text-white">
            <Sidebar
                expand={expand}
                setExpand={setExpand}
                sessions={sessions}
                startNewChat={startNewChat}
            />

            <div className="flex-1 flex flex-col relative">
                {/* Mobile Header */}
                <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full z-10">
                    <Image
                        onClick={() => setExpand(!expand)}
                        className="rotate-180 cursor-pointer"
                        src={assets.menu_icon}
                        alt="menu"
                    />
                    <Image className="opacity-70" src={assets.chat_icon} alt="chat" />
                </div>

                {/* Chat Area */}
                <div className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {isFetching ? (
                        <div className="flex justify-center items-center h-full text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            Loading chat...
                        </div>
                    ) : messages.length > 0 ? (
                        messages.map((msg, i) => (
                            <Message
                                key={i}
                                role={msg.role}
                                content={msg.content}
                                onEdit={(content) => setEditingMessage({ content, index: i })}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                            <Image src={assets.logo_icon} alt="logo" className="h-16 opacity-70" />
                            <p className="text-xl font-medium">Hi, I'm DeepSeek.</p>
                            <p className="text-sm text-gray-400">How can I help you today?</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating response...
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Prompt Box */}
                <div className="border-t border-gray-700 flex items-center justify-center px-4 py-3">
                    <PromptBox
                        onSend={handleSendMessage}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        editingMessage={editingMessage}
                    />
                </div>
            </div>
        </div>
    );
}
