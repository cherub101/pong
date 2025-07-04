import {useState, useRef, useEffect} from 'react';
export default function Game1({onButtonClick}){
    const [counter, setCounter] = useState(0);
    const [game, setGame] = useState(true);
    const ballXY = useRef({x: 900, y: 400});
    const ballV = useRef({dx: -15, dy: 15});
    const ballRef = useRef(null);
    const paddleY = useRef(400);
    const paddleRef = useRef(null);
    const gameRef = useRef(null);
    useEffect(() => {
        if(game){
            window.addEventListener('mousemove', changePaddlePosition);
            let animationFrameId;
            const update = () => {
                paddleRef.current.style.top = `${paddleY.current}px`
                changeBallPosition();
                ballRef.current.style.right = `${ballXY.current.x}px`;
                ballRef.current.style.top = `${ballXY.current.y}px`;
                animationFrameId = requestAnimationFrame(update);
            };
            animationFrameId = requestAnimationFrame(update);
            return () => {
                cancelAnimationFrame(animationFrameId);
                window.removeEventListener("mousemove", changePaddlePosition);
            }
        }
    }, [game]);

    const changeBallPosition = () => {
        const x = ballXY.current.x;
        const y = ballXY.current.y;
        if(x <= 10) {
            if(checkIfLost()){
                return;
            }
            ballV.current.dx *= -1;
        }
        else if(x >= 1765) {
            ballV.current.dx *= -1;
            gameRef.current.style.borderLeft = `10px solid green`;
            setCounter(prevCounter => prevCounter + 1);
            setTimeout(() => {
                gameRef.current.style.borderLeft = `10px solid red`;
            },300);
        }
        ballXY.current.x += ballV.current.dx;
        if (y >= 755){
            ballV.current.dy *= -1;
            gameRef.current.style.borderBottom = `10px solid orange`;
            setTimeout(() => {
                gameRef.current.style.borderBottom = `10px solid white`;
            },300);
        }
        else if(y <= 0){
            ballV.current.dy *= -1;
            gameRef.current.style.borderTop = `10px solid orange`;
            setTimeout(() => {
                gameRef.current.style.borderTop = `10px solid white`;
            },300);
        }
        ballXY.current.y += ballV.current.dy;
    }

    const changePaddlePosition = (event) => {
        if(event.pageY - 140 > 700){
            paddleY.current = 700;
        }
        else if (event.pageY - 140 < 0){
            paddleY.current = 0;
        }
        else{
            paddleY.current = event.pageY - 140;
        }
    }

    const checkIfLost = () => {
        if (ballXY.current.y < paddleY.current
            ||
            ballXY.current.y > paddleY.current + 80)
        {
            setGame(false);
            return true;
        }
        return false;
    }

    const startGame = () => {
        ballXY.current = {x: 900, y: 400};
        const directionSetting = Math.floor(Math.random() * 2);
        switch (directionSetting){
            case 0:
                ballV.current = {dx: -15, dy: 15};
                break;
            case 1:
                ballV.current = {dx: -15, dy: -15};
                break;
        }
        setCounter(0);
        setGame(true);
    }

    return(
        <>
            <>
                <main
                    ref={gameRef}
                    className="gameField1"
                >
                    <h1 className='counter absolute top-[300px] left-[100px] text-9xl'>{counter}</h1>
                    <div
                        className="ball"
                        ref={ballRef}
                    >
                    </div>
                    <div
                        className='paddle paddleRight'
                        ref={paddleRef}
                    ></div>
                </main>
            </>
            {!game ? (
                <>
                    <div className='youLostBox'>
                        <h1>
                            You lost at {counter} bounces
                        </h1>
                        <div>
                            <button
                                onClick={startGame}
                                className="menuButton"
                            >
                                Play again
                            </button>
                            <button
                                onClick={() => onButtonClick()}
                                className="menuButton"
                            >
                                Return to menu
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <></>
            )}
        </>
    )
}