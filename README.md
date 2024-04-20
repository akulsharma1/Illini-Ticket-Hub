[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/3e23_jye)

### Setup
- View `backend/readme.md` and `frontend/readme.md` in order to set up all the code
- Once set up, do `yarn start` in `backend` and `yarn start` in `frontend` in order to start both the backend and frontend.
- Visit http://localhost:3000 to view the frontend. It automatically connects to the backend.

Week 8 Progress:

  Aaron:
  
    - Set up Plotly and the files needed to use it
    - Created graphs for all the buy and sell transactions on the user's profile page
    
  Adrian:
  
    - 

    
  Ritam: 
  
    - 

  
  Akul: 
  
    - 

Week 7 Progress:

  Aaron:
  
    - Fixed minor bug with sign out button not working completely
    - Wrote backend API to add a ticket to a users account
    - Added frontend button and pop up menu for users to add tickets
      - Added check to ensure no double tickets
    
  Adrian:
  
    - Wrote backend APIs to edit a user's ask, remove a user's ask, edit a user's bid, remove a user's bid
    - Fixed bugs in existing backend APIs
      - fixed bug where we were comparing strings rather than integers, resulting in unexpected behavior
      - fixed logic error in a conditional block which checked if a ticket could be transferred
    - added an edit bid and edit ask modal on the frontend
    - added conditional rendering to the remove bid/ask and buy/sell now buttons

    
  Ritam: 
  
    - Wrote backend APIs to get a user's current ask or bid for a specific event
    - Implemented displaying this current ask or bid for each event's respective buy or sell page
    - On dashboard, for a given ticket a user owns, if it is listed, it now displays the price it is listed at
    - Fixed dashboard problem we've had regarding not being able to scroll, sorted tickets on dashboard by whether listed or not
    - Other misc frontend user experience / design improvements

  
  Akul: 
  
    - Fixed signin bug where backend crashes when an email that doesn't exist is inputted
    - Added general logic for future POST body type checking & implemented in account
    - General formatting adjustments

Week 6 Progress:

  Aaron:
  
    - Connected dashboard page to backend to display tickets dynamically
    - Fixed minor bug where signout button doesn't cover entire button
    - Created backend API that returns the total bids associated with an account and the total asks associated with an account
    - Used above APIs to connect more of accountView to the frontendd
    
  Adrian:
  
    - Connected the buy now and make new bid buttons up to the backend (makes call to the bid endpoint)
    - Created a modal which pops up on the screen to let the user enter an amount to bid in a textbox
    - Connected sell now and make new ask buttons to backend
    - Created ask modal to let user enter a specific amount to ask for

    
  Ritam: 
  
    - Wrote backend API that returns the top 5 lowest asks and the top 5 highest bids for each specific event
    - Updated frontend in the sell and buy pages with a new card that displays the top 5 lowest asks and top 5 highest bids

  
  Akul: 
  
    - Added transactions table
    - Integrated transactions table with sales - when a sale occurs it gets added to the transactions table
    - Cleaned up some transfer/sale helper functions

Week 5 Progress:

  Aaron:
  
    - Added images to eventsView page to help with aesthetics
    - Added sign-out button to all pages
    - fixed various small UI issues for better viewing experience
    
  Adrian:
  
    - added dynamic routing to the buy page so that each event has its own page
    - retrieved event specific data from local store within each buy page to display the relevant information
    - connected backend in buy page to fetch the highest bid and lowest ask from backend

    
  Ritam: 
  
    - Removed buy and sell page from the sidebar, and added account page to the sidebar
    - Made specific unique sell pages for each event, pulling from localstorage from the event card to guide to which event to sell
    - Added routing to specific event sell pages from the event card in the events tab
    - Made some light frontend changes for user experience and made buy/sell pages look better

  
  Akul: 
  
    - Added the ability to create a bid (POST /bids/create)
    - Added the ability to create an ask (POST /asks/create)
    - Added logic for matching asks/bids and transferring tickets
    - Added event creation


Week 4 Progress:

  Aaron:
  
    - Created event page, added routing to it, and connected it to backend to dynamically display events
    - Added global access to userProfile, allowing other componenets to access account information
    
  Adrian:
  
    - created buy page and added routing to it
    - resolved some naming conflicts in the buyPage and eventsView css files that were creating unwanted dependencies

    
  Ritam: 
  
    - Coded sell page and established routing for it
    - Made some UI changes for buy page, made some other general web page design and flow edits
  
  Akul: 
  
    - Added endpoint POST `/transfer` to transfer a given ticket between two users. Endpoint checks if the ticket can be transferred (e.g. sales are enabled, new owner doesn't already own a ticket, etc.)
    - Added endpoints GET `/events` and GET `/events/purchase/:event_id` to return necessary info for buy and sell pages
    - Added endpoint documentation

Week 3 Progress:

  Aaron:
  
    - Connected log-in page to backend to check if the users email and password match with what's on the database, logging them in if it is
    - Updated frontend to display "Incorrect Password" if the password is invalid
    - Added userProfile class for other components to access user data locally
    
  Adrian:
  
    - updated frontend with new fields for account information such as number of active bids and date of account creation

    - Added backend API calls to fetch user account data from database to display

    
  Ritam: 
  
    - Updated frontend for create account to include a name field for a new user to input their name 

    - Implemented backend API calls to create account page, so that when user creates account, it actually enters to the database and creates an account

    - Made general routing changes for creating account

  
  Akul: 
  
    - adjusted GET /account/tickets to display event data (start time, away team, etc.) instead of just event ID

    - adjusted POST /account/sign-in to return sign in details necessary for frontend

    - removed unnecessary test endpoints


Week 2 Progress:

  Aaron:
  
    - created dashboard page
    
    - added sidebar with dashboard, buy, sell and event tabs and account button
    
    - connected dashboardTickets file to the backend to display ticket cards on the dashboard
    
    - linked each tab in sidebar to their respective webpages
    
  Adrian:
  
    - created account view page where account name and email are displayed. Added the sidebar component to the page.
    
    - added routing from account button on the dashboard to account page
    
    - added routing from logout button on account page to login page 
    
    - used navigator to pass account information from login page to dashboard and from dashboard to account page
    
  Ritam: 
  
    - Designed and coded frontend for Login page, routed this to the dashboard, added button to route to create an account

    - Designed and coded frontend for Create Account page, routed this to dashboard, added button to route to login page

    - Made general routing changes and designed webpage workflow, made some basic webpage edits

  
  Akul: 
  
    - remodeled sql database and wrote sample data creation scripts to streamline testing process

    - added backend GET /account/profile (get profile details) and GET /account/tickets (get tickets for account)

    - wrote backend flow for account creation and signin (includes password hashing)
  
