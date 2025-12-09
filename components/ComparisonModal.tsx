import React from 'react';
import { ProductMatch } from '../types';
import { X, ExternalLink } from 'lucide-react';

interface Props {
  products: ProductMatch[];
  onClose: () => void;
}

const ComparisonModal: React.FC<Props> = ({ products, onClose }) => {
  const formatPrice = (p: number | string) => new Intl.NumberFormat('fa-IR').format(Number(p));

  // Collect all unique features found in these products to build rows
  // Since normalized features are strings, we might just list them.
  // For a better table, we would assume Key: Value structure in strings.
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1a1a1a] w-full max-w-5xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">مقایسه محصولات ({products.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-auto p-4 flex-1 scrollbar-thin">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-gray-500 font-normal min-w-[120px]">مشخصات</th>
                {products.map((p, i) => (
                  <th key={i} className="p-4 min-w-[220px] bg-white/5 rounded-t-xl mx-2 border-b border-white/10 align-top">
                    <div className="flex flex-col gap-3">
                      {p.image && (
                        <div className="h-32 w-full rounded-lg overflow-hidden bg-black">
                           <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <span className="text-sm font-bold text-white line-clamp-2 h-10">{p.title}</span>
                      <div className="text-primary font-mono text-lg">{formatPrice(p.price)} <span className="text-xs">تومان</span></div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              
              {/* Category */}
              <tr>
                <td className="p-4 text-gray-400">دسته‌بندی</td>
                {products.map((p, i) => (
                  <td key={i} className="p-4 text-gray-200">{p.category || '-'}</td>
                ))}
              </tr>

              {/* Features List */}
              <tr>
                 <td className="p-4 text-gray-400 align-top">ویژگی‌ها</td>
                 {products.map((p, i) => (
                   <td key={i} className="p-4 align-top">
                     <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                       {p.features?.map((f, idx) => (
                         <li key={idx}>{f}</li>
                       ))}
                     </ul>
                   </td>
                 ))}
              </tr>

              {/* Action */}
              <tr>
                <td className="p-4"></td>
                {products.map((p, i) => (
                  <td key={i} className="p-4">
                    <a 
                      href={p.link} 
                      target="_blank" 
                      className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-green-400 text-black font-bold py-2 rounded-lg transition-colors"
                    >
                      خرید <ExternalLink size={16} />
                    </a>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;