# Project Sahayata - Digital Mental Wellness System

A comprehensive digital mental wellness platform designed specifically for students, providing confidential access to AI-guided support, professional counselling, educational resources, and peer community forums.

## 🌟 Features

### For Students
- **AI Wellness Companion**: 24/7 AI-guided mental health support with crisis detection
- **Confidential Booking System**: Seamless appointment scheduling with professional counsellors
- **Resource Hub**: Curated psychoeducational content in multiple languages
- **Peer Support Forum**: Anonymous community discussions moderated by trained peers
- **Personal Dashboard**: Mood tracking, appointment management, and personalized recommendations

### For Administrators
- **Analytics Dashboard**: Anonymized usage statistics and trend analysis
- **Content Management**: Resource library administration
- **User Management**: Student and staff account oversight
- **Reporting Tools**: Comprehensive data export and analysis

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, express-rate-limit
- **File Upload**: multer
- **Email**: nodemailer

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Responsive design with modern styling
- **JavaScript**: Vanilla JS with DOM manipulation
- **UI Components**: Cards, modals, forms, navigation

## 📁 Project Structure

```
project-sahayata/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.config.js          # MongoDB connection configuration
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Authentication logic
│   │   │   ├── booking.controller.js # Appointment management
│   │   │   ├── resource.controller.js # Resource management
│   │   │   ├── chat.controller.js    # AI chat functionality
│   │   │   └── admin.controller.js   # Admin dashboard logic
│   │   ├── middlewares/
│   │   │   └── auth.jwt.js          # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── index.js             # Database connection and model exports
│   │   │   ├── user.model.js        # User schema and methods
│   │   │   ├── appointment.model.js # Appointment schema
│   │   │   ├── resource.model.js    # Resource schema
│   │   │   └── chat.model.js        # Chat session and message schemas
│   │   ├── routes/
│   │   │   └── index.js             # API route definitions
│   │   └── services/
│   │       └── analytics.service.js # Anonymized analytics
│   ├── app.js                       # Main Express application
│   ├── package.json                 # Dependencies and scripts
│   └── env.example                  # Environment variables template
├── index.html                       # Landing page
├── sign-in.html                     # Login page
├── sign-up.html                     # Registration page
├── dashboard.html                   # Student dashboard
├── ai-chat-bot.html                 # AI wellness companion
├── booking.html                     # Appointment booking
├── resources.html                   # Resource hub
├── forum.html                       # Peer support forum
├── user-profile.html                # User profile management
├── user-settings.html               # Account settings
├── forgot-password.html             # Password reset
└── README.md                        # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project-sahayata
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```env
NODE_ENV=development
PORT=8080
MONGO_URI=mongodb://localhost:27017/sahayata_dev
JWT_SECRET=your-super-secret-jwt-key-here
```

#### Database Setup
1. **Install MongoDB** (if not already installed):
   - **Windows**: Download from [MongoDB website](https://www.mongodb.com/try/download/community)
   - **macOS**: `brew install mongodb-community`
   - **Ubuntu**: `sudo apt install mongodb`

2. **Start MongoDB**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Ubuntu
   sudo systemctl start mongod
   ```

3. **Create Database**:
   ```bash
   mongosh
   use sahayata_dev
   ```

#### Start the Backend Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:8080`

### 3. Frontend Setup

The frontend consists of static HTML files that can be served by any web server.

#### Using Python (Simple HTTP Server)
```bash
# From project root
python -m http.server 3000
```

#### Using Node.js (http-server)
```bash
# Install http-server globally
npm install -g http-server

# Serve frontend files
http-server -p 3000
```

#### Using Live Server (VS Code Extension)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Booking System
- `GET /api/counsellors` - List all counsellors
- `GET /api/counsellors/:id` - Get counsellor details
- `GET /api/counsellors/:id/availability` - Get availability
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get user appointments
- `DELETE /api/appointments/:id` - Cancel appointment

### Resources
- `GET /api/resources` - List all resources
- `GET /api/resources/:id` - Get resource details
- `POST /api/resources/:id/view` - Increment view count
- `POST /api/resources/:id/rate` - Rate resource
- `GET /api/resources/categories/:category` - Get by category
- `GET /api/resources/search` - Search resources

### AI Chat
- `POST /api/chat/start` - Start chat session
- `POST /api/chat/message` - Send message
- `GET /api/chat/sessions` - Get user sessions
- `GET /api/chat/sessions/:sessionId` - Get session messages
- `POST /api/chat/sessions/:sessionId/end` - End session

### Admin Dashboard
- `GET /api/admin/analytics` - Get anonymized analytics
- `GET /api/admin/dashboard-metrics` - Get real-time metrics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/appointments` - Get all appointments
- `GET /api/admin/reports` - Generate reports

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Security Headers**: Helmet.js for security headers
- **Data Anonymization**: Privacy-preserving analytics

## 📊 Database Schema

### User Model
```javascript
{
  studentId: String,        // Unique student identifier
  fullName: String,         // User's full name
  email: String,           // Email address
  password: String,        // Hashed password
  role: String,            // student, counsellor, moderator, admin
  department: String,      // Academic department
  yearOfStudy: Number,     // Year of study (1-6)
  phone: String,           // Phone number
  emergencyContact: String, // Emergency contact
  isActive: Boolean,       // Account status
  lastLogin: Date,         // Last login timestamp
  preferences: Object      // User preferences
}
```

### Appointment Model
```javascript
{
  userId: ObjectId,        // Reference to User
  counsellorId: ObjectId,  // Reference to User (counsellor)
  startTime: Date,         // Appointment start time
  endTime: Date,          // Appointment end time
  status: String,         // scheduled, confirmed, completed, cancelled
  sessionType: String,    // in-person, video, phone
  notes: String,          // Session notes
  cancellationReason: String // Reason for cancellation
}
```

### Resource Model
```javascript
{
  title: String,           // Resource title
  description: String,     // Resource description
  content: String,         // Resource content
  category: String,        // Resource category
  type: String,           // article, video, audio, infographic
  language: String,       // Resource language
  duration: Number,       // Duration in minutes
  fileUrl: String,        // File URL
  thumbnailUrl: String,   // Thumbnail URL
  tags: [String],         // Resource tags
  isPublished: Boolean,   // Publication status
  viewCount: Number,      // View count
  rating: Number,         // Average rating
  ratingCount: Number,    // Number of ratings
  createdBy: ObjectId     // Reference to User
}
```

### Chat Models
```javascript
// ChatSession
{
  userId: ObjectId,        // Reference to User
  sessionId: String,       // Unique session identifier
  status: String,         // active, ended, emergency
  startTime: Date,        // Session start time
  endTime: Date,          // Session end time
  emergencyTriggered: Boolean, // Emergency flag
  emergencyKeywords: [String]  // Triggered keywords
}

// ChatMessage
{
  sessionId: ObjectId,     // Reference to ChatSession
  sender: String,         // user, ai
  message: String,        // Message content
  timestamp: Date,        // Message timestamp
  messageType: String,    // text, suggestion, emergency
  metadata: Object        // Additional message data
}
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Health check
curl http://localhost:8080/health

# Register user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

## 📈 Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=8080
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sahayata_prod
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-domain.com
```

### Deployment Options

#### Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
git push heroku main
```

#### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

#### VPS/Cloud Server
```bash
# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start app.js --name "sahayata-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added MongoDB/Mongoose backend
- **v1.2.0** - Enhanced security and analytics

## 🙏 Acknowledgments

- Mental health professionals for guidance
- Student welfare departments for feedback
- Open source community for tools and libraries
- Educational institutions for pilot testing

---

**Project Sahayata** - Empowering students with accessible mental health support. 💚
