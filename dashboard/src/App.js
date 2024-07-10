import './App.css';
import Main from './components/Main.js'
import LoadingScreen from './components/LoadingScreen.js'
import Editor from './components/Editor.js'
import {useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
function App() {

  const [elementvisible,setVisible] = useState('Main');

  return (
    <Router>
      <Routes>
        <Route path='/main' Component={Main}/>
        <Route path='/loading' Component={LoadingScreen}/>
        <Route path='/editor' Component={Editor}/>
      </Routes>
    </Router>
  );
}

export default App;
