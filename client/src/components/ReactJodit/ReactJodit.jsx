/* eslint-disable react/prop-types */
"use client";
import JoditEditor from "jodit-react";
import { forwardRef, useMemo, useRef } from "react";

const ReactJodit = forwardRef(
  ({ placeholder, data: content = "", onChange: setContent }, ref) => {
    const editor = useRef(null);

    const config = useMemo(() => {
      return {
        readonly: false,
        placeholder: placeholder || "Start typings...",
      };
    }, [placeholder]);

    return (
      <JoditEditor
        // ref={ref}
        ref={ref ? ref : editor}
        value={content}
        config={{
          ...config,
          uploader: {
            insertImageAsBase64URI: true,
          },
          spellcheck: false,
          autofucus: true,
          disablePlugins: [
            "redo-undo",
            "powered-by-jodit",
            "about",
            "filebrowser",
            "redo",
            "undo",
            "file",
            "classname",
          ],
        }}
        tabIndex={1}
        onBlur={(newContent) => setContent(newContent)}
        className="myjoditEditor"
      />
    );
  }
);

ReactJodit.displayName = "ReactJodit";
export default ReactJodit;
