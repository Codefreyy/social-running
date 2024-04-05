# Social Running: Testing

To ensure that the user experience of our social running app is smooth and seamless, we adopted the following testing strategy:

1. Testing tools and techniques: API interactions were verified through Postman and curl to ensure smooth data exchange between the front and back ends. We developed test cases covering both positive and negative scenarios and conducted manual tests to evaluate the usability, intuitiveness and overall user experience of the app. All test cases were documented in the **test_cases.md** file in the project folder.
2. Issue Tracking and Resolution: All identified issues were tracked and resolved using Jira to ensure that each one was handled properly.
3. UI Testing: Manual UI testing and debugging was performed on Mozilla and Google Chrome to ensure cross-browser compatibility and stability.

## Test Data Preparation

Upon server startup, the system automatically injects sample data to facilitate testing. This includes:

- **20 runs** with varied levels to represent different skill levels.
- **20 users** to simulate a diverse user base.
- **Random assignment** of users to runs to mimic real participation.
- **Comments** on runs based on participation, ensuring each run has relevant feedback.

This approach generates a comprehensive dataset for testing various application scenarios, such as user engagement and run participation.

_Note:_ The `db-setup.js` script injects 20 data entries into the database at each start to provide a substantial amount of data for evaluation, specifically when logging in as an admin.

To prevent data duplication and clutter (e.g., 20 \* n similar runs), the database is cleared at each startup.

## Functional Testing

### User Authentication Test

#### Register

| Test Case                               | Operation                              | Expected Result                                                   | Pass/Fail |
| --------------------------------------- | -------------------------------------- | ----------------------------------------------------------------- | --------- |
| Register with valid credentials         | Username: `admin`<br>Password: `admin` | Alert "Registered successfully" and navigate to the run list page | Pass      |
| Register with invalid credentials       | Enter empty username or password       | Please fill in all the fields!                                    | Pass      |
| Registration with a duplicated Username | Username: `admin`<br>Password: `admin` | User already exists!                                              | Pass      |

#### Login

| Test Case                            | Operation                                    | Expected Result                                  | Pass/Fail |
| ------------------------------------ | -------------------------------------------- | ------------------------------------------------ | --------- |
| Login - Valid Credentials            | Username: `12`<br>Password: `1`              | Access the homepage directly                     | Pass      |
| Login - Invalid Username or password | Enter twice: Username: `12`, Password: `123` | Alert “Registration failed: User already exists” | Pass      |
| Login – Empty username or password   | Enter empty Username or password             | Alert “Please fill in all fields”                | Pass      |

#### Logout

| Test Case            | Operation                                 | Expected Result                                      | Pass/Fail |
| -------------------- | ----------------------------------------- | ---------------------------------------------------- | --------- |
| Logout Functionality | Click logout button                       | Successful logout and redirection to the login page. | Pass      |
| Hidden Logout Button | Direct to pages with hidden logout option | Logout button is not displayed                       | Pass      |

#### Map and Route

| Test Case                                           | Operation                                                                     | Expected Result                                                                                                    | Pass/Fail |
| --------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------- |
| Initialize Map                                      | After logging in, directed to the homepage where the map automatically loads. | The map successfully loads, displaying the correct map style and controls.                                         | Pass      |
| Select Location                                     | Enter "St Andr" in the search box.                                            | A list of search suggestions appears below the box. Selecting "St. Andrews, Fife, Scotland" updates the input box. | Pass      |
| Add Start Point Marker                              | Enter "St Andr" and select "St. Andrews, Fife, Scotland, United Kingdom".     | A start point marker is displayed on the map, centering on this location.                                          | Pass      |
| Add End Point Marker                                | Enter "Dundee air" and select "Dundee Airport, Dundee, Scotland".             | An end point marker is displayed on the map, centering on this location.                                           | Pass      |
| Update Start Point Location                         | Enter "St Andrews Tes" and select "Tesco Metro, St. Andrews, Scotland".       | The start point marker updates to the new location, centering the map on this point.                               | Pass      |
| Add Meeting Points Button                           | Click on the Add Meeting Points button.                                       | An input box and a remove button appear.                                                                           | Pass      |
| Add Meeting Point Marker                            | Enter "cupar" and select "Cupar, Fife, Scotland".                             | A meeting point marker is added to the map, centering on this location.                                            | Pass      |
| Remove Meeting Point Marker                         | Click on the Remove button.                                                   | The meeting point marker and associated input box and button are removed.                                          | Pass      |
| Display Route for All Points                        | Add start and end points and several meeting points.                          | A route is displayed on the map, connecting all points in order.                                                   | Pass      |
| Attempt to Display Route Without Start or End Point | Try selecting meeting points without a start or end point.                    | No route is displayed, only markers.                                                                               | Pass      |

#### Run Creation and Management

| Test Case                                               | Operation                                          | Expected Result                                        | Pass/Fail |
| ------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------ | --------- |
| Create run with valid inputs                            | Input all required detail and submit               | Run is created with the provided details               | Pass      |
| Create run without name                                 | Input all details except name                      | Alert "Please fill in the field!"                      | Pass      |
| Create run without starting time                        | Enter “0000/00/00 00:00” as start time             | Alert "Please fill in the field!"                      | Pass      |
| Create run with starting time earlier than current time | Enter a start time before the current time         | Alert “start time cannot be earlier than current time” | Pass      |
| Create run with invalid expected pace                   | Enter an unreasonable expected pace                | Hint text shows, preventing run creation               | Pass      |
| Add new meeting point                                   | Click the button “add meeting point”               | A new input box for adding a meeting point appears     | Pass      |
| Delete the meeting point                                | Add and then remove a meeting point                | The meeting point and its input box are removed        | Pass      |
| View details of a specific run                          | Click for details of a run like “central park run” | The page displays detailed information about the run   | Pass      |

#### Filter Runs Tests

| Test Case                         | Operation                                           | Expected Result                                            | Pass/Fail |
| --------------------------------- | --------------------------------------------------- | ---------------------------------------------------------- | --------- |
| Filter runs by pace without level | Choosing “7min/mile” without choosing a level       | Shows all runs that meet the 7min/mile pace                | Pass      |
| Filter runs by level without pace | Choose "expert" level filter without selecting pace | Displays all runs of the "expert" level                    | Pass      |
| Filter run by level and pace      | Choose both "newbie" level and “11min/mile” pace    | Shows runs that meet both newbie level and 11min/mile pace | Pass      |

#### User participation

| Test Case                                            | Operation                                                                | Expected Result                                                                       | Pass/Fail |
| ---------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | --------- |
| View run details                                     | Click on see details button under run info                               | Run details are displayed                                                             | Pass      |
| Join run                                             | Click on join run button                                                 | User is successfully joined and the count of joined runners increases                 | Pass      |
| Cancel join run                                      | Click on cancel join button                                              | User successfully cancels run participation and the count of joined runners decreases | Pass      |
| Verify if user cannot join a run more than once      | After joining a run, click back and then on the same run to view details | The join button is not available                                                      | Pass      |
| Verify notification of the current number of runners | Click on join run button                                                 | The current number of runners who joined the run is displayed                         | Pass      |
| User space link                                      | Click on User Space link on the run details page                         | User is directed to his/her space                                                     | Pass      |
| Verify joined runs are displayed in user space       | Navigate to the user space                                               | All subscribed runs are displayed in user space                                       | Pass      |
| Back to the home page link                           | Click on back to home page link                                          | User is directed to Home page                                                         | Pass      |
| Verify the back button                               | Click on back button after viewing the run details                       | User is directed to Home page                                                         | Pass      |

#### User Statistics

| Test Case                                              | Operation                                                                                     | Expected Result                                             | Pass/Fail |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------- |
| Verify if user space displays the current username     | Navigate to the user space                                                                    | The username of the current user is displayed on the GUI    | Pass      |
| Verify total run participation statistics              | Navigate to the user space                                                                    | The total number of subscribed runs is displayed            | Pass      |
| Verify if the user's average pace is displayed         | Navigate to the user space                                                                    | The user's pace average is displayed                        | Pass      |
| Verify if the user's average pace is correctly counted | Navigate to the user space, count the total pace, and divide by the number of subscribed runs | The average pace matches the displayed value                | Pass      |
| Check if the dashboard expands dynamically             | Navigate to the homepage and subscribe to more runs                                           | The dashboard dynamically expands                           | Pass      |
| Verify correct display of run levels on the dashboard  | Check the displayed run on the dashboard                                                      | The hover effect displays the correct run level information | Pass      |
| Verify if User data persists after reloading           | Logout and refresh the browser                                                                | User data persists in the user space                        | Pass      |

#### Comments

| Test Case                          | Operation                                    | Expected Result                           | Pass/Fail |
| ---------------------------------- | -------------------------------------------- | ----------------------------------------- | --------- |
| Post a valid comment               | Enter "looks good!" and click 'Post Comment' | New comment is added to the comments list | Pass      |
| Attempt to post nothing to comment | Enter nothing and click 'Post Comment'       | Alert "please enter valid comment!"       | Pass      |
| Attempt to post space to comment   | Press space twice and click 'Post Comment'   | Alert "please enter valid comment!"       | Pass      |
| Display comments after posting     | Enter "wow" and click 'Post Comment'         | New comment is added to the comments list | Pass      |

#### Weather

| Test Case                      | Operation                                   | Expected Result                                                                                  | Pass/Fail |
| ------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------- |
| Test the weather for the day   | Select today's date as start time           | Display specific weather forecast: max and min temperature, condition, chance of rain, UV index. | Pass      |
| Test the weather in 15 days    | Select the date in 15 days as start time    | Display specific weather forecast: max and min temperature, condition, chance of rain, UV index. | Pass      |
| Test the weather after 15 days | Select the date after 15 days as start time | Display "Sorry, we can only predict the weather within 15 days."                                 | Pass      |

#### Recommendation Algorithm

| Test Case                      | Operation                                                      | Expected Result                                                                   | Pass/Fail |
| ------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------- |
| New user recommendation        | Register a new user                                            | Display "Please participate in runs you like so we can learn about you!"          | Pass      |
| No new runs to recommend       | Participate in all the runs                                    | Display "You participated in all the runs! We are unable to recommend new runs!"  | Pass      |
| Display max 3 recommended runs | Login with admin or register and participate in at least 1 run | Display maximum 3 runs. Could be less if there are fewer than 3 runs to recommend | Pass      |
| Compatibility score            | Participate in at least 2 runs and compute the score by hand   | The results by hand and the results displayed should match                        | Pass      |

## cURL Commands for testing

We used the following curl command to test the api and see if the application corresponds correctly in different scenarios. We use admin as username and password, admin is one of the users we inserted when we initialized the database. All apis passed the test and get expected reponses.

Note: The following sessionId changes every time.

### (1) User Login

1. correct username and password

```
curl -X POST http://localhost:5500/login -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin", "sessionId": "dshajsd831nhda"}'
```

2. wrong username and password

```
curl -X POST http://localhost:5500/login -H "Content-Type: application/json" -d '{"username": "admin21", "password": "admin", "sessionId": "dshajsd831nhda"}'
```

### (2) User Logout

```
curl -X POST http://localhost:5500/logout -H "Content-Type: application/json" -d '{"username": "admin", "sessionId": "dshajsd831nhda"}'
```

### (3) User Registration

```
curl -X POST http://localhost:5500/register -H "Content-Type: application/json" -d '{"username": "newUser", "password": "newPassword"}'
```

### (4) Create a New Run

```
curl -X POST http://localhost:5500/runs -H "Content-Type: application/json" -d '{"startTime": "2025-04-01T09:00:00Z", "startPoint": "Location Coordinates", "endPoint": "Location Coordinates", "expectedPace": "5:00 min/km", "name": "Morning Run", "level": "newbie", "description": "A fun run for beginners.", "startPointName": "Park Entrance", "endPointName": "Lake View", "meetingPoints": [{"name": "Halfway Point", "coordinates": "Location Coordinates"}]}'
```

### (5) Get Run Details

Replace `uniqueRunId` with the actual ID of the run.

```
curl -X GET http://localhost:5500/runs/tl0t3vB4O3zw2XgXgbRaj
```

### (6) Join a Run

Replace `uniqueRunId` with the actual ID of the run.

```
curl -X POST http://localhost:5500/runs/tl0t3vB4O3zw2XgXgbRaj/join -H "Content-Type: application/json" -d '{"username": "admin", "sessionId": "dshajsd831nhda"}'
```

### (7) **Leave a Run** POST /runs/:id/leave

Replace `uniqueRunId` with the actual ID of the run.

```
curl --location --request POST 'http://localhost:5500/runs/WhDxjhQkX62_23N2Oewg8/leave' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "admin",
    "sessionId": "04b8-375a-187f-182e"
}'
```

### **(8) Get Number of Participants for a Specific Run** GET /runs/:id/participants

Replace `uniqueRunId` with the actual ID of the run.

```
curl --location --request GET 'http://localhost:5500/runs/WhDxjhQkX62_23N2Oewg8/participants'
```

### **(9)Get Joined Runs by Username** GET /users/:username/joinedRuns

Replace `exampleUser` with the actual ID of the run.

```
curl --location --request GET 'http://localhost:5500/users/admin/joinedRuns'
```

### **(10) Post Comment to a Run** POST /comments

Replace `uniqueRunId` with the actual ID of the run.

```
curl --location --request POST 'http://localhost:5500/comments' \--header 'Content-Type: application/json' \
--data-raw '{
    "content": "This is a comment",
    "runId": "WhDxjhQkX62_23N2Oewg8",
    "username": "admin"
}'
```

### **(11) Get Comments for a Run** GET /comments

Replace `uniqueRunId` with the actual ID of the run.

```
curl --location --request GET 'http://localhost:5500/comments?runId=WhDxjhQkX62_23N2Oewg8'
```

### **(12) Get Weather Data for a Run** GET /weather

Replace date with the actual 'Start time' of the run.

```
1.The date is in 15 days
curl --location --request GET 'http://localhost:5500/weather?lat=40.712776&lon=-74.005974&startTime=2024-04-15T09:00:00Z'

2.The date is after 15 days
curl --location --request GET 'http://localhost:5500/weather?lat=40.712776&lon=-74.005974&startTime=2024-05-15T09:00:00Z'
```
