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

export const App = ({handlers: {directoryClick, onSave}, state: {directory, editor}}) =>
  <div className="horizontal">
    <Directory className="left directory-listing" files={directory.files} onClick={directoryClick} />
    <div className="main">
      {editor.session
      ? <div className="editor"><AceEditor session={editor.session} onSave={onSave} /></div>
      : undefined}
    </div>
  </div>
