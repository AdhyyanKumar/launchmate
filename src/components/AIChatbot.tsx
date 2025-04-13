'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useThemeStore, getThemeClasses } from '../store/themeStore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function AIChatbot() {
  const { theme } = useThemeStore();
  const themeClasses = getThemeClasses(theme);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI assistant. How can I help you with your startup journey today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
  
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
  
      const data = await res.json();
  
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || 'Sorry, I couldn’t understand that.',
        sender: 'bot',
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Something went wrong while talking to the assistant.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };
  

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 ${themeClasses.card} rounded-lg shadow-xl border ${themeClasses.border} z-50`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-600" />
          <h3 className={`font-semibold ${themeClasses.text}`}>AI Assistant</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className={`${themeClasses.text} hover:opacity-70`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : `${themeClasses.button} ${themeClasses.text}`
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
              {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className={`flex-1 resize-none p-2 rounded-lg ${themeClasses.button} ${themeClasses.text} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-2 rounded-lg ${
              input.trim()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}