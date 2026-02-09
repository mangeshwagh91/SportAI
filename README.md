# SportAI - AI-Powered Fitness Platform

A modern fitness platform powered by AI that provides personalized workout recommendations, BMI calculations, and fitness coaching.

## Project Structure

```
SportAI/
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context (AuthContext)
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   └── pages/          # Page components
│   └── package.json
├── server/          # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   └── package.json
└── README.md
```

## Features

### Frontend (React + TypeScript)
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🔐 Authentication with login/signup popups
- 📱 Responsive design for mobile and desktop
- 💪 BMI Calculator
- 🤖 AI-powered fitness recommendations
- 💬 Interactive chat interface

### Backend (Node.js + Express)
- 🔐 JWT-based authentication
- 🛡️ Security with helmet, CORS, and rate limiting
- 🗄️ MongoDB database with Mongoose
- ✅ Input validation with express-validator
- 🔒 Password hashing with bcryptjs
- 📝 User profile management

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Setup Instructions

#### 1. Clone the repository
```bash
git clone <repository-url>
cd SportAI
```

#### 2. Backend Setup
```bash
cd server
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start the server
npm run dev
```

The server will run on http://localhost:5000

#### 3. Frontend Setup
```bash
cd client
npm install

# Start the development server
npm run dev
```

The client will run on http://localhost:3000

### Environment Variables

#### Server (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sportai
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Health Check
- `GET /api/health` - Server health check

## Technologies Used

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Vite
- React Query
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- helmet (security)
- cors
- express-validator
- express-rate-limit

## Development

### Running both client and server
```bash
# In one terminal (backend)
cd server && npm run dev

# In another terminal (frontend)
cd client && npm run dev
```

### Building for Production

#### Frontend
```bash
cd client && npm run build
```

#### Backend
```bash
cd server && npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.