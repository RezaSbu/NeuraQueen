
import React from 'react';
import { ProductMatch } from '../types';
import { ShoppingCart, ExternalLink, Sparkles, Scale } from 'lucide-react';

interface Props {
  product: ProductMatch;
  index: number;
  onCompare: (product: ProductMatch) => void;
  isSelectedForCompare: boolean;
}

const ProductCard: React.FC<Props> = ({ product, index, onCompare, isSelectedForCompare }) => {
  const formatPrice = (p: number | string) => {
    return new Intl.NumberFormat('fa-IR').format(Number(p));
  };

  const displayFeatures = product.features?.slice(0, 3) || [];

  return (
    <div className={`
      group relative flex flex-col w-72 h-[420px] rounded-3xl overflow-hidden 
      transition-all duration-300 hover:-translate-y-2
      ${product.isCloseMatch 
        ? 'bg-gradient-to-b from-[#2a2a2a] to-[#1a1a00] border border-yellow-500/20' 
        : 'bg-[#1E1E1E] border border-white/5 hover:border-primary/40'}
       shadow-lg hover:shadow-2xl hover:shadow-primary/5
    `}>
      
      {/* Number Badge */}
      <div className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white font-mono font-bold shadow-lg">
        {index + 1}
      </div>

      {/* Compare Checkbox */}
      <div className="absolute top-3 right-3 z-20">
        <button 
          onClick={(e) => { e.preventDefault(); onCompare(product); }}
          className={`
            p-2 rounded-full backdrop-blur-md border transition-all duration-200
            ${isSelectedForCompare 
              ? 'bg-primary text-black border-primary' 
              : 'bg-black/40 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'}
          `}
          title="افزودن به مقایسه"
        >
          <Scale size={16} />
        </button>
      </div>

      {/* Close Match Label */}
      {product.isCloseMatch && (
        <div className="absolute top-14 right-3 z-20 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg backdrop-blur-sm">
          <Sparkles size={10} />
          <span>پیشنهاد مشابه</span>
        </div>
      )}

      {/* Image Section */}
      <div className="h-48 bg-gray-900 relative overflow-hidden shrink-0 group">
        {product.image ? (
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
               <span className="text-xs">تصویر موجود نیست</span>
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-transparent opacity-100" />
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1 relative -mt-8">
        
        {/* Category */}
        <div className="mb-2">
            <span className="inline-block bg-white/5 border border-white/5 backdrop-blur-sm text-gray-400 text-[10px] px-2 py-1 rounded-md">
                {product.category || 'لوازم جانبی'}
            </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-gray-100 mb-3 line-clamp-2 leading-relaxed h-10 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Features */}
        <div className="flex flex-col gap-1 mb-auto">
          {displayFeatures.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-400">
               <span className="w-1 h-1 rounded-full bg-primary/50"></span>
               <span className="truncate">{f}</span>
            </div>
          ))}
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex flex-col mb-3">
             <span className="text-[10px] text-gray-500 mb-0.5">قیمت نهایی</span>
             <div className="text-white font-mono font-bold text-lg flex items-center gap-1">
                 {formatPrice(product.price)} 
                 <span className="text-[11px] text-gray-400 font-sans font-normal">تومان</span>
             </div>
          </div>

          <a 
            href={product.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-primary hover:text-black text-white border border-white/10 hover:border-primary text-sm font-medium py-2.5 rounded-xl transition-all duration-300 group/btn shadow-lg shadow-black/50"
          >
            <span>مشاهده و خرید</span>
            <ExternalLink size={16} className="group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
