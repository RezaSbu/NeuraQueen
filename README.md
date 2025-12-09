
```markdown
# StarCycle - Mobinext AI Chatbot

An intelligent conversational AI assistant for StarCycle motorcycle parts store, built with Next.js and powered by artificial intelligence.

## 🌟 Features

- 🤖 **Intelligent AI Assistant**: Specialized chatbot for motorcycle parts and accessories
- 🇮🇷 **Full Persian Language Support**: Complete RTL interface with Vazirmatn font
- 🔍 **Smart Product Search**: Advanced filtering by category, price, brand, and specifications
- 📊 **Product Comparison**: Compare up to 3 products simultaneously with detailed specifications
- 💬 **Session Management**: Save chat history and create multiple conversation sessions
- ⚡ **Typewriter Effect**: Smooth text animation for enhanced user experience
- 📱 **Responsive Design**: Mobile-first approach with seamless desktop and mobile experience

## 🛠 Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Database**: SQLite with Prisma ORM
- **AI Integration**: Z-AI Web Dev SDK for intelligent responses
- **Icons**: Lucide React for consistent iconography
- **Styling**: Custom CSS animations and dark theme

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat message processing API
│   │   └── seed/          # Sample product data API
│   ├── globals.css        # Global styles and animations
│   ├── layout.tsx         # Root layout component
│   └── page.tsx          # Main chat interface
├── components/
│   └── chat/
│       ├── ChatMessage.tsx       # Chat message component
│       ├── ComparisonModal.tsx    # Product comparison modal
│       ├── ProductCard.tsx        # Product display card
│       └── Typewriter.tsx        # Typing animation effect
├── types/
│   └── index.ts          # TypeScript type definitions
└── lib/
    └── db.ts            # Database connection and configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd starcycle-mobinext-chatbot
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
npm run db:push
```

4. **Add sample products (optional)**
```bash
curl -X POST http://localhost:3000/api/seed
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to `http://localhost:3000`

## 💡 Usage Guide

### Basic Interaction

1. **Start a conversation**: The AI assistant will greet you in Persian
2. **Ask about products**: Use natural language to describe what you're looking for
3. **View recommendations**: Browse through suggested products with detailed information
4. **Compare products**: Add items to comparison list for side-by-side analysis
5. **Manage sessions**: Create new chats or switch between previous conversations

### Sample Queries

- "کلاه کاسکت فک متحرک تا ۳ میلیون تومان" (Full-face helmet up to 3M Toman)
- "روغن موتور 4 زمانه 1 لیتری" (4-stroke 1-liter engine oil)
- "لاستیک اسپرت برای یاماها R6" (Sport tires for Yamaha R6)
- "بهترین اگزوز برای موتور اسپرت" (Best exhaust for sport motorcycle)

### Search Capabilities

- **Category**: Helmets, engine oil, tires, batteries, exhaust systems, etc.
- **Price Range**: Filter products based on your budget
- **Brand**: Search by specific manufacturer
- **Technical Specs**: Size, volume, model, and other specifications

## 🎯 Key Features Explained

### AI-Powered Sales Assistant

The chatbot follows a sophisticated 3-stage sales funnel:

1. **Discovery Phase**: Asks targeted questions about technical specifications
2. **Confirmation Phase**: Summarizes requirements before searching
3. **Action Phase**: Provides relevant product recommendations

### Smart Product Matching

- **Exact Matches**: Products matching all specified criteria
- **Close Matches**: Similar products within price tolerance (70/30 rule)
- **Intelligent Ranking**: Products ranked by relevance and price proximity

### Comparison System

- **Side-by-Side View**: Detailed comparison table with specifications
- **Visual Comparison**: Product images and key features
- **Quick Actions**: Direct purchase links for each product

## 🔧 Development

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma` and run `npm run db:push`
2. **API Endpoints**: Create new routes in `src/app/api/`
3. **Components**: Build reusable components in `src/components/`
4. **Types**: Define TypeScript interfaces in `src/types/`

### Code Quality

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build for production
npm run build
```

## 📊 Database Schema

The application uses SQLite with the following main models:

- **Product**: Stores product information, pricing, and specifications
- **ChatSession**: Manages conversation history and user sessions
- **User**: User account information (for future authentication)

## 🎨 Design System

### Color Palette
- **Primary**: Emerald Green (#10b981) - Represents growth and reliability
- **Background**: Dark theme (#09090b) - Reduces eye strain
- **Surface**: Card backgrounds (#18181b) - Content hierarchy
- **Accent**: Rose (#f43f5e) - Call-to-action elements

### Typography
- **Primary Font**: Vazirmatn (Persian script)
- **Fallback**: System fonts for non-Persian content
- **Weights**: 200-800 for comprehensive hierarchy

### Animations
- **Fade In**: Smooth appearance of new elements
- **Slide Up**: Content entrance from bottom
- **Typewriter**: Progressive text reveal
- **Pulse**: Loading and attention states

## 🔒 Security & Performance

- **Input Validation**: All user inputs are sanitized and validated
- **SQL Injection Prevention**: Prisma ORM provides parameterized queries
- **XSS Protection**: React's built-in XSS prevention
- **Performance**: Optimized images and lazy loading
- **Caching**: Database query optimization and response caching

## 🌐 Deployment

### Environment Variables

Create a `.env.local` file with:

```env
DATABASE_URL="file:./dev.db"
# Add other environment-specific variables here
```

### Production Deployment

1. **Build the application**
```bash
npm run build
```

2. **Start production server**
```bash
npm start
```

3. **Deploy to your preferred platform** (Vercel, Netlify, Railway, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and developed exclusively for StarCycle by Mobinext.


```

این متن کامل و حرفه‌ای شامل تمام بخش‌های لازم برای یک README عالی است. می‌توانید مستقیماً کپی کرده و استفاده کنید!
