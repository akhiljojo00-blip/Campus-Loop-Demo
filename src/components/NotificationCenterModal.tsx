import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { InAppNotification } from '../types';
import { Bell, CheckCheck, Trash2, X, Tag, ClipboardList, Sparkles, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';

export const NotificationCenterModal: React.FC = () => {
  const {
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    setSelectedProduct,
    setSelectedWantedRequest,
    listings,
    wantedRequests,
    setActiveTab,
    setIsPreferencesModalOpen
  } = useCampus();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isNotificationCenterOpen) return null;

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif: InAppNotification) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
    }

    if (notif.linkType === 'listing' && notif.linkId) {
      const match = listings.find(l => l.id === notif.linkId);
      if (match) {
        setSelectedProduct(match);
        setIsNotificationCenterOpen(false);
        return;
      }
      setActiveTab('marketplace');
      setIsNotificationCenterOpen(false);
    } else if (notif.linkType === 'wanted' && notif.linkId) {
      const match = wantedRequests.find(w => w.id === notif.linkId);
      if (match) {
        setSelectedWantedRequest(match);
        setIsNotificationCenterOpen(false);
        return;
      }
      setActiveTab('wanted');
      setIsNotificationCenterOpen(false);
    } else if (notif.linkType === 'chat') {
      setActiveTab('marketplace');
      setIsNotificationCenterOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_listing_match':
        return <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'wanted_match':
        return <ClipboardList className="w-4 h-4 text-[#BA4E29]" />;
      case 'promotion_active':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'offer_update':
      case 'exchange_update':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-stone-500" />;
    }
  };

  const formatRelativeTime = (isoOrTs: string | number) => {
    const time = typeof isoOrTs === 'number' ? isoOrTs : new Date(isoOrTs).getTime();
    const diffSec = Math.floor((Date.now() - time) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-end sm:justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-[#14231D] text-stone-900 dark:text-stone-100 sm:rounded-3xl border-l sm:border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg w-full max-w-md h-full sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#153225] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#BA4E29] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-white">
                Notifications
              </h2>
              <p className="text-[11px] text-[#FAF8F5]/80">
                Live marketplace matches & campus alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            <button
              onClick={() => setIsNotificationCenterOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-3 bg-stone-50 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#153225] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-[#153225] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <button
            onClick={() => {
              setIsNotificationCenterOpen(false);
              setIsPreferencesModalOpen(true);
            }}
            className="text-[11px] font-semibold text-stone-500 hover:text-[#BA4E29] transition-colors cursor-pointer"
          >
            Match Settings ⚙️
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 p-2 sm:p-3">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="font-serif font-bold text-sm text-stone-700 dark:text-stone-300">
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
                Customize your category preferences to get alerts when matching items or Wanted requests are posted.
              </p>
              <button
                onClick={() => {
                  setIsNotificationCenterOpen(false);
                  setIsPreferencesModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#153225] text-white text-xs font-bold hover:bg-[#1E4333] transition-colors cursor-pointer"
              >
                <span>Set Category Alerts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            filteredNotifs.map(n => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`group p-3.5 rounded-2xl transition-all cursor-pointer mb-1.5 flex items-start gap-3 ${
                  n.isRead
                    ? 'bg-transparent hover:bg-stone-50 dark:hover:bg-stone-900/50'
                    : 'bg-[#E1EDE5]/40 dark:bg-emerald-950/40 border border-[#C2DBCB]/60 dark:border-emerald-800/40 hover:bg-[#E1EDE5]/60'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-xs font-bold truncate ${n.isRead ? 'text-stone-800 dark:text-stone-200' : 'text-[#153225] dark:text-emerald-300'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-stone-400 shrink-0">
                      {formatRelativeTime(n.timestamp || n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
