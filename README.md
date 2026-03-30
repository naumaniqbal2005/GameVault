# GameVault - Game Rental & Purchase System

A comprehensive game rental and purchase management system built with Node.js, Express, and SQL Server.

## 🎮 Features

- **User Management**: Registration, authentication, profile management
- **Game Catalog**: Browse, search, filter games by category/platform/genre
- **Digital Rentals**: Rent games digitally with due date tracking
- **Physical Purchases**: Buy physical copies with inventory management
- **Reviews & Ratings**: User reviews with rating validation
- **Waitlist System**: Both digital and physical waitlists
- **Membership Tiers**: Discount system for premium members
- **Admin Functions**: Complete admin dashboard functionality
- **Transaction Tracking**: Payment and rental history

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Models**: Database interaction layer with SQL Server
- **Controllers**: Business logic and request handling
- **Routes**: RESTful API endpoints
- **Validation**: Input validation using express-validator
- **Error Handling**: Comprehensive error management

### Database (SQL Server)
- **Normalized Design**: Proper relationships and constraints
- **Transaction Support**: ACID compliance for critical operations
- **Inventory Tracking**: Real-time availability management

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- SQL Server (2019+)
- npm

### Setup Steps

1. **Configure SQL Server**
   - Ensure SQL Server is running
   - Create database using `gamevault-db.sql`
   - Enable SQL Server Authentication

2. **Environment Configuration**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `.env` with your database credentials:
   ```
   DB_SERVER=localhost\\SQLEXPRESS
   DB_NAME=GameVault
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

3. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Start Backend Server**
   ```bash
   npm start
   # or for development
   npm run server
   ```

5. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
```
POST /api/users/register     - User registration
POST /api/users/login        - User login
GET  /api/users/profile/:id  - Get user profile
PUT  /api/users/profile/:id  - Update user profile
```

### Game Management
```
GET    /api/games              - Get all games (with filters)
GET    /api/games/:id          - Get game by ID
POST   /api/games              - Create game (admin)
PUT    /api/games/:id          - Update game (admin)
DELETE /api/games/:id          - Delete game (admin)
GET    /api/games/:id/physical-copies  - Get available physical copies
GET    /api/games/:id/digital-copies   - Get available digital copies
```

### Rental System
```
POST   /api/rentals/rent        - Rent a digital game
PUT    /api/rentals/return/:id - Return a game
DELETE /api/rentals/:id          - Delete rental (admin)
GET    /api/rentals/user/:id    - Get user rental history
GET    /api/rentals/user/:id/active - Get active rentals
POST   /api/rentals/waitlist/join - Join digital waitlist
GET    /api/rentals/waitlist/user/:id - Get user waitlist
```

### Purchase System
```
POST   /api/purchases/purchase     - Buy physical game
GET    /api/purchases/user/:id     - Get user purchase history
GET    /api/purchases/:id          - Get purchase by ID
POST   /api/purchases/waitlist/join - Join physical waitlist
```

### Reviews
```
POST   /api/reviews              - Create review
GET    /api/reviews/game/:id      - Get game reviews
GET    /api/reviews/user/:id      - Get user reviews
PUT    /api/reviews/review/:id   - Update review
DELETE /api/reviews/review/:id   - Delete review
GET    /api/reviews/can-review/:userId/:gameId - Check if user can review
```

### Categories
```
GET    /api/categories           - Get all categories
GET    /api/categories/:id       - Get category by ID
POST   /api/categories           - Create category (admin)
PUT    /api/categories/:id       - Update category (admin)
DELETE /api/categories/:id       - Delete category (admin)
```

### Memberships
```
GET    /api/memberships/tiers              - Get all membership tiers
GET    /api/memberships/user/:id          - Get user membership
GET    /api/memberships/user/:id/history   - Get membership history
POST   /api/memberships/user            - Create user membership
PUT    /api/memberships/:id/status      - Update membership status
```

## 📊 Database Schema

### Core Tables
- **Users**: User accounts and profiles
- **Admins**: Administrative accounts
- **Games**: Game catalog with pricing
- **Categories**: Game categorization
- **DigitalCopies**: Available digital slots
- **PhysicalCopies**: Physical inventory
- **Rentals**: Rental transactions
- **Purchases**: Purchase records
- **Reviews**: User ratings and reviews
- **MembershipTiers**: Discount levels
- **UserMemberships**: User subscription data

### Supporting Tables
- **DigitalWaitlist**: Digital rental queue
- **PhysicalWaitlist**: Physical purchase queue
- **Transactions**: Payment records
- **Penalties**: Fine management
- **Notifications**: User alerts
- **AdminActivityLog**: Audit trail

## 🔧 Development

### Scripts
```bash
npm start          # Start production server
npm run server      # Start development server with nodemon
npm run client      # Start frontend
npm run dev         # Start both backend and frontend
```

### Project Structure
```
GameVault/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── gameController.js
│   │   ├── rentalController.js
│   │   ├── purchaseController.js
│   │   ├── reviewController.js
│   │   ├── categoryController.js
│   │   └── membershipController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Game.js
│   │   ├── Rental.js
│   │   ├── Purchase.js
│   │   ├── Review.js
│   │   ├── Category.js
│   │   ├── Membership.js
│   │   └── Admin.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── gameRoutes.js
│   │   ├── rentalRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── membershipRoutes.js
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js               # Express server
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── gamevault-db.sql           # Database schema
```

## 🧪 Testing with Postman

### Example Requests

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
    "fullName": "John Doe",
    "email": "john@example.com"
}
```

#### Rent a Game
```http
POST /api/rentals/rent
Content-Type: application/json

{
    "userId": 1,
    "copyId": 2,
    "rentalDays": 7
}
```

#### Get Games with Filters
```http
GET /api/games?category=1&platform=PlayStation&search=Zelda
```

#### Create Review
```http
POST /api/reviews
Content-Type: application/json

{
    "userId": 1,
    "gameId": 101,
    "rentalId": 1,
    "rating": 5,
    "reviewText": "Amazing game!"
}
```

## 🔒 Security Considerations

- **Input Validation**: All inputs validated using express-validator
- **SQL Injection Prevention**: Parameterized queries throughout
- **Error Handling**: No sensitive information leaked
- **CORS**: Configured for frontend integration
- **Environment Variables**: Sensitive data in .env file

## 📝 Important Notes

- **SQL Server** must be running for the application to work
- **CopyID** vs **GameID**: Use CopyID for transactions, GameID for browsing
- **Transactions**: Critical operations use database transactions
- **Admin Routes**: Should be protected with authentication middleware
- **ID Generation**: Currently using random numbers (use proper ID generation in production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
