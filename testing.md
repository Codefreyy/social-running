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