"use client";

import { assets } from "../assets/assets";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useClerk, UserButton } from "@clerk/nextjs";
import { useAppContext } from "../context/AppContext";
import ChatLable from "./ChatLable";
import { useRouter } from "next/navigation";

const Sidebar = ({ expand, setExpand }) => {
  const { openSignIn } = useClerk();
  const { user } = useAppContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState({ id: null, open: false });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      setSessions(data.sessions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSessions();
  }, []);

  if (!mounted) {
    return (
      <div
        className={`flex flex-col justify-between 
          bg-gradient-to-b from-blue-50 via-white to-blue-100
          border-r border-blue-200/70 pt-7 transition-all z-50 max-md:absolute max-md:h-screen
          ${expand ? "p-4 w-64" : "w-16 overflow-visible"}`}
      >
        <div className="animate-pulse flex flex-col gap-4">
          <div className="bg-blue-100/60 rounded h-10 w-full"></div>
          <div className="bg-blue-100/60 rounded h-9 w-full"></div>
          <div className="bg-blue-100/60 rounded h-6 w-full"></div>
        </div>
        <div className="animate-pulse bg-blue-100/60 rounded h-10 w-full mt-4"></div>
      </div>
    );
  }

  const newChat = () => {
    const newId = crypto.randomUUID();
    router.push(`/${newId}`);
  };
  return (
    <div
      className={`flex flex-col justify-between 
        border-r border-blue-200/70 pt-7 transition-all z-50
        max-md:absolute max-md:h-screen shadow-[2px_0_15px_rgba(0,0,0,0.05)]
        ${
          expand
            ? "p-4 w-64 bg-gradient-to-b from-blue-50/70 via-white to-blue-100/90 backdrop-blur-xl"
            : "w-16 bg-blue-50/90 backdrop-blur-xl overflow-visible"
        }`}
      style={{ height: "100vh" }}
    >
      <div className="flex-1 overflow-y-auto">
        <div>
          <div
            className={`flex ${
              expand ? "flex-row gap-10" : "flex-col items-center gap-8"
            }`}
          >
            {expand ? (
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text select-none">
                Gini AI
              </h2>
            ) : (
              <Image
                className="w-10 drop-shadow-sm"
                src={assets.logo_icon}
                alt="logo"
              />
            )}

            <div
              onClick={() => setExpand(!expand)}
              className="flex items-center justify-center 
                hover:bg-blue-100/70 transition-all duration-300 h-9 w-9 rounded-lg cursor-pointer border border-blue-200/60"
            >
              <Image
                src={expand ? assets.sidebar_close_icon : assets.sidebar_icon}
                alt="sidebar toggle"
                className="w-7 opacity-70"
              />
            </div>
          </div>

          <button
            onClick={newChat}
            className={`
    mt-8 flex items-center justify-center cursor-pointer transition duration-200 
    rounded-xl
    ${
      expand
        ? "bg-blue-600 hover:bg-blue-500 text-white gap-2 p-2.5 w-max shadow-md shadow-blue-200"
        : "h-10 w-10 mx-auto bg-blue-600 hover:bg-blue-500 text-white border border-blue-600 shadow-md"
    }
  `}
          >
            <Image
              className={expand ? "w-6" : "w-6 opacity-100"}
              src={assets.chat_icon}
              alt="new chat"
            />
            {expand && <p className="text-sm font-medium">New Chat</p>}
          </button>

          {expand && (
            <div className="mt-8 text-gray-600 text-sm">
              <p className="my-1 font-semibold text-gray-700">Recents</p>
              {loading ? (
                <div className="animate-pulse flex flex-col gap-2">
                  <div className="bg-blue-100/60 rounded h-8 w-full"></div>
                  <div className="bg-blue-100/60 rounded h-8 w-full"></div>
                </div>
              ) : (
                sessions.map((session) => (
                  <ChatLable
                    key={session.id}
                    session={session}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                    onUpdateSessions={fetchSessions}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 pb-4">
        <div
          onClick={user ? null : openSignIn}
          className={`flex items-center gap-3 text-gray-700 text-sm cursor-pointer
            ${
              expand
                ? "hover:bg-blue-100/70 border border-blue-200/60 rounded-lg p-2"
                : "justify-center w-full"
            }`}
        >
          {user ? (
            <UserButton />
          ) : (
            <Image src={assets.profile_icon} alt="profile" className="w-8" />
          )}
          {expand && <span className="font-medium">My Profile</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
