# GameVault - Game Rental & Purchase System

A complete game rental and purchase management platform built using Node.js, Express, and SQL Server.

## 🎮 Features

- **User Management**: Registration, authentication, and profile management
- **Game Catalog**: Browse, search, and filter games by category, platform, or genre
- **Digital Rentals**: Rent games digitally with automatic due date tracking
- **Physical Purchases**: Buy physical copies with real-time inventory management
- **Reviews & Ratings**: Leave reviews with built-in rating validation
- **Waitlist System**: Separate waitlists for both digital and physical availability
- **Copy Management**: Create and manage physical/digital game copies independently
- **Transaction Tracking**: Unified payment and rental history
- **Admin Dashboard**: Centralized statistics and system overview
- **Membership Tiers**: Tiered discount system for premium members
- **Admin Functions**: Full admin dashboard with complete control

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Models**: Database interaction layer connected to SQL Server
- **Controllers**: Core business logic and request handling
- **Routes**: Clean RESTful API endpoints
- **Validation**: Request validation powered by express-validator
- **Error Handling**: Consistent and informative error responses

### Database (SQL Server)
- **Normalized Design**: Well-structured relationships and constraints
- **Transaction Support**: ACID-compliant operations for critical flows
- **Inventory Tracking**: Live availability management for copies

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- SQL Server (2019+)
- npm

### Steps for Setup

1. **Configure SQL Server**
   - Make sure SQL Server is running
   - Set up the database using `gamevault-db.sql`
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
POST /api/users/register     - Register a new user
POST /api/users/login        - Log in to an existing account
GET  /api/users/profile/:id  - Fetch user profile
PUT  /api/users/profile/:id  - Update user profile
GET  /api/users              - List all users (admin)
DELETE /api/users/:id        - Delete a user (admin)
PUT  /api/users/:id/suspend  - Suspend a user (admin)
PUT  /api/users/:id/unsuspend - Unsuspend a user (admin)
```

### Game Management
```
GET    /api/games              - Fetch all games (supports filters)
GET    /api/games/:id          - Fetch a single game by ID
POST   /api/games              - Add a new game (admin)
PUT    /api/games/:id          - Update game details (admin)
DELETE /api/games/:id          - Remove a game (admin)
GET    /api/games/:id/physical-copies  - List available physical copies
GET    /api/games/:id/digital-copies   - List available digital copies
```

### Rental System
```
POST   /api/rentals/rent               - Rent a digital game
PUT    /api/rentals/return/:id         - Return a rented game
DELETE /api/rentals/:id                - Remove rental record (admin)
GET    /api/rentals/user/:id           - Get full rental history for a user
GET    /api/rentals/user/:id/active    - Get currently active rentals
GET    /api/rentals                    - Get all rentals (admin)
GET    /api/rentals/overdue            - Get overdue rentals (admin)
POST   /api/rentals/waitlist/join      - Join the digital waitlist
GET    /api/rentals/waitlist/user/:id  - View user waitlist entries
GET    /api/rentals/waitlist/game/:id  - View game waitlist entries (admin)
GET    /api/rentals/waitlist           - Get all waitlists (admin)
DELETE /api/rentals/waitlist/:id       - Delete a waitlist entry
```

### Purchase System
```
POST   /api/purchases/purchase        - Purchase a physical game
GET    /api/purchases/user/:id        - Get purchase history for a user
GET    /api/purchases/:id             - Fetch a specific purchase
GET    /api/purchases                 - Get all purchases (admin)
POST   /api/purchases/waitlist/join   - Join the physical waitlist
GET    /api/purchases/waitlist/user/:id  - View user physical waitlist
GET    /api/purchases/waitlist/game/:id  - View game physical waitlist (admin)
GET    /api/purchases/waitlist       - Get all physical waitlists (admin)
DELETE /api/purchases/waitlist/:id    - Delete a waitlist entry
```

### Reviews
```
POST   /api/reviews                            - Submit a review
GET    /api/reviews/game/:id                   - Get all reviews for a game
GET    /api/reviews/user/:id                   - Get all reviews by a user
GET    /api/reviews/review/:id                 - Get a single review by ID
PUT    /api/reviews/review/:id                 - Edit a review
DELETE /api/reviews/review/:id                 - Delete a review
GET    /api/reviews/can-review/:userId/:gameId - Check review eligibility
GET    /api/reviews                            - Get all reviews (admin)
```

### Categories
```
GET    /api/categories      - List all categories
GET    /api/categories/:id  - Get a specific category
POST   /api/categories      - Create a category (admin)
PUT    /api/categories/:id  - Update a category (admin)
DELETE /api/categories/:id  - Delete a category (admin)
```

### Copy Management
```
POST   /api/physical-copies              - Create a new physical copy (admin)
GET    /api/physical-copies/game/:id     - Get physical copies for a game
POST   /api/digital-copies               - Create a new digital copy (admin)
GET    /api/digital-copies/game/:id      - Get digital copies for a game
```

### Transactions
```
GET    /api/transactions                 - Get all transactions (admin)
GET    /api/transactions/:id             - Get a specific transaction
GET    /api/transactions/user/:id        - Get transactions for a user
GET    /api/transactions/rentals         - Get rental transactions
GET    /api/transactions/purchases       - Get purchase transactions
```

### Admin & Dashboard
```
POST   /api/admin/login                  - Admin login
GET    /api/admin/verify                 - Verify admin token
GET    /api/dashboard/stats            - Get dashboard statistics
```

### Memberships
```
GET    /api/memberships/tiers              - View all membership tiers
GET    /api/memberships/tiers/:id          - View a single tier
GET    /api/memberships/user/:id           - Get a user's active membership
GET    /api/memberships/user/:id/history   - View membership history
POST   /api/memberships/tiers              - Create a new tier (admin)
POST   /api/memberships/user               - Assign a membership to a user
PUT    /api/memberships/:id/status         - Update membership status
GET    /api/memberships                    - Get all user memberships (admin)
DELETE /api/memberships/:id                - Delete a membership (admin)
```

## 📊 Database Schema

### Core Tables
- **Users**: User accounts and profile data
- **Admins**: Admin accounts and access control
- **Games**: Full game catalog with pricing info
- **Categories**: Game category definitions
- **DigitalCopies**: Available digital rental slots
- **PhysicalCopies**: Physical copy inventory
- **Rentals**: All rental transactions
- **Purchases**: All purchase records
- **Reviews**: User ratings and written reviews
- **MembershipTiers**: Tier definitions and discount rates
- **UserMemberships**: User subscription records

### Supporting Tables
- **DigitalWaitlist**: Queue for digital rental requests
- **PhysicalWaitlist**: Queue for physical purchase requests
- **Transactions**: Unified payment records
- **Penalties**: Late return and damage fines
- **Notifications**: User alerts and availability notices
- **AdminActivityLog**: Full audit trail of admin actions

## 🔧 Development

### Scripts
```bash
npm start          # Start production server
npm run server     # Start development server with nodemon
npm run client     # Start frontend
npm run dev        # Start both backend and frontend concurrently
```

### Project Structure
```
GameVault/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── gameController.js
│   │   ├── rentalController.js
│   │   ├── purchaseController.js
│   │   ├── reviewController.js
│   │   ├── categoryController.js
│   │   ├── membershipController.js
│   │   ├── transactionController.js
│   │   ├── dashboardController.js
│   │   └── adminController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Game.js
│   │   ├── Rental.js
│   │   ├── Purchase.js
│   │   ├── Review.js
│   │   ├── Category.js
│   │   ├── Membership.js
│   │   ├── Admin.js
│   │   ├── Waitlist.js
│   │   ├── Transaction.js
│   │   ├── PhysicalCopies.js
│   │   ├── DigitalCopies.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── gameRoutes.js
│   │   ├── rentalRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── membershipRoutes.js
│   │   ├── physicalCopyRoutes.js
│   │   ├── digitalCopyRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminWaitlist.js
│   │   │   ├── AdminUsers.js
│   │   │   ├── AdminWishlist.js
│   │   │   └── ...
│   │   └── App.js
│   ├── public/
│   └── package.json
├── gamevault-db.sql
└── README.md
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

- **Input Validation**: All incoming data validated using express-validator
- **SQL Injection Prevention**: Parameterized queries used throughout
- **Error Handling**: Error responses never expose sensitive server details
- **CORS**: Properly configured for frontend integration
- **Environment Variables**: All sensitive config stored in `.env`

## 📝 Important Notes

- **SQL Server** must be running before starting the backend
- **CopyID vs GameID**: Use CopyID for transactions, GameID for browsing
- **Transactions**: Critical operations wrapped in database transactions
- **Admin Routes**: Should have authentication middleware added before production
- **ID Generation**: Currently random — replace with UUID or DB auto-increment in production

## 🤝 Contributing

1. Fork the repository
2. Create a new feature branch
3. Implement your changes
4. Add tests where applicable
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.
