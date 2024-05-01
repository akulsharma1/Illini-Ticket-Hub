### About Illini Ticket Hub
Illini Ticket Hub was created to solve a major issue at UIUC: there is no effective way for students to sell their student sports tickets. Current ticket marketplaces like Ticketmaster and Seatgeek do not allow the sale of student tickets. Thus, we created Illini Ticket Hub. It is a fullstack application with a marketplace and ticket management dashboard.

### Functionality
- Ticket management dashboard.
- Event dashboard
- Marketplace (similar to [StockX's](https://stockx.com) marketplace with asks and bids). Has full functionality including checking validity of sales and edge cases.
- Full account creation functionality.
- Add/view tickets in accounts.
- View transaction history (with graphs).
- Event adding/management for admins.

### Tech Stack
- Backend: TypeScript/Node.JS, PostgreSQL (Prisma ORM), Express.JS, Microsoft Azure (for cloud deployment).
- Frontend: TypeScript/Node.JS, React.JS, HTML/CSS

### Setup
- View `backend/readme.md` and `frontend/readme.md` in order to set up all the code
- Once set up, do `yarn start` in `backend` and `yarn start` in `frontend` in order to start both the backend and frontend.
- Visit http://localhost:3000 to view the frontend. It automatically connects to the backend.
