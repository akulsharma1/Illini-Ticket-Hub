[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/3e23_jye)

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
  
