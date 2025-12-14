# UpSosh Website

A premium, modern, and visually stunning website for UpSosh - an official + unofficial events platform.

## 🚀 Features

- **Modern Design**: Clean, minimal design with glassmorphism effects
- **3D Animations**: Interactive 3D elements and smooth animations using Framer Motion, GSAP, and Spline
- **Dark/Light Mode**: Seamless theme switching with smooth transitions
- **Smooth Scrolling**: Lenis smooth scroll for butter-smooth navigation
- **Fully Responsive**: Mobile-first design that looks great on all devices
- **SEO Optimized**: Proper meta tags and semantic HTML
- **Premium Components**: Reusable UI components with hover effects and animations

## 🛠️ Tech Stack

- **Dual Mode Discovery**: Toggle between "Formal" (Workshops, Galas) and "Informal" (House Parties, Meetups) events.
- **Interactive 3D Hero**: Immersive 3D elements powered by Spline.
- **Seamless Booking**: Integrated cart and checkout flow with mock payment processing.
- **Superhost Program**: Dedicated section for elite hosts with verification steps.
- **Dark Mode**: Fully responsive dark/light mode with persistent preference.
- **Accessibility**: Keyboard navigation, screen reader support, and focus management.

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [GSAP](https://greensock.com/gsap/) & [Spline](https://spline.design/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Testing**: Playwright (E2E) & Jest (Unit/Component)

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/upsosh.git
    cd upsosh
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Copy `.env.example` to `.env.local`:
    ```bash
    cp .env.example .env.local
    ```

## 🏃‍♂️ Running Locally

To run the application locally, you need to start both the Next.js development server and the mock API server.

1.  **Start the Mock API**:
    ```bash
    npm run mock:api
    ```
    This runs `json-server` on port 3001.

2.  **Start the Dev Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

- **Unit & Component Tests**:
    ```bash
    npm run test
    ```
- **End-to-End Tests**:
    ```bash
    npm run test:e2e
    ```

## 🚢 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  Add the environment variables (see `.env.example`).
4.  Deploy!

For detailed integration guides (Backend, Payments, 3D Assets), see [docs/INTEGRATION.md](docs/INTEGRATION.md).
For a pre-launch checklist, see [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md).

## 📄 License

MIT

## 📁 Project Structure

```
upSoshWebsite/
├── app/                      # Next.js app directory
│   ├── about/               # About page
│   ├── blog/                # Blog page
│   ├── contact/             # Contact page
│   ├── privacy/             # Privacy policy page
│   ├── superhost/           # Superhost page
│   ├── terms/               # Terms of service page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Container.tsx
│   │   ├── GlassCard.tsx
│   │   └── Section.tsx
│   ├── DownloadCTASection.tsx
│   ├── FeaturesSection.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── HowItWorksSection.tsx
│   ├── Navigation.tsx
│   ├── SmoothScrollProvider.tsx
│   ├── TestimonialsSection.tsx
│   ├── ToggleDemoSection.tsx
│   └── WhatIsUpSoshSection.tsx
├── contexts/                # React contexts
│   └── ThemeContext.tsx     # Theme provider
├── public/                  # Static assets
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## 🎨 Design System

### Colors

**Light Mode:**
- Pure White: `#FFFFFF`
- Soft Light Blue: `#E7F1FF`
- Primary Blue: `#3B82F6`
- Indigo Accent: `#6366F1`

**Dark Mode:**
- Background Navy: `#0B1020`
- Deep Black: `#000000`
- Neon Blue Glow: `#3B82F6`
- Purple Accent: `#A855F7`

### Animations

- Float animations for 3D elements
- Glow effects for interactive components
- Smooth transitions between sections
- Parallax scrolling effects
- Hover animations with scale and rotation

## 🌐 Pages

- **Landing Page**: Hero, features, toggle demo, how it works, testimonials
- **About**: Company story, values, and team
- **Superhost**: Benefits and application info
- **Blog**: Event tips and community stories
- **Contact**: Contact form and information
- **Terms**: Terms of service
- **Privacy**: Privacy policy

## 🎯 Key Sections

1. **Hero Section**: 3D animated logo with parallax effects
2. **What Is UpSosh**: Interactive event type cards
3. **Features**: Phone mockups with scroll animations
4. **Toggle Demo**: Formal/informal mode switcher
5. **How It Works**: Step-by-step guide with 3D spheres
6. **Testimonials**: Auto-rotating carousel
7. **Download CTA**: App store buttons and QR code
8. **Footer**: Newsletter signup and links

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Theme Customization

The theme can be customized in `tailwind.config.js`. Colors, animations, and gradients are all configurable.

## 🔧 Environment Variables

No environment variables required for basic setup.

## 📄 License

All rights reserved © 2025 UpSosh

## 🤝 Contributing

This is a proprietary project. Please contact the team for contribution guidelines.

## 📞 Support

For support, email support@upsosh.com or visit our help center.
