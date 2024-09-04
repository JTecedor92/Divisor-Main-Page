import React from 'react'
import './Icon.css'
import checkIcon from '../assets/check-final.png'
import crossIcon from '../assets/cross-final.png'

function Icon({type, propString, lastOutput, output}) {
  return (
    <div className='icon-all'>
        <div className='circle'>
            <img src={checkIcon} className='icon' style={{
                display: (type === 'check' ? 'inline-block' : 'none')
            }}/>
            <img src={crossIcon} className='icon' style={{
                display: (type === 'cross' ? 'inline-block' : 'none')
            }}/>
        </div>
        <div className='inputs'>
            {propString}
        </div>
        <div className='inputs' style={{flexGrow: "1"}}>
            Last Output
        </div>
        <div className='output'>
            {output}
        </div>
    </div>
  )
}

export default Icon
