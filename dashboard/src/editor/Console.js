import React from 'react'
import {useEffect, useState, useRef} from 'react'
import './Console.css'


function Console({terminalFunctionSetter}) {
  const [lines, setLines] = useState([]);

   
    const placeholder =""
    useEffect(() => {
        terminalFunctionSetter(addLine);
        

        return () =>{
            console.log("Cleanup lol")
        }
    }, [])

  return (
    <div className='console-terminal' >
        {lines.map((element) => (
        element
      ))}
    </div>
  )
  
function addLine(text) {
  console.log("Addline called")
  const now = new Date();
  const hours = now.getHours() + "";
  const mins = now.getMinutes() + "";
  const secs = now.getSeconds() + "";
  const timeString = (hours.length > 1 ? hours : "0"+hours) + ":" + (mins.length > 1 ? mins : "0"+mins) + ":" + (secs.length > 1 ? secs : "0"+secs);
  setLines((prevElements) => [
    ...prevElements,
      <div className='console-line' key={lines.length}> 
          {timeString + ">> " + text}
          <div>
            {placeholder}
            </div>
      </div>
      
  ])
  



}
}



export default Console