import React, {useState, useEffect, useRef} from 'react'
import EditorStateManager from './EditorStateManager'
import LoadingComponent from '../components/LoadingComponent.js'
import Icon from '../components/Icon.js'
import './FullEditorPage.css'
import { LinearGradient } from 'react-text-gradients'
// import Console from './Console.js'
// import { Language } from '@mui/icons-material';



function FullEditorPage() {

    const [sessionID, setSessionID] = useState("");
    const [user, setUser] = useState("");
    const [sessionID2, setSessionID2] = useState("");
    const [user2, setUser2] = useState("");
    const [editorIsLoading, setEditorIsLoading] = useState(true);
    const [caseIsRunning, setCaseIsRunning] = useState(false);
    const [teamname, setTeamname] = useState("");

    const runnerFunction = useRef(undefined);

    // const [problems, setProblems2] = useState([]);
    const problems = useRef([]);

    const [caseStatuses, setCaseStatuses] = useState([]);
    
  
    const [slidingAni, setSlidingAni] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState("text/x-java");
    const [currentProblem, setCurrentProblem] = useState(undefined)
    const [currentProblemNum, setCurrentProblemNum] = useState(1)
    const [problemList, setProblemList] = useState([])
    const slidingAniActive = useRef(false);
    const tempClicked = useRef(false);
    const [testFunction, setTestFunction] = useState(undefined);
    const [tempPosition, setTempPosition] = useState({left: 0, top: 0})
    const [startPosition, setStartPosition] = useState({left: 0, top: 0})
    const blocker = useRef(false);
    const blockerblocker = useRef(false);

    const addLineFunction = useRef(undefined);

    const selectedTabStyle = useRef({
      cursor: "pointer",
      paddingBottom: "4px",
      borderBottom: "2px",
      borderStyle: "solid",
      fontWeight: "400",
      letterSpacing: "1px",
    });
    const unselectedTabStyle = useRef({
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      margin:"0",
      padding: "0",
      height: "34px",
      fontWeight: "200",
      letterSpacing: "1px",
      marginLeft: "15px",
      fontSize: "20px",
      textWrap: "nowrap",
      border: "0",
    });

    const [testCaseElementsState, setTestCaseElements2] = useState([]);
    const testCaseElements = useRef([]);

    const [tabSelected, setTabSelected] = useState("problem");
    
    

    const [socket, setSocket] = useState();
    const [state, setState] = useState({});

    const forceUpdate = () => {
        setState({});
    };
    
    function handleSocket (sock) {
      console.log("Socket set.");
      setSocket(sock);
    }

    function setTestCaseElements (arr) {
      console.log(arr);
      setTestCaseElements2(arr);
      testCaseElements.current = arr;
    }


    const setProblems = (items) => {
      problems.current = items;
      console.log("setting problems to:")
      console.log(items);
      setCurrentProblem(items[0]);
      console.log("Set current problem to " + items[0])

      let tempArr = [];
      for(let i = 0; i < items.length; i++){
        tempArr.push(
        <div className='problem-listing' onClick={()=>{handleClick2(i)}}>
          #{i+1}- {items[i].title}
        </div>
        );
      }
      setProblemList(tempArr);
    }
    const handleClick2 = (i) => {
      console.log('handle called');
      setCurrentProblemNum(i+1);
      console.log(problems);
      setCurrentProblem(problems.current[i]);
      blockerblocker.current = true;
      setSlidingAni(false);
    }
    function handleAddLine (func) {
      addLineFunction.current = func;
      console.log("Add Line set to " + typeof addLineFunction.current);
      const func2 = addLineFunction.current;
    }
   

    const lorem = 'Cillum proident quis nostrud sunt pariatur laboris velit minim ipsum ex anim veniam proident. Velit Lorem sit occaecat eu consequat ea cillum est aliquip aliquip Lorem est elit adipisicing. Sunt amet consequat eu voluptate mollit occaecat incididunt ipsum adipisicing velit aliqua officia. Laborum aliqua dolor incididunt labore excepteur aliqua minim nisi nostrud labore in.\nAnim incididunt nulla ad sunt ut sint incididunt tempor dolore. Cillum id mollit est elit. Deserunt id commodo sint Lorem ullamco exercitation. Nostrud pariatur dolor aute magna cupidatat consectetur excepteur magna. Deserunt aute amet id eiusmod occaecat.\nReprehenderit aliqua in occaecat voluptate consequat ex ipsum laborum reprehenderit tempor est culpa laboris. Aliquip voluptate tempor cupidatat id est. Enim irure commodo aliqua do pariatur occaecat. Consequat commodo tempor nulla dolor eiusmod. Ex minim anim voluptate deserunt eiusmod officia culpa est minim id. Commodo nostrud nulla tempor nostrud labore.'
    useEffect(() => {
      slidingAniActive.current = false;
    }, [tabSelected])
    
    useEffect(() => {
      
      // const testcases = msg.testcases;
      // console.log(testcases);
      const htmls = [];
      if(caseStatuses !== undefined){
        console.log("Case Statuses changed");
        console.log(caseStatuses);

        for(let i = 0; i < caseStatuses.length; i++){
          const caseStatus = caseStatuses[i];
          htmls.push(<Icon key={htmls.length+1} type={caseStatus.status} propString={caseStatus.inputs} output={caseStatus.output} lastOutput={caseStatus.lastOutput}/>)
        }


        console.log("htmls incoming");
        console.log(htmls);
        console.log(caseStatuses);
        setTestCaseElements(htmls);
      }
      


    }, [caseStatuses])

    useEffect(() => {
      console.log('mayaa')
      console.log(testCaseElementsState);
      forceUpdate();
    }, [testCaseElementsState])

    useEffect(() => {
      document.addEventListener('mousemove', (event) =>{
        
        if(tempClicked.current){
          setTempPosition({left: (tempPosition.left - (startPosition.left - event.clientX)), top: (tempPosition.top - (startPosition.top - event.clientY))})

        }
      });

      
      
  
      return () => {
        document.removeEventListener('mousemove', (event) =>{
          if(tempClicked.current){
            setTempPosition({left: (tempPosition.left - (event.clientX - startPosition.left)), top: (tempPosition.top - (event.clientY - startPosition.top))})
          }
        });
      };

    }, []);

    useEffect(() => {
      try{
        if(user2 !== "" && teamname !== ""){
        setSessionID(teamname + "\\" + currentProblemNum);
        setUser(user2);
        console.log("Sending join req");
        socket.emit('join', {id: (teamname + "\\" + currentProblemNum), username: user2, language: currentLanguage});
        setEditorIsLoading(true);
        }
        
        }catch(error){
          console.log(error);
        }

    }, [currentProblemNum, currentProblem])

    useEffect(() => {
      if(socket !== undefined){
        console.log("Socket Checking for outputs")
        socket.on('o-'+sessionID, (msg) =>{
          if(msg.type === 'testcase'){

              console.log('Testcase message:');
              console.log(msg);

              const testcases = msg.testcases;
              const statuses = [];

              for(let i = 0; i < testcases.length; i++){
                const localTestcase = testcases[i];
                statuses.push(localTestcase);
              }

              // console.log(testcases);
              // for(let i = 0;; i++){
              //     const testcase = testcases[i];
              //     if(testcase === undefined){
              //         break;
              //     }
              //     statuses.push(testcase);
                
              // }
              console.log(statuses);
              setCaseStatuses(statuses);
          }else if(msg.type === 'testcase-2'){
            console.log(msg.number);
            console.log(msg.status);
            setCaseStatuses((prevStatuses) => {
              // Create a shallow copy of the array
              const newStatuses = [...prevStatuses];
              
              // Update the specific element in the copied array
              newStatuses[msg.number] = msg.status;
              
              // Return the new array to set the state
              return newStatuses;
          });
              // html[msg.number] = (<Icon type={testcases[i+""]}  propString={propStringz} output={currentProblem.testcases["out"+(i+1)]}/>)
          }else if(msg.type === 'running'){

          }

        })
      
      }
    }, [socket, sessionID])

  return (
    <div className='editor-all' onMouseUp={() => {
      tempClicked.current = false;;
    }}>

      <div className='temporary-entry' onMouseDown={(event) => {
        // tempClicked.current = true;
        setStartPosition({left: event.clientX, top: event.clientY});

      }} style={{left: tempPosition.left, top: tempPosition.top}}>
        <input placeholder="Team Name" onChange={(event)=>{
          setTeamname(event.target.value)
      setSessionID2(event.target.value + "\\" + currentProblemNum)
  }}></input>
  <button onClick={(event) =>{
          try{
            socket.emit('run', {id: sessionID2});  
          }catch(error){
            console.log(error);
          }
}}>Button For Testing</button>
        <input placeholder="Username" onChange={(event)=>{
  setUser2(event.target.value)
  }}></input>
        <button onClick={(event) =>{
          try{
          setSessionID(sessionID2);
          setUser(user2);
          console.log("Sending join req");
          socket.emit('join', {id: sessionID2, username: user2, language: currentLanguage});
          setEditorIsLoading(true);
          
          }catch(error){
            console.log(error);
          }
}}>Join Session</button>
      </div>

      <div className='editor-top'>

      </div>

      <div className='editor-bottom'>

        <div className='editor-left'>
          <div className='problem-window'>
            <div className='problem-window-top'>
              <h2 className='problem-window-top-headings' onClick={()=>{setTabSelected('problem')}}
                style={tabSelected === 'problem' ? selectedTabStyle.current : unselectedTabStyle.current}>
                  Problem
              </h2>
              <h2 className='problem-window-top-headings'   onClick={()=>{setTabSelected('testcase')}}
                style={tabSelected === 'testcase' ? selectedTabStyle.current : unselectedTabStyle.current}>
                  Test Cases
              </h2>
              <h2 className='problem-window-top-headings' onClick={()=>{setTabSelected('scoreboard')}}
                style={tabSelected === 'scoreboard' ? selectedTabStyle.current : unselectedTabStyle.current}>
                  Scoreboard
              </h2>
            </div>


            {/*Here comes a hell of a lot of code */}


            <div className='problem-window-bottom' onClick={() => {
                  if(!blocker.current){
                    setSlidingAni(false);
                  }else{
                    blocker.current = false;
                  }
                }} style={{
                  display: (tabSelected === 'problem' ? 'flex' : 'none')
                }}>
              <div className='sliding-menu' onClick={()=> {
                if(!blockerblocker.current){
                  blocker.current = true;
                }else{
                  blockerblocker.current = false;
                }
              }} style={slidingAni ? {
                animationName: 'slide-in',
                animationDuration: '.5s',
                animationFillMode: 'forwards'
              } : (slidingAniActive.current ? {animationName: 'slide-out',
                animationDuration: '.5s',
                animationFillMode: 'forwards'} : {animation: ''})}
                onAnimationEnd={()=>{slidingAniActive.current = true}}>
                  <h2 className='sliding-menu-title'>
                  <LinearGradient gradient={['to left', '#5adaff ,#5468ff']}>
                    Problems
                  </LinearGradient>
                  </h2>

                <div className='close-icon' onClick={() => {
                  setSlidingAni(false);
                }}>
                  <LinearGradient gradient={['to left', '#ff6a6a, #fe5454']}>
                  ✖
                  </LinearGradient>
                </div>
                {problemList.map((element) => element)}
                
              </div>
              <h1 className='problem-title'>
                #{currentProblemNum}- {currentProblem === undefined ? 'Loading...' : currentProblem.title} ● {currentProblem === undefined ? '0' : currentProblem.points} pts
              </h1>
              <h1 className='problem-menu' onClick={()=>{
                setSlidingAni(true);
                blocker.current = true;
              }}>
                ≡
              </h1>
              <p className='problem-text' >
                {currentProblem === undefined ? 'Problem is loading...' : currentProblem.text}
              </p>
            </div>
            
            {/*Test Cases*/}

            <div className='problem-window-bottom' style={{
                    display: (tabSelected === 'testcase' ? 'flex' : 'none'),
                    position: 'relative'
                  }}>

                  {/* <div className='testcase-top'> 
                      <h1 className='testcase-titles title-1'>
                        Status
                      </h1>
                      <h1 className='testcase-titles title-2'>
                        Parameters
                      </h1>
                      <h1 className='testcase-titles title-3'>
                        Last Output
                      </h1>
                      <h1 className='testcase-titles title-4'>
                        Correct Output
                      </h1>
                      
                  </div> */}

                  {testCaseElementsState.map((element) => element)}
                  {caseIsRunning ? (<div className='running-button'>
                    Running...
                  </div>) : (<div className='run-button' onClick={() => {
                    if(runnerFunction.current !== undefined){
                      runnerFunction.current(currentProblemNum);
                    }
                  }}>
                    Run
                  </div>)}
                  <div className='submit-button'>
                    Submit
                  </div>

                  
              {/* <Icon type={'cross'}/>
              <Icon type={'empty'}/>
              <Icon type={'check'}/>
              <Icon type={'cross'}/> */}
            </div>
          </div>
          
          
          
          
        </div>

        {/* <Console terminalFunctionSetter={handleAddLine}/> */}

        <div className='editor-right'>
         
              <select id="options" name="options" className='lang-selector' onChange={(event) => {
                const lang = event.target.value;
                console.log("Selected language: " + lang)
                switch(lang){
                  case 'java':
                    setCurrentLanguage('text/x-java');
                    break;
                  case 'cpp':
                    setCurrentLanguage('text/x-c++src');
                    break;
                  case 'python':
                    setCurrentLanguage('text/x-python');
                    break;
                }
              }}>
                  <option value="java" selected>Java</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
              </select>
     
          
          <div className='editor-editor'>
            <EditorStateManager caseSetter={setTestCaseElements} addLine={addLineFunction.current} sessionID={sessionID} user={user} setSocket={handleSocket} currentLanguage={currentLanguage} loadingSetter1={setEditorIsLoading} problemsSetter={setProblems} runnerFunction={runnerFunction}/>
            <div className='loading-object' style={{display: (editorIsLoading ? 'flex' : 'none')}}>
              <LoadingComponent height={'20vh'}/>
            </div>
            
          </div>
          
          

        </div>

      </div>

    </div>
  )
}

export default FullEditorPage
