import React, { useEffect, useState } from 'react'
import "./LoadingScreen.css"
import Logo from "../assets/LogoWhite.png";
import halfLogoBR from "../assets/LogoWhiteHalfBR.png"
import halfLogoTL from "../assets/LogoWhiteHalfTL.png"

function LoadingScreen() {
    const [firstAniComplete, setFirstAniComplete] = useState(false);
    const [secondAniComplete, setSecondAniComplete] = useState(false);
    const [loadCount, setLoadCount] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);
    function secondAnimation() {
        setSecondAniComplete(true);
        setFirstAniComplete(false);
    }
    function firstAnimation(){
        setFirstAniComplete(true);
    }
    function addPeriod(){
        setLoadCount(prevLoadCount => (prevLoadCount === 3 ? 0 : prevLoadCount + 1));
    }

  useEffect(() => {
    if (firstAniComplete) {
      setFadeOut(true);
    }
  }, [firstAniComplete]);
    useEffect(() => {
        const interval = setInterval(addPeriod, 750);
        return () => clearInterval(interval);
    }, [])
    return (
    <div className='all'
    style={{animation: fadeOut ? ('fadeOutAnimation 1.3s ease forwards') : ('none')}}
    //Set the above to 1.3s
    //'fadeOutAnimation 1.3s ease forwards'
    >
        <div className='inner'>
            {firstAniComplete ? (         
                <div>
                    <img src={halfLogoTL} 
                    className='imgh top-left'
                    onAnimationEnd={secondAnimation}
                    
                    ></img>
                    <img src={halfLogoBR} className='imgh bottom-right' 
                    ></img>
                </div>
            ):(
                <img src={Logo} 
                className='imgf'
                onAnimationEnd={firstAnimation}
                style={{display: secondAniComplete ? 'none' : 'block'}}
                ></img>
            )
 
            }
            <t className="txt"
            onAnimationEnd={addPeriod}
            >Loading{
            (loadCount === 0) ? "" : (
                (loadCount === 1) ? "." : (
                    (loadCount === 2) ? ".." : (
                       "..." 
                    )
                )
            )
            }</t>
        </div>
    </div>
  )
}

export default LoadingScreen