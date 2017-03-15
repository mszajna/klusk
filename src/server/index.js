import {createWebrtcConnection} from './webrtc'
import {createDirectoryWatcher} from './file/watch'
import {open, save} from './file/rw'
import {mergePipes, log} from '../observables'

const dataTransform = log(mergePipes(createDirectoryWatcher('ignore'), open('ignore'), save('ignore')))

createWebrtcConnection(dataTransform)
