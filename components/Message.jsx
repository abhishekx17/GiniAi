'use client';

import { assets } from "../assets/assets";
import Image from "next/image";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

const Message = ({ role, content, onEdit, onRegenerate, onLike, onDislike }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div className={`flex flex-col w-full mb-8 ${role === "user" ? "items-end" : ""}`}>
        <div
          className={`group relative flex max-w-2xl py-3 px-4 rounded-xl ${role === "user" ? "bg-[#414158]" : "gap-3 bg-[#2a2b32] px-3"
            }`}
        >
          {/* Hover action buttons */}
          <div
            className={`opacity-0 group-hover:opacity-100 absolute flex gap-2 ${role === "user" ? "-left-16 top-2.5" : "left-9 -bottom-6"
              } transition-all`}
          >
            {role === "user" ? (
              <>
                <Image
                  src={assets.copy_icon}
                  alt={copied ? "Copied!" : "Copy"}
                  className="w-4 cursor-pointer"
                  onClick={handleCopy}
                  title={copied ? "Copied!" : "Copy"}
                />
                <Image
                  src={assets.pencil_icon}
                  alt="Edit"
                  className="w-4 cursor-pointer"
                  onClick={() => onEdit && onEdit(content)}
                  title="Edit"
                />
              </>
            ) : (
              <>
                <Image
                  src={assets.copy_icon}
                  alt={copied ? "Copied!" : "Copy"}
                  className="w-4 cursor-pointer"
                  onClick={handleCopy}
                  title={copied ? "Copied!" : "Copy"}
                />
                <Image
                  src={assets.regenerate_icon}
                  alt="Regenerate"
                  className="w-4 cursor-pointer"
                  onClick={() => onRegenerate && onRegenerate()}
                  title="Regenerate"
                />
                <Image
                  src={assets.like_icon}
                  alt="Like"
                  className="w-4 cursor-pointer"
                  onClick={() => onLike && onLike()}
                  title="Like"
                />
                <Image
                  src={assets.dislike_icon}
                  alt="Dislike"
                  className="w-4 cursor-pointer"
                  onClick={() => onDislike && onDislike()}
                  title="Dislike"
                />
              </>
            )}
          </div>

          {/* Message Content */}
          {role === "user" ? (
            <span className="text-white/90">{content}</span>
          ) : (
            <div className="flex gap-3 w-full">
              <Image
                src={assets.logo_icon}
                alt="Bot Logo"
                className="h-9 w-9 p-1 border border-white/15 rounded-full"
              />
              <div className="space-y-2 w-full overflow-auto text-white/80">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
