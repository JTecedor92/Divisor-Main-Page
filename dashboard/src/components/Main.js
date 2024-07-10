import React from 'react'
import './Main.css'
import Topbar from './Topbar.js'
function Main() {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Topbar />
      <div className='all1'>
        <div style={{ backgroundImage: 'radial-gradient(at 100% 0, #5adaff, #5468ff 100%)', minHeight: '100%', flexGrow: '1', boxShadow: '0 4px 8px inset rgba(45, 35, 66, 0.3)' }}>
          <div className='sbstack'>
            <div className='sbText'>
              Current Leagues
            </div>
            <div className='sbText'>
              Current Sessions
            </div>
          </div>
          <div className='credits'>
            Credits
          </div>
        </div>
        <div style={{ background: 'white', minHeight: '100%', flexGrow: '6' }}>
          <div className='welcome'>
            Welcome back, user
          </div>
          <div className='stack'>
            <button className='button'>Play Session</button>
            <button className='button'>Create Session</button>
            <button className='button'>Search for League</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main