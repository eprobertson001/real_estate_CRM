# Copilot Instructions for Real Estate CRM

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a comprehensive real estate CRM system built with Next.js, TypeScript, and Tailwind CSS. The application focuses on transaction management, document automation, and seamless integrations.

## Key Features
- **Transaction Management**: Complete real estate deal lifecycle tracking
- **MLS Integration**: Property data automation via MLS API
- **Dotloop Integration**: Document management and e-signature workflows
- **Gmail Integration**: Email management within the CRM
- **PDF Document Parsing**: Automated contract data extraction
- **Task Management**: Color-coded, tagged task organization
- **Calendar System**: Deal timeline and deadline tracking
- **Activity Tracking**: Performance metrics and reporting
- **Accessible UI**: Clean, user-friendly interface for all ages 18+

## Architecture Guidelines
- Use TypeScript for type safety
- Implement responsive design with Tailwind CSS
- Follow Next.js App Router patterns
- Use React Server Components where appropriate
- Implement proper error handling and loading states
- Ensure accessibility standards (WCAG 2.1 AA)
- Use modern React patterns (hooks, context)

## Database Schema
- Users (agents, brokers, admins)
- Transactions (real estate deals)
- Properties (MLS data)
- Tasks (with tags, colors, due dates)
- Documents (PDFs, contracts, disclosures)
- Activities (tracking and reporting)
- Calendar Events

## API Integration Patterns
- Use Next.js API routes for backend logic
- Implement proper authentication and authorization
- Use environment variables for API keys
- Handle rate limiting and error responses
- Implement caching strategies

## Code Organization
- Components in `/src/components` with sub-folders by feature
- Pages in `/src/app` following App Router structure
- API routes in `/src/app/api`
- Utilities in `/src/lib`
- Types in `/src/types`
- Database schemas in `/src/lib/db`

## Styling Guidelines
- Use Tailwind CSS for consistent styling
- Implement design system with reusable components
- Ensure responsive design (mobile-first)
- Use semantic colors for task categories
- Maintain consistent spacing and typography
