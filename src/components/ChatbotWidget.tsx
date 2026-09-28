import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, Sparkles, Tag, Package, ExternalLink, ArrowRight, CornerDownLeft } from 'lucide-react';
import api from '../api/client';
import { Product } from '../types';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  products?: Product[];
  actionLink?: { text: string; url: string };
  coupons?: { code: string; desc: string }[];
  timestamp: string;
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hi there! 👋 I am EasyBot, your AI shopping assistant. How can I help you today?',
      timestamp: 'Just now',
    },
  ]);

  // Load catalog once for instant in-chat recommendations
  useEffect(() => {
    api.get<any>('/products', { params: { pageSize: 50 } })
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        setCatalog(items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    '🔍 Best Headphones',
    '💻 Laptops for Work',
    '🏷️ Any Coupons?',
    '📦 How to track order?',
    '🔄 Return Policy',
  ];

  const handleSend = (userText: string) => {
    const text = userText.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      try {
        const botResponse = generateBotResponse(text);
        setMessages((prev) => [...prev, botResponse]);
      } catch (err) {
        console.error('Error generating bot response:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'bot',
            text: "I'm having a momentary hiccup searching the catalog, but our store is fully open! Feel free to browse products or check your orders.",
            actionLink: { text: 'Explore All Products', url: '/products' },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    }, 500);
  };

  const generateBotResponse = (query: string): Message => {
    const lower = query.toLowerCase();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Coupons
    if (lower.includes('coupon') || lower.includes('discount') || lower.includes('promo') || lower.includes('code') || lower.includes('offer')) {
      return {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Here are our verified promo coupons active right now on EasyShop! Use them at checkout:',
        coupons: [
          { code: 'WELCOME20', desc: '20% off for all shoppers (up to ₹1,000)' },
          { code: 'SAVE500', desc: 'Flat ₹500 off on orders above ₹2,500' },
          { code: 'FREESHIP', desc: '100% Free Express Shipping (save ₹150)' },
        ],
        timestamp: time,
      };
    }

    // 2. Order Tracking
    if (lower.includes('track') || lower.includes('status') || lower.includes('where is my order') || lower.includes('delivery')) {
      return {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'All orders on EasyShop feature live, real-time tracking via WebSockets! You can view your step-by-step dispatch status on your Orders page.',
        actionLink: { text: 'View My Orders & Track Live', url: '/orders' },
        timestamp: time,
      };
    }

    // 3. Return & Refund Policy
    if (lower.includes('return') || lower.includes('refund') || lower.includes('policy') || lower.includes('cancel')) {
      return {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'EasyShop offers a hassle-free 7-day return and replacement policy on all verified products! If an item is defective or does not match description, you can initiate a return or contact your merchant directly.',
        timestamp: time,
      };
    }

    // 4. Product Search / Recommendation
    const safeCatalog = Array.isArray(catalog) ? catalog : [];
    const isLaptopQuery = lower.includes('laptop') || lower.includes('computer') || lower.includes('macbook') || lower.includes('work');
    const isHeadphoneQuery = lower.includes('headphone') || lower.includes('audio') || lower.includes('earphone') || lower.includes('sound') || lower.includes('music');
    const isKeyboardQuery = lower.includes('keyboard') || lower.includes('gaming');
    const isClothesQuery = lower.includes('hoodie') || lower.includes('cloth') || lower.includes('wear') || lower.includes('fashion');

    const matchedProducts = safeCatalog.filter((p) => {
      const pName = (p.name || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      const pCat = (p.categoryName || '').toLowerCase();
      const combined = `${pName} ${pDesc} ${pCat}`;

      if (isLaptopQuery && (pCat.includes('laptop') || combined.includes('ultrabook') || combined.includes('laptop') || combined.includes('computer'))) {
        return true;
      }
      if (isHeadphoneQuery && (pCat.includes('audio') || combined.includes('headphone') || combined.includes('audio'))) {
        return true;
      }
      if (isKeyboardQuery && (combined.includes('keyboard') || combined.includes('gaming'))) {
        return true;
      }
      if (isClothesQuery && (combined.includes('hoodie') || combined.includes('cotton') || combined.includes('fashion'))) {
        return true;
      }

      // Token match with basic stemming (stripping 's')
      const qTerms = lower.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
      return qTerms.some((term) => {
        const stem = term.endsWith('s') ? term.slice(0, -1) : term;
        return combined.includes(term) || (stem.length > 2 && combined.includes(stem));
      });
    });

    if (matchedProducts.length > 0) {
      return {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `I found ${matchedProducts.length} top match${matchedProducts.length > 1 ? 'es' : ''} for "${query}" in our catalog:`,
        products: matchedProducts.slice(0, 3),
        timestamp: time,
      };
    }

    // Fallback recommendations if catalog exists
    if (safeCatalog.length > 0) {
      return {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `I couldn't find an exact match for "${query}", but here are some of our trending picks from the store:`,
        products: safeCatalog.slice(0, 2),
        actionLink: { text: 'Browse Full Store Catalog', url: '/products' },
        timestamp: time,
      };
    }

    // 5. General Fallback
    return {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: "I can help you discover products, suggest discounts, check order tracking, or explain our store policies. Try clicking one of the suggestions below!",
      timestamp: time,
    };
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 p-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full shadow-xl shadow-indigo-300 transition-all hover:scale-105"
          title="Chat with EasyBot"
        >
          <Bot className="w-6 h-6 animate-bounce" />
          <span className="hidden sm:inline text-xs font-bold tracking-tight pr-1">Shop Assistant</span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight">EasyBot AI</h3>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-400 text-emerald-950 rounded-full">Online</span>
                </div>
                <p className="text-[11px] text-indigo-100">Live Shopping & Support Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-2xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Render Embedded Products */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      {m.products.map((p) => (
                        <Link
                          key={p.productID}
                          to={`/products/${p.productID}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 transition-all text-left group"
                        >
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 group-hover:text-indigo-600 truncate">{p.name}</p>
                            <p className="text-indigo-600 font-bold">₹{p.price.toLocaleString('en-IN')}</p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Render Embedded Coupons */}
                  {m.coupons && (
                    <div className="mt-2.5 space-y-1.5">
                      {m.coupons.map((c) => (
                        <div key={c.code} className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-emerald-800 tracking-wide text-[11px]">{c.code}</span>
                            <p className="text-[10px] text-emerald-700">{c.desc}</p>
                          </div>
                          <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Action Link */}
                  {m.actionLink && (
                    <Link
                      to={m.actionLink.url}
                      onClick={() => setIsOpen(false)}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                    >
                      <span>{m.actionLink.text}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 bg-white rounded-2xl border border-slate-200 w-16">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q.replace(/^[^\w]+/, ''))}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-[10px] font-semibold transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about products, orders..."
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
