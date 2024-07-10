import React, {useState, useEffect, useRef} from 'react'

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/css/css';
import { Controlled as ControlledEditorComponent } from 'react-codemirror2';

function handleChange(){

}
function SharedEditor(props) {
  const connection = useRef(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000")

    socket.addEventListener("open", event => {
      socket.send("Connection established")
      console.log("Connection established")
    });
  
    socket.addEventListener("message", event => {
      console.log("Message from server ", event.data)
    });

    connection.current = socket;

    return () => connection.current.close();
  }, [])


  return (
    <div style={{textAlign:"left", fontSize:"1.8vh"}}>
      <h1  style={{textAlign:"center"}}>How to build Bomb in Java</h1>
    <ControlledEditorComponent
        onBeforeChange={handleChange}
        value= {props.initialValue}
        className="code-mirror-wrapper"
        options={{
          lineWrapping: true,
          lint: true,
          mode: props.language,
          lineNumbers: true,
        }}
      />
    </div>
  )
}

export default SharedEditor
