export interface Product {
  id?: string | number;
  title: string;
  price: number | string;
  link: string;
  image?: string;
  category?: string;
  features?: string[]; // Simplified from JSON structure
  description?: string;
}

export interface ProductMatch extends Product {
  isCloseMatch?: boolean;
  matchReason?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  products?: ProductMatch[];
  isThinking?: boolean;
  timestamp?: number;
}

export interface Session {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastModified: number;
}

export interface User {
  user_id: string;
  number: string;
  username: string;
  name: string;
  last_name: string;
  signup_Date: string;
}

export interface FilterParams {
  category?: string;
  min_price?: number;
  max_price?: number;
  keywords?: string;
  brand?: string;
}

export const DATA_URL = "https://raw.githubusercontent.com/RezaSbu/Database/refs/heads/main/optimized_products_final_updated.json";