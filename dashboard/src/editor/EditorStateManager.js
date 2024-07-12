import React, {useState, useEffect, useRef} from 'react'
import Editor from './Editor';
import socketIOClient from 'socket.io-client';

const endpoint = "http://localhost:3000";

function EditorStateManager({sessionID}) {
    const javaBoiler = "import java.util.concurrent.TimeUnit;\n\nclass Main {\n\tpublic static void main(String[] args){\n\t\tSystem.out.println(\"The bomb is ticking...\");\n\t\tfor(int i = 10; i > -1; i++){\n\t\t\tTimeUnit.SECONDS.sleep(1);\n\t\t\tSystem.out.println(i);\n\t\t}\n\t\tSystem.out.println(\"BOOM\");\n\t}\n}"
    const [currentEditorValue, setCurrentEditorValue] = useState(javaBoiler);
    const [currentLanguage, setCurrentLanguage] = useState("text/x-java");

    const outerSocket = useRef(null)


    function handleChange(editor, data, value){
        setCurrentEditorValue(value);
        outerSocket.current.emit('update', { id: sessionID, type: data.origin, fLine: data.from.line, fChar: data.from.ch, tLine: data.to.line, tChar: data.to.ch});
        console.log(`Made the change ${data.origin} at line ${data.from.line}, column ${data.from.ch}`);
        
    }
    useEffect(() => {
        const socket = socketIOClient(endpoint);
        outerSocket.current = socket;
        socket.on(sessionID, (value)=>{
            setCurrentEditorValue(value);
        });

        
        return () => {
            socket.disconnect();
        };

    }, [sessionID])

    return (
        <Editor language={currentLanguage} value={currentEditorValue} handleChange={handleChange}/>
     )
}

export default EditorStateManager
