import React from 'react'
import {entries, map} from 'lodash/fp'
import {AceEditor} from './ace'

const Directory = ({files, onClick}) =>
  <ul>
    {map(([key, {path, files}]) =>
      <li key={key}>
        <span onClick={() => onClick(path)}>{key}</span>
        {files ? <Directory files={files} onClick={onClick} /> : undefined}
      </li>
    )(entries(files))}
  </ul>

export const App = (handlers, state) =>
  <div className="horizontal">
    <Directory className="left directory" files={state.directory} onClick={handlers.directoryClick} />
    <AceEditor className="main" session={state.editor.session} />
  </div>
