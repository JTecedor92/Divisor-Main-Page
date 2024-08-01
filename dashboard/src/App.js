import './App.css';
import Main from './components/Main.js'
import LoadingScreen from './components/LoadingScreen.js'
import FullEditorPage from './editor/FullEditorPage.js'
import Login from './components/Login.js';
import CompCreator from './components/CompCreator.js'
import {useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
function App() {

  const [elementvisible,setVisible] = useState('Main');

  return (
    <Router>
      <Routes>
        <Route path='/main' Component={Main}/>
        <Route path='/loading' Component={LoadingScreen}/>
        <Route path='/editor' Component={FullEditorPage}/>
        <Route path='/login' Component={Login}/>
        <Route path='/compcreator' Componenet={CompCreator}/>
      </Routes>
    </Router>
  );
}

export default App;
