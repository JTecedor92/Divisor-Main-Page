import React, {useState, useEffect, useRef} from 'react'

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/css/css';
import 'codemirror/addon/edit/closebrackets'
import { Controlled as ControlledEditorComponent } from 'react-codemirror2';


function Editor({ language, value, handleChange}) {

  const onChange = (editor, data, value) => {
    handleChange(editor, data, value);

    
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
          autoCloseBrackets: true,
        }}
      />
    </div>
  )
}

export default Editor
