# Social Running Project

Welcome to the Social Running Project! Follow these instructions to get the server and client running on your machine.

## Getting Started

### Server Setup

1. Open the project folder `socialrunning` on your computer.
2. Open a terminal in the `socialrunning` directory.
3. Type `npm i` to install all the dependencies
4. Type `npm start` or `node server.js` and press Enter to start the server. This process may take a few seconds.
   Or Type `npm run dev` to use nodemon, so that you don't need to restart the server every time you make changes.
5. Wait for the message `Server is running on port 5500` to appear in the terminal. This confirms that the server has successfully started.

### Client Setup

Open the web browser and enter the URL `http://localhost:5500` in the address bar. Press Enter to navigate to the page and start the app.

### Server Setup

If the database connection fails, please verify the settings in db/config-db.js. Double-check both the port and password.

If you're running MongoDB locally on your machine, the port is likely set to 27017. However, if you're using a lab machine, the port may be different, possibly 24667.

### Login

In order to have acces to the aplication, please log in using the admin account :

- username : admin
- password : admin

You'll then have access to the admin profile with existing runs and participations.
