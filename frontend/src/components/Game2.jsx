import {useEffect, useRef, useState} from 'react';

export default function Game2({role, roomId, socket, onButtonClick, players, setPlayers}){
    const [game, setGame] = useState(true);
    const [score, setScore] = useState({p1: 0, p2: 0});
    const [didWon, setDidWon] = useState(false);
    const [opponentIsPresent, setOpponentIsPresent] = useState(true);
    const [playAgainButton, setPlayAgainButton] = useState(true)
    const paddleRightRef = useRef(null);
    const paddleRightRefY = useRef(400);
    const paddleLeftRef = useRef(null);
    const paddleLeftRefY = useRef(400);
    const ballRef = useRef(null);
    const gameRef = useRef(null);
    //server connection
    useEffect(() => {
        socket.current.on('connect', () => {
            console.log("Connected to wss")
        });

        socket.current.on("opp_move", (y) => {
            if(role === 'left') {
                if (y - 140 > 700) {
                    paddleRightRefY.current = 700;
                }
                else if (y - 140 < 0) {
                    paddleRightRefY.current = 0;
                }
                else {
                    paddleRightRefY.current = y - 140;
                }
            }
            else if(role === 'right') {
                if (y - 140 > 700) {
                    paddleLeftRefY.current = 700;
                }
                else if (y - 140 < 0) {
                    paddleLeftRefY.current = 0;
                }
                else {
                    paddleLeftRefY.current = y - 140;
                }
            }
        });

        socket.current.on('ball_move', (data) => {
            const x = data.x;
            const y = data.y;
            ballRef.current.style.right = `${x}px`;
            ballRef.current.style.top = `${y}px`;
        });

        socket.current.on('score', (data) => {
            setScore(data);
        })

        socket.current.on('game_over', (data) => {
            setGame(false);
            setScore(data);
            if (role === 'left') {
                setDidWon(data.p2 > data.p1);
            } else {
                setDidWon(data.p2 < data.p1);
            }
        })

        socket.current.on('opponent_disconnected', () => {
            setOpponentIsPresent(false);
        })

        socket.current.on('start_game', (data) => {
            setScore({p1: 0, p2: 0});
            setPlayers({p1: data.p1, p2: data.p2});
            setGame(true);
            setPlayAgainButton(true);
            setOpponentIsPresent(true);
        });

    }, []);

    const sendPlayAgainRequest = () => {
        setPlayAgainButton(false);
        socket.current.emit('play_again');
    }

    //game movement
    useEffect(() => {
        if( game === true ){
            window.addEventListener('mousemove', changePaddlePosition);
            let animationFrameId;
            const update = () => {
                paddleRightRef.current.style.top = `${paddleRightRefY.current}px`
                paddleLeftRef.current.style.top = `${paddleLeftRefY.current}px`
                animationFrameId = requestAnimationFrame(update);
            };
            animationFrameId = requestAnimationFrame(update);
            return () => {
                cancelAnimationFrame(animationFrameId);
                window.removeEventListener("mousemove", changePaddlePosition);
            }
        }
    }, [game]);

    const changePaddlePosition = (event) => {
        if(role==='right') {
            if (event.pageY - 140 > 700) {
                paddleRightRefY.current = 700;
            }
            else if (event.pageY - 140 < 0) {
                paddleRightRefY.current = 0;
            }
            else {
                paddleRightRefY.current = event.pageY - 140;
            }
            socket.current.emit('move', {roomId: roomId, role: role, paddleY: paddleRightRefY.current, pageY: event.pageY});
        }
        else if(role==='left') {
            if (event.pageY - 140 > 700) {
                paddleLeftRefY.current = 700;
            }
            else if (event.pageY - 140 < 0) {
                paddleLeftRefY.current = 0;
            }
            else {
                paddleLeftRefY.current = event.pageY - 140;
            }
            socket.current.emit('move', {roomId: roomId, role: role, paddleY: paddleLeftRefY.current, pageY: event.pageY});
        }
    }

    return(
        <>
            {opponentIsPresent ? (
                game ? (
                        <>
                            <h1 className='text-center text-3xl mb-4.5'>{players.p2} {score.p2} : {score.p1} {players.p1}</h1>
                            <main
                                ref={gameRef}
                                className="gameField2"
                            >
                                <div
                                    className="ball"
                                    ref={ballRef}
                                >
                                </div>
                                <div
                                    className='paddle paddleLeft'
                                    ref={paddleLeftRef}
                                ></div>
                                <div
                                    className='paddle paddleRight'
                                    ref={paddleRightRef}
                                ></div>
                            </main>
                        </>

                    )
                    :
                    (
                        <div className='menuBox'>
                            <button
                                className="goBackButton"
                                onClick={() => onButtonClick()}
                            >
                                Back
                            </button>
                            <h1>The score is {score.p2} : {score.p1}</h1>
                            {didWon ? (
                                <h2>You won!</h2>
                            ) : (
                                <h2>You lost :(</h2>
                            )}
                            {playAgainButton ? (
                                <button
                                    onClick={sendPlayAgainRequest}
                                >
                                    Play again
                                </button>
                            ):(
                                <h1>Sent request</h1>
                            )
                            }
                        </div>
                    )
            ):(
                <div className='menuBox'>
                    <h1>Opponent disconnected</h1>
                    <button
                        onClick={() => onButtonClick()}
                    >
                        Go to menu
                    </button>
                </div>
            )
            }
        </>
    )
}