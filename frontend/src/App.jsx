import {useState} from 'react';
import Welcome from './components/Welcome.jsx';
import WaitingRoom from './components/WaitingRoom.jsx';
import LandingPage from "./components/LandingPage.jsx";
export default function App() {
  const [view, setView] = useState('landing');
  const [gameMode, setGameMode] = useState(null);
  const viewManagement = () =>{
      switch (view) {
          case 'start':
              return <Welcome
                      onButtonClick={(mode) => {
                        setView('waitingRoom');
                        setGameMode(mode);
                    }}/>
          case 'landing':
              return <LandingPage
                        onLogin={() => setView('start')}
                    />;
          case 'waitingRoom':
              return <WaitingRoom
                      view={gameMode}
                      onButtonClick={setView}
                    />;
        }
  }
  return (
    <>
        <div className={
            'tooSmall h-full w-full hidden justify-center items-center text-center text-white  text-6xl'
        }>
            <div>
                <h1>
                    Window is too small.
                </h1>
                <h2>
                    To play pong you need at least: 1800×800.
                </h2>
            </div>
        </div>
        {viewManagement()}
    </>
  )
}
