"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // Light theme

const MarkdownRenderer = ({ content }) => {
  return (
    <div
      className="
        prose max-w-full break-words
        text-gray-900 
        prose-headings:text-gray-900
        prose-a:text-blue-600 hover:prose-a:text-blue-800
        prose-strong:text-gray-900

        prose-code:bg-blue-50
        prose-code:text-blue-700
        prose-code:px-1.5 prose-code:py-0.5
        prose-code:rounded-md
        
        prose-pre:bg-blue-50
        prose-pre:border prose-pre:border-blue-200
        prose-pre:rounded-xl
        prose-pre:p-4
        prose-pre:overflow-x-auto
      "
    >
      <ReactMarkdown rehypePlugins={[rehypeSanitize, rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
