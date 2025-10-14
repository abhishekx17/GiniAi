import MarkdownRenderer from "./MarkdownRenderer";

const ChatMessage = ({ message }) => {
    return (
        <div
            className={`my-2 p-2 rounded-lg ${message.role === "assistant" ? "bg-gray-800" : "bg-blue-700"
                }`}
        >
            <MarkdownRenderer content={message.content} />
        </div>
    );
};
