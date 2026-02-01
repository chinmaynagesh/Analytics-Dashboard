import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Minimize2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your SolarOS AI assistant. I can help you analyze your solar plants, predict maintenance needs, optimize cleaning schedules, and answer questions about your energy production. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToGemini = async (userMessage, conversationHistory) => {
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);

    // Prepare conversation history for context
    const conversationHistory = updatedMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get AI response from Gemini
    const aiResponseContent = await sendMessageToGemini(inputMessage, conversationHistory);

    const aiResponse = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponseContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedPrompts = [
    "What's the soiling status across all plants?",
    "Show me today's performance",
    "Optimize cleaning schedule",
    "Revenue forecast for next month"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#e87722] to-[#d66815] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 z-50"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#4ade80] rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-[#1a1a1f] rounded-2xl shadow-2xl flex flex-col z-50 border border-[#2a2a35]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#e87722] to-[#d66815] p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">SolarOS AI</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#4ade80] rounded-full" />
                  <span className="text-xs text-white/90">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#e87722] to-[#d66815] text-white'
                      : 'bg-[#25252d] text-white border border-[#3a3a45]'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3 h-3 text-[#e87722]" />
                      <span className="text-xs text-[#9ca3af]">AI Assistant</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-60 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#25252d] border border-[#3a3a45] rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#e87722] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#e87722] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#e87722] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-[#9ca3af]">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length === 1 && (
            <div className="px-4 pb-3">
              <div className="text-xs text-[#6b7280] mb-2">Suggested prompts:</div>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(prompt)}
                    className="px-3 py-1.5 bg-[#25252d] hover:bg-[#2a2a35] border border-[#3a3a45] rounded-lg text-xs text-white transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-[#2a2a35]">
            <div className="flex items-center gap-2">
              <div className="chatbot-input-container">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything about your solar plants..."
                  className="chatbot-input"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="chatbot-send-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-[#6b7280] mt-2 text-center">
              Powered by SolarOS AI • Press Enter to send
            </div>
          </div>
        </div>
      )}
    </>
  );
}
