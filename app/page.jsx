'use client';
import { assets } from "../assets/assets";
import Message from "../components/Message";
import PromptBox from "../components/PromptBox";
import Sidebar from "../components/Sidebar";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [expand, setExpand] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // for message send
  const [isPageLoading, setIsPageLoading] = useState(true); // for page/session load
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);

  // Fetch existing sessions when page loads
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/chat');
        const data = await response.json();
        if (data.sessions) setSessions(data.sessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleSendMessage = async (prompt, file = null) => {
    if (!prompt && !file) return;
    setIsLoading(true);

    try {
      const userMessage = { role: 'user', content: prompt || (file && file.name) };
      setMessages(prev => [...prev, userMessage]);


      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log(data);

      if (data.sessionId) {
        window.location.href = `/${data.sessionId}`;
      }


      if (data.message) {
        setMessages(prev => [...prev, { role: 'model', content: data.message }]);
        setSessionId(data.sessionId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ Error processing your request.' },
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
    <div className="flex h-screen bg-[#1e1f22] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar expand={expand} setExpand={setExpand} sessions={sessions} startNewChat={startNewChat} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative">
        {/* Mobile Header */}
        <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
          <Image
            onClick={() => setExpand(!expand)}
            className="rotate-180 cursor-pointer"
            src={assets.menu_icon}
            alt="menu"
          />
          <Image className="opacity-70" src={assets.chat_icon} alt="chat" />
        </div>

        {/* --- Page loading state --- */}
        {isPageLoading ? (
          <div>
            <div className="flex items-center gap-3">
              <Image src={assets.logo_icon} alt="logo" className="h-16" />
              <p className="text-2xl font-medium">Hi, I'm DeepSeek.</p>
            </div>
            <p className="text-sm mt-2 text-gray-400">How can I help you today?</p>
          </div>

        ) : messages.length === 0 ? (
          // --- Default welcome state ---
          <>
            <div className="flex items-center gap-3">
              <Image src={assets.logo_icon} alt="logo" className="h-16" />
              <p className="text-2xl font-medium">Hi, I'm DeepSeek.</p>
            </div>
            <p className="text-sm mt-2 text-gray-400">How can I help you today?</p>
          </>
        ) : (
          // --- Show chat messages if available ---
          <div className="w-full max-w-2xl h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pt-24 pb-4">
            {messages.map((msg, i) => (
              <Message key={i} role={msg.role} content={msg.content} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating response...
              </div>
            )}
          </div>
        )}

        {/* --- Prompt box --- */}
        {!isPageLoading && (
          <div className="absolute bottom-0 w-full max-w-2xl border-t border-gray-700 px-4 py-3">
            <PromptBox onSend={handleSendMessage} isLoading={isLoading} setIsLoading={setIsLoading} />
            <p className="text-xs text-gray-500 text-center mt-1">
              AI-generated, for reference only
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
