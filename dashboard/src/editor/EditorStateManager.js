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

    const [isMultiplayer, setIsMultiplayer] = useState(false);

    const [inSession, setInSession] = useState(false);

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

    

    function handleAddition(text, atChar){
        // let dex = keys.indexOf(msg.id);
        // let doc = docs[dex];
        let doc = value;
        //Gets an array storing updates to a given document
        // let docUpdate = docUpdates[dex];

        // let text = msg.text;
        
        let offset = 0;

        if(text.includes("\n")){
            let flag = false;
            if(text === "\n" && doc.substring(atChar-1, atChar) === "{" && doc.substring(atChar, atChar+1) === "}"){
                text = "\n\n";
                flag = true;
            }
            let temp = doc.substring(0, atChar)
            let unclosedParenthesisCount = 0;
            for(let i = 0; i < temp.length; i++){
                if(temp.substring(i, i+1) === '{' && (i === 0 || !(temp.substring(i-1, i) === "\\"))){
                    unclosedParenthesisCount++;
                }else if(temp.substring(i, i+1) === '}' && (i === 0 || (!temp.substring(i-1, i) === "\\"))){
                    unclosedParenthesisCount--;
                }
            }
            console.log("Parenthecount" + unclosedParenthesisCount);
            offset += unclosedParenthesisCount;
            let temp2 = "";
            if(unclosedParenthesisCount > 0){
                for(let j = 0; j < unclosedParenthesisCount; j++){
                    
                   temp2 += "\t"
                }
                console.log(`${temp2.length} tabs`)
                for(let i = 0; i < text.length; i++){
                    if(i === 0 || text[i] === "\n"){
                        text = text.substring(0, i+1) + temp2 + text.substring(i+1, text.length);
                        i+= temp2.length;
                        
                    }
                }
            }
            if(flag && doc.length > atChar && doc.substring(atChar, atChar+1) === "}"){
                text = text.substring(0, text.length - 1);
            }

        }


        
 
        try{
            doc = doc.substring(0, atChar) +  text + doc.substring(atChar);
            
        }catch(error){}

        if(text === "\"\"" || text === "\{\}" || text === "\(\)" || text === "\[\]" || text === "\'\'"){
            offset += 1;
        }

        setValue(doc);
        console.log("Returning the document (local): " + doc)
        cursorLine.current = charToLine(atChar+text.length-offset, value).line;
        cursorLine.current = charToLine(atChar+text.length-offset, value).char;


        // io.emit(msg.id, {value: docs[dex], username: msg.username, cursorLocation: charToLine(msg.atChar+text.length-offset, docs[dex])})
    
    }
    function handleRemoval(fromChar, toChar){
        // console.log('ID: ' + msg.id);
        // console.log('From Character: ' + msg.fromChar);
        // console.log('To Character: ' + msg.toChar);
        // let dex = keys.indexOf(msg.id);
        let doc = value;
        //Gets an array storing updates to a given document
        // let docUpdate = docUpdates[dex];
        doc = doc.substring(0, fromChar) + doc.substring(toChar);

        setValue(doc);
    }

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

            if(isMultiplayer){
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
                    outerSocket.current.emit('add', { id: sessionID, username: user, atChar: charStart, text: text2, editCount: editCount, respond: true});
                }
            }else{
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
                    handleAddition(text2, charStart);
                    // outerSocket.current.emit('add', { id: sessionID, username: user, atChar: charStart, text: text2, editCount: editCount});

                    outerSocket.current.emit('add', { id: sessionID, username: user, atChar: charStart, text: text2, editCount: editCount, respond: false});
                }
            }
                
        //Check if the edit is some form of a removal
        }else if(type === 'cut' || type === '+delete'){
            
            if(isMultiplayer){
                console.log("Data incoming...");
                console.log(data);

                //Find the point where the removal starts and ends
                charStart = lineToChar(data.from.line, data.from.ch, value);
                charEnd = lineToChar(data.to.line, data.to.ch, value);
                

                console.log(`Requesting to delete characters from ${charStart} to ${charEnd}`)
                //Giver the server information about the deletion
                outerSocket.current.emit('remove', { id: sessionID, username: user, fromChar: charStart, toChar: charEnd, editCount: editCount, respond:true})
            }else{
                console.log("Data incoming...");
                console.log(data);

                //Find the point where the removal starts and ends
                charStart = lineToChar(data.from.line, data.from.ch, value);
                charEnd = lineToChar(data.to.line, data.to.ch, value);
                

                console.log(`Requesting to delete characters from ${charStart} to ${charEnd}`)

                handleRemoval(charStart, charEnd);
                //Giver the server information about the deletion
                outerSocket.current.emit('remove', { id: sessionID, username: user, fromChar: charStart, toChar: charEnd, editCount: editCount, respond:false})
            }
            

        }

    }
    useEffect(() => {
        //When the page mounts, create a socket to connect to the server
        const socket = socketIOClient(endpoint);

        //Store the socket in a useRef to make it accessible permanently outside the scope of this useEffect call
        outerSocket.current = socket;

        //Pass the socket to the FullEditorPage
        setSocket(socket);

        return () => {
            socket.disconnect();
        };
    }, [])

    useEffect(() => {
        //Called whenever the client's session ID comes through the socket
        console.log("Session: " + sessionID);
        outerSocket.current.on(sessionID, (msg)=>{
            console.log("Recieved" + msg.isMultiplayer);
            if(msg.isMultiplayer !== undefined){
                setIsMultiplayer(msg.isMultiplayer);
                
            }
            if(msg.value || msg.value === ""){
                //Log the recieved data
                console.log("Editor recieved value:");
                console.log(msg.value);
                console.log("Editor recieved cursor position:");
                console.log(msg.cursorLocation);

                setValue(msg.value)
                
                if(msg.cursorLocation){
                    cursorLine.current = msg.cursorLocation.line;
                    cursorCharacter.current = msg.cursorLocation.char;
                    try{
                        console.log(`Setting cursor position to line ${cursorLine.current}, character ${cursorCharacter.current}`)
                        outerEditor.current.setCursor(cursorLine.current, cursorCharacter.current)
                    }catch(error){}
                }
            } 
        });
        
        return () =>{

        }
        

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

