import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  { emoji: "💰", label: "Deposit Issue" },
  { emoji: "💸", label: "Withdrawal Issue" },
  { emoji: "⚠️", label: "Site Issue" },
  { emoji: "👤", label: "Account Help" },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const resp = await supabase.functions.invoke("chat", {
        body: { messages: newMessages },
      });

      if (resp.error) throw resp.error;
      setMessages([...newMessages, { role: "assistant", content: resp.data.reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Float button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-50 hover:scale-110 active:scale-95 transition-transform"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 w-[340px] h-[480px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <h3 className="text-primary-foreground font-semibold text-sm">🤖 AI Support</h3>
            <button onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="bg-secondary rounded-lg rounded-bl-sm px-3 py-2 text-sm">
                  Hi! I'm your AI assistant. How can I help you today?
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((a) => (
                    <button
                      key={a.label}
                      onClick={() => sendMessage(a.label)}
                      className="bg-secondary text-foreground text-xs px-3 py-1.5 rounded-full hover:bg-accent transition-colors"
                    >
                      {a.emoji} {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-secondary rounded-lg rounded-bl-sm px-3 py-2 text-sm text-muted-foreground max-w-[80%]">
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Type a message..."
              className="flex-1 bg-input text-foreground text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading}
              className="bg-primary text-primary-foreground p-2 rounded-lg hover:brightness-110 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
