import React from 'react'
import {entries, map} from 'lodash/fp'
import {AceEditor} from './ace'

const Directory = ({files, onClick, className}) =>
  <ul className={className}>
    {map(([key, file]) =>
      <li key={key}>
        <span onClick={() => onClick(file)}>{key}</span>
        {files ? <Directory files={file.files} onClick={onClick} /> : undefined}
      </li>
    )(entries(files))}
  </ul>

export const App = (handlers, state) =>
  <div className="horizontal">
    <Directory className="left directory" files={state.directory.files} onClick={handlers.directoryClick} />
    <AceEditor className="main editor" session={state.editor.session} />
  </div>
