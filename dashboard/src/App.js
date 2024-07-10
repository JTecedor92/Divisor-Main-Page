import './App.css';
import Main from './components/Main.js'
import LoadingScreen from './components/LoadingScreen.js'
import SharedEditor from './components/SharedEditor.js'
import {useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
function App() {

  const [elementvisible,setVisible] = useState('Main');
  const javaBoiler = "import java.util.concurrent.TimeUnit;\n\nclass Main {\n\tpublic static void main(String[] args){\n\t\tSystem.out.println(\"The bomb is ticking...\");\n\t\tfor(int i = 10; i > -1; i++){\n\t\t\tTimeUnit.SECONDS.sleep(1);\n\t\t\tSystem.out.println(i);\n\t\t}\n\t\tSystem.out.println(\"BOOM\");\n\t}\n}"

  return (
    <Router>
      <Routes>
        <Route path='/main' Component={Main}/>
        <Route path='/loading' Component={LoadingScreen}/>
        <Route path='/editor' element={<SharedEditor language="text/x-java" initialValue={javaBoiler}/>}/>
      </Routes>
    </Router>
  );
}

export default App;
