# Social Running Project
Welcome to the Social Running Project! This guide will help you set up the server, client, and database on your local machine.

## Project Overview
This project was part of the CS5003 Masters programming project module. **As the team leader of six**, I guided our group through the completion of this project in 2 weeks, achieving a high score of **19 out of 20**. 

This application provides a comprehensive platform for planning and organizing running events for running enthusiasts, the final implementation includes:

- **User authentication**:users can register,login and logout through sessions.
- **Run planning and scheduling**: running routes can be planned in detail, including start and end points, meeting points, time, difficulty level and expected pace. Form validation avoids creating run plans or entering unrealistic data before the current time. Interactive map integration allows users to visualize their routes (connecting start, meeting and finish points), providing a more intuitive and engaging planning experience.
- **Interactive Run List**: Users can view available runs, as well as runs recommended through an algorithm based on user preferences
- **Participate in Runs & Comments**: Features include the ability to join/unjoin runs, view detailed run information, and a comment section for community interaction.
- **Weather Integration**:Get real-time weather forecasts from an external API
- **User Space**:A dedicated space for users to view their stats and participated runs.
- **Design & Usability**: The platform has a responsive, modern and clean design that enhances user interaction and accessibility.


### Team Working
In project management, we utilize **Jira** to assign tasks, monitor progress through visual dashboards, and facilitate knowledge sharing through a central project page. The page serves as a repository for important documents including meeting minutes and database setup guides.

We divided the project into two main iterations. The first iteration delivered a **minimum viable product (MVP)** by March 24th, including user authentication and basic running list functionality. The second iteration ended on April 1, introducing additional features such as a comment section, run recommendations, and a dedicated user space. The time between April 1 and 4 was reserved for testing and report writing.

To ensure clarity and consistency, we held kickoff and wrap-up meetings at the beginning and end of each iteration, respectively. Any issues encountered during development were quickly discussed in our group chat, creating a supportive problem-solving environment. As each iteration came to a close, we shared daily updates in the group chat to highlight the project status and address any outstanding tasks, specifically tagging certain members as necessary to improve responsiveness.


## Getting Started
### Server Setup
- Navigate to the `socialrunning` project folder on your computer.
- Open a terminal within this directory.
- Install all necessary dependencies by running `npm i`.
- Start the server using npm start or node server.js. For development, use npm run dev to automatically restart the server after changes.
- Ensure the server is running successfully on port `5500` as indicated by the terminal message.
  
### Client Setup
Access the application by entering `http://localhost:5500` in your web browser's address bar.

### Database Setup
Check the database connection settings in `db/config-db.js`, ensuring the correct port and password are used. Local MongoDB typically uses port `27017`, but other setups might vary.

### Login
Log in with the admin account to access full features:

Username: admin
Password: admin

Enjoy full access to admin features, including viewing existing runs and participations.
