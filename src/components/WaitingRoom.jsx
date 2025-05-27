export default function WaitingRoom({view, onButtonClick}){
    return (
        <>   
            <button 
                className="goBackButton"
                onClick={() => onButtonClick('start')}
            >
                Back
            </button>     
            {view === 1 ?
                (
                    <>
                        <h2
                            className="text-center text-6xl mb-6"
                        >
                            One player mode rules:
                        </h2>
                        <h3 className="text-center text-4xl mb-3">
                            Bounce the ball with paddle <br/>
                            Each bounce from left wall is a point <br/>
                            Good Luck!
                        </h3>
                        <button 
                            className='playButton'
                            onClick={() => onButtonClick('game1')}
                        >
                            Play
                        </button>
                    </>
                )
                :
                (
                    <>
                        <h2>
                            You picked two players mode
                        </h2>
                        <button 
                            className='playButton'
                            onClick={() => onButtonClick('game2')}
                        >
                            Play
                        </button>
                    </>
                )
            }
        </>
    )
}