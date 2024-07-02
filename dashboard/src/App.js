import './App.css';
import Main from './components/Main.js'
import LoadingScreen from './components/LoadingScreen.js'
import {useState} from 'react';
function App() {

  const [elementvisible,setVisible] = useState('Main');

  return (
    <div className="App">
      <div style={{display: elementvisible==='Loading' ? 'inline-block' : 'none' , width: '100%' , height: '100%'}}>
        <LoadingScreen/>
      </div>
      <div style={{display: elementvisible==='Main' ? '' : 'none', width: '100%' , height: '100%'}}>
        <Main/>
      </div>
    </div>
  );
}

export default App;
