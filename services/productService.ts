import { Product, ProductMatch, FilterParams, DATA_URL } from '../types';

let productDatabase: Product[] = [];

// Fetch and cache the database
export const loadProductDatabase = async (): Promise<void> => {
  if (productDatabase.length > 0) return;
  
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("Failed to load product data");
    const data = await response.json();
    
    // Normalize data structure if needed depending on raw JSON format
    // Assuming the JSON is an array of objects. We map to our interface.
    productDatabase = Array.isArray(data) ? data.map((item: any, index: number) => ({
      id: item.id || index,
      title: item.title || item.name || "محصول بدون نام",
      price: parsePrice(item.price),
      link: item.link || item.url || "#",
      image: item.image || item.img || null,
      category: item.category || "لوازم جانبی",
      features: normalizeFeatures(item.features),
      description: item.description || ""
    })) : [];
    
    console.log(`Loaded ${productDatabase.length} products.`);
  } catch (error) {
    console.error("Error loading knowledge base:", error);
    productDatabase = []; // Fallback
  }
};

// Helper to normalize features which might be strings or objects {label, value}
const normalizeFeatures = (features: any): string[] => {
    if (!Array.isArray(features)) return [];
    return features.map(f => {
        if (typeof f === 'string') return f;
        if (f && typeof f === 'object') {
            if (f.label && f.value) return `${f.label}: ${f.value}`;
            if (f.value) return String(f.value);
            return Object.values(f).join(': ');
        }
        return String(f);
    });
};

// Helper to clean price strings to numbers
const parsePrice = (priceRaw: string | number): number => {
  if (typeof priceRaw === 'number') return priceRaw;
  if (!priceRaw) return 0;
  // Remove non-digits
  const numericString = priceRaw.replace(/\D/g, '');
  return parseInt(numericString, 10) || 0;
};

// Search Logic implementing the prompt's requirements
export const searchProducts = async (params: FilterParams): Promise<ProductMatch[]> => {
  await loadProductDatabase();

  const { category, min_price = 0, max_price = 1000000000, keywords, brand } = params;
  
  // 1. Exact Filtering
  let candidates = productDatabase.filter(p => {
    // Category Filter (Fuzzy match)
    if (category && !p.category?.includes(category) && !p.title.includes(category)) {
      // Check for broad category matches if specific fails
      return false;
    }
    
    // Price Filter
    const price = typeof p.price === 'number' ? p.price : parsePrice(p.price);
    if (price < min_price || price > max_price) return false;

    // Brand Filter
    if (brand && !p.title.includes(brand)) return false;

    return true;
  });

  // Keyword scoring
  if (keywords) {
    const keywordList = keywords.split(' ').filter(k => k.length > 2);
    candidates = candidates.map((p: any) => {
      let score = 0;
      const textSpace = `${p.title} ${p.description || ''} ${p.features?.join(' ')}`.toLowerCase();
      
      keywordList.forEach(k => {
        if (textSpace.includes(k.toLowerCase())) score += 1;
      });
      return { ...p, _score: score };
    }).filter((p: any) => p._score > 0).sort((a: any, b: any) => b._score - a._score);
  }

  // 2. Logic for "Close Match" (The 70/30 rule from prompt)
  // If we have very few results (< 3), we relax the price constraint
  let finalResults: ProductMatch[] = candidates.map(c => ({ ...c }));

  if (finalResults.length < 5) {
     const priceTolerance = 2000000; // 2 Million Toman tolerance
     const relaxedMax = max_price + priceTolerance;
     const relaxedMin = Math.max(0, min_price - priceTolerance);

     const closeMatches = productDatabase.filter(p => {
        // Exclude already found
        if (finalResults.find(fr => fr.title === p.title)) return false;
        
        // Check Category
        if (category && !p.category?.includes(category) && !p.title.includes(category)) return false;

        const price = typeof p.price === 'number' ? p.price : parsePrice(p.price);
        
        // Relaxed Price Check
        if (price >= relaxedMin && price <= relaxedMax) {
           return true;
        }
        return false;
     }).map(p => ({
        ...p,
        isCloseMatch: true,
        matchReason: "قیمت نزدیک به بودجه شما"
     }));

     // Sort close matches by price difference
     closeMatches.sort((a, b) => {
        const priceA = typeof a.price === 'number' ? a.price : parsePrice(a.price);
        const priceB = typeof b.price === 'number' ? b.price : parsePrice(b.price);
        // Find distance from target range
        const distA = priceA > max_price ? priceA - max_price : min_price - priceA;
        const distB = priceB > max_price ? priceB - max_price : min_price - priceB;
        return distA - distB;
     });

     finalResults = [...finalResults, ...closeMatches];
  }

  // Cap at 10 items
  return finalResults.slice(0, 10);
};