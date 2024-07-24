import React, {useState, useEffect, useRef} from 'react'

import "./Editor.css";

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/css/css';
import 'codemirror/addon/edit/closebrackets'
import { Controlled as ControlledEditorComponent } from 'react-codemirror2';


function Editor({language, handleChange, valueFromStateManager, cursorLine, cursorCharacter}) {

  const outerEditor = useRef();
  const [value, setValue] = useState("Not Updated");

  const onChange = (editor, data, value) => {
    handleChange(editor, data, value);
  }

  useEffect(() => {
    setValue(valueFromStateManager)
  }, [valueFromStateManager])

  useEffect(() => {
    if(outerEditor.current && cursorLine && cursorCharacter){
      console.log(`Setting cursor position to line ${cursorLine}, character ${cursorCharacter}`)
      outerEditor.current.setCursor(cursorLine, cursorCharacter)

    }
  }, [cursorCharacter, cursorLine, valueFromStateManager])



  return (
    <div className="editor">
    <ControlledEditorComponent
        onBeforeChange={onChange}
        value= {value}
        className="code-mirror-wrapper"
        options={{
          lineWrapping: true,
          lint: true,
          mode: language,
          lineNumbers: true,
          indentWithTabs: true, // Use tabs instead of spaces
          tabSize: 2, // Set tab size to 2 spaces (or any value you prefer)
          smartIndent: false, // Disable smart indentation
        }}
        editorDidMount={(editor) => {
          outerEditor.current = editor;
          editor.setSize('45vw','75vh');
        }}
      />
    </div>
  )
}

export default Editor
