"use client";

import { assets } from "../assets/assets";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import MarkdownRenderer from "./Renderer";

const ChatLable = ({ session, openMenu, setOpenMenu, onUpdateSessions }) => {
  const isOpen = openMenu.id === session.id && openMenu.open;
  const menuRef = useRef(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState(session.session_name);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (isOpen) setOpenMenu({ id: null, open: false });
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setOpenMenu({ id: session.id, open: !isOpen });
  };

  const handleRename = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`/api/chat/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName }),
      });

      if (res.ok) {
        onUpdateSessions();
        setShowRenameModal(false);
        setOpenMenu({ id: null, open: false });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this chat permanently?")) return;
    try {
      const res = await fetch(`/api/chat/${session.id}`, { method: "DELETE" });
      if (res.ok) {
        onUpdateSessions();
        setOpenMenu({ id: null, open: false });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="
        flex items-center justify-between 
        p-2 rounded-xl text-sm select-none
        cursor-pointer group
        transition-all duration-150
        bg-white
        border border-transparent
        hover:bg-blue-50/40
        hover:border-blue-200/60
      "
    >
      <Link href={`/${session.id}`} className="flex-1 flex items-center gap-3">
        <div className="truncate font-medium text-gray-700">
          <MarkdownRenderer content={session.session_name} />
        </div>
      </Link>

      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={toggleMenu}
          className="
            flex items-center justify-center 
            h-7 w-7 rounded-lg 
            hover:bg-blue-100/60 
            transition-all
          "
        >
          <Image
            src={assets.three_dots}
            alt="menu"
            className="w-4 opacity-70"
          />
        </button>

        {isOpen &&
          createPortal(
            <div
              className="
                absolute bg-white
                border border-gray-200/70 
                rounded-xl 
                w-max p-2 
                shadow-[0_4px_20px_rgba(0,0,0,0.08)]
                z-[9999] animate-fadeIn
              "
              style={{
                top:
                  menuRef.current.getBoundingClientRect().bottom +
                  window.scrollY,
                left: menuRef.current.getBoundingClientRect().right - 150,
              }}
            >
              <div
                onClick={() => setShowRenameModal(true)}
                className="
                  flex items-center gap-3 
                  px-3 py-2 
                  text-gray-700 
                  hover:bg-blue-50/60 
                  rounded-lg 
                  cursor-pointer
                  transition-all
                "
              >
                <Image src={assets.pencil_icon} alt="Rename" className="w-4" />
                <p>Rename</p>
              </div>

              <div
                onClick={handleDelete}
                className="
                  flex items-center gap-3 
                  px-3 py-2 
                  text-red-600 
                  hover:bg-red-50/70
                  rounded-lg 
                  cursor-pointer
                  transition-all
                "
              >
                <Image src={assets.delete_icon} alt="Delete" className="w-4" />
                <p>Delete</p>
              </div>
            </div>,
            document.body
          )}
      </div>

      {showRenameModal &&
        createPortal(
          <div
            className="
            fixed inset-0 flex items-center justify-center 
            z-[9999] bg-black/30 backdrop-blur-sm
          "
          >
            <div
              className="
              bg-white 
              shadow-[0_4px_22px_rgba(0,0,0,0.10)]
              border border-gray-200/60 
              p-6 rounded-2xl 
              w-80 flex flex-col gap-4 
              animate-fadeIn
            "
            >
              <h2 className="text-gray-800 text-lg font-semibold">
                Rename Chat
              </h2>

              <input
                className="
                  w-full p-2 
                  border border-gray-300 
                  rounded-lg 
                  focus:ring-2 focus:ring-blue-400 
                  focus:outline-none
                "
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRenameModal(false)}
                  className="
                    px-4 py-2 
                    border border-gray-300 
                    rounded-lg 
                    hover:bg-gray-100
                    transition-all
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={handleRename}
                  className="
                    px-4 py-2 
                    bg-blue-600 text-white 
                    rounded-lg 
                    hover:bg-blue-500
                    transition-all
                  "
                >
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ChatLable;
