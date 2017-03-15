import {Observable, Subject} from 'rxjs'
import {createWebrtcConnection} from './webrtc'
import {App} from './view/app'
import {render} from 'react-dom'
import ace from 'brace'

import {log} from '../observables'
import {directoryListing} from './directory'
import {fileContent, fileOverriden} from './ace'

const withDocumentsAndSessions = (data$, open$, close$, save$, activateFile$) => {
  let documents = {}
  let sessions = {}

  open$
    .filter(({isDir}) => !isDir)
    .map(({path}) => path)
    .subscribe(path => {
      if (!documents[path]) {
        sessions[path] = ace.createEditSession('', 'ace/mode/text')
        documents[path] = sessions[path].getDocument()
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
    Observable.of({type: 'file/open', path: '.'}),
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

const dataTransform = data$ => {
  const save$ = new Subject()
  const fileClick$ = new Subject()
  const open$ = fileClick$
    .filter(({open}) => !open)
  const close$ = fileClick$
    .filter(({open, isDir}) => open && isDir)
  const activateFile$ = fileClick$
    .filter(({isDir}) => !isDir)

  const {documentRequest$, activeSession$} = withDocumentsAndSessions(data$, open$, close$, save$, activateFile$)

  const state$ = Observable.combineLatest(
    directoryListing(data$.merge(documentRequest$)),
    activeSession$,
    data$, // TODO: this is a hack to be sure state updates as sessions object can be updated at any point in time
    (directory, session, data) => ({directory, editor: {session}})
  )

  const handlers = {
    onFileClick: fileClick$.next.bind(fileClick$),
    onSave: save$.next.bind(save$)
  }

  state$.subscribe(state => render(App({handlers, state}), document.getElementById('app')))

  return documentRequest$
}

/* global window */
const remoteId = window.location.hash.substring(1)

createWebrtcConnection(remoteId, log(dataTransform))
