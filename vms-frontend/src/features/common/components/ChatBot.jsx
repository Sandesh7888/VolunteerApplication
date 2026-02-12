import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useApi } from '../../../useApi';
import { useNavigate } from 'react-router-dom';

export default function ChatBot() {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I am your AI assistant. Ask me anything about events or volunteering!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Reset or load chat history when user changes
  useEffect(() => {
    if (user?.id) {
        const saved = localStorage.getItem(`chat_history_${user.id}`);
        if (saved) {
            setMessages(JSON.parse(saved));
        } else {
            setMessages([
                { type: 'bot', text: 'Hi! How can I help you today?' }
            ]);
        }
    } else {
        setMessages([]);
    }
  }, [user?.id]);

  // Save messages to local storage whenever they change
  useEffect(() => {
    if (user?.id && messages.length > 0) {
        localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user?.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiCall('/chat', {
        method: 'POST',
        body: { message: userMsg }
      });

      setMessages(prev => [...prev, { type: 'bot', text: response.response }]);

    } catch (err) {
      console.error("ChatBot Error:", err);
      setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I'm having trouble connecting to the server. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
        setMessages([
            { type: 'bot', text: 'Hi! How can I help you today?' }
        ]);
        if (user?.id) {
            localStorage.removeItem(`chat_history_${user.id}`);
        }
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Messages Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 border border-slate-100 overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot size={20} />
              </div>
              <span className="font-bold">Volunteer Assistant</span>
            </div>
            <div className="flex items-center gap-1">
                <button 
                  onClick={handleClear}
                  className="hover:bg-white/20 p-1 rounded-full transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-1 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                    msg.type === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                 <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm">
                    <Loader2 size={16} className="animate-spin text-indigo-500" />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-xl transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg shadow-indigo-600/30 hover:scale-110 transition-all duration-300 group"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} className="fill-current" />}
        {!isOpen && (
           <span className="absolute -top-1 -right-1 flex h-4 w-4">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
           </span>
        )}
      </button>
    </div>
  );
}
