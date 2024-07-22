import React, {useState, useEffect, useRef} from 'react'

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/css/css';
import 'codemirror/addon/edit/closebrackets'
import { Controlled as ControlledEditorComponent } from 'react-codemirror2';


function Editor({ language, value, handleChange, editorFunc}) {

  const componentRef = useRef(null);

  const onChange = (editor, data, value) => {
    handleChange(editor, data, value);

    if (componentRef.current) {
      componentRef.current.focus(); // Assuming the component forwards refs and has a focus method
  }
    
  }

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
          editor.setSize(null,'70vh');
          console.log('editorDidMount:', editor);
          componentRef.current = editor
          editorFunc(editor);
        }}
      />
    </div>
  )
}

export default Editor
