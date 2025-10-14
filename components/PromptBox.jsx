'use client';
import React, { useState, useRef } from "react";
import Image from "next/image";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";

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

  const handleArrowClick = () => handleSend();

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]); // store file, do NOT send yet
    }
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleSend(); }}
      className="w-full max-w-2xl bg-[#404045] p-4 rounded-3xl mt-4 transition-all"
    >
      <textarea
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent text-white placeholder-gray-400"
        rows={2}
        placeholder="Message Deepseek"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (prompt.trim()) handleArrowClick();
          }
        }}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Show selected file name */}
      {file && (
        <p className="text-gray-300 text-sm mt-1 truncate">{file.name}</p>
      )}

      <div className="flex items-center justify-between text-sm mt-3">
        {/* Deepthink / Search Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`flex items-center gap-2 border px-2 py-1 rounded-full cursor-pointer transition ${mode.thinking ? " text-white bg-blue-500/80 text-white" : "border-gray-300/40 hover:bg-gray-500/20 text-gray-200"
              }`}
            onClick={() => toggleMode("thinking")}
          >
            <Image className="h-5 w-5" src={assets.deepthink_icon} alt="Deepthink" />
            Deepthink (R1)
          </button>

          <button
            type="button"
            className={`flex items-center gap-2 border px-2 py-1 rounded-full cursor-pointer transition ${mode.searching ? "text-white bg-blue-500/80 " : "border-gray-300/40 hover:bg-gray-500/20 text-gray-200"
              }`}
            onClick={() => toggleMode("searching")}
          >
            <Image className="h-5 w-5" src={assets.search_icon} alt="Search" />
            Search
          </button>
        </div>

        {/* Pin Icon triggers file picker */}
        <div className="flex items-center gap-2">
          <div
            className="cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <Image className="w-4" src={assets.pin_icon} alt="Pin" />
          </div>

          {/* Arrow Icon sends everything */}
          <motion.div
            whileTap={{ scale: 0.9 }}
            animate={isArrowAnimating ? { rotate: [0, 20, -20, 0] } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
            className={`${prompt || file ? "bg-primary" : "bg-[#71717a]"} rounded-full p-2 cursor-pointer`}
            onClick={handleArrowClick}

          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt || file ? assets.arrow_icon : assets.arrow_icon_dull}
              alt="Send"
            />
          </motion.div>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
