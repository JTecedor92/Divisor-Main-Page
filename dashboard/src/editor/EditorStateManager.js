import React, {useState, useEffect, useRef} from 'react'
import Editor from './Editor';
import socketIOClient from 'socket.io-client';

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/css/css';
import 'codemirror/addon/edit/closebrackets'
import { Controlled as ControlledEditor} from 'react-codemirror2';

const endpoint = "http://localhost:3001";

function EditorStateManager({setSocket, sessionID, user}) {

    const [currentLanguage, setCurrentLanguage] = useState("text/x-java");   

    const outerSocket = useRef(null)
    const outerEditor = useRef();

    const count = useRef(0);

    const handleKeyDown = (editor, event) => {
        count.current = 0;
    }

    //Managing for Editor
    const [value, setValue] = useState("Not Updated");
    // const [cursorLine, setCursorLine] = useState(0);
    // const [cursorCharacter, setCursorCharacter] = useState(0);
    
    const cursorLine = useRef(0)
    const cursorCharacter = useRef(0)


    let charStart;
    let charEnd;
    let type;
    let text2;
    let editCount = 0;

    let charChecker;
    let lineChecker;



    function charToLine(char){
        let lineToChar2 = [];
        lineToChar2.push(0);
        for(let i = 0; i < value.length;i++){
            if(value[i] === '\n'){
                lineToChar2.push(i+1);
            }
        }
        let index = 0;
        let distance = char - lineToChar2[0];
        for(let i = 1; i <lineToChar2.length; i++){
            if(char-lineToChar2[i] < distance && char > lineToChar2[i]){
                index = i;
                distance = char - lineToChar2[i];
            }
        }

        return({line: index, char: char-lineToChar2[index]})
    }

    function lineToChar(line, char){
        let lineToChar2 = [];

        lineToChar2.push(0);

        for(let i = 0; i < value.length; i++){
            if(value[i] === '\n'){
                lineToChar2.push(i+1);
            }
        }

        console.log(lineToChar2);

        return lineToChar2[line]+char;
    }


    //Run this code whenever the editor recieves an update
    function handleChange(editor, data, value){
        //Log the data from the editor
        console.log("Sessionid is " + sessionID);
        const text = data.text;

        console.log("Data:");
        console.log(data);

        //Set the edit type
        type = data.origin;

        //Check if the type is any form of an addition
        if(type === 'paste' || type === '+input' && count.current === 0){
            count.current++;
            if(!(text.length === 1 && text[0] === "")){

            //Find the location of the character where the edit occurs
            charStart = lineToChar(data.from.line, data.from.ch, value)
            
            //Run this code if an a newline was requested
            if(text.length > 1 && text[0] === "" && text[1] === ""){
                text2 = "\n";
            }else{
                
                //If one of a certain group of characters are typed, automatically close them
                if(text.length === 1){
                    if(text[0] === "\{"){
                        text[0] = "{}";
                    }else if(text[0] === "\(" ){
                        text[0] = "()";
                    }else if(text[0] === '\['){
                        text[0] = "[]";
                    }if(text[0] === "\"" || text[0] === "\'"){
                        text[0] += text[0];
                    }
                }

                //For multi-line additions, add line breaks at the end of each line
                text2 = "";
                for(let i = 0; i <text.length;i++){
                    text2 += text[i];
                    if(i !== text.length - 1){
                        text2 += '\n';
                    }
                }
            }
            
            
            //Console log the text being sent to the server for addition
            console.log(`Requesting to add \"${text2}\" to code at ${charStart}`)

            //Send the information about the addition
            outerSocket.current.emit('add', { id: sessionID, username: user, atChar: charStart, text: text2, editCount: editCount});
        }
        //Check if the edit is some form of a removal
        }else if(type === 'cut' || type === '+delete'){
            console.log("Data incoming...");
            console.log(data);

            //Find the point where the removal starts and ends
            charStart = lineToChar(data.from.line, data.from.ch, value);
            charEnd = lineToChar(data.to.line, data.to.ch, value);
            

            console.log(`Requesting to delete characters from ${charStart} to ${charEnd}`)
            //Giver the server information about the deletion
            outerSocket.current.emit('remove', { id: sessionID, username: user, fromChar: charStart, toChar: charEnd, editCount: editCount});

        }

    }
    useEffect(() => {

        //When the page mounts, create a socket to connect to the server
        const socket = socketIOClient(endpoint);

        //Store the socket in a useRef to make it accessible permanently outside the scope of this useEffect call
        outerSocket.current = socket;

        //Pass the socket to the FullEditorPage
        setSocket(socket);

        //Called whenever the client's session ID comes through the socket
        socket.on(sessionID, (msg)=>{
            if(msg.value || msg.value === ""){
                //Log the recieved data
                console.log("Editor recieved value:");
                console.log(msg.value);
                console.log("Editor recieved cursor position:");
                console.log(msg.cursorLocation);

                setValue(msg.value)
                
                if(msg.cursorLocation){
                    // charChecker = msg.cursorLocation.char;
                    // lineChecker = msg.cursorLocation.line;
                    // setCursorLine(msg.cursorLocation.line);
                    // setCursorCharacter(msg.cursorLocation.char)
                    // console.log("Line checker is " + lineChecker);
                    // console.log("char checker is " + charChecker)
                    cursorLine.current = msg.cursorLocation.line;
                    cursorCharacter.current = msg.cursorLocation.char;
                    try{
                        console.log(`Setting cursor position to line ${cursorLine.current}, character ${cursorCharacter.current}`)
                        outerEditor.current.setCursor(cursorLine.current, cursorCharacter.current)
                    }catch(error){}
                }
            } 
        });
        
        return () => {
            socket.disconnect();
        };

    }, [sessionID])

  

    return (
        <div className="editor">
            <ControlledEditor
                onBeforeChange={handleChange}
                value= {value}
                className="code-mirror-wrapper"
                options={{
                    lineWrapping: true,
                    lint: true,
                    mode: currentLanguage,
                    lineNumbers: true,
                    indentWithTabs: true, // Use tabs instead of spaces
                    tabSize: 2, // Set tab size to 2 spaces (or any value you prefer)
                    smartIndent: false, // Disable smart indentation
                }}
                editorDidMount={(editor) => {
                    outerEditor.current = editor;
                    editor.setSize('45vw','75vh');
                }}
                onKeyDown={handleKeyDown}
            />
        </div>
     )
}

export default EditorStateManager

