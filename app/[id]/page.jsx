// 'use client';

// import { assets } from "../../assets/assets";
// import Message from "../../components/Message";
// import PromptBox from "../../components/PromptBox";
// import Sidebar from "../../components/Sidebar";
// import Image from "next/image";
// import { useState, useEffect, useRef } from "react";
// import { useParams } from "next/navigation";
// import { Loader2, Edit, ClipboardCopy } from "lucide-react";

// export default function Home() {
//     const { id } = useParams();
//     const [expand, setExpand] = useState(false);
//     const [messages, setMessages] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [isFetching, setIsFetching] = useState(true);
//     const [sessionId, setSessionId] = useState(id);
//     const [sessions, setSessions] = useState([]);
//     const [editingMessage, setEditingMessage] = useState(null);
//     const messagesEndRef = useRef(null);

//     // Auto-scroll
//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [messages]);

//     // Fetch sessions
//     useEffect(() => {
//         const fetchSessions = async () => {
//             try {
//                 const res = await fetch("/api/chat");
//                 const data = await res.json();
//                 if (data.sessions) setSessions(data.sessions);
//             } catch (err) {
//                 console.error("Error fetching sessions:", err);
//             }
//         };
//         fetchSessions();
//     }, []);

//     // Fetch messages
//     useEffect(() => {
//         if (!sessionId) {
//             setMessages([]);
//             setIsFetching(false);
//             return;
//         }

//         const fetchMessages = async () => {
//             setIsFetching(true);
//             try {
//                 const res = await fetch(`/api/chat/${sessionId}`);
//                 const data = await res.json();
//                 if (data.messages) setMessages(data.messages);
//             } catch (err) {
//                 console.error("Error fetching messages:", err);
//             } finally {
//                 setIsFetching(false);
//             }
//         };
//         fetchMessages();
//     }, [sessionId]);

//     // Send message
//     const handleSendMessage = async (prompt) => {
//         if (!prompt) return;
//         setIsLoading(true);

//         try {
//             let updatedMessages = [...messages];

//             // If editing, replace existing message
//             if (editingMessage) {
//                 updatedMessages[editingMessage.index] = {
//                     role: "user",
//                     content: prompt,
//                 };
//                 setEditingMessage(null);
//             } else {
//                 updatedMessages.push({ role: "user", content: prompt });
//             }

//             setMessages(updatedMessages);

//             const res = await fetch(`/api/chat/${sessionId || ""}`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ prompt, sessionId }),
//             });

//             const data = await res.json();
//             if (data.message) {
//                 setMessages((prev) => [
//                     ...prev,
//                     { role: "model", content: data.message },
//                 ]);
//                 if (data.sessionId && data.sessionId !== sessionId)
//                     setSessionId(data.sessionId);
//             }
//         } catch (err) {
//             console.error("Error sending message:", err);
//             setMessages((prev) => [
//                 ...prev,
//                 { role: "assistant", content: "⚠️ Error processing request." },
//             ]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const startNewChat = () => {
//         setSessionId(null);
//         setMessages([]);
//     };

//     return (
//   <div className="flex h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800">

//     {/* Sidebar */}
//     <Sidebar
//       expand={expand}
//       setExpand={setExpand}
//       sessions={sessions}
//       startNewChat={startNewChat}
//     />

//     {/* Chat Container */}
//     <div className="flex-1 flex flex-col relative h-screen">

//       {/* Mobile Header */}
//       <div className="md:hidden absolute px-4 top-4 flex items-center justify-between w-full z-20">
//         <Image
//           onClick={() => setExpand(!expand)}
//           className="rotate-180 cursor-pointer"
//           src={assets.menu_icon}
//           alt="menu"
//         />
//         <Image className="opacity-70" src={assets.chat_icon} alt="chat" />
//       </div>

//       {/* Chat Area */}
//       <div className="
//         flex-1
//         overflow-y-auto
//         w-full
//         px-4
//         pb-4
//         pt-16 md:pt-6
//         mx-auto
//         max-w-full md:max-w-3xl
//         space-y-4
//       ">

//         {isFetching ? (
//           <div className="flex justify-center items-center h-full text-gray-500">
//             <Loader2 className="w-6 h-6 animate-spin mr-2" />
//             Loading chat...
//           </div>
//         ) : messages.length > 0 ? (
//           messages.map((msg, i) => (
//             <Message
//               key={i}
//               role={msg.role}
//               content={msg.content}
//               onEdit={(content) => setEditingMessage({ content, index: i })}
//             />
//           ))
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
//             <Image src={assets.logo_icon} alt="logo" className="h-20 opacity-80" />
//             <p className="text-xl md:text-2xl font-semibold">Hi there!</p>
//             <p className="text-sm opacity-70">How can I help you today?</p>
//           </div>
//         )}

//         {isLoading && (
//           <div className="flex items-center gap-2 text-gray-500 text-sm">
//             <Loader2 className="w-4 h-4 animate-spin" />
//             Generating response...
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Box */}
//       <div className="
//         border-t border-gray-300 
//         bg-white/70 backdrop-blur-lg
//         px-4 py-3
//         w-full
//       ">
//         <div className="w-full max-w-full md:max-w-3xl mx-auto">
//           <PromptBox
//             onSend={handleSendMessage}
//             isLoading={isLoading}
//             setIsLoading={setIsLoading}
//             editingMessage={editingMessage}
//           />
//         </div>
//       </div>
//     </div>
//   </div>
// );
// }

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
        <div className="flex h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800">
            {/* Sidebar */}
            <Sidebar
                expand={expand}
                setExpand={setExpand}
                sessions={sessions}
                startNewChat={startNewChat}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm z-10">
                    <Image
                        onClick={() => setExpand(!expand)}
                        className="cursor-pointer"
                        src={assets.menu_icon}
                        alt="menu"
                        width={24}
                        height={24}
                    />
                    <Image 
                        src={assets.chat_icon} 
                        alt="chat" 
                        width={24}
                        height={24}
                        className="opacity-70"
                    />
                    <div className="w-6"></div> {/* Spacer for balance */}
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto w-full px-4 py-4">
                        {isFetching ? (
                            <div className="flex justify-center items-center h-32 text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                Loading chat...
                            </div>
                        ) : messages.length > 0 ? (
                            <div className="space-y-6">
                                {messages.map((msg, i) => (
                                    <Message
                                        key={i}
                                        role={msg.role}
                                        content={msg.content}
                                        onEdit={(content) => setEditingMessage({ content, index: i })}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-gray-500 space-y-4">
                                <Image 
                                    src={assets.logo_icon} 
                                    alt="logo" 
                                    width={80}
                                    height={80}
                                    className="opacity-80"
                                />
                                <p className="text-xl md:text-2xl font-semibold text-center">Hi there!</p>
                                <p className="text-sm opacity-70 text-center">How can I help you today?</p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-4 p-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating response...
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Container - Fixed at bottom */}
                <div className="border-t border-gray-300 bg-white/80 backdrop-blur-lg sticky bottom-0">
                    <div className="max-w-4xl mx-auto w-full p-4">
                        <PromptBox
                            onSend={handleSendMessage}
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                            editingMessage={editingMessage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}