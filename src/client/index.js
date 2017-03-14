import './index.css'
import {Observable, Subject} from 'rxjs'
import {createWebrtcConnection} from './webrtc'
import {App} from './view/app'
import {render} from 'react-dom'
import ace from 'brace'

import {log} from '../observables'
import {directoryListing} from './directory'
import {fileContent, fileOverriden} from './ace'

// export const dataTransform = log(mergePipes(saveCurrentDocument(editor), openDocument(editor, 'test.js')))

const withDocumentsAndSessions = (data$, open$, close$, save$) => {
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

  const activeFile$ = open$
    .filter(({isDir}) => !isDir)

  const activeSession$ = activeFile$
    .map(({path}) => sessions[path])
    .startWith(undefined)

  const documentRequest$ = Observable.merge(
    Observable.of({type: 'file/open', path: '.'}),
    open$.map(({path}) => ({type: 'file/open', path})),
    close$.map(({path}) => ({type: 'file/close', path})),
    save$.withLatestFrom(activeFile$, (save, file) => file).map(({path}) => ({type: 'file/save', path, content: documents[path].getValue()})),
    fileOverriden(data$).filter(({path}) => documents[path]).map(({path}) => ({type: 'file/open', path}))
  )

  return {
    documentRequest$,
    activeSession$
  }
}

const dataTransform = data$ => {
  const open$ = new Subject()
  const close$ = new Subject()
  const save$ = new Subject()

  const {documentRequest$, activeSession$} = withDocumentsAndSessions(data$, open$, close$, save$)

  const state$ = Observable.combineLatest(
    directoryListing(data$),
    activeSession$,
    data$, // TODO: this is a hack to be sure state updates as sessions object can be updated at any point in time
    (directory, session, data) => ({directory, editor: {session}})
  )

  const handlers = {
    directoryClick: open$.next.bind(open$),
    onSave: save$.next.bind(save$)
  }

  state$.subscribe(state => render(App({handlers, state}), document.getElementById('app')))

  return documentRequest$
}

createWebrtcConnection(log(dataTransform))
