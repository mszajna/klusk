import React from 'react'
import {entries, map} from 'lodash/fp'
import {AceEditor} from './ace'
import classNames from 'classnames'

const Directory = ({files, onClick, className}) =>
  <ul className={className}>
    {map(([key, file]) =>
      <li key={key}>
        <span className={classNames({directory: file.isDir, unfolded: file.files})} onClick={() => onClick(file)}>{key}</span>
        {files ? <Directory files={file.files} onClick={onClick} /> : undefined}
      </li>
    )(entries(files))}
  </ul>

export const App = (handlers, state) =>
  <div className="horizontal">
    <Directory className="left directory-listing" files={state.directory.files} onClick={handlers.directoryClick} />
    <AceEditor className="main editor" session={state.editor.session} />
  </div>
