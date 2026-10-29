import React, { useState, useEffect, useRef } from 'react';
import { useCampus } from '../context/CampusContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  X, 
  Send, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  ArrowRight,
  MessageCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { BargainOffer, ChatMessage } from '../types';

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
    setIsReviewModalOpen,
    setReviewingTarget,
    showToast,
    confirmExchange,
    exchanges,
    refreshBackendData
  } = useCampus();

  const { user } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'bargain' | 'chat'>('bargain');
  const [offerInputPrice, setOfferInputPrice] = useState('');
  const [offerInputMessage, setOfferInputMessage] = useState('');
  const [counterInputPrice, setCounterInputPrice] = useState('');
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [isOfferSubmitting, setIsOfferSubmitting] = useState(false);

  // Chat & Conversation State
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const isSellerOfListing = Boolean(user?.id && contactingProduct?.sellerId === user.id);
  const currentOffer = contactingProduct ? getOfferForListing(contactingProduct.id) : undefined;
  const sellerProfile = contactingProduct ? getSellerProfile(contactingProduct.sellerName) : null;
  const currentExchange = contactingProduct ? exchanges.find(e => e.listingId === contactingProduct.id && e.status !== 'cancelled') : undefined;

  // Initialize conversation & realtime chat
  useEffect(() => {
    if (!contactingProduct) return;

    let isMounted = true;
    let realtimeChannel: any = null;

    if (isSupabaseConfigured && user?.id) {
      setIsLoadingChat(true);

      const setupBackendChat = async () => {
        try {
          let convId: string | null = null;

          if (!isSellerOfListing) {
            // Buyer perspective: get or create conversation
            const { data: convData, error: convErr } = await supabase.rpc('get_or_create_conversation', {
              p_listing_id: contactingProduct.id
            });
            if (convErr) {
              console.warn('Could not initialize conversation:', convErr.message);
            } else if (convData?.id) {
              convId = convData.id;
            }
          } else {
            // Seller perspective: find latest conversation for this listing
            const { data: convList, error: listErr } = await supabase
              .from('conversations')
              .select('id')
              .eq('listing_id', contactingProduct.id)
              .order('updated_at', { ascending: false })
              .limit(1);

            if (!listErr && convList && convList.length > 0) {
              convId = convList[0].id;
            }
          }

          if (!isMounted) return;
          setConversationId(convId);

          if (convId) {
            // Fetch messages
            const { data: msgRows, error: msgErr } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('conversation_id', convId)
              .order('created_at', { ascending: true });

            if (!msgErr && msgRows && isMounted) {
              const mapped: ChatMessage[] = msgRows.map((r: any) => ({
                id: r.id,
                conversationId: r.conversation_id,
                senderId: r.sender_id,
                sender: r.message_type === 'system' || r.message_type === 'offer_event' 
                  ? 'system' 
                  : (r.sender_id === user.id ? 'buyer' : 'seller'),
                text: r.message,
                time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date(r.created_at).getTime(),
                messageType: r.message_type
              }));
              setMessages(mapped);
            }

            // Realtime subscription
            realtimeChannel = supabase.channel(`chat_conv_${convId}`)
              .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `conversation_id=eq.${convId}`
              }, (payload) => {
                const newRow = payload.new as any;
                if (!newRow) return;
                setMessages(prev => {
                  if (prev.some(m => m.id === newRow.id)) return prev;
                  const isMe = newRow.sender_id === user.id;
                  const s = newRow.message_type === 'system' || newRow.message_type === 'offer_event'
                    ? 'system'
                    : (isMe ? 'buyer' : 'seller');
                  return [...prev, {
                    id: newRow.id,
                    conversationId: newRow.conversation_id,
                    senderId: newRow.sender_id,
                    sender: s as 'buyer' | 'seller' | 'system',
                    text: newRow.message,
                    time: new Date(newRow.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    timestamp: new Date(newRow.created_at).getTime(),
                    messageType: newRow.message_type
                  }];
                });
              })
              .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'bargain_offers',
                filter: `conversation_id=eq.${convId}`
              }, () => {
                refreshBackendData();
              })
              .subscribe();
          }
        } catch (e) {
          console.warn('Error loading backend chat:', e);
        } finally {
          if (isMounted) setIsLoadingChat(false);
        }
      };

      setupBackendChat();
    } else {
      // Demo simulated initial greeting
      setMessages([
        {
          id: 'demo-msg-0',
          sender: 'seller',
          text: `Hey! Thanks for looking at my listing for "${contactingProduct.title}". Feel free to make a price offer or propose a campus meetup spot!`,
          time: 'Just now'
        }
      ]);
    }

    return () => {
      isMounted = false;
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [contactingProduct, user, isSellerOfListing, refreshBackendData]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!contactingProduct || !sellerProfile) return null;

  const quickPrompts = [
    `Hi ${contactingProduct.sellerName.split(' ')[0]}! Is this still available to pick up today?`,
    `Can we meet at ${contactingProduct.campusLocation} around 3:30 PM?`,
    `Is the condition suitable for first-year practicals?`,
    `Would you accept ₹${Math.max(10, contactingProduct.price - 40)} if I pay cash on the spot?`
  ];

  const handleProposeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const offered = Number(offerInputPrice);
    if (!offerInputPrice || isNaN(offered) || offered <= 0) return;

    if (isSellerOfListing) {
      showToast('Action Not Allowed', 'You are the seller of this item.', 'warning');
      return;
    }

    setIsOfferSubmitting(true);
    try {
      const newOffer = await makeOffer(
        contactingProduct.id,
        offered,
        offerInputMessage.trim() || `Would you consider ₹${offered} for in-person pickup today?`
      );
      setIsOfferSubmitting(false);
      setOfferInputPrice('');
      setOfferInputMessage('');

      if (!isSupabaseConfigured && newOffer) {
        // Simulate seller auto response after 1.5s in demo mode
        setTimeout(() => {
          if (offered >= contactingProduct.price * 0.85) {
            respondToOffer(newOffer.id, 'accept', undefined, `Deal! ₹${offered} works for me since we can meet directly on campus.`);
          } else {
            const counter = Math.round((offered + contactingProduct.price) / 2);
            respondToOffer(newOffer.id, 'counter', counter, `How about we meet in the middle at ₹${counter}?`);
          }
        }, 1500);
      }
    } catch {
      setIsOfferSubmitting(false);
    }
  };

  const handleSendChatMessage = async (textToSend?: string) => {
    const text = textToSend || chatInputText;
    if (!text.trim()) return;

    if (isSupabaseConfigured && user?.id && conversationId) {
      setChatInputText('');
      setIsSendingMessage(true);
      try {
        const { error } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message: text.trim(),
            message_type: 'text'
          });

        if (error) {
          showToast('Message Error', error.message, 'warning');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Send failed';
        showToast('Message Failed', msg, 'warning');
      } finally {
        setIsSendingMessage(false);
      }
      return;
    }

    // Demo simulation fallback
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
              onClick={() => refreshBackendData()}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Refresh conversation & offer status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
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
            {isSupabaseConfigured && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Live Supabase Realtime active"></span>
            )}
          </button>
        </div>

        {/* Tab 1: Bargaining & Offer Flow (Phase C1) */}
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
                  {currentOffer.status === 'Pending' && !isSellerOfListing && (
                    <button
                      onClick={() => cancelOffer(currentOffer.id)}
                      className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
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
                          {step.sender === 'buyer' ? 'Buyer Proposal:' : 'Seller Response:'}
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

                {/* Seller Actions on Pending Offer */}
                {currentOffer.status === 'Pending' && isSellerOfListing && (
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                    <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block">
                      Buyer offered ₹{currentOffer.offeredPrice}. Choose an action:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => respondToOffer(currentOffer.id, 'accept')}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Accept ₹{currentOffer.offeredPrice}
                      </button>
                      <button
                        onClick={() => setShowCounterInput(!showCounterInput)}
                        className="py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                      >
                        Counter
                      </button>
                      <button
                        onClick={() => respondToOffer(currentOffer.id, 'reject')}
                        className="py-2 px-3 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>

                    {showCounterInput && (
                      <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl space-y-2 mt-2">
                        <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">
                          Counter-Price (₹)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={counterInputPrice}
                            onChange={(e) => setCounterInputPrice(e.target.value)}
                            placeholder={`e.g. ${Math.round((currentOffer.offeredPrice + contactingProduct.price) / 2)}`}
                            className="flex-1 py-1.5 px-3 rounded-lg border border-stone-300 text-xs bg-white dark:bg-stone-900 outline-none"
                            min={1}
                          />
                          <button
                            onClick={() => {
                              const p = Number(counterInputPrice);
                              if (p > 0) {
                                respondToOffer(currentOffer.id, 'counter', p);
                                setShowCounterInput(false);
                              }
                            }}
                            className="py-1.5 px-3 bg-[#BA4E29] text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Buyer Actions on Countered Offer */}
                {currentOffer.status === 'Countered' && !isSellerOfListing && (
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                    <button
                      onClick={() => respondToOffer(currentOffer.id, 'accept', currentOffer.counterPrice)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Accept Counter ₹{currentOffer.counterPrice} (+25 Coins)
                    </button>
                    <button
                      onClick={() => cancelOffer(currentOffer.id)}
                      className="py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {/* Deal Accepted State Actions & Exchange Workflow (Phase C3) */}
                {currentOffer.status === 'Accepted' && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Deal Agreed at ₹{currentOffer.counterPrice || currentOffer.offeredPrice}!</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      Listing is reserved for campus exchange. Meet at {contactingProduct.campusLocation} to verify the item.
                    </p>

                    {currentExchange && (
                      <div className="p-2.5 bg-white dark:bg-stone-900 rounded-lg border border-emerald-200 dark:border-emerald-900/60 text-[11px] space-y-1">
                        <div className="flex items-center justify-between font-semibold text-stone-700 dark:text-stone-300">
                          <span>Handover Status:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                            {currentExchange.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Buyer confirmed: {currentExchange.buyerConfirmedAt ? '✓ Confirmed' : 'Pending'} • Seller confirmed: {currentExchange.sellerConfirmedAt ? '✓ Confirmed' : 'Pending'}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      {currentExchange && currentExchange.status === 'reserved' && (
                        <button
                          onClick={() => confirmExchange(currentExchange.id)}
                          className="py-1.5 px-3 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Confirm Handover & Inspection</span>
                        </button>
                      )}

                      <button
                        onClick={() => startLiveLocationSharing(contactingProduct.campusLocation)}
                        className="py-1.5 px-3 rounded-lg bg-[#153225] dark:bg-emerald-800 text-white text-xs font-bold hover:bg-[#1E4333] transition-colors cursor-pointer"
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
                        className="py-1.5 px-3 rounded-lg bg-[#BA4E29] text-white text-xs font-bold hover:bg-[#A34322] transition-colors cursor-pointer"
                      >
                        Leave Peer Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isSellerOfListing ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-emerald-900/60 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                  You are the Seller of this Listing
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  When students propose price offers on this item, they will appear here for you to accept, counter, or decline.
                </p>
              </div>
            ) : (
              /* Propose a New Offer Form */
              <form onSubmit={handleProposeOffer} className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-emerald-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                    Propose a Reasonable Counter-Price
                  </h3>
                  <span className="text-[10px] text-stone-400">
                    {isSupabaseConfigured ? 'Live Backend Offer' : 'Bargain Demo Flow'}
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
                  {isOfferSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Proposal...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      <span>Send Price Offer to Seller</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Safety notice */}
            <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              * Note: The bargaining system enforces buyer/seller authentication, atomic reservation, and mutual handover agreement.
            </div>

          </div>
        )}

        {/* Tab 2: Campus Chat Feed (Phase C2) */}
        {activeSubTab === 'chat' && (
          <>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/50 dark:bg-stone-900/40">
              <div className="text-center my-1">
                <span className="text-[10px] bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-full">
                  {isSupabaseConfigured 
                    ? 'Encrypted Campus Chat • Realtime Direct Messages' 
                    : 'Simulated Campus Chat • Peer to Peer (Demo Mode)'}
                </span>
              </div>

              {isLoadingChat ? (
                <div className="flex items-center justify-center py-12 text-stone-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Loading conversation history...</span>
                </div>
              ) : (
                messages.map((m) => {
                  if (m.sender === 'system') {
                    return (
                      <div key={m.id} className="text-center my-2">
                        <span className="inline-block text-[10px] bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 px-3 py-1 rounded-full font-medium">
                          {m.text}
                        </span>
                      </div>
                    );
                  }

                  const isMe = m.sender === 'buyer';

                  return (
                    <div 
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isMe
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
                  );
                })
              )}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 w-fit text-[11px] text-stone-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#153225] dark:bg-emerald-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#153225] dark:bg-emerald-400 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#153225] dark:bg-emerald-400 animate-bounce delay-200"></span>
                  <span className="ml-1 text-[10px]">{contactingProduct.sellerName.split(' ')[0]} is typing...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
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
                placeholder={isSellerOfListing ? "Message the buyer..." : `Message ${contactingProduct.sellerName.split(' ')[0]}...`}
                className="flex-1 py-2 px-3.5 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs bg-white dark:bg-stone-800 dark:text-white focus:border-[#153225] outline-none"
              />
              <button
                type="submit"
                disabled={!chatInputText.trim() || isSendingMessage}
                className="p-2.5 rounded-xl bg-[#153225] dark:bg-emerald-700 text-white hover:bg-[#1E4333] disabled:opacity-40 transition-opacity cursor-pointer flex items-center justify-center"
                aria-label="Send message"
              >
                {isSendingMessage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
