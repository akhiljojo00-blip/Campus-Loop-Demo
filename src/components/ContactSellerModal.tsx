import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  X, 
  Send, 
  User, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  MessageCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  time: string;
}

export const ContactSellerModal: React.FC = () => {
  const { contactingProduct, setContactingProduct, setSelectedProduct } = useCampus();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'seller',
      text: `Hey! Thanks for looking at my listing for "${contactingProduct?.title || 'this item'}". Feel free to ask any questions or suggest a campus meetup spot!`,
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!contactingProduct) return null;

  const quickPrompts = [
    `Hi ${contactingProduct.sellerName.split(' ')[0]}! Is this still available to pick up today?`,
    `Can we meet at ${contactingProduct.campusLocation} around 3:30 PM?`,
    `Is the condition suitable for first-year syllabus practicals?`,
    `Would you accept ₹${Math.max(10, contactingProduct.price - 40)} if I pay cash on the spot?`
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'buyer',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Trigger simulated seller response
    setIsTyping(true);
    setTimeout(() => {
      let replyText = `Awesome! Yes, that works for me. I will bring the ${contactingProduct.title.split(' ')[0]} to ${contactingProduct.campusLocation}. Look for me in the lobby!`;
      if (text.toLowerCase().includes('price') || text.toLowerCase().includes('accept') || text.includes('₹')) {
        replyText = `I can do that! Let us meet at ${contactingProduct.campusLocation} and you can inspect it in person.`;
      }

      const sellerReply: ChatMessage = {
        id: `seller-${Date.now()}`,
        sender: 'seller',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, sellerReply]);
      setIsTyping(false);
    }, 1100);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setContactingProduct(null)}
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E7E3DC] shadow-warm-lg overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#153225] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm text-emerald-200">
              {contactingProduct.sellerName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm text-white">
                  {contactingProduct.sellerName}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[11px] text-[#FAF8F5]/70 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-300" />
                {contactingProduct.campusLocation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedProduct(contactingProduct);
                setContactingProduct(null);
              }}
              className="text-xs text-white/80 hover:text-white underline cursor-pointer"
            >
              Back to item
            </button>
            <button
              onClick={() => setContactingProduct(null)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Item mini preview strip */}
        <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#E7E3DC] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 truncate">
            <img 
              src={contactingProduct.imageUrl} 
              alt={contactingProduct.title} 
              className="w-8 h-8 rounded-lg object-cover bg-stone-200 shrink-0" 
            />
            <div className="truncate">
              <span className="font-serif font-bold text-stone-900 block truncate">
                {contactingProduct.title}
              </span>
              <span className="text-[10px] text-stone-500">
                Condition: {contactingProduct.condition}
              </span>
            </div>
          </div>
          <span className="font-serif font-bold text-sm text-[#153225] shrink-0">
            ₹{contactingProduct.price}
          </span>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/50">
          <div className="text-center my-2">
            <span className="text-[10px] bg-stone-200/70 text-stone-600 px-2.5 py-1 rounded-full">
              Simulated Campus Chat Demo • Peer to Peer
            </span>
          </div>

          {messages.map((m) => (
            <div 
              key={m.id}
              className={`flex flex-col ${m.sender === 'buyer' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'buyer'
                    ? 'bg-[#153225] text-white rounded-br-xs'
                    : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-xs shadow-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-stone-400 mt-1 px-1">
                {m.time}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-stone-200 w-fit text-[11px] text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-[#153225] animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#153225] animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#153225] animate-bounce delay-200"></span>
              <span className="ml-1 text-[10px]">{contactingProduct.sellerName.split(' ')[0]} is typing...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="p-2.5 bg-white border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-stone-400 shrink-0 uppercase tracking-wider pl-1">
            Quick:
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] text-stone-700 hover:text-[#153225] hover:bg-[#E1EDE5] bg-stone-100/90 px-2.5 py-1 rounded-full shrink-0 transition-colors border border-stone-200/60 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-[#E7E3DC] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${contactingProduct.sellerName.split(' ')[0]}...`}
            className="flex-1 py-2 px-3.5 rounded-xl border border-stone-200 text-xs focus:border-[#153225] focus:ring-1 focus:ring-[#153225] outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-[#153225] text-white hover:bg-[#1E4333] disabled:opacity-40 transition-opacity cursor-pointer"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
