const express = require('express');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const PORT = 3000;
const KEY = '0VN8UADS8787R1#@$#%$%!CA340CHM423#@$87';
const app = express();
app.use(cors({
    origin: '*',
    methods: ['POST'],
    credentials: true
}))
    .use(express.json())

//SQL
const pgClient = new Client({
    user: 'pong',
    host: 'postgre.local',
    database: 'pong',
    password: 'PongPostgre.#$2812>',
    port: 5432,
});

pgClient.connect()
    .then(() => console.log('PostgreSQL connected'))
    .catch(error => console.error('PostgreSQL connection error', error));

app.post('/create', async (request, response) => {
    const {username, password} = request.body;
    try{
        const result = await pgClient.query(
            'SELECT COUNT(*) FROM users WHERE username = $1',
            [username]
        );
        if(result.rows[0].count === '0'){
            const hashedPassword = await bcrypt.hash(password, 10);
            await pgClient.query(
                'INSERT INTO users (username, password) VALUES ($1, $2)',
                [username, hashedPassword]
            );
            const token = jwt.sign({name: username}, KEY, {expiresIn: '1h'});
            response.status(201).json({token});
        }
        else{
            return response.status(409).json({message: 'User with this username already exists'});
        }
    }
    catch(error){
        response.status(400).json({error: error.message});
    }
});

app.post('/login', async (request, response) => {
    const {username, password} = request.body;
    try {
        const result = await pgClient.query(
            'SELECT password FROM users WHERE username = $1',
            [username]
        );
        if (result.rows.length === 0) {
            return response.status(401).json({error: 'This username doesnt exists'});
        }
        const dbPassword = result.rows[0].password;
        const isMatch = await bcrypt.compare(password, dbPassword)
        if (isMatch) {
            const token = jwt.sign({name: username}, KEY, {expiresIn: '1h'});
            response.status(200).json({token});
        } else {
            response.status(401).json({error: 'Invalid password'});
        }
    }
    catch (error) {
        response.status(500).json({error: error.message});
    }
});

app.get('/verify', (request, response) => {
    const auth = request.headers['authorization'];
    const token = auth && auth.split(' ')[1];
    if (!token) return response.sendStatus(401);
    jwt.verify(token, KEY, (error, decoded) => {
        if (error) return response.sendStatus(403);
        response.status(200).json({name: decoded.name});
    });
});

// WSS
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})

const io = require('socket.io')(server, {
    cors: { origin: '*' }
});

const roomUsers = new Map();

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: Token required'));

    jwt.verify(token, KEY, (error, decoded) => {
        if (error) return next(new Error('Authentication error: Invalid token'));
        next();
    });
});

io.on('connection', (socket) => {

    socket.on('create_room', (username) => {
        const roomId = nanoid(6).toUpperCase();
        socket.join(roomId);
        socket.roomId = roomId;
        roomUsers.set(roomId, { player1: socket, p1name: username, p1y: 400});
        socket.emit('room_created',{ role: 'right', roomId: roomId });
    });

    socket.on('join_room', (roomId, username) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        const users = roomUsers.get(roomId);
        if ( room && room.size === 1 ){
            socket.join(roomId);
            socket.roomId = roomId;
            users.player2 = socket;
            users.p2name = username;
            users.p2y = 400;
            users.playAgain = 0;
            socket.emit('room_joined', { role: 'left'});
            io.to(roomId).emit('start_game', {p1: users.p1name, p2: users.p2name});
            gameLoop(roomId, socket);
        }
    });

    socket.on('move' , (data) => {
        const users = roomUsers.get(data.roomId);
        if(!users) return;
        if (data.role === 'right' && typeof data.paddleY === 'number'){
            users.p1y = data.paddleY;
        }
        else if(data.role === 'left' && typeof data.paddleY === 'number'){
            users.p2y = data.paddleY;
        }
        socket.to(socket.roomId).emit('opp_move', data.pageY);
    });

    socket.on('disconnect', () => {
        const roomId = socket.roomId;
        const room = roomUsers.get(roomId);
        if (!room) return;
        socket.to(roomId).emit('opponent_disconnected');
        roomUsers.delete(roomId);
    })

    socket.on('play_again', () => {
        const roomId = socket.roomId;
        const room = roomUsers.get(roomId);
        room.playAgain += 1;
        if(room.playAgain === 2){
            room.playAgain = 0;
            io.to(roomId).emit('start_game', {p1: room.p1name, p2: room.p2name});
            gameLoop(roomId, socket);
        }
    })

})

//game logic
async function gameLoop (roomId) {
    const score = { p1: 0, p2: 0 };
    const ball = { x: 900, y: 400 };
    const directions = [
        { dx: 10, dy: 10 },
        { dx: 10, dy: -10 },
        { dx: -10, dy: 10 },
        { dx: -10, dy: -10 }
    ];
    let ballV = directions[Math.floor(Math.random() * 4)];

    const intervalId = setInterval(async () => {
        ball.x += ballV.dx;
        ball.y += ballV.dy;

        if (ball.y <= 0 || ball.y >= 755) {
            ballV.dy *= -1;
        }

        if (ball.x <= 10 || ball.x >= 1765) {
            const status = await checkIfLost(roomId, ball);
            switch(status){
                case 0:
                    ballV.dx *= -1;
                    ball.x += ballV.dx;
                    break;
                case 1:
                    score.p2++;
                    io.to(roomId).emit('score', score);
                    ball.x = 900;
                    ball.y = 400;
                    ballV = directions[Math.floor(Math.random() * 4)];
                    await new Promise(res => setTimeout(res, 1000));
                    break;
                case 2:
                    score.p1++;
                    io.to(roomId).emit('score', score);
                    ball.x = 900;
                    ball.y = 400;
                    ballV = directions[Math.floor(Math.random() * 4)];
                    await new Promise(res => setTimeout(res, 1000));
                    break;
            }
        }

        if (score.p1 >= 10 || score.p2 >= 10) {
            io.to(roomId).emit('game_over', score);
            clearInterval(intervalId);
            return;
        }

        io.to(roomId).emit('ball_move', { x: ball.x, y: ball.y, score });
    }, 1000 / 60);
}

function checkIfLost (roomId, ball) {
    return new Promise((resolve) => {
        const room = roomUsers.get(roomId);
        if (!room) {
            return resolve(0);
        }
        if (ball.x <= 10) {
            const paddleY = room.p1y;
            if (ball.y < paddleY || ball.y > paddleY + 80) {
                console.log(ball.y + ' ' + paddleY);
                resolve(1);
            } else {
                resolve(0);
            }
        }
        else if (ball.x >= 1765) {
            const paddleY = room.p2y;
            if (ball.y < paddleY || ball.y > paddleY + 80) {
                console.log(ball.y + ' ' + paddleY);
                resolve(2);
            } else {
                resolve(0);
            }
        }
        else {
            resolve(0);
        }
    });
}
