# 🚀 **PercyTech Modern Platform**

A **modern, scalable SMS communication platform** built with cutting-edge technologies that can be branded for different use cases:

- **Gnymble** - Highly-regulated industries (cigar, etc.)
- **PercyMD** - Healthcare and medical communications
- **PercyText** - General business texting and communications

## ✨ **Core Platform Features**

- 🔐 **Secure Authentication** - JWT-based auth with Zustand state management
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- ⚡ **Fast Development** - Vite + React + TypeScript for rapid iteration
- 🎯 **Type Safety** - Full TypeScript coverage with strict mode
- 🧪 **Testing Ready** - Vitest + Testing Library setup
- 📊 **State Management** - Zustand for simple, scalable state
- 🔄 **Data Fetching** - React Query for server state management
- 🎨 **Modern UI** - Headless UI components with Heroicons

## 🏗️ **Architecture Overview**

### **Multi-Branding Strategy**

The platform is designed as a **core SMS communication engine** that can be:

- **White-labeled** for different industries
- **Customized** with industry-specific compliance features
- **Scaled** from small businesses to enterprise clients

### **Compliance Layers**

- **Base Layer**: Core SMS functionality, user management, security
- **Industry Layer**: HIPAA (healthcare), FDA (regulated products), GDPR (privacy)
- **Brand Layer**: Custom UI, terminology, and business rules

## 🛠 **Tech Stack**

### **Frontend**

- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and better DX
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **React Router** - Client-side routing
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

### **Development Tools**

- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **Testing Library** - React component testing

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 20+
- npm 10+

### **Installation**

```bash
# Navigate to the frontend directory
cd percytech-modern/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 **Project Structure**

```
percytech-modern/
├── frontend/              # React 19 + TypeScript + Vite application
├── backend/               # Planned backend (not yet implemented)
├── shared/                # Common utilities and types
├── docs/                  # Project documentation
├── docker/                # 🐳 Docker development environment
├── docker-compose.yml     # Docker services configuration
├── legacy-system/         # 📁 Copied legacy PercyTech system for reference
├── README.md              # This file
└── DEVELOPMENT_GUIDE.md   # Complete development guide
```

## 🎯 **Development Status**

### **✅ Completed (Week 1)**

- Project setup with Vite + React + TypeScript
- Tailwind CSS configuration and design system
- Basic routing with React Router
- Zustand state management setup
- Authentication store and protected routes
- Login/Register forms with validation
- Basic layout components (Header, Footer, Navigation)

### **🚧 In Progress (Week 2-4)**

- Component library development
- Form components with validation
- Data tables and grids
- Modal and dialog components
- Testing coverage (80%+)
- ✅ **Backend development** - NestJS + TypeScript + MySQL setup complete

### **📋 Planned (Weeks 5-8)**

- Core SMS messaging infrastructure
- Multi-tenant architecture
- Industry-specific compliance features
- Advanced communication tools

## 🎨 **Design System**

### **Colors**

- **Primary**: Blue scale (600-700 for main actions)
- **Gray**: Neutral scale for text and backgrounds
- **Semantic**: Red for errors, green for success

### **Components**

- **Buttons**: Primary, secondary variants with hover states
- **Cards**: Consistent shadow and border styling
- **Forms**: Input fields with focus states and validation
- **Layout**: Responsive grid system with proper spacing

## 🔐 **Authentication Flow**

1. **Login/Register** - Form validation with Zod schemas
2. **JWT Storage** - Secure token storage in Zustand
3. **Protected Routes** - Route-level authentication guards
4. **Persistent State** - User session persistence across reloads

## 📱 **Responsive Design**

- **Mobile First** - Designed for mobile devices first
- **Breakpoints** - Tailwind's responsive utilities
- **Touch Friendly** - Proper touch targets and spacing
- **Progressive Enhancement** - Enhanced experience on larger screens

## 🧪 **Testing Strategy**

- **Unit Tests** - Component and utility function testing
- **Integration Tests** - User interaction flows
- **Accessibility** - Screen reader and keyboard navigation
- **Performance** - Bundle size and runtime performance

## 🚀 **Deployment**

### **Build Process**

```bash
npm run build            # Creates optimized dist/ folder
npm run build:analyze    # Analyze bundle size
```

### **Environment Variables**

```bash
VITE_API_URL=           # Backend API endpoint
VITE_APP_NAME=          # Application name
VITE_APP_VERSION=       # App version
VITE_BRAND_TYPE=        # gnymble|percymd|percytext
```

## 🔧 **Configuration Files**

- **vite.config.ts** - Vite build configuration
- **tailwind.config.js** - Tailwind CSS customization
- **tsconfig.json** - TypeScript compiler options
- **.eslintrc.cjs** - ESLint rules and plugins
- **.prettierrc** - Code formatting rules

## 📚 **Learning Resources**

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query/latest)

## 🎯 **For Developers & Agents**

- **`DEVELOPMENT_GUIDE.md`** - Complete guide for working with this project
- **`legacy-system/`** - Copied legacy system for reference

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📄 **License**

This project is licensed under the MIT License.

---

## 🔗 **Related Projects**

This is the **modern platform** being developed alongside the **legacy PercyTech system**.

- **Legacy System**: `/legacy-system` - Copied 5-year-old healthcare communication platform
- **Modern Platform**: `/percytech-modern` - New React 19 + TypeScript application (this project)

**Built with ❤️ by the PercyTech Team**
