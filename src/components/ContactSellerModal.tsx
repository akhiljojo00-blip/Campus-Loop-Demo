import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  X, 
  Send, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  DollarSign,
  ArrowRight,
  RotateCcw,
  Tag,
  AlertCircle,
  Star,
  Compass,
  MessageCircle
} from 'lucide-react';
import { BargainOffer } from '../types';

interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  time: string;
}

export const ContactSellerModal: React.FC = () => {
  const { 
    contactingProduct, 
    setContactingProduct, 
    setSelectedProduct, 
    makeOffer, 
    respondToOffer, 
    cancelOffer, 
    getOfferForListing,
    getSellerProfile,
    setSelectedSellerProfile,
    startLiveLocationSharing,
    liveLocationSession,
    setIsReviewModalOpen,
    setReviewingTarget
  } = useCampus();

  const [activeSubTab, setActiveSubTab] = useState<'bargain' | 'chat'>('bargain');
  const [offerInputPrice, setOfferInputPrice] = useState('');
  const [offerInputMessage, setOfferInputMessage] = useState('');
  const [isOfferSubmitting, setIsOfferSubmitting] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'seller',
      text: `Hey! Thanks for looking at my listing for "${contactingProduct?.title || 'this item'}". Feel free to make a price offer or propose a campus meetup spot!`,
      time: 'Just now'
    }
  ]);
  const [chatInputText, setChatInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!contactingProduct) return null;

  const currentOffer = getOfferForListing(contactingProduct.id);
  const sellerProfile = getSellerProfile(contactingProduct.sellerName);

  const quickPrompts = [
    `Hi ${contactingProduct.sellerName.split(' ')[0]}! Is this still available to pick up today?`,
    `Can we meet at ${contactingProduct.campusLocation} around 3:30 PM?`,
    `Is the condition suitable for first-year practicals?`,
    `Would you accept ₹${Math.max(10, contactingProduct.price - 40)} if I pay cash on the spot?`
  ];

  const handleProposeOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const offered = Number(offerInputPrice);
    if (!offerInputPrice || isNaN(offered) || offered <= 0) return;

    setIsOfferSubmitting(true);
    setTimeout(() => {
      const newOffer = makeOffer(
        contactingProduct.id,
        offered,
        offerInputMessage.trim() || `Would you consider ₹${offered} for in-person pickup today?`
      );
      setIsOfferSubmitting(false);
      setOfferInputPrice('');
      setOfferInputMessage('');

      // Simulate seller auto response after 1.2s in demo mode
      setTimeout(() => {
        if (offered >= contactingProduct.price * 0.85) {
          respondToOffer(newOffer.id, 'accept', undefined, `Deal! ₹${offered} works for me since we can meet directly on campus.`);
        } else {
          const counter = Math.round((offered + contactingProduct.price) / 2);
          respondToOffer(newOffer.id, 'counter', counter, `How about we meet in the middle at ₹${counter}?`);
        }
      }, 1500);
    }, 400);
  };

  const handleSendChatMessage = (textToSend?: string) => {
    const text = textToSend || chatInputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'buyer',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInputText('');

    setIsTyping(true);
    setTimeout(() => {
      let replyText = `Awesome! Yes, that works. I will bring the ${contactingProduct.title.split(' ')[0]} to ${contactingProduct.campusLocation}. Look for me in the lobby!`;
      if (text.toLowerCase().includes('price') || text.toLowerCase().includes('accept') || text.includes('₹')) {
        replyText = `I can do that! Check out the Bargain & Offers tab to lock in the agreed price.`;
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
        className="relative w-full max-w-xl bg-white dark:bg-[#14231D] rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg overflow-hidden flex flex-col h-[650px] max-h-[92vh] animate-in zoom-in-95 duration-150 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 bg-[#153225] dark:bg-[#0D1C15] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedSellerProfile(sellerProfile)}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-sm text-emerald-200 transition-colors cursor-pointer"
              title="View Seller Profile & Reviews"
            >
              {contactingProduct.sellerName.charAt(0)}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSellerProfile(sellerProfile)}
                  className="font-serif font-bold text-sm text-white hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{contactingProduct.sellerName}</span>
                  <span className="text-xs text-amber-300 flex items-center">
                    ★ {sellerProfile.averageRating}
                  </span>
                </button>
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
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Item mini preview strip */}
        <div className="px-4 py-2 bg-[#FAF8F5] dark:bg-stone-900 border-b border-[#E7E3DC] dark:border-emerald-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 truncate">
            <img 
              src={contactingProduct.imageUrl} 
              alt={contactingProduct.title} 
              className="w-8 h-8 rounded-lg object-cover bg-stone-200 shrink-0" 
            />
            <div className="truncate">
              <span className="font-serif font-bold text-stone-900 dark:text-stone-100 block truncate">
                {contactingProduct.title}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                Condition: {contactingProduct.condition}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-serif font-bold text-sm text-[#153225] dark:text-emerald-300">
              ₹{contactingProduct.agreedPrice || contactingProduct.price}
            </span>
            {contactingProduct.agreedPrice && (
              <span className="text-[9px] text-emerald-700 dark:text-emerald-400 block font-bold">
                Agreed Price
              </span>
            )}
          </div>
        </div>

        {/* Sub-Tabs: Bargain / Offers vs Campus Chat */}
        <div className="flex border-b border-[#E7E3DC] dark:border-emerald-900/60 bg-stone-50 dark:bg-stone-900 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('bargain')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'bargain'
                ? 'bg-white dark:bg-[#14231D] text-[#BA4E29] border-b-2 border-[#BA4E29]'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Make an Offer / Bargain</span>
            {currentOffer && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                currentOffer.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {currentOffer.status}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('chat')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'chat'
                ? 'bg-white dark:bg-[#14231D] text-[#153225] dark:text-emerald-300 border-b-2 border-[#153225] dark:border-emerald-400'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Campus Chat & Meetup</span>
          </button>
        </div>

        {/* Tab 1: Bargaining & Offer Flow (Feature 2) */}
        {activeSubTab === 'bargain' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/50 dark:bg-stone-900/40">
            
            {/* Price Overview Banner */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Original Listing Price
                </span>
                <span className="font-serif font-extrabold text-lg text-stone-800 dark:text-stone-200">
                  ₹{contactingProduct.price}
                </span>
              </div>

              {currentOffer ? (
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Current Offer Status
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    currentOffer.status === 'Accepted'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : currentOffer.status === 'Countered'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : currentOffer.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                  }`}>
                    {currentOffer.status}: ₹{currentOffer.counterPrice || currentOffer.offeredPrice}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                  Open to Peer Negotiation
                </span>
              )}
            </div>

            {/* Offer History Timeline */}
            {currentOffer ? (
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-emerald-900/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Bargain Negotiation History
                  </span>
                  {currentOffer.status === 'Pending' && (
                    <button
                      onClick={() => cancelOffer(currentOffer.id)}
                      className="text-[11px] text-red-600 hover:underline font-semibold"
                    >
                      Cancel Offer
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {currentOffer.history.map((step, idx) => (
                    <div 
                      key={idx}
                      className={`p-2.5 rounded-xl text-xs flex items-start justify-between gap-2 ${
                        step.sender === 'buyer' 
                          ? 'bg-[#FAECE6] dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-stone-900 dark:text-stone-100 block">
                          {step.sender === 'buyer' ? 'Your Proposal:' : `${contactingProduct.sellerName}'s Response:`}
                        </span>
                        <p className="text-stone-600 dark:text-stone-300 text-[11px] mt-0.5">
                          {step.message}
                        </p>
                      </div>
                      <span className="font-serif font-extrabold text-sm text-[#153225] dark:text-emerald-300 shrink-0">
                        ₹{step.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Seller Counter Response Actions (Simulated) */}
                {currentOffer.status === 'Countered' && (
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                    <button
                      onClick={() => respondToOffer(currentOffer.id, 'accept', currentOffer.counterPrice)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Accept Counter ₹{currentOffer.counterPrice} (+25 Coins)
                    </button>
                    <button
                      onClick={() => cancelOffer(currentOffer.id)}
                      className="py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {/* Deal Accepted State Actions */}
                {currentOffer.status === 'Accepted' && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Deal Agreed at ₹{currentOffer.counterPrice || currentOffer.offeredPrice}!</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      You both agreed on the price. Now meet on campus to inspect the item and finalize.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => startLiveLocationSharing(contactingProduct.campusLocation)}
                        className="py-1.5 px-3 rounded-lg bg-[#153225] dark:bg-emerald-800 text-white text-xs font-bold hover:bg-[#1E4333] transition-colors"
                      >
                        Share Live Meetup Proximity (15m)
                      </button>

                      <button
                        onClick={() => {
                          setReviewingTarget({
                            sellerName: contactingProduct.sellerName,
                            itemTitle: contactingProduct.title,
                            category: contactingProduct.category,
                            exchangeId: `exchange-${currentOffer.id}`
                          });
                          setIsReviewModalOpen(true);
                          setContactingProduct(null);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-[#BA4E29] text-white text-xs font-bold hover:bg-[#A34322] transition-colors"
                      >
                        Leave Peer Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Propose a New Offer Form */
              <form onSubmit={handleProposeOffer} className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-emerald-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                    Propose a Reasonable Counter-Price
                  </h3>
                  <span className="text-[10px] text-stone-400">
                    Bargain Demo Flow
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Your Proposed Price (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-sm text-stone-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={offerInputPrice}
                      onChange={(e) => setOfferInputPrice(e.target.value)}
                      placeholder={`e.g. ${Math.round(contactingProduct.price * 0.85)}`}
                      className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs bg-white dark:bg-stone-900 dark:text-white outline-none focus:border-[#BA4E29]"
                      min={1}
                      max={contactingProduct.price}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Note for Seller (Optional)
                  </label>
                  <input
                    type="text"
                    value={offerInputMessage}
                    onChange={(e) => setOfferInputMessage(e.target.value)}
                    placeholder="e.g. Ready for instant pickup at library steps!"
                    className="w-full py-2 px-3.5 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs bg-white dark:bg-stone-900 dark:text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isOfferSubmitting || !offerInputPrice}
                  className="w-full py-2.5 rounded-xl bg-[#BA4E29] hover:bg-[#A34322] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{isOfferSubmitting ? 'Sending Proposal...' : 'Send Price Offer to Seller'}</span>
                </button>
              </form>
            )}

            {/* Safety & Demo disclosure */}
            <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              * Note: The bargaining system provides an interactive simulation of offer/counter-offer state transitions. Price alterations only apply after explicit acceptance.
            </div>

          </div>
        )}

        {/* Tab 2: Campus Chat Feed */}
        {activeSubTab === 'chat' && (
          <>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/50 dark:bg-stone-900/40">
              <div className="text-center my-1">
                <span className="text-[10px] bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-full">
                  Simulated Campus Chat • Peer to Peer
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
                        : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200/90 dark:border-emerald-900/60 rounded-bl-xs shadow-xs'
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
                <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 w-fit text-[11px] text-stone-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#153225] dark:bg-emerald-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#153225] dark:bg-emerald-400 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#153225] dark:bg-emerald-400 animate-bounce delay-200"></span>
                  <span className="ml-1 text-[10px]">{contactingProduct.sellerName.split(' ')[0]} is typing...</span>
                </div>
              )}
            </div>

            {/* Quick Question Chips */}
            <div className="p-2 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-stone-400 shrink-0 uppercase tracking-wider pl-1">
                Quick:
              </span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChatMessage(q)}
                  className="text-[11px] text-stone-700 dark:text-stone-300 hover:text-[#153225] hover:bg-[#E1EDE5] dark:hover:bg-emerald-950 bg-stone-100/90 dark:bg-stone-800 px-2.5 py-1 rounded-full shrink-0 transition-colors border border-stone-200/60 dark:border-stone-700 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Message Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="p-3 bg-white dark:bg-stone-900 border-t border-[#E7E3DC] dark:border-emerald-900/60 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder={`Message ${contactingProduct.sellerName.split(' ')[0]}...`}
                className="flex-1 py-2 px-3.5 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs bg-white dark:bg-stone-800 dark:text-white focus:border-[#153225] outline-none"
              />
              <button
                type="submit"
                disabled={!chatInputText.trim()}
                className="p-2.5 rounded-xl bg-[#153225] dark:bg-emerald-700 text-white hover:bg-[#1E4333] disabled:opacity-40 transition-opacity cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
