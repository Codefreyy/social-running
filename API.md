### API DOCUMENTATION

1. Start a Game`POST /game/start`

Creates a new game instance.

Parameters:

- gridCol (integer): Number of columns in the game grid.
- gridRow (integer): Number of rows in the game grid.
- requiredPlayers (integer): Number of players required to start the game.

Example Request:

```bash
POST http://localhost:5500/game/start
```

Body:

```
{
  "gridCol": 5,
  "gridRow": 5,
  "requiredPlayers": 2
}
```

Example Response:

```json
{
  "gameId": "tp8FYo_nrGGUc4f-7z3tX"
}
```

2. Join a Game `POST /game/:id/join`

Allows a player to join an existing game by ID.

Parameters:

- id (string): The ID of the game to join (URL parameter).
- name (string): Name of the player joining the game (Body parameter).

Example Request:

```bash
POST http://localhost:5500/game/uniqueGameId123/join
```

Body:

```json
{
  "name": "Joy"
}
```

Example Response:

```json
{
  "playerId": "ow4dFj_ban-tkp6-NDL09",
  "gameState": {
    "gameId": "w7kGkI-DAmvWHJLmZ8KMD",
    "gridCol": 2,
    "gridRow": 2,
    "players": [
      {
        "id": "3lMwafaYRubvnYhs45WUW",
        "name": "yuweii",
        "score": 0,
        "lastActiveTime": 1710412435382
      },
      {
        "id": "ow4dFj_ban-tkp6-NDL09",
        "name": "yujie312",
        "score": 0,
        "lastActiveTime": 1710412459491
      }
    ],
    "active": true,
    "requiredPlayers": 2,
    "fences": {},
    "currentPlayerIndex": 0,
    "isGameEnd": false
  }
}
```

3. Get Game State `GET /game/:id/state`

Retrieves the current state of a game by ID.

Parameters:

- id (string): The ID of the game (URL parameter).

Example Request:

```bash
GET http://localhost:5500/game/uniqueGameId123/state
```

Example Response:

```json
{
  "gameId": "C4bUZTLyuiRQIaULlHG_w",
  "gridCol": 2,
  "gridRow": 2,
  "players": [
    {
      "id": "2JUljJmP-CQe03h7mLzSL",
      "name": "yujie",
      "score": 0,
      "lastActiveTime": 1710412389351
    },
    {
      "id": "VKrnP5Ouqe6cYrGcXIko9",
      "name": "yuweii",
      "score": 1,
      "lastActiveTime": 1710412392651
    }
  ],
  "active": true, //if the game has started
  "requiredPlayers": 2, //how many players this game is allowed to have
  "fences": {
    "0-0-top": "2JUljJmP-CQe03h7mLzSL", //key is the position of the border, and value is the player who places this fence
    "0-1-left": "VKrnP5Ouqe6cYrGcXIko9",
    "0-0-right": "VKrnP5Ouqe6cYrGcXIko9",
    "0-0-left": "2JUljJmP-CQe03h7mLzSL",
    "1-0-top": "VKrnP5Ouqe6cYrGcXIko9",
    "0-0-bottom": "VKrnP5Ouqe6cYrGcXIko9"
  },
  "currentPlayerIndex": 1, //the index of player who is allowed to place fence this turn
  "isGameEnd": false, //if the game has ended
  "claimedCells": [
    {
      "key": "0-0", // the position of the cell
      "playerId": "VKrnP5Ouqe6cYrGcXIko9" // the playerId who claimed the cell
    }
  ]
}
```

4. List Games` GET /game/lists`

Retrieves a list of all current games.

Example Request:

```bash
GET http://localhost:5500/game-lists
```

Example Response:

```json
[
  {
    "gameId": "03OHfypC0iPxTyFbM1SPE",
    "players": [
      {
        "id": "NZrGZ4K4F1OsXAcmY1Wdd",
        "name": "yuwei",
        "score": 0,
        "lastActiveTime": 1710404371851
      },
      {
        "id": "fsPlfCOV5pU8L9rqRHD4m",
        "name": "yujie",
        "score": 0,
        "lastActiveTime": 1710404389803
      }
    ],
    "active": false,
    "requiredPlayers": 2,
    "isGameEnd": true
  },
  {
    "gameId": "dKMYPHVh5kyyE4hHELLi6",
    "players": [
      {
        "id": "mwPlfCOV5pU8L9rqRHD4m",
        "name": "yujie",
        "score": 0,
        "lastActiveTime": 1710404389803
      },
      {
        "id": "FXdht6Wi4CSQ7goC8_lWA",
        "name": "yuwei",
        "score": 0,
        "lastActiveTime": 1710404449240
      }
    ],
    "active": false,
    "requiredPlayers": 2,
    "isGameEnd": true
  }
]
```

5. Place a Fence`POST /game/:id/placeFence`

Players can place a fence in the game grid.

Parameters:

- id (string): The ID of the game (URL parameter).
- playerId (string): The ID of the player placing the fence.
- row (integer): The row number where the fence is being placed.
- col (integer): The column number where the fence is being placed.
- border (string): Specifies which border of the cell to place the fence on.

Example Request:

```bash
POST http://localhost:5500/game/uniqueGameId123/placeFence
```

Body:

```json
[
  {
    "playerId": "e4GtY0YC7eJlGJDcA4Hp9",
    "row": "1",
    "col": "0",
    "border": "top"
  },
  {
    "playerId": "e4GtY0YC7eJlGJDcA4Hp9",
    "row": "0",
    "col": "0",
    "border": "bottom"
  }
]
```

Example Response:

```json
{
  "gameId": "ryJNlAB_52uSSN0fc-XLG",
  "gridCol": 2,
  "gridRow": 2,
  "players": [
    {
      "id": "e4GtY0YC7eJlGJDcA4Hp9",
      "name": "yujie312",
      "score": 0,
      "lastActiveTime": 1710412650468
    },
    {
      "id": "f79ltjfSq4CHPn3yOX-u_",
      "name": "yuweii",
      "score": 0,
      "lastActiveTime": 1710412642828
    }
  ],
  "active": true,
  "requiredPlayers": 2,
  "fences": {
    "1-0-top": "e4GtY0YC7eJlGJDcA4Hp9",
    "0-0-bottom": "e4GtY0YC7eJlGJDcA4Hp9"
  },
  "currentPlayerIndex": 0,
  "isGameEnd": false
}
```

6. Update Claimed Cells and Score, Check whether game end
   `PUT /game/:id/update`

Updates the score for a player and their claimed cells in the game.

Parameters:

- id (string): The ID of the game (URL parameter).
- playerId (string): The ID of the player whose score is being updated.
- claimedCells (array of objects): A list of cells claimed by the player.

Example Request:

```bash
PUT http://localhost:5500/game/uniqueGameId123/update
```

Body:

```json
{
  "playerId": "f79ltjfSq4CHPn3yOX-u_",
  "claimedCells": [
    {
      "row": 0,
      "col": 0
    }
  ]
}
```

Example Response:

```json
{
  "gameId": "ryJNlAB_52uSSN0fc-XLG",
  "gridCol": 2,
  "gridRow": 2,
  "players": [
    {
      "id": "e4GtY0YC7eJlGJDcA4Hp9",
      "name": "yujie312",
      "score": 0,
      "lastActiveTime": 1710412776937
    },
    {
      "id": "f79ltjfSq4CHPn3yOX-u_",
      "name": "yuweii",
      "score": 1,
      "lastActiveTime": 1710412781104
    }
  ],
  "active": true,
  "requiredPlayers": 2,
  "fences": {
    "1-0-top": "e4GtY0YC7eJlGJDcA4Hp9",
    "0-0-bottom": "e4GtY0YC7eJlGJDcA4Hp9",
    "0-0-left": "f79ltjfSq4CHPn3yOX-u_",
    "0-1-left": "e4GtY0YC7eJlGJDcA4Hp9",
    "0-0-right": "e4GtY0YC7eJlGJDcA4Hp9",
    "0-0-top": "f79ltjfSq4CHPn3yOX-u_"
  },
  "currentPlayerIndex": 1,
  "isGameEnd": false,
  "claimedCells": [
    {
      "key": "0-0",
      "playerId": "f79ltjfSq4CHPn3yOX-u_"
    }
  ]
}
```

7. User Registration `POST /users/register`

Allows users to register for an account.

Parameters:

- username (string): Username for the new account.
- password (string): Password for the new account.

Example Request:

```bash
POST http://localhost:5500/users/register
```

Body:

```json
{
  "username": "yuweiai",
  "password": "123"
}
```

Example Response:

```json
{
  "message": "User registered successfully"
}
```

8. User Login `POST /users/login`

Allows users to log into their account.

Parameters:

- username (string): Username of the account.
- password (string): Password of the account.

Example Request:

```bash
POST http://localhost:5500/users/login
```

Body:

```json
{
  "username": "yuweiai",
  "password": "123"
}
```

Example Response:

```json
{
  "message": "Login successful",
  "username": "yuweiai"
}
```

9. User Stats `GET /users/:username/stats`

Retrieves statistics for a specific user.

Parameters:

- username (string): Username of the account (URL parameter).

Example Request:

```bash
GET http://localhost:5500/users/existingUser/stats
```

Example Response:

```json
{
  "wins": 5,
  "losses": 3,
  "draws": 2
}
```

10. Leave a Game `POST /game/:id/leave`

Allows a player to leave an ongoing game.

Parameters:

- id (string): The ID of the game (URL parameter).
- playerId (string): The ID of the player leaving the game (Body parameter).

Example Request:

```bash
POST http://localhost:5500/game/uniqueGameId123/leave
```

Body:

```json
{
  "playerId": "c5Hiq8HqQakEcqBTBfeWq"
}
```

Example Response:

```json
{
  "gameId": "fplzu-J2pXVUKYS4nF4Bc",
  "gridCol": 2,
  "gridRow": 2,
  "players": [],
  "active": false,
  "requiredPlayers": 2,
  "fences": {},
  "currentPlayerIndex": 0,
  "isGameEnd": true,
  "claimedCells": [],
  "result": {
    "type": "win",
    "winners": ["qh-mKgWlcbvLmecyZs4MW"]
  }
}
```
