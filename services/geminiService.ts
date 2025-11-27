
import { GoogleGenAI, FunctionDeclaration, Type, Content } from "@google/genai";
import { searchProducts } from "./productService";
import { FilterParams, ChatMessage } from "../types";

// PROMPTS
const BASE_PROMPT = `
شما "NeuraQueen" 🤖، دستیار هوشمند و متخصص فروشگاه "استار سیکلت" هستید.
هدف شما فروش محصولات نیست، بلکه مشاوره دقیق برای خرید بهترین گزینه است.

🧠 **قوانین حیاتی مکالمه (Protocol):**

1.  **تحلیل ورودی کاربر:**
    - اگر کاربر فقط اسم یک دسته را گفت (مثلاً "کلاه کاسکت"، "دستکش"، "لاستیک")، **حق ندارید جستجو کنید.** ⛔
    - شما باید ابتدا نیاز کاربر را شفاف کنید.

2.  **استراتژی پرسشگری (Interrogation Phase):**
    - قبل از هر پیشنهادی، باید ۳ فاکتور کلیدی را بدانید:
      الف) **نوع دقیق/سبک:** (مثلاً برای کلاه: فک متحرک یا ثابت؟ برای لاستیک: چه موتوری؟)
      ب) **بودجه:** (سقف هزینه چقدر است؟)
      ج) **کاربرد:** (شهری، جاده‌ای، حرفه‌ای؟)
    - **قانون:** در هر نوبت فقط ۱ یا ۲ سوال بپرسید. کاربر را بمباران سوالی نکنید.

3.  **زمان استفاده از ابزار (Action Phase):**
    - تنها زمانی ابزار \`query_knowledge_base\` را صدا بزنید که اطلاعات کافی دارید.
    - اگر کاربر گفت "هر چی داری نشون بده"، آنگاه جستجو با فیلتر کلی مجاز است.

4.  **شخصیت:**
    - لحن: حرفه‌ای، صمیمی، کوتاه و مفید.
    - از ایموجی‌های مرتبط (🏍️، 🛡️، 💰) استفاده کنید.
`;

const RAG_SYSTEM_PROMPT = `
📦 **نحوه نمایش محصولات:**
- وقتی محصولات را پیدا کردید، آنها را لیست کنید.
- برای هر محصول یک دلیل کوتاه بیاورید که چرا با نیاز کاربر مطابقت دارد.
- اگر محصول دقیق پیدا نشد، نزدیک‌ترین گزینه‌ها را با ذکر دلیل پیشنهاد دهید (قانون 70/30).
- قیمت ها را به تومان بگویید.
`;

// Tool Definition
const queryKnowledgeBaseTool: FunctionDeclaration = {
  name: "query_knowledge_base",
  description: "جستجو در دیتابیس محصولات استار سیکلت. فقط زمانی استفاده شود که نیاز کاربر (دسته بندی و بودجه) مشخص شده باشد.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: "دسته بندی اصلی (کلاه کاسکت، دستکش، لباس، قفل، اگزوز، و غیره)"
      },
      min_price: {
        type: Type.NUMBER,
        description: "کف قیمت (اگر مشخص نیست 0)"
      },
      max_price: {
        type: Type.NUMBER,
        description: "سقف بودجه کاربر (تومان)"
      },
      keywords: {
        type: Type.STRING,
        description: "ویژگی‌های خاص مثل رنگ، برند، سایز یا مدل موتور (مثلا: هوندا، قرمز، XL)"
      },
      brand: {
        type: Type.STRING,
        description: "برند خاص اگر کاربر خواسته باشد"
      }
    },
    required: ["category"]
  }
};

let genAI: GoogleGenAI | null = null;

const getClient = () => {
    if (!genAI) {
        genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return genAI;
};

// Map UI ChatMessages to Gemini Content format
const mapHistoryToContent = (messages: ChatMessage[]): Content[] => {
    return messages
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));
};

export const initializeChat = () => {
    getClient();
};

export const sendMessageToGemini = async (newMessage: string, history: ChatMessage[]) => {
  const client = getClient();
  
  // We pass the PREVIOUS history to initialize the chat state.
  // The SDK's sendMessage adds the new message automatically to the sequence.
  const chatSession = client.chats.create({
    model: "gemini-2.5-flash",
    history: mapHistoryToContent(history),
    config: {
      systemInstruction: BASE_PROMPT + "\n" + RAG_SYSTEM_PROMPT,
      temperature: 0.5, // Slightly higher for more natural questions
      tools: [{ functionDeclarations: [queryKnowledgeBaseTool] }],
    },
  });

  try {
    let result = await chatSession.sendMessage({ message: newMessage });
    
    // Check for function calls
    const calls = result.functionCalls;
    
    if (calls && calls.length > 0) {
      const call = calls[0];
      
      if (call.name === "query_knowledge_base") {
        console.log("🛠️ NeuraQueen Searching DB:", call.args);
        
        // Execute Search
        const products = await searchProducts(call.args as FilterParams);
        
        // Create context
        const productContext = products.length > 0 
            ? JSON.stringify(products.slice(0, 10))
            : "هیچ محصول دقیقی با این فیلترها پیدا نشد. لطفا محصولات مشابه پیشنهاد بده.";
        
        // Send tool response
        result = await chatSession.sendMessage({
          message: [{
            functionResponse: {
              name: call.name,
              id: call.id,
              response: { result: productContext }
            }
          }]
        });
        
        return {
          text: result.text,
          products: products
        };
      }
    }

    return {
      text: result.text,
      products: []
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "متاسفانه مشکلی در شبکه پیش آمد. لطفا دوباره تلاش کنید.",
      products: []
    };
  }
};
