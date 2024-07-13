import React, { useEffect, useRef } from 'react'
import { ACTIONS } from '../Actions';

import CodeMirror from 'codemirror';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/lib/codemirror.css';

//Languages
import 'codemirror/mode/javascript/javascript';

//Themes
import 'codemirror/theme/dracula.css';

function Editor({ socketRef, roomId, onCodeChange, editRef }) {
  const editorRef = useRef(null);
  useEffect(() => {
    const init = async () => {
      if (editorRef.current) {
        return;
      }

      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );
      editorRef.current = editor;

      editor.setSize("100%", "100%");
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    };

    init();
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, [onCodeChange, roomId, socketRef, editRef]);

    return (
        <div className='flex flex-col h-[100vh] w-[100vw] m-0 p-0'>
          <textarea id="realtimeEditor" className='flex-grow h-[100vh] w-[100vw] border-none p-0 m-0 resize-none'></textarea>
        </div>
    )
}

export default Editor