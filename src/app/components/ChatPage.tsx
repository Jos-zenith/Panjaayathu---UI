import { useState, useRef, useEffect } from "react"; 
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Textarea } from "@/app/components/ui/textarea";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { projectId, publicAnonKey } from "@/utils/supabase/info";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export function ChatPage() {
  const [userId] = useState(() => `user-${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Vanakkam! 🙏 I'm here to listen and support you. Whether it's family dynamics, relationship concerns, or any stress you're facing, feel free to share in English, Tamil, or even Tanglish. How are you feeling today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9caf0ac/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            message: input,
            userId,
            chatHistory: messages,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please make sure the Gemini API key is set up correctly. You can try again in a moment.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[80vh] flex flex-col border-stone-300">
          <CardHeader className="border-b border-stone-300 bg-forest-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-forest-600 to-forest-700 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-forest-800">Conflict Coach</CardTitle>
                <CardDescription className="text-stone-600">
                  Your culturally-aware wellness companion
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-forest-600"
                          : "bg-gradient-to-br from-forest-600 to-forest-700"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-[80%] ${
                        message.role === "user" ? "flex justify-end" : ""
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-forest-600 text-white"
                            : "bg-white border border-stone-300 text-stone-900"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 px-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-forest-600 to-forest-700 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-stone-300 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-stone-300 p-4 bg-white">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share what's on your mind... (English, Tamil, or Tanglish)"
                  className="min-h-[60px] resize-none border-stone-300 focus:ring-forest-600"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-terracotta-600 hover:bg-terracotta-700 text-white"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-gradient-to-br from-forest-50 to-forest-100 border-forest-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1 text-forest-800">Family Dynamics</h3>
              <p className="text-xs text-stone-600">
                Navigate intergenerational conflicts with cultural sensitivity
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-stone-100 to-stone-200 border-stone-300">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1 text-stone-800">Irugapatru Approach</h3>
              <p className="text-xs text-stone-600">
                Communication over separation - building bridges, not walls
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-terracotta-50 to-terracotta-100 border-terracotta-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1 text-terracotta-800">Safe & Confidential</h3>
              <p className="text-xs text-stone-600">
                Low-stigma support in your language, your way
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}