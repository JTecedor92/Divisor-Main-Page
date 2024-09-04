import React from 'react'
import './ProblemCreator.css'

function ProblemCreator() {
  return (
    <div>
        <div className='probcreator-title'>
            Problem Creator
        </div>
        <div className='problem'>
            <textarea className='inputs-1' style={{height:'10vh'}} placeholder='Title'>
            </textarea>
            <textarea className='inputs-1' style={{height:'10vh'}}>
                Point Amount
            </textarea>
            <textarea className='inputs-1' style={{height:'40vh'}}>
                Description
            </textarea>
        </div>
        <div className='test-cases'>
            
        </div>
    </div>
  )
}

export default ProblemCreator