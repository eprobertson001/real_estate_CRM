# Real Estate CRM - Setup Instructions

## 🚀 Getting Started

Your Real Estate CRM project has been created! Follow these steps to complete the setup and start using your CRM.

## Step 1: Install Node.js

**Node.js is required to run this application.**

1. **Download Node.js:**
   - Go to [https://nodejs.org/](https://nodejs.org/)
   - Download the LTS version (recommended for most users)
   - Choose the Windows installer (.msi file)

2. **Install Node.js:**
   - Run the downloaded installer
   - Follow the installation wizard
   - ✅ Make sure to check "Add to PATH" during installation
   - Restart your terminal/PowerShell after installation

3. **Verify Installation:**
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers for both commands.

## Step 2: Install Dependencies

Once Node.js is installed, run these commands in your project directory:

```powershell
# Install all project dependencies
npm install

# Generate the database client
npx prisma generate

# Set up the database
npx prisma db push
```

**✅ Troubleshooting Step 2:**

If you encounter an **"upstream dependency conflict"** during `npm install`:
- This was already fixed in the project by replacing incompatible packages
- The installation should work normally now

If you get **"Environment variable not found: DATABASE_URL"** during Prisma commands:
- This is normal - a `.env` file is automatically created with the correct database URL
- The commands should work on retry

If you encounter **"Cannot find module 'autoprefixer'"** error:
- Run: `npm install --save-dev autoprefixer`
- Clear Next.js cache: `Remove-Item -Recurse -Force .next`
- Restart the development server: `npm run dev`

## Step 3: Configure Environment Variables

1. **Copy the environment template:**
   - The `.env.local` file contains all necessary environment variables
   - Update the following important settings:

```env
# Generate a strong secret for authentication
NEXTAUTH_SECRET="your-secure-secret-here"

# Google OAuth (for Gmail integration)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# MLS API credentials
MLS_API_KEY="your-mls-api-key"

# Dotloop API credentials  
DOTLOOP_API_KEY="your-dotloop-api-key"
```

## Step 4: Start the Development Server

```powershell
npm run dev
```

The application will start at: **http://localhost:3000**

## 🏗️ Project Features

Your Real Estate CRM includes:

### ✅ Completed Foundation
- ✅ Next.js 14 with TypeScript setup
- ✅ Tailwind CSS with custom real estate theme
- ✅ Prisma database schema with all entities
- ✅ Authentication ready (NextAuth.js)
- ✅ Project structure organized by features
- ✅ Type definitions for all data models
- ✅ ESLint and TypeScript configuration

### 🎯 Key Features Ready to Implement

1. **Dashboard with Project Management Interface**
   - Transaction pipeline visualization
   - Task management with color coding and tags
   - Activity tracking and metrics
   - Quick actions and navigation

2. **Transaction Management**
   - Complete deal lifecycle tracking
   - Property details with MLS integration
   - Commission calculations
   - Document attachments

3. **Task Management System**
   - Deal timeline templates with required documents
   - Color-coded priority levels
   - Tag-based organization
   - Calendar integration

4. **Document Management**
   - PDF contract parsing and auto-population
   - Required document checklists
   - Dotloop integration for e-signatures
   - File storage and organization

5. **Email Integration**
   - Gmail API integration
   - Send/receive emails from CRM
   - Email templates
   - Conversation threading

6. **Calendar Features**
   - Deal milestone tracking
   - Task due dates
   - Appointment scheduling
   - Deadline reminders

## 📱 Accessibility Features

The interface is designed for users of all ages (18+) with:
- Clean, uncluttered design
- High contrast colors
- Large, easy-to-click buttons
- Keyboard navigation support
- Screen reader compatibility

## 🔌 API Integrations

### MLS Integration
- Automatic property data retrieval
- Listing photos and details
- Market comparables
- Property history

### Dotloop Integration
- Document templates
- E-signature workflows
- Transaction tracking
- Compliance management

### Gmail Integration
- Email management within CRM
- Contact synchronization
- Email templates
- Automated responses

## 📊 Database Schema

The system includes these main entities:
- **Users** (agents, brokers, admins)
- **Transactions** (real estate deals)
- **Properties** (MLS data integration)
- **Tasks** (deal timeline management)
- **Documents** (contracts, disclosures)
- **Calendar Events** (scheduling)
- **Activities** (audit trail)
- **Email Accounts** (Gmail integration)

## 🎨 Deal Timeline Categories

Pre-configured document categories for real estate transactions:

**Real Estate Agent/Broker:**
- Fully Executed Purchase Agreement
- Lead-Based Paint Disclosure
- Agency Disclosure Forms
- Commission Agreement
- Earnest Money Receipt
- Repair Receipts/Addenda
- Final Walkthrough Checklist
- Closing Disclosure

**Title Company/Attorney:**
- Title Search & Insurance Policy
- Settlement Statement
- Deed Transfer
- Mortgage Payoff Statement

**Buyer/Seller:**
- Government-Issued Photo ID
- Cashier's Check/Wire Transfer
- Homeowners Insurance Proof
- Utility Transfer Confirmation

## 🛠️ Development Commands

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint

# Database commands
npx prisma generate    # Generate client
npx prisma db push     # Push schema changes
npx prisma studio      # Open database browser
```

## 🔒 Security Setup

1. **Generate secure secrets:**
   ```powershell
   # Generate a secure NEXTAUTH_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Set up Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

## 📞 Support

If you encounter any issues:
1. Check that Node.js is properly installed
2. Ensure all environment variables are set
3. Verify database connection
4. Check the console for error messages

## 🚀 Next Steps

After completing the setup:
1. Access the application at http://localhost:3000
2. Set up your user account
3. Configure API integrations
4. Import existing transaction data
5. Customize task categories and colors
6. Train your team on the new system

Your Real Estate CRM is now ready to transform your business operations! 🏠
