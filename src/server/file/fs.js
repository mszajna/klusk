import {Observable} from 'rxjs'
import fs from 'fs'

export const readFile = Observable.bindNodeCallback(fs.readFile)
export const writeFile = Observable.bindNodeCallback(fs.writeFile)
export const readdir = Observable.bindNodeCallback(fs.readdir)
export const stat = Observable.bindNodeCallback(fs.stat)
