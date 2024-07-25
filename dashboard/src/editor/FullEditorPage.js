import React, {useState, useEffect, useRef} from 'react'
import EditorStateManager from './EditorStateManager'
import './FullEditorPage.css'
import Console from './Console.js'


function FullEditorPage() {

    const [sessionID, setSessionID] = useState("");
    const [user, setUser] = useState("");
    const [sessionID2, setSessionID2] = useState("");
    const [user2, setUser2] = useState("");

    const tempClicked = useRef(false);
    const [tempPosition, setTempPosition] = useState({left: 0, top: 0})
    const [startPosition, setStartPosition] = useState({left: 0, top: 0})


    const [socket, setSocket] = useState();
    
    function handleSocket (sock) {
      console.log("Socket set.");
      setSocket(sock);
    }

    useEffect(() => {
      document.addEventListener('mousemove', (event) =>{
        
        if(tempClicked.current){
          setTempPosition({left: (tempPosition.left - (startPosition.left - event.clientX)), top: (tempPosition.top - (startPosition.top - event.clientY))})

        }
      });
  
      return () => {
        document.removeEventListener('mousemove', (event) =>{
          if(tempClicked.current){
            setTempPosition({left: (tempPosition.left - (event.clientX - startPosition.left)), top: (tempPosition.top - (event.clientY - startPosition.top))})
          }
        });
      };
    }, []);
  return (
    <div className='editor-all' onMouseUp={() => {
      tempClicked.current = false;;
    }}>

      <div className='temporary-entry' onMouseDown={(event) => {
        // tempClicked.current = true;
        setStartPosition({left: event.clientX, top: event.clientY});

      }} style={{left: tempPosition.left, top: tempPosition.top}}>
        <input placeholder="Session ID" onChange={(event)=>{
  setSessionID2(event.target.value)
  }}></input>
        <input placeholder="Username" onChange={(event)=>{
  setUser2(event.target.value)
  }}></input>
        <button onClick={(event) =>{
          try{
          setSessionID(sessionID2);
          setUser(user2);
          socket.emit('join', {id: sessionID2, username: user2})(user, sessionID);
          
          }catch(error){}
}}>Join Session</button>
      </div>

      <div className='editor-top'>

      </div>

      <div className='editor-bottom'>

        <div className='editor-left'>
          <div className='problem-window'>

          </div>
          <Console/>
        </div>

        <div className='editor-right'>

          <div className='editor-editor'>
            <EditorStateManager sessionID={sessionID} user={user} setSocket={handleSocket}/>
          </div>

        </div>

      </div>

    </div>
  )
}

export default FullEditorPage
