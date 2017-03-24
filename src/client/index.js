import {Observable, Subject} from 'rxjs'
import {createWebrtcConnection} from './webrtc'
import {App} from './view/app'
import {render} from 'react-dom'
import ace from 'brace'

import {directoryListing} from './directory'
import {fileContent, fileOverriden} from './ace'
import editModes from './editModes'

const withDocumentsAndSessions = ({data$, connect$, open$, close$, save$, activateFile$}) => {
  let documents = {}
  let sessions = {}

  open$
    .filter(({isDir}) => !isDir)
    .map(({path}) => path)
    .subscribe(path => {
      if (!documents[path]) {
        sessions[path] = ace.createEditSession('', editModes(path))
        sessions[path].setOptions({tabSize: 2})
        documents[path] = sessions[path].getDocument()
        documents[path].on('change', console.log)
      } else if (!sessions[path]) {
        sessions[path] = ace.createEditSession(documents[path])
      }
    })

  close$.subscribe(path => {
    delete sessions[path]
    delete documents[path]
  })

  fileContent(data$).subscribe(({path, content}) => {
    if (documents[path]) {
      documents[path].setValue(content)
    }
  })

  const activeSession$ = activateFile$
    .map(({path}) => sessions[path])
    .startWith(undefined)

  const documentRequest$ = Observable.merge(
    connect$.map(() => ({type: 'file/open', path: '.'})),
    open$.map(({path}) => ({type: 'file/open', path})),
    close$.map(({path}) => ({type: 'file/close', path})),
    save$.withLatestFrom(activateFile$, (save, file) => file).map(({path}) => ({type: 'file/save', path, content: documents[path].getValue()})),
    fileOverriden(data$).filter(({path}) => documents[path]).map(({path}) => ({type: 'file/open', path}))
  )

  return {
    documentRequest$,
    activeSession$
  }
}

const dataTransform = ({data$, connect$, disconnect$}) => {
  const save$ = new Subject()
  const fileClick$ = new Subject()
  const open$ = fileClick$
    .filter(({open}) => !open)
  const close$ = fileClick$
    .filter(({open, isDir}) => open && isDir)
  const activateFile$ = fileClick$
    .filter(({isDir}) => !isDir)

  const {documentRequest$, activeSession$} = withDocumentsAndSessions({data$, connect$, open$, close$, save$, activateFile$})

  const connection$ = connect$.map(() => 'connected').merge(disconnect$.map(() => 'disconnected')).startWith('connecting')

  const state$ = Observable.combineLatest(
    directoryListing(data$.merge(documentRequest$)),
    activeSession$,
    connection$,
    (directory, session, connection) => ({directory, editor: {session}, connection})
  )

  const handlers = {
    onFileClick: fileClick$.next.bind(fileClick$),
    onSave: save$.next.bind(save$)
  }

  state$.subscribe(state => render(App({handlers, state}), document.getElementById('app')))

  return ({
    data$: documentRequest$
  })
}

/* global window */
const remoteId = window.location.hash.substring(1)

createWebrtcConnection(remoteId, dataTransform)
