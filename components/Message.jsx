"use client";

import { assets } from "../assets/assets";
import Image from "next/image";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

const Message = ({
  role,
  content,
  onEdit,
  onRegenerate,
  onLike,
  onDislike,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isUser = role === "user";

  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div className={`flex flex-col w-full mb-8 ${isUser ? "items-end" : ""}`}>
        <div
          className={`
            group relative flex max-w-2xl py-3 px-4 rounded-2xl 
            border transition-all duration-200
            ${
              isUser
                ? "bg-white border-[#DCE8FF] text-gray-800 shadow-sm"
                : "bg-blue-50/40 border-[#C7DAFF] shadow-sm backdrop-blur-md"
            }
          `}
        >
          {/* Hover Action Buttons */}
          <div
            className={`
              opacity-0 group-hover:opacity-100 absolute flex gap-3 
              transition-all duration-200
              ${isUser ? "-left-24 top-2" : "left-14 -bottom-6"}
            `}
          >
            {isUser ? (
              <>
                <Image
                  src={assets.copy_icon}
                  alt="Copy"
                  className="w-4 cursor-pointer hover:scale-110 transition"
                  onClick={handleCopy}
                />
                <Image
                  src={assets.pencil_icon}
                  alt="Edit"
                  className="w-4 cursor-pointer hover:scale-110 transition"
                  onClick={() => onEdit && onEdit(content)}
                />
              </>
            ) : (
              <>
                <Image
                  src={assets.copy_icon}
                  alt="Copy"
                  className="w-4 cursor-pointer hover:scale-110 transition"
                  onClick={handleCopy}
                />
                <Image
                  src={assets.regenerate_icon}
                  alt="Regenerate"
                  className="w-4 cursor-pointer hover:scale-110 transition"
                  onClick={() => onRegenerate && onRegenerate()}
                />
                <Image
                  src={assets.like_icon}
                  alt="Like"
                  className="w-4 cursor-pointer hover:scale-110 transition"
                  onClick={() => onLike && onLike()}
                />
                <Image
                  src={assets.dislike_icon}
                  alt="Dislike"
                  className="w-4 cursor-pointer hover:scale-110 transition"
                  onClick={() => onDislike && onDislike()}
                />
              </>
            )}
          </div>

          {/* Message Content */}
          {isUser ? (
            <span className="leading-relaxed font-medium text-gray-900">
              {content}
            </span>
          ) : (
            <div className="flex gap-3 w-full items-start">
              {/* Gini Logo Bubble */}
              <div className="h-10 w-10 rounded-xl bg-white border border-[#D5E3FF] shadow-sm flex items-center justify-center">
                <Image
                  src={assets.logo_icon}
                  alt="Gini Logo"
                  className="h-6 w-6 opacity-90"
                />
              </div>

              {/* Markdown */}
              <div className="space-y-2 w-full overflow-auto prose prose-blue max-w-none text-gray-900">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
