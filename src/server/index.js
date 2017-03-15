import minimist from 'minimist'
import process from 'process'
import uuid from 'uuid/v4'
import {createWebrtcConnection} from './webrtc'
import {createDirectoryWatcher} from './file/watch'
import {open, save} from './file/rw'
import {mergePipes, log} from '../observables'

const {id} = minimist(process.argv.slice(2))
const localId = id || uuid()
console.log(`http://localhost:3000/#${localId}`)

const dataTransform = log(mergePipes(createDirectoryWatcher('ignore'), open('ignore'), save('ignore')))

createWebrtcConnection(id || uuid(), dataTransform)
