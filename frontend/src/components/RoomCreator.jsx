import { useState, useRef } from "react";
import { io } from 'socket.io-client';
import Game2 from "./Game2.jsx";

export default function RoomCreator ({onButtonClick}){
    const [createdRoom, setCreatedRoom] = useState(false);
    const [roomId, setRoomId] = useState('');
    const [role, setRole] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [players, setPlayers] = useState({ p1: '', p2: '' });
    const socketRef = useRef(null);

    const connectSocket = () => {
        const token = localStorage.getItem('token');
        const socket = io("https://backend-pong.konradito.win", {
            auth: {
                token: token
            }
        });
        socketRef.current = socket;

        socket.on('room_created', (data) => {
            setRoomId(data.roomId);
            setRole(data.role);
            setCreatedRoom(true);
            console.log(data.role);
            console.log(data.roomId);
        })

        socket.on('room_joined', (data) => {
            setRole(data.role);
            console.log(data.role);
        })

        socket.on('start_game', (data) => {
            setPlayers({p1: data.p1, p2: data.p2});
            setGameStarted(true);
        })
    };

    const createRoom = () => {
        connectSocket();
        socketRef.current.emit('create_room',localStorage.getItem('username'));
    };

    const joinRoom = () => {
        connectSocket();
        socketRef.current.emit('join_room', roomId.toUpperCase(), localStorage.getItem('username'));
    };

    const handleCode = (event) => {
        if (event.target.value.length <= 6){
            setRoomId(event.target.value);
        }
    }
    const handleEnter = (event) => {
        if (event.key === 'Enter') {
            if (event.target.value.length === 6) {
                joinRoom();
            }
            else{
                alert('Room ID must be at least 6 characters long');
            }
        }
    }

    return(
        <>
            { !gameStarted ?
                (!createdRoom ? (
                    <div className='menuBox'>
                        <button
                            className="goBackButton"
                            onClick={() => onButtonClick('start')}
                        >
                            Back
                        </button>
                        <h2>
                            You picked two players mode
                        </h2>
                        <div>
                            <input
                                type="text"
                                value={roomId}
                                className='enterCodeButton p-[15px] text-center text-3xl w-[300px] mr-6 border-2 border-white rounded-[15px]'
                                placeholder="Enter room code"
                                onChange={handleCode}
                                onKeyDown={handleEnter}
                            />
                            <button
                                className='enterCodeButton text-4xl'
                                onClick={createRoom}
                            >
                                Create Room
                            </button>

                        </div>
                    </div>

                ):(
                    <div className='menuBox'>
                        <h2>
                            Room code : {roomId}
                        </h2>
                    </div>
                ))
                :
                (
                    <Game2
                        roomId={roomId}
                        role={role}
                        socket={socketRef}
                        players={players}
                        setPlayers={setPlayers}
                        onButtonClick={ () =>
                            onButtonClick('start')}
                    />
                )
            }
        </>
    )
}