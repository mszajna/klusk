import './index.css'
import {Observable, Subject} from 'rxjs'
import {createWebrtcConnection} from './webrtc'
import {App} from './view/app'
import {render} from 'react-dom'
import ace from 'brace'

import {log} from '../observables'
import {directoryListing} from './directory'
import {fileContent} from './ace'

// export const dataTransform = log(mergePipes(saveCurrentDocument(editor), openDocument(editor, 'test.js')))

let documents = {}
let sessions = {}

const withDocumentsAndSessions = (data$, open$, close$) => {
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

  return Observable.merge(
    Observable.of({type: 'file/open', path: '.'}),
    open$.map(({path}) => ({type: 'file/open', path})),
    close$.map(({path}) => ({type: 'file/close', path}))
  )
}

const dataTransform = data$ => {
  const directoryClick$ = new Subject()

  const documentEvent$ = withDocumentsAndSessions(data$, directoryClick$, Observable.never())

  const state$ = Observable.combineLatest(
    directoryListing(data$).startWith({}),
    directoryClick$.filter(({isDir}) => !isDir).map(({path}) => path).startWith(undefined),
    data$, // TODO: this is a hack to be sure state updates as sessions object can be updated at any point in time
    (directory, path, data) => ({directory, editor: {session: sessions[path]}})
  )

  const handlers = {
    directoryClick: directoryClick$.next.bind(directoryClick$)
  }

  state$.subscribe(state => render(App(handlers, state), document.getElementById('app')))

  return documentEvent$
}

createWebrtcConnection(log(dataTransform))
