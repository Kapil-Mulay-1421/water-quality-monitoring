'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface ChatBotProps {
  context: any;
}

export function ChatBot({ context }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context: context || { status: 'No live telemetry available' }
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch');
      }
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';

      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const textChunk = decoder.decode(value, { stream: true });
        assistantMsg += textChunk;
        
        setMessages((prev) => {
          const lastIndex = prev.length - 1;
          const updated = [...prev];
          updated[lastIndex] = { role: 'assistant', content: assistantMsg };
          return updated;
        });
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100 hover:scale-110'} z-50`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        <div className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-t-2xl flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold">🤖 Splashy</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-blue-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-4">
              <p>Hi! I can answer questions about the current water quality data.</p>
              <p className="mt-2 text-xs">Try asking: &quot;Is the water potable?&quot;</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white self-end rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 self-start rounded-tl-sm shadow-sm'}`}>
              {m.content}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="self-start text-gray-500 p-2">
              <Loader2 className="animate-spin w-5 h-5" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="shrink-0 p-3 bg-white border-t border-gray-200 rounded-b-2xl flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the telemetry..."
            className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 transition-colors shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
