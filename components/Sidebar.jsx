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

  // Fetch sessions
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error(err);
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
        className={`flex flex-col justify-between bg-[#212327] pt-7 transition-all z-50 max-md:absolute max-md:h-screen
        ${expand ? "p-4 w-64" : "md:w-20 w-0 max-md:overflow-hidden"}`}
      >
        <div className="animate-pulse flex flex-col gap-4">
          <div className="bg-gray-700 rounded h-10 w-full"></div>
          <div className="bg-gray-700 rounded h-9 w-full"></div>
          <div className="bg-gray-700 rounded h-6 w-full"></div>
          <div className="bg-gray-700 rounded h-6 w-full"></div>
        </div>
        <div className="animate-pulse bg-gray-700 rounded h-10 w-full mt-4"></div>
      </div>
    );
  }

  const newChat = () => {
    router.push("/");
  };

  return (
    <div
      className={`flex flex-col justify-between bg-[#212327] pt-7 transition-all z-50
        max-md:absolute max-md:h-screen ${expand ? "p-4 w-64" : "md:w-20 w-0 max-md:overflow-hidden"}`}
      style={{ height: "100vh" }}
    >
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Section */}
        <div>
          <div className={`flex ${expand ? "flex-row gap-10" : "flex-col items-center gap-8"}`}>
            <Image
              className={expand ? "w-36" : "w-10"}
              src={expand ? assets.logo_text : assets.logo_icon}
              alt="logo"
            />

            <div
              onClick={() => setExpand(!expand)}
              className="group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 aspect-square rounded-lg cursor-pointer"
            >
              <Image src={assets.menu_icon} alt="menu" className="md:hidden" />
              <Image
                src={expand ? assets.sidebar_close_icon : assets.sidebar_icon}
                alt="sidebar toggle"
                className="hidden md:block w-7"
              />

            </div>
          </div>

          {/* New Chat Button */}
          <button
            className={`mt-8 flex items-center justify-center cursor-pointer ${expand
                ? "bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max"
                : "group relative h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg"
              }`}
            onClick={newChat}
          >
            <Image
              className={expand ? "w-6" : "w-7"}
              src={expand ? assets.chat_icon : assets.chat_icon_dull}
              alt=""
            />
            {expand && <p className="text-white text-medium">New chat</p>}
          </button>

          {/* Recent Chats */}
          <div className={`mt-8 text-white/25 text-sm ${expand ? "block" : "hidden"}`}>
            <p className="my-1">Recents</p>
            {loading ? (
              <div className="animate-pulse flex flex-col gap-2">
                <div className="bg-gray-700 rounded h-8 w-full"></div>
                <div className="bg-gray-700 rounded h-8 w-full"></div>
              </div>
            ) : (
              sessions.map((session) => (
                <ChatLable
                  key={session.id}
                  session={session}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                  onUpdateSessions={fetchSessions} // refresh after rename/delete
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-4 flex flex-col gap-2">
        {/* Get App */}
        <div
          className={`flex items-center cursor-pointer group relative ${expand
              ? "gap-2 text-white/80 text-sm p-2.5 border border-primary rounded-lg hover:bg-white/10"
              : "h-10 w-10 mx-auto hover:bg-gray-500/10 rounded-lg"
            }`}
        >
          {expand ? (
            <span className="flex items-center gap-2">
              <Image className="w-5" src={assets.phone_icon} alt="phone" />
              <span>Get App</span>
              <Image alt="new" src={assets.new_icon} className="w-10 h-auto" />
            </span>
          ) : (
            <Image className="w-6 mx-auto" src={assets.phone_icon_dull} alt="phone" />
          )}

          <div
            className={`absolute -top-60 pb-8 ${!expand ? "-right-40" : ""} opacity-0 group-hover:opacity-100 transition`}
          >
            <div className="relative w-max bg-black text-white text-sm p-3 rounded-lg shadow-lg">
              <Image className="w-44" src={assets.qrcode} alt="" />
              <p>Scan to get Deepseek App</p>
              <div
                className={`w-3 h-3 absolute bg-black rotate-45 ${expand ? "right-1/2" : "left-4"
                  } -bottom-1.5`}
              ></div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div
          onClick={user ? null : openSignIn}
          className={`flex items-center ${expand ? "hover:bg-white/10 rounded-lg" : "justify-center w-full"} gap-3 text-white/60 text-sm p-2 cursor-pointer`}
        >
          {user ? (
            <UserButton />
          ) : (
            <Image src={assets.profile_icon} alt="profile" className="w-7" />
          )}
          {expand && <span>My Profile</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
