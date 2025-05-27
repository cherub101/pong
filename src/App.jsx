import {useState} from 'react';
import Welcome from './components/Welcome.jsx';
import WaitingRoom from './components/WaitingRoom.jsx';
import Game1 from './components/Game1.jsx';
import Game2 from "./components/Game2.jsx";
export default function App() {
  const [view, setView] = useState('start');
  const [gameMode, setGameMode] = useState(null);
  const viewManagement = () =>{
    switch (view) {
      case 'start':
        return <Welcome 
                  onButtonClick={(mode) => {
                    setView('waitingRoom');
                    setGameMode(mode);
                }}/>
      case 'waitingRoom':
        return <WaitingRoom 
                  view={gameMode}
                  onButtonClick={setView}
                />;
      case 'game1':
        return <Game1
                  onButtonClick={setView}
                />;
        case 'game2':
            return <Game2
                onButtonClick={setView}
            />;
    }
  }
  return (
    <>
      {view !== 'game1' && view !== 'game2'  ? (
          <div className='menuBox'>
              {viewManagement()}
          </div>)
          :
          viewManagement()}
    </>
  )
}
