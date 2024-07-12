import React, {useState} from 'react'
import EditorStateManager from './EditorStateManager'
import './FullEditorPage.css';


function FullEditorPage() {

    const [sessionID, setSessionID] = useState("");

  return (
    <div className='all2'>
        <h1 className='timer'>00:00</h1>
        <button className='menu'>Menu</button>
        <div className='problem-window'>
            <div className='problem-selector'>

            </div>
        </div>
        <div className=''></div>
        <input onChange={(event)=>{setSessionID(event.target.value)}}></input>
        <div className='editor-window'>
            <EditorStateManager sessionID={sessionID}/>
        </div>
    </div>
  )
}

export default FullEditorPage
