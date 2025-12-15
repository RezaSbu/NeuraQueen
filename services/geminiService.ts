import { GoogleGenAI, FunctionDeclaration, Type, Content } from "@google/genai";
import { searchProducts } from "./productService";
import { FilterParams, ChatMessage } from "../types";

// PROMPTS
const BASE_PROMPT = `
شما "Mobinext" 🤖، دستیار هوشمند و متخصص فروشگاه "استار سیکلت" هستید.
شما یک فروشنده حرفه ای هستید، نه یک موتور جستجو.

🚩 **پروتکل فروش (Sales Funnel):**
مکالمه شما باید ۳ مرحله داشته باشد:

1. **مرحله اکتشاف (Discovery):**
   - اگر کاربر محصولی خواست (مثلاً "روغن موتور" یا "کلاه کاسکت")، سریعاً لیست ندهید.
   - **باید** سوال بپرسید تا نیاز دقیق بر اساس **مشخصات فنی و عنوان** (Title/Features) مشخص شود.
   - ⛔ **ممنوعیت:** هرگز درباره "توضیحات" (Description) یا موارد کلی و سلیقه‌ای سوال نپرسید.
   - **سوالات مجاز (فقط موارد زیر):**
     ۱. **نوع/مدل** (مرتبط با عنوان محصول)
     ۲. **قیمت/بودجه** (تومان)
     ۳. **سایز** (برای لباس/کلاه)
     ۴. **حجم/لیتر** (برای روغن/تمیزکننده‌ها)
     ۵. **برند**
   - قانون: در هر نوبت حداکثر ۲ سوال بپرسید.

2. **مرحله تایید (Confirmation):**
   - وقتی جواب ها را گرفتید، یک خلاصه بگویید (مثلاً: "پس یک روغن موتور ۱ لیتری تا ۲۰۰ هزار تومان میخواهید؟")
   - اگر اطلاعات کافی بود، سراغ مرحله ۳ بروید.

3. **مرحله پیشنهاد (Action):**
   - حالا از ابزار \`query_knowledge_base\` استفاده کنید.
   - نتایج را نشان دهید و توضیح دهید چرا مناسب هستند.

⛔ **نبایدهای مطلق:**
- هرگز قبل از دانستن "بودجه" و "نوع محصول" جستجو نکنید (مگر اینکه کاربر بگوید "همه مدل ها را نشان بده").
- فیلترینگ شما هرگز نباید بر اساس متن توضیحات (Description) یاشد. فقط عنوان، ویژگی‌ها، سایز، حجم و قیمت ملاک است.
`;

const RAG_SYSTEM_PROMPT = `
📦 **نحوه نمایش محصولات:**
- وقتی محصولات را پیدا کردید، آنها را با فرمت جذاب لیست کنید.
- قانون 70/30: اگر محصول دقیق نبود، محصول مشابه با قیمت نزدیک پیشنهاد دهید.
- قیمت ها را حتما به تومان ذکر کنید.
`;

// Tool Definition
const queryKnowledgeBaseTool: FunctionDeclaration = {
  name: "query_knowledge_base",
  description: "جستجو در دیتابیس محصولات بر اساس عنوان، ویژگی‌ها، سایز، حجم و قیمت. (توضیحات محصول نادیده گرفته می‌شود)",
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: "دسته بندی اصلی یا نوع محصول (کلاه کاسکت، روغن موتور، اگزوز)"
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
        description: "کلمات کلیدی فنی: سایز (L, XL)، حجم (1L, 4L)، برند، یا مدل خاص موجود در عنوان."
      },
      brand: {
        type: Type.STRING,
        description: "برند خاص"
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
        .map(m => {
            // Remove internal UI fields if expanding logic later
            return {
                role: m.role,
                parts: [{ text: m.text }]
            };
        });
};

export const initializeChat = () => {
    getClient();
};

// New function for Admin Analysis
export const generateSimpleContent = async (prompt: string): Promise<string> => {
    const client = getClient();
    try {
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.5,
            }
        });
        return response.text || "خطا در تولید محتوا";
    } catch (error) {
        console.error("AI Gen Error:", error);
        return "خطا در ارتباط با هوش مصنوعی";
    }
};

export const sendMessageToGemini = async (newMessage: string, history: ChatMessage[]) => {
  const client = getClient();
  
  // Create a completely new chat session for every request to ensure statelessness on the server side
  // but preserving context via the 'history' array passed from the client.
  // This solves the "Session Isolation" issue.
  const chatSession = client.chats.create({
    model: "gemini-2.5-flash",
    history: mapHistoryToContent(history), 
    config: {
      systemInstruction: BASE_PROMPT + "\n" + RAG_SYSTEM_PROMPT,
      temperature: 0.3, // Lower temperature for more disciplined logic following
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
        console.log("🛠️ Mobinext Searching DB:", call.args);
        
        // Execute Search
        const products = await searchProducts(call.args as FilterParams);
        
        // Create context
        const productContext = products.length > 0 
            ? JSON.stringify(products.slice(0, 10))
            : "هیچ محصول دقیقی با این فیلترها پیدا نشد. قانون 70/30 را اجرا کن و محصولات نزدیک را پیشنهاد بده.";
        
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