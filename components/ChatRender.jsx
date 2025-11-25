import MarkdownRenderer from "./MarkdownRenderer";

const ChatMessage = ({ message }) => {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`
                my-3 p-4 rounded-2xl select-text
                transition-all duration-150
                border shadow-[0_2px_10px_rgba(0,0,0,0.06)]
                ${
                  isAssistant
                    ? "bg-blue-50/40 border-blue-200/70 text-blue-900 backdrop-blur-sm"
                    : "bg-white border-gray-200/70 text-gray-800"
                }
            `}
    >
      <MarkdownRenderer content={message.content} />
    </div>
  );
};

export default ChatMessage;
