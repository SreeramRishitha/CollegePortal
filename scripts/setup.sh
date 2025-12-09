#!/bin/bash

echo "🚀 Setting up College Portal..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create .env files if they don't exist
echo "📝 Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your actual values!"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend/.env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > frontend/.env.local
fi

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p backend/uploads/documents
mkdir -p backend/uploads/complaints

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your MongoDB URI and Gemini API key"
echo "2. Start MongoDB (or use Docker: docker-compose up -d mongodb)"
echo "3. Run 'npm run dev' to start the application"
echo ""
echo "For detailed instructions, see SETUP.md"

