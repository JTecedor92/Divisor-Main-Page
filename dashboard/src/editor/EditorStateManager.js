import React, {useState, useEffect, useRef} from 'react'
import Editor from './Editor';
import socketIOClient from 'socket.io-client';

const endpoint = "http://localhost:3001";

function EditorStateManager({setSocket, sessionID, user}) {

    const [currentEditorValue, setCurrentEditorValue] = useState("");
    const [lastValue, setLastValue] = useState("");
    const [currentLanguage, setCurrentLanguage] = useState("text/x-java");
    const [editorInstance, setEditorInstance] = useState();
    

    const outerSocket = useRef(null)
    const outerEditor = useRef(null)
    let lineToChar;
    let charStart;
    let charEnd;
    let type;
    let text2;
    let editCount = 0;


    function setEditor (editor){
        setEditorInstance(editor);
    }

    //Run this code whenever the editor recieves an update
    function handleChange(editor, data, value){

        //Log the data from the editor
        const text = data.text;

        console.log("Data:");
        console.log(data);

        //Create an empty array to hold the location (In characters) of each new line
        lineToChar = [];

        //Push 0 to the array because the first line starts at character 0
        lineToChar.push(0);

        //Search through the previous value to find all the new lines
        //(Previous because the coder is seeing the state before the edit on screen until they recieve a response from the server)
        for(let i = 0; i < lastValue.length;i++){
            if(lastValue[i] === '\n'){
                lineToChar.push(i+1);
            }
        }
        
        // lineToChar.push(lastValue.length);

        //Set the edit type
        type = data.origin;

        //Check if the type is any form of an addition
        if(type === 'paste' || type === '+input'){

            //Find the location of the character where the edit occurs
            charStart = lineToChar[data.from.line]+data.from.ch;
            
            //Run this code if an a newline was requested
            if(text.length > 1 && text[0] === "" && text[1] === ""){
                text2 = "\n";
            }else{
                
                //If one of a certain group of characters are typed, automatically close them
                if(text.length === 1){
                    if(text[0] === "\{"){
                        text[0] = "{}";
                    }else if(text[0] === "\"" || text[0] === "\'" || text[0] === "\(" || text[0] === '\['){
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
            console.log(`Requesting to add \"${text2}\" to code`)

            //Send the information about the addition
            outerSocket.current.emit('add', { id: sessionID, username: user, atChar: charStart, text: text2, editCount: editCount});

        //Check if the edit is some form of a removal
        }else if(type = 'cut' || type === '+delete'){

            //Find the point where the removal starts and ends
            charStart = lineToChar[data.from.line]+data.from.ch;
            charEnd = lineToChar[data.to.line]+data.to.ch;

            //Giver the server information about the deletion
            outerSocket.current.emit('remove', { id: sessionID, username: user, fromChar: charStart, toChar: charEnd, editCount: editCount});

        }
        
        //Set the last value
        setLastValue(value);
    }
    useEffect(() => {

        //When the page mounts, create a socket to connect to the server
        const socket = socketIOClient(endpoint);

        //Store the socket in a useRef to make it accessible permanently outside the scope of this useEffect call
        outerSocket.current = socket;

        //Pass the socket to the FullEditorPage
        setSocket(socket);

        //Whenever the socket sees its session id, read the message
        socket.on(sessionID, (msg)=>{

            //On the first message, initialize the lastValue
            if(msg.creation){
                setLastValue(msg.value);  
            }

            //Print the new value recieved by the client from the server
            console.log("Editor recieved:\n" + msg.value);

            //Editcount in progress
            editCount++;

            //Set the value of the editor to the value sent by the server
            setCurrentEditorValue(msg.value);

            //Find the line breaks
            let lineToChar2 = [];
            lineToChar2.push(0);
            for(let i = 0; i < msg.value.length;i++){
                if(msg.value[i] === '\n'){
                    lineToChar2.push(i+1);
                }
            }
            
            
            if(msg.cursorLocation){
                let index = 0;
                let distance = msg.cursorLocation - lineToChar2[0];
                for(let i = 1; i <lineToChar2.length; i++){
                    if(msg.cursorLocation-lineToChar2[i] < distance && msg.cursorLocation > lineToChar2[i]){
                        index = i;
                        distance = msg.cursorLocation - lineToChar2[i];
                    }
                }
                
                // console.log(`New Location: line ${index+1}, character ${msg.cursorLocation - lineToChar2[index]}`)
                
                // const event = new KeyboardEvent('keydown', {
                //     keyCode1,
                //     which: keyCode1,
                //     bubbles: true,
                //   });
                // editorInstance.dispatchEvent(event);
                
                editorInstance.setCursor(index, msg.cursorLocation - lineToChar2[index])


                if(msg.username === user){
                    
                }
            


            }
        });

        
        return () => {
            socket.disconnect();
            
        };

    }, [sessionID])

    return (
        <Editor language={currentLanguage} value={currentEditorValue} handleChange={handleChange} editorFunc={setEditor} />
     )
}

export default EditorStateManager
