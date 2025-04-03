# Chromia Multisig Frontend

A modern, secure, and user-friendly multisignature wallet on Chromia interface built with Next.js and React.

## 🚀 Features

- Modern UI with NextUI and Radix UI components
- Real-time transaction management
- Secure wallet integration
- Responsive design
- Dark/Light mode support
- Form validation with React Hook Form and Zod
- State management with Zustand
- Data fetching with TanStack Query

## 📋 Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Git

## 🛠️ Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd chromia-multisig-fe
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add necessary environment variables:

## 🚀 Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Build

Create a production build:
```bash
npm run build
# or
yarn build
```

Start the production server:
```bash
npm run start
# or
yarn start
```

## 🧪 Testing

Run the test suite:
```bash
npm run test
# or
yarn test
```

## 📦 Project Structure

```
├── app/                  # Next.js app directory
├── components/          # Reusable React components
│   ├── ui/             # UI components
│   └── partials/       # Partial components
├── lib/                # Utility functions and configurations
├── provider/           # React context providers
├── public/            # Static assets
└── styles/            # Global styles and theme
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **UI Libraries:**
  - NextUI
  - Radix UI
  - Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Form Handling:** React Hook Form + Zod
- **Styling:** Tailwind CSS + SASS
- **Authentication:** NextAuth.js
- **Web3 Integration:** wagmi + viem

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.
