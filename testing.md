## cURL Commands for testing

We used the following curl command to test the api and see if the application corresponds correctly in different scenarios. We use admin as username and password, admin is one of the users we inserted when we initialized the database. All apis passed the test and get expected reponses.

Note: The following sessionId changes every time.

### 1) User Login

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
