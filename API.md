### **(1) User Login** POST /login

Authenticates a user and returns a session ID.

**Parameters:**

- username (string): The user's username.
- password (string): The user's password.
- sessionId (string): A session identifier for the user session.

**Example Request:**

```bash
POST http://localhost:5500/login
```

**Body:**

```json
{
  "username": "exampleUser",
  "password": "examplePassword",
  "sessionId": "exampleSessionId"
}
```

**Example Response:**

```json
{ "username": "exampleUser", "sessionId": "exampleSessionId" }
```

or

```json
{ "error": "Invalid credentials" }
```

### (2) **User Logout** POST /logout

Logs out a user by clearing the session ID.

**Parameters:**

- username (string): The user's username.
- sessionId (string): The session identifier to be cleared.

**Example Request:**

```bash
POST http://localhost:5500/logout
```

**Body:**

```json
{ "username": "exampleUser", "sessionId": "exampleSessionId" }
```

**Example Response:**

```json
{ "message": "Logged out successfully" }
```

or

```json
{ "error": "Invalid session or user" }
```

### (3) **User Registration** POST /register

Registers a new user.

**Parameters:**

- username (string): The desired username.
- password (string): The desired password.

**Example Request:**

```bash
POST http://localhost:5500/register
```

**Body:**

```json
{ "username": "newUser", "password": "newPassword" }
```

**Example Response:**

```json
{ "success": true, "userId": "generatedUserId" }
```

or

```json
{ "success": false, "message": "User already exists" }
```

### (4) **Create a New Run** POST /runs

Allows users to create a new running event.

**Parameters:**

- A JSON object containing run details such as startTime, startPoint, endPoint, expectedPace, name, level, description, startPointName, endPointName, and meetingPoints.

**Example Request:**

```bash
POST http://localhost:5500/runs
```

**Body:**

```json
{
  "startTime": "2023-01-01T09:00:00Z",
  "startPoint": "Location Coordinates",
  "endPoint": "Location Coordinates",
  "expectedPace": "5:00 min/km",
  "name": "Morning Run",
  "level": "newbie",
  "description": "A fun run for beginners.",
  "startPointName": "Park Entrance",
  "endPointName": "Lake View",
  "meetingPoints": [
    { "name": "Halfway Point", "coordinates": "Location Coordinates" }
  ]
}
```

**Example Response:**

```json
{ "message": "Run added successfully" }
```

or

```json
{ "error": "An error occurred" }
```

### (5) **Get Run Details** GET /runs/:id

Retrieves details of a specific run by its ID.

**Parameters:**

- id (path parameter): The unique identifier for the run.

**Example Request:**

```
bashCopy code
```

GET http://localhost:5500/runs/ZGss1lcLznRMHu3hq0Rqk

**Example Response:**

```json
{
  "_id": "JL3IxF8AaCIUnh9FVzWXL",
  "name": "Central Park Run",
  "startTime": "2024-04-10T07:00:00.000Z",
  "startPoint": "-73.965355,40.782865",
  "endPoint": "-73.97505656531952,40.78243350598806",
  "startPointName": "New York, USA",
  "endPointName": "End Point near New York",
  "expectedPace": 9,
  "description": "Central Park Run in beautiful New York, USA. Perfect for newbie runners.",
  "level": "newbie",
  "participants": [
    "user0",
    "user1",
    "user2",
    "user3",
    "user4",
    "user5",
    "user6",
    "user7",
    "user8",
    "user9",
    "user10",
    "user11",
    "user12",
    "user13",
    "user14",
    "user15",
    "user16",
    "user17",
    "user18",
    "user19"
  ]
}
```

or

```json
{ "error": "Run not found" }
```

### (6) **Join a Run** POST /runs/:id/join

Allows a user to join a run.

**Parameters:**

- id (path parameter): The unique identifier for the run.
- username (string): The user's username.
- sessionId (string): The session ID for user verification.

**Example Request:**

```bash
POST http://localhost:5500/runs/uniqueRunId/join
```

**Body:**

```json
{ "username": "exampleUser", "sessionId": "exampleSessionId" }
```

**Example Response:**

```json
{ "message": "Successfully joined the run" }
```

or

```json
{ "error": "Session ID mismatch or user not found" }
```

### (7) **Leave a Run** POST /runs/:id/leave

Allows a user to leave a run they've joined.

**Parameters:**

- id (path parameter): The unique identifier for the run.
- username (string): The user's username.
- sessionId (string): The session ID for user verification.

**Example Request:**

```bash
POST http://localhost:5500/runs/uniqueRunId/leave
```

**Body:**

```json
{ "username": "exampleUser", "sessionId": "exampleSessionId" }
```

**Example Response:**

```json
{ "message": "Successfully left the run" }
```

or

```json
{ "error": "Session ID mismatch or user not found" }
```

### **(8) Get Number of Participants for a Specific Run** GET /runs/:id/participants

Retrieves the number of participants for a specific run by its ID.

**Parameters:**

- id (path parameter): The unique identifier for the run.

**Example Request:**

```
GET http://localhost:5500/runs/uniqueRunId/participants
```

**Example Response:**

```json
{ "participantCount": 10 }
```

or

```json
{ "error": "Run not found" }
```

### **(9)Get Joined Runs by Username** GET /users/:username/joinedRuns

Retrieves a list of runs that a user has joined.

**Parameters:**

- username (path parameter): The username of the user whose joined runs are to be retrieved.

**Example Request:**

```bash
GET http://localhost:5500/users/exampleUser/joinedRuns
```

**Example Response:**

```json
{ "joinedRuns": [{ "runDetails": "Details of joined run" }] }
```

or

```json
{ "error": "An error occurred" }
```

---

### **(10) Post Comment to a Run** POST /comments

Allows users to post a comment to a specific run.

**Parameters:**

- content (string): The content of the comment.
- runId (string): The unique identifier for the run the comment is associated with.
- username (string): The username of the user posting the comment.

**Example Request:**

```bash
POST http://localhost:5500/comments
```

**Body:**

```json
{
  "content": "Loved this run!",
  "runId": "uniqueRunId",
  "username": "exampleUser"
}
```

**Example Response:**

```json
{ "message": "comment saved" }
```

or

```json
{ "message": "An error occurred while saving comments" }
```

### **(11) Get Comments for a Run** GET /comments

Retrieves all comments associated with a specific run ID.

**Parameters:**

- runId (query parameter): The unique identifier for the run whose comments are to be retrieved.

**Example Request:**

```bash
GET http://localhost:5500/comments?runId=uniqueRunId
```

**Example Response:**

```json
[{ "commentDetails": "Details of the comment" }]
```

or

```json
{ "message": "An error occurred while getting comments" }
```

### **(12) Get Weather Data for a Run** GET /weather

Retrieves weather forecast data for a specific run based on coordinates and start time.

**Parameters:**

- lat (query parameter): The latitude coordinate of the run's location.
- lon (query parameter): The longitude coordinate of the run's location.
- startTime (query parameter): The start time of the run.

**Example Request:**

```bash
GET http://localhost:5500/weather?lat=40.712776&lon=-74.005974&startTime=2023-01-01T09:00:00Z
```

**Example Response:**

```json
{ "forecastForTargetDate": "Weather forecast data" }
```

or

```json
{ "error": "Sorry, we can only predict the weather within 15 days" }
```
