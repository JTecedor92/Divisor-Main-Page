import React from 'react'
import './Topbar.css'
import SettingsIcon from '@mui/icons-material/Settings';
import {useState, useEffect, useRef} from 'react';
import whiteLogo from '../assets/LogoWhite.png'

function Topbar() {

  const [open, setOpen] = useState(false);

  let menuRef = useRef();

  useEffect(()=>{
    let handler = (e) =>{
      if (!menuRef.current.contains(e.target)) {
      setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);

    return() => {
      document.removeEventListener("mousedown", handler);
    }
  });

  return (
    <div className= 'topbar'>
      <div className= 'left'>
        <img src={whiteLogo} className='logo'/>
        <div className='title'>
          Divisor
        </div>
      </div>
      <div className= 'right'>
        <div ref={menuRef}>    
          <button className='tbutton' onClick={()=>{setOpen(!open)}}>
            <SettingsIcon className= 'settings-icon'/>
          </button>
          <div className={`dropdown-menu ${open? 'active' : 'inactive'}`}>
            <div className='triangle'></div>
            <h1 className='menu-item'>
              Profile
            </h1>
            <h1 className='menu-item'>
              Friends
            </h1>
            <h1 className='menu-item'>
              Preferences
            </h1>
              <h1 className='signout'>
                Sign out
              </h1>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Topbar