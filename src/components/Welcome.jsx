export default function Welcome({onButtonClick}) {
    return (
        <>
            <h1>
                Welcome at PONG game!!!
            </h1>
            <div>
                <button
                    onClick={() => onButtonClick(1)}
                    className='menuButton'
                >
                    ONE PLAYER
                </button>
                <button
                    onClick={() => onButtonClick(2)}
                    className='menuButton'
                >
                    TWO PLAYERS
                </button>
            </div>
        </>
    )
}