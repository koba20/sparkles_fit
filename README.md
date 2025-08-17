# XIVTTW E-commerce Project

## Project info

**URL**: https://lovable.dev/projects/032842d0-ac46-4953-b00c-07a539fbebf7

## Database Setup

This project requires proper database setup to function correctly. If you encounter any database-related errors, please refer to the following setup guides:

- [Orders Table Setup](./DATABASE_SETUP.md) - Required for processing orders
- [Contact Messages Setup](./CONTACT_MESSAGES_SETUP.md) - Required for contact form functionality

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/032842d0-ac46-4953-b00c-07a539fbebf7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend & Database)
- React Router (Navigation)
- React Query (Data Fetching)

## Features

### Shopping Cart System
- **Dedicated Cart Page**: Full-featured cart page at `/cart` with optimized UI
- **Cart Context**: Global cart state management with Supabase integration
- **Quantity Management**: Add, remove, and update item quantities
- **Order Summary**: Real-time calculation of subtotal, shipping, and tax
- **Responsive Design**: Mobile-optimized cart interface
- **Empty State**: Beautiful empty cart state with call-to-action buttons

### Cart Features
- Add items to cart from product detail pages
- View cart items with product images, names, and prices
- Update quantities with +/- buttons
- Remove individual items or clear entire cart
- Real-time price calculations
- Free shipping threshold ($100+ orders)
- Tax calculation (8%)
- Secure checkout flow (placeholder)
- Continue shopping functionality

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/032842d0-ac46-4953-b00c-07a539fbebf7) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
# sparkles_fit
