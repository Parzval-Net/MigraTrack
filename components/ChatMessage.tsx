import React, { memo } from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  msg: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ msg }) => {
  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
      <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user'
        ? 'bg-primary text-white rounded-tr-none'
        : 'bg-white dark:bg-surface-dark text-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-white/5'
        }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text || '...'}</p>
      </div>
    </div>
  );
};

export default memo(ChatMessage);
