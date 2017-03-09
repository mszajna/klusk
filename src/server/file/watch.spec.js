import {Observable} from 'rxjs'
import {watchFile} from './watch'
import {fail, equal} from 'assert'
import {describe, it} from 'mocha'

describe('watchFile', () => {
  it('test', (done) => {
    const testPath = 'ignore/test.js'
    watchFile(Observable.of(testPath).delay(10))(Observable.of(testPath), Observable.never()).subscribe(
      path => { equal(testPath, path); done() },
      done,
      fail
    )
  })
})
