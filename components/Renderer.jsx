"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // optional dark theme

const MarkdownRenderer = ({ content }) => {
    return (
        <div className="prose prose-invert max-w-full break-words">
            <ReactMarkdown
                children={content}
                rehypePlugins={[rehypeSanitize, rehypeHighlight]}
            />
        </div>
    );
};

export default MarkdownRenderer;
