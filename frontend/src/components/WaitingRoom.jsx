import RoomCreator from './RoomCreator.jsx';
import {useState} from "react";
import Game1 from "./Game1.jsx";

export default function WaitingRoom({view, onButtonClick}){
    const [play, setPlay] = useState(false);
    return (
        <>
            {view === 1 ?
                (!play ?
                    (
                        <div className='menuBox'>
                            <button
                                className="goBackButton"
                                onClick={() => onButtonClick('start')}
                            >
                                Back
                            </button>
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
                                onClick={() => setPlay(true)}
                            >
                                Play
                            </button>
                        </div>
                    )
                        :
                    (
                        <Game1 onButtonClick={ () =>
                            onButtonClick('start')
                        }/>
                    )
                )
                :
                (
                    <RoomCreator
                        onButtonClick={ () =>
                            onButtonClick('start')
                        }
                    />
                )
            }
        </>
    )
}