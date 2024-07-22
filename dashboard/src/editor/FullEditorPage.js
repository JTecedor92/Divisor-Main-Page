import React, {useState} from 'react'
import EditorStateManager from './EditorStateManager'
import './FullEditorPage.css';


function FullEditorPage() {

    const [sessionID, setSessionID] = useState("");
    const [user, setuser] = useState("");
    const [user2, setuser2] = useState("");

    const [socket, setSocket] = useState();
    
    function handleSocket (sock) {
      setSocket(sock);
    }
  return (
    <div>
      <div className='all2'>
          <h1 className='timer'>00:00</h1>
          <button className='menu'>Menu</button>
        <div className='left'>
          <div className='problem-window'>
            <div className='problem-selector'>

            </div>
          </div>
        </div>
          <div className=''></div>
          <input onChange={(event)=>{
            setSessionID(event.target.value)
            }}></input>
          <input onChange={(event)=>{
            setuser2(event.target.value)
            }}></input>
          <button onClick={(event) =>{
            setuser(user2);
            socket.emit('create', {id: sessionID, username: user})
          }}>Join Session</button>

        <div className='right'>
          <div className='editor-window'>
            <EditorStateManager sessionID={sessionID} user={user} setSocket={handleSocket}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FullEditorPage
