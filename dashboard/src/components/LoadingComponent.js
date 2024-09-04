import React from 'react'
import Logo from "../assets/LogoBlack.png";
import './LoadingComponent.css'

function LoadingComponent({height}) {
  return (
    <img src={Logo} 
        className='imgf-2'
        style={{height: height}}
    ></img>
  )
}

export default LoadingComponent
