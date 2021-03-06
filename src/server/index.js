import minimist from 'minimist'
import process from 'process'
import uuid from 'uuid/v4'
import {createWebrtcConnection} from './webrtc'
import {createDirectoryWatcher} from './file/watch'
import {open, save} from './file/rw'
import {mergePipes} from '../observables'

const {id, url} = minimist(process.argv.slice(2))
const localId = id || uuid()
const baseUrl = url || 'https://mszajna.github.io/klusk/'
console.log(`${baseUrl}#${localId}`)

const dataTransform = ({data$}) => ({
  data$: mergePipes(createDirectoryWatcher('.'), open('.'), save('.'))(data$)
})

createWebrtcConnection(localId, dataTransform)
