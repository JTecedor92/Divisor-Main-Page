import React from 'react'
import {useEffect, useState, useRef} from 'react'
import './Console.css'






function Console() {
    const lines = useRef([]);
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
        {lines.current.map((element) => (
        element
      ))}
      <div>
        {currentLine}
      </div>
    </div>
  )
  
function addLine(text) {
  lines.current.push(<div className='console-line' key={lines.current.length}> 
          {text}
      </div>
  )

}
}



export default Console