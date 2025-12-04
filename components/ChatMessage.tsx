
import React, { useState, useEffect, memo } from 'react';
import { ChatMessage as ChatMessageType, ProductMatch } from '../types';
import ProductCard from './ProductCard';
import Typewriter from './Typewriter';
import ReactMarkdown from 'react-markdown';
import { User, Cpu, BrainCircuit } from 'lucide-react';

interface Props {
  message: ChatMessageType;
  isLastMessage: boolean;
  onCompare: (product: ProductMatch) => void;
  compareList: ProductMatch[];
}

const ChatMessage: React.FC<Props> = ({ message, isLastMessage, onCompare, compareList }) => {
  const isUser = message.role === 'user';
  const hasProducts = message.products && message.products.length > 0;
  
  // Logic to determine if we should animate:
  // 1. It must be the last message.
  // 2. It must be recent (created in the last 10 seconds). 
  // This prevents re-typing when loading history or switching sessions.
  const isRecent = message.timestamp ? (Date.now() - message.timestamp < 10000) : true;
  const shouldAnimate = !isUser && isLastMessage && isRecent;

  const [isTyped, setIsTyped] = useState(!shouldAnimate);

  useEffect(() => {
     // If it stops being the last message, force it to 'typed' state immediately.
     if (!isLastMessage) {
         setIsTyped(true);
     }
  }, [isLastMessage]);

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn group`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl border border-white/10
          ${isUser 
            ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300' 
            : 'bg-gradient-to-br from-[#00D084] to-[#00A060] text-black shadow-primary/20'}
        `}>
          {isUser ? <User size={20} /> : <BrainCircuit size={22} />}
        </div>

        {/* Content Container */}
        <div className="flex flex-col gap-3 w-full min-w-0">
           
           {/* Header Name (Bot only) */}
           {!isUser && (
             <span className="text-xs font-bold text-gray-500 mb-[-5px] mr-1">Mobinext AI</span>
           )}

           {/* Text Bubble */}
           {message.text && !message.isThinking && (
             <div className={`
              px-6 py-5 rounded-3xl text-[15px] leading-8 shadow-sm backdrop-blur-sm
              ${isUser 
                ? 'bg-[#2A2A2A] text-white rounded-tr-md border border-white/5' 
                : 'bg-[#1E1E1E]/80 text-gray-100 rounded-tl-md border border-white/5'}
            `}>
              {!isTyped ? (
                  <Typewriter 
                      text={message.text} 
                      speed={15} 
                      onComplete={() => setIsTyped(true)} 
                  />
              ) : (
                  <div className="markdown-content">
                    <ReactMarkdown
                        components={{
                        strong: ({node, ...props}) => <span className="font-bold text-primary" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 space-y-1 text-gray-300" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" {...props} />
                        }}
                    >
                        {message.text}
                    </ReactMarkdown>
                  </div>
              )}
            </div>
           )}

           {/* Thinking State */}
           {message.isThinking && (
             <div className="flex items-center gap-3 px-5 py-4 bg-[#1E1E1E]/50 border border-white/5 rounded-3xl rounded-tl-md w-fit">
               <div className="relative w-8 h-8 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 border-2 border-primary rounded-full animate-spin border-t-transparent"></div>
                  <Cpu size={14} className="text-primary" />
               </div>
               <span className="text-sm font-medium text-gray-400 animate-pulse">در حال تحلیل...</span>
             </div>
           )}

            {/* Product Grid - Show if typed OR if it's an old message */}
            {hasProducts && (isTyped || !isLastMessage) && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 animate-slideUp">
               {message.products?.map((product, idx) => (
                 <ProductCard 
                   key={`${product.id}-${idx}`} 
                   product={product} 
                   index={idx}
                   onCompare={onCompare}
                   isSelectedForCompare={compareList.some(p => p.title === product.title)}
                 />
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default memo(ChatMessage);
