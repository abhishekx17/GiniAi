"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";

const PromptBox = ({ onSend, isLoading, setIsLoading }) => {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState({ thinking: false, searching: false });
  const [isArrowAnimating, setIsArrowAnimating] = useState(false);

  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (!prompt && !file) return;

    setIsArrowAnimating(true);
    setIsLoading(true);

    try {
      setPrompt("");
      await onSend(prompt);
      setFile(null);
      setMode({ thinking: false, searching: false });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsArrowAnimating(false);
      setIsLoading(false);
    }
  };

  const toggleMode = (key) => {
    setMode((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      className="
        w-full max-w-2xl mx-auto
         bg-gradient-to-b from-blue-50 via-white to-blue-100 backdrop-blur-xl
        p-4 rounded-3xl border border-blue-200/40
        shadow-[0_4px_20px_rgba(0,0,50,0.05)]
        transition-all
      "
    >
      <textarea
        className="
          outline-none w-full resize-none overflow-hidden
          bg-transparent text-gray-800 placeholder-gray-500
          text-base font-medium
        "
        rows={2}
        placeholder="Ask Gini anything…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (prompt.trim()) handleSend();
          }
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files?.[0])}
        className="hidden"
      />

      {file && (
        <p className="text-gray-600 text-sm mt-1 truncate font-medium">
          {file.name}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => toggleMode("thinking")}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full
              border transition font-medium
              ${
                mode.thinking
                  ? "bg-blue-600 text-white border-blue-600 shadow"
                  : "border-blue-300 hover:bg-blue-100 text-blue-700"
              }
            `}
          >
            <Image
              src={assets.deepthink_icon}
              alt="Think"
              width={18}
              height={18}
            />
            Think
          </button>

          <button
            type="button"
            onClick={() => toggleMode("searching")}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full
              border transition font-medium
              ${
                mode.searching
                  ? "bg-blue-600 text-white border-blue-600 shadow"
                  : "border-blue-300 hover:bg-blue-100 text-blue-700"
              }
            `}
          >
            <Image
              src={assets.search_icon}
              alt="Search"
              width={18}
              height={18}
            />
            Search
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="cursor-pointer hover:opacity-70"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image src={assets.pin_icon} alt="Attach" width={20} height={20} />
          </div>

          <motion.div
            whileTap={{ scale: 0.9 }}
            animate={
              isArrowAnimating ? { rotate: [0, 20, -20, 0] } : { rotate: 0 }
            }
            transition={{ duration: 0.4 }}
            onClick={handleSend}
            className={`
              p-2 rounded-full cursor-pointer
              ${
                prompt || file
                  ? "bg-blue-600 shadow-md shadow-blue-300"
                  : "bg-blue-200/60"
              }
            `}
          >
            <Image
              src={prompt || file ? assets.arrow_icon : assets.arrow_icon_dull}
              alt="Send"
              width={16}
              height={16}
            />
          </motion.div>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
