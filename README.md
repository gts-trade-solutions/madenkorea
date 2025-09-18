# Consumer Innovations Store

A modern e-commerce platform for authentic Korean beauty products.

## Project Overview

This is a full-featured Consumer Innovations e-commerce website built with modern web technologies. Features include product catalog, shopping cart, user authentication, admin portal, supplier management, and CMS functionality.

## Technologies Used

This project is built with:

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn-ui components
- **Backend**: Supabase (Database, Authentication, Storage)
- **State Management**: React Hooks & Context
- **Routing**: React Router
- **Icons**: Lucide React

## Features

- 🛍️ **Product Catalog**: Browse Korean beauty products with filtering and search
- 🛒 **Shopping Cart**: Add/remove items, quantity management
- 👤 **User Authentication**: Sign up, sign in, user profiles
- 📱 **Responsive Design**: Mobile-first responsive layout
- 🎥 **Video Content**: Product demonstrations and Consumer Innovations tutorials
- ⚡ **Admin Portal**: Manage products, orders, content
- 🏪 **Supplier Portal**: Supplier dashboard with product management
- 📝 **CMS**: Content management for banners, pages, videos
- 💾 **Database**: Full CRUD operations with Supabase
- 🖼️ **Image Upload**: File storage and management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```sh
   git clone <your-repo-url>
   cd Consumer Innovations-store
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Set up environment variables**

   - Configure your Supabase credentials
   - Update database connection settings

4. **Start development server**

   ```sh
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── integrations/       # Supabase integration
└── config/             # Configuration files
```

## Deployment

This project can be deployed to any modern hosting platform that supports static sites:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
