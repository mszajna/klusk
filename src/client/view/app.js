import React from 'react'
import {entries, map} from 'lodash/fp'
import {AceEditor} from './ace'
import '../index.css'

const iconClass = ({isDir, open}) => 'icon fa ' + (
  isDir
    ? open
      ? 'fa-folder-open-o'
      : 'fa-folder-o'
    : 'fa-file-o'
  )

const Directory = ({files, onFileClick, className}) =>
  <ul>
    {map(([key, file]) =>
      <li key={key}>
        <span className="name" onClick={() => onFileClick(file)}>
          <i className={iconClass(file)} aria-hidden="true" />
          {key}
        </span>
        {file.open ? <Directory files={file.files} onFileClick={onFileClick} /> : undefined}
      </li>
    )(entries(files))}
  </ul>

export const App = ({handlers: {onFileClick, onSave}, state: {directory, editor}}) =>
  <div className="horizontal">
    <div className="left directory-listing">
      <Directory files={directory.files} onFileClick={onFileClick} />
    </div>
    <div className="main">
      {editor.session
      ? <div className="editor"><AceEditor session={editor.session} onSave={onSave} /></div>
      : undefined}
    </div>
  </div>
