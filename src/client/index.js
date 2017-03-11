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

const dataTransform = data$ => {
  const directoryClick = new Subject()

  const state$ = Observable.combineLatest(
    directoryListing(data$).startWith({}),
    fileContent(data$).map(({content}) => content).startWith('').map(content => ace.createEditSession(content, 'ace/mode/text')),
    (directory, session) => ({directory, editor: {session}})
  )

  const handlers = {
    directoryClick: directoryClick.next.bind(directoryClick)
  }

  state$.subscribe(state => render(App(handlers, state), document.getElementById('app')))

  return directoryClick.map(path => ({type: 'file/open', path})).startWith({type: 'file/open', path: '.'})
}

createWebrtcConnection(log(dataTransform))
