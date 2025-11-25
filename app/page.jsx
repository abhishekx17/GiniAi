"use client";
import { assets } from "../assets/assets";
import Message from "../components/Message";
import PromptBox from "../components/PromptBox";
import Sidebar from "../components/Sidebar";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [expand, setExpand] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/chat");
        const data = await response.json();
        if (data.sessions) setSessions(data.sessions);
      } catch (error) {
        console.error("Session Error:", error);
        toast.error("Failed to load sessions");
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
      const userMessage = {
        role: "user",
        content: prompt || (file && file.name),
      };
      setMessages((prev) => [...prev, userMessage]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        // Optional: Update URL without full page reload
        window.history.pushState({}, "", `/${data.sessionId}`);
      }

      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      }
    } catch (error) {
      console.error("Message Error:", error);
      toast.error("Failed to send message");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
    window.history.pushState({}, "", "/");
    toast.success("New chat started");
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-900">
      {/* Sidebar */}
      <Sidebar
        expand={expand}
        setExpand={setExpand}
        sessions={sessions}
        startNewChat={startNewChat}
        currentSessionId={sessionId}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-blue-100 bg-white/80 backdrop-blur-sm z-10">
          <Image
            onClick={() => setExpand(!expand)}
            className="cursor-pointer"
            src={assets.menu_icon}
            alt="menu"
            width={24}
            height={24}
          />
          <h2 className="text-lg font-semibold text-blue-600">Gini AI</h2>
          <div className="w-6"></div> {/* Spacer for balance */}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Loading Screen */}
          {isPageLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Image
                src={assets.logo_icon}
                alt="logo"
                width={56}
                height={56}
                className="animate-pulse"
              />
              <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text">
                Gini AI
              </h1>
              <p className="text-sm mt-2 text-gray-500">
                Setting things up for you…
              </p>
            </div>
          ) : messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center h-full px-4">
              <Image
                src={assets.logo_icon}
                alt="logo"
                width={80}
                height={80}
                className="mb-4"
              />
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text">
                Gini AI
              </h1>
              <p className="text-lg text-gray-600 mb-1 text-center">
                Your intelligent everyday companion ✨
              </p>
              <p className="text-sm text-gray-400 text-center">
                Ask me anything to get started
              </p>
            </div>
          ) : (
            /* Messages Container */
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="max-w-4xl mx-auto w-full">
                <div className="space-y-6">
                  {messages.map((msg, idx) => (
                    <Message key={idx} role={msg.role} content={msg.content} />
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm p-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gini is thinking…
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          )}

          {!isPageLoading && (
            <div className="sticky bottom-0">
              <div className="max-w-4xl mx-auto w-full p-4">
                <PromptBox
                  onSend={handleSendMessage}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
                <p className="text-xs text-gray-500 text-center mt-3">
                  Gini AI may produce imperfect responses
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
