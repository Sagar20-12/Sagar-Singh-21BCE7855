![SS9](https://github.com/user-attachments/assets/676683a6-ca71-4f60-baec-1b2169b9c98d)
# CHESS - POP

A 5x5 Grid Multiplayer chess game that majorily focuses on two piecec i.e Pawns(P1,P2,P3) and Heroes(H1, H2,H3) with limited sets of rules for the two categories. 
A Multiplayer game that is fun to play and if any of the player goes out of move the other player wins the game.

![image](https://github.com/user-attachments/assets/7b0393c9-b86c-4d7a-a6ad-7b377893162b)



# TECH STACK USED:

HTML ✅

CSS ✅

JAVASCRIPT ✅

REACT ✅

EXPRESS ✅

NODEJS ✅

SOCKET.IO ✅

# PROJECT ARCHITECTURE (SERVER SIDE AND CLIENT SIDE IMPLEMENTATION)

![image](https://github.com/user-attachments/assets/3bd83a7d-95e6-467f-8fbf-4a844c51f5b6)


## BASIC ARCHITECTURE LAYOUT OF THE DIRECTORY

![image](https://github.com/user-attachments/assets/46b172e0-2fec-4b17-a979-899dffed90a2)


# How to run?

1) Clone the repository using git clone 'https://github.com/Sagar20-12/Sagar-Singh-21BCE7855.git'.

2) Open terminal follow below steps:

a) Make Server Directory

mkdir server

cd server

b. Initialize a new Node.js project in this "server" directory:

npm init -y

c. Install the WebSocket library:

npm install ws
   
3) Jump to server directory using cd server 'Project/ cd server'.

4) Start the server using 'node server.js' and redirect to the localhost.

5) Copy the same localhost URL and navigate to different browser window and open in new tab.

6) Get Ready to play with two player.

# WEB SOCKET INCLUSION IN APP.JS

```
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

#SERVICE CONTENTS

## 1) STARTING THE GAME

![image](https://github.com/user-attachments/assets/4f3b9d11-c603-456d-b82c-990ee593da63)


## 2) Performing Valid Moves (Ensuring within 5x5 grid bounds)

![image](https://github.com/user-attachments/assets/4562eda8-eb74-489c-911b-78b2c7e8f537)

# PAWN MOVES ONLY IN GREEN HIGHLIGHTED AREA

![SS7](https://github.com/user-attachments/assets/fda4a414-48df-4de2-885e-d9dc8beb6e23)

# HERO 1 WILL MOVE IN HIS GREEN HIGHLIGHTED AREA( TWO STEP FORWARD, BACKWARD, RIGHT, LEFT)

![SS9](https://github.com/user-attachments/assets/ae4a760e-c722-4a17-9cb7-991460fef45a)

# HERO 2 WILL MOVE IN HIS GREEN HIGHLIGHTED AREA (TWO STEPS RIGHT FORWARD DIAGONAL, LEFT FORWARD DIAGONAL, LEFT BACKWARD DIAGONAL, RIGHT BACKWORD DIAGONAL)

![SS8](https://github.com/user-attachments/assets/18bb4c01-c5ba-4d3d-aee4-1b49ce9a8e51)


## 3) RealTime Update with 0ms network respons
![image](https://github.com/user-attachments/assets/c933ca62-bd6e-4638-9fdc-7dbef2bf77c9)


## 4) EDGE CASE HANDLING (If Any Player goes out of Moves Then it will display which player won at top.)
![image](https://github.com/user-attachments/assets/49e33052-5613-4ceb-8f73-cc7784d3db3c)


## 5) Reset Game option
![image](https://github.com/user-attachments/assets/80179ae3-aa8d-4413-b22f-e55fcb52fbba)


## 6) If Anyone player left the game it will notify the other player.
![image](https://github.com/user-attachments/assets/95ce00ad-0c5d-4c5c-847e-ee73979198f3)


