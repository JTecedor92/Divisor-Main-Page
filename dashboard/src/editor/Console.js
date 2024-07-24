import React from 'react'
import {useEffect, useState} from 'react'
import './Console.css'

const lines = []


function addLine(text) {
        lines.push(<div className='console-line' key={lines.length.toString}> 
                {text}
            </div>
        )
    
}
const handleStroke = (event) => {
    if(lines[lines.length-1]){
        if(event.key === 'ArrowLeft'){
            //do move left here
        }else if(event.key === 'ArrowRight'){
            //Do move right here
        }else if(event.key === 'Delete'){
            //Do delete behavior here
        }else if(event.key.length === 1 && /[a-zA-Z]/.test(event.key)){
            //Do letter behaviors here
        }
    }
}
function Console() {
    
    const [currentLine, setCurrentLine] = useState("");
    const [currentCursorPosition, setCurrentCursorPosition] = useState(0);
    useEffect(() => {


        return () =>{
            console.log("Cleanup lol")
        }
    }, [])

  return (
    <div className='console-terminal' onKeyDown={handleStroke}>
        {lines.map((element) => (
        element
      ))}
      <div>
        {currentLine}
      </div>
      {/* Cursor should blink when terminal is in focus */}
      {/* <div className='caret'>
        
      </div> */}
      <input className='line'>
      </input>
    </div>
  )
}

export default Console