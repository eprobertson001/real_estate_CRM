# Real Estate CRM

A comprehensive Customer Relationship Management system designed specifically for real estate professionals. This CRM provides transaction management, document automation, MLS integration, email management, and project-style task tracking.

## Features

### 🏠 Transaction Management
- Complete real estate deal lifecycle tracking
- Contract to close workflow management
- Property details with MLS integration
- Commission tracking and calculations
- Document attachment and automation

### 📊 Dashboard & Analytics
- Project management-style interface
- Pipeline visualization
- Performance metrics and reporting
- Activity tracking
- Calendar integration

### 📧 Email Integration
- Gmail integration for seamless communication
- Send and receive emails directly from the CRM
- Email tracking and history
- Automated email templates

### 📄 Document Management
- **PDF & Word Document Upload**: Drag-and-drop interface for contract uploads
- **AI-Powered Parsing**: Automatic extraction of property addresses, prices, buyer/seller names, and transaction details
- **Smart Data Integration**: Merge document data with MLS property information
- **Conflict Resolution**: When document and MLS data differ, users can choose which information to keep
- **Auto-Population**: Transaction forms pre-filled with extracted data
- Document storage and organization
- Digital signature integration via Dotloop
- Required document checklists

### ✅ Task Management
- Color-coded task organization
- Tag-based categorization
- Due date tracking
- Deal timeline templates
- Automated task creation

### 🗓️ Calendar Features
- Integrated calendar system
- Deadline tracking
- Appointment scheduling
- Task reminders
- Transaction milestone tracking

### 🔗 Integrations
- **MLS API**: Automatic property data retrieval
- **Dotloop**: Document management and e-signatures
- **Gmail API**: Email integration
- **Google Calendar**: Calendar synchronization

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Prisma ORM with SQLite (development)
- **Authentication**: NextAuth.js
- **State Management**: TanStack Query
- **UI Components**: Radix UI primitives
- **Email**: Nodemailer with Gmail API
- **PDF Processing**: pdf-parse and mammoth for document automation
- **File Upload**: formidable for handling document uploads

## Getting Started

### Prerequisites

1. **Node.js** (version 18 or higher)
   - Download and install from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

### Installation

1. **Clone and setup the repository:**
   ```bash
   cd real_estate_CRM
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local` to create your environment file
   - Update the following variables:
   ```env
   # Database
   DATABASE_URL="sqlite:./dev.db"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"
   
   # Google OAuth & Gmail
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # MLS API
   MLS_API_KEY="your-mls-api-key"
   
   # Dotloop API
   DOTLOOP_API_KEY="your-dotloop-api-key"
   ```

3. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── transactions/      # Transaction management
│   ├── tasks/            # Task management
│   ├── calendar/         # Calendar features
│   └── settings/         # User settings
├── components/           # React components
│   ├── ui/              # Base UI components
│   ├── dashboard/       # Dashboard-specific components
│   ├── transactions/    # Transaction components
│   ├── tasks/          # Task components
│   └── layout/         # Layout components
├── lib/                # Utilities and configurations
│   ├── auth.ts         # Authentication setup
│   ├── db.ts          # Database connection
│   ├── validations.ts  # Zod schemas
│   └── utils.ts       # Helper functions
└── types/             # TypeScript type definitions
```

## Key Features in Detail

### Deal Timeline Management

The system includes pre-built deal timelines with the following categories:

**Real Estate Agent/Broker Documents:**
- Fully Executed Purchase Agreement
- Lead-Based Paint Disclosure
- Agency Disclosure Forms
- Commission Agreement
- Earnest Money Receipt
- Repair Receipts/Addenda
- Final Walkthrough Checklist
- Closing Disclosure

**Title Company/Attorney Documents:**
- Title Search & Insurance Policy
- Settlement Statement
- Deed Transfer
- Mortgage Payoff Statement

**Buyer/Seller Documents:**
- Government-Issued Photo ID
- Cashier's Check/Wire Transfer
- Homeowners Insurance Proof
- Utility Transfer Confirmation

### Task Management

- **Color Coding**: Visual organization with customizable colors
- **Tag System**: Flexible categorization
- **Priority Levels**: High, Medium, Low, Urgent
- **Due Date Tracking**: Never miss important deadlines
- **Automated Creation**: Tasks auto-generated based on deal timeline

### Accessibility

The interface is designed to be accessible for users of all ages (18+) with:
- Clear, high-contrast design
- Large, easy-to-click buttons
- Keyboard navigation support
- Screen reader compatibility
- Simplified workflows

## API Integrations

### MLS Integration
Configure your MLS API credentials to automatically pull property data including:
- Property details and specifications
- Listing photos and descriptions
- Market comparables
- Listing history

### Dotloop Integration
Connect your Dotloop account for:
- Document template access
- Electronic signature workflows
- Transaction tracking
- Compliance management

### Gmail Integration
Set up Gmail API for:
- Email sending and receiving
- Contact synchronization
- Email templates
- Conversation threading

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

### Database Schema

The application uses Prisma with the following main entities:
- **Users** - Agent/broker accounts
- **Transactions** - Real estate deals
- **Properties** - Property information
- **Tasks** - Deal-related tasks
- **Documents** - File attachments
- **Activities** - Audit trail
- **Calendar Events** - Scheduled items

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the API integration guides

## License

This project is proprietary software for real estate professionals.

---

**Note**: This CRM is designed specifically for real estate workflows and includes industry-specific features and compliance requirements.
