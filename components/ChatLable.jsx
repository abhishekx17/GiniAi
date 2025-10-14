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

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (isOpen) setOpenMenu({ id: null, open: false });
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, setOpenMenu]);

  // Toggle menu
  const toggleMenu = (e) => {
    e.stopPropagation();
    setOpenMenu({ id: session.id, open: !isOpen });
  };

  // Handle rename
  const handleRename = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`/api/chat/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName }),
      });
      if (res.ok) {
        onUpdateSessions(); // refresh session list
        setShowRenameModal(false);
        setOpenMenu({ id: null, open: false });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this chat?")) return;
    try {
      const res = await fetch(`/api/chat/${session.id}`, { method: "DELETE" });
      if (res.ok) {
        onUpdateSessions(); // refresh session list
        setOpenMenu({ id: null, open: false });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 text-white/80 hover:bg-white/10 rounded-lg text-sm cursor-pointer group  ">
      {/* Session Link */}
      <Link href={`/${session.id}`} className="flex-1 flex items-center gap-3">
        <p className="truncate"><MarkdownRenderer content={session.session_name} ></MarkdownRenderer></p>
      </Link>

      {/* Three dots menu */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={toggleMenu}
          className="flex items-center justify-center h-6 w-6 hover:bg-black/20 rounded-lg z-50"
        >
          <Image src={assets.three_dots} alt="menu" className="w-4" />
        </button>

        {/* Dropdown menu */}
        {isOpen &&
          createPortal(
            <div
              className="absolute bg-gray-700 text-white rounded-xl w-max p-2 z-[9999] shadow-lg"
              style={{
                top: menuRef.current.getBoundingClientRect().bottom + window.scrollY,
                left: menuRef.current.getBoundingClientRect().right - 144,
              }}
            >
              <div
                className="flex items-center text-white gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer"
                onClick={() => setShowRenameModal(true)}
              >
                <Image src={assets.pencil_icon} alt="Rename" className="w-4" />
                <p>Rename</p>
              </div>
              <div
                className="flex items-center gap-3 text-white hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer"
                onClick={handleDelete}
              >
                <Image src={assets.delete_icon} alt="Delete" className="w-4" />
                <p>Delete</p>
              </div>
            </div>,
            document.body
          )}
      </div>

      {/* Rename Modal */}
      {showRenameModal &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50">
            <div className="bg-[#212327] p-6 rounded-lg w-80 flex flex-col gap-4">
              <h2 className="text-white text-lg">Rename Chat</h2>
              <input
                className="w-full p-2 rounded bg-gray-800 text-white outline-none"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                  onClick={() => setShowRenameModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-primary rounded hover:opacity-90"
                  onClick={handleRename}
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
