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


function Console() {
    
    const [currentLine, setCurrentLine] = useState("");
    const [currentCursorPosition, setCurrentCursorPosition] = useState(0);
    useEffect(() => {
        addLine("Hi");
        addLine("Hi");
        addLine("Hi");
        addLine("Hi");
        addLine("Hi");

        return () =>{
            console.log("Cleanup lol")
        }
    }, [])

  return (
    <div className='console-terminal' >
        {lines.map((element) => (
        element
      ))}
      <div>
        {currentLine}
      </div>
    </div>
  )
}

export default Console