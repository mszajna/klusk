import {expect} from 'chai'
import {AceOperation} from './aceOt'

describe('AceOperation', () => {
  const apply = (document, ops) => AceOperation.fromJSON(ops).apply(document)

  describe('apply', () => {
    it('inserts a line in an empty document', () => {
      expect(apply([], ['test'])).to.deep.equal(['test'])
    })

    it('deletes a line from 1 line document', () => {
      expect(apply(['test'], [-1])).to.deep.equal([])
    })

    it('retains a line and then inserts a line', () => {
      expect(apply(['test'], [1, 'test2'])).to.deep.equal(['test', 'test2'])
    })

    it('retains a line and then deletes a line', () => {
      expect(apply(['test', 'test2'], [1, -1])).to.deep.equal(['test'])
    })

    it('inserts a characters in a line', () => {
      expect(apply([''], [['test']])).to.deep.equal(['test'])
    })

    it('deletes a characters in a line', () => {
      expect(apply(['test'], [[-4]])).to.deep.equal([''])
    })

    it('retains some characters in a line and then inserts', () => {
      expect(apply(['test'], [[4, ' test2']])).to.deep.equal(['test test2'])
    })

    it('retains some characters in a line and then deletes', () => {
      expect(apply(['test test2'], [[4, -6]])).to.deep.equal(['test'])
    })

    it('retains some lines then does an inline operation', () => {
      expect(apply(['test', 'tst2'], [1, [1, 'e', 3]])).to.deep.equal(['test', 'test2'])
    })

    it('throws when operation does not consume full document', () => {
      expect(() => apply(['test'], [])).to.throw()
    })

    it('throws when operation overflows the document', () => {
      expect(() => apply([], [1])).to.throw()
    })

    it('throws when line operation does not consume full line', () => {
      expect(() => apply(['test'], [[]])).to.throw()
    })

    it('throws when line operation overflows the line', () => {
      expect(() => apply([''], [[1]])).to.throw()
    })
  })

  const compose = (ops1, ops2) => AceOperation.fromJSON(ops1).compose(AceOperation.fromJSON(ops2)).toJSON()

  describe('compose', () => {

    // property('apply(apply(D, A), B) === apply(D, compose(A, B))') // requires D.length === A.source && A.target = B.source
    const test = (d, a, b) => {
      const da = apply(apply(d, a), b)
      const db = apply(d, compose(a, b))
      expect(db).to.deep.equal(da)
    }

    it('two retains', () => {
      test(['lorem'], [1], [1])
    })

    it('retain with insert', () => {
      test(['ipsum'], [1], ['lorem', 1])
    })

    it('retain with delete', () => {
      test(['lorem'], [1], [-1])
    })

    it('retain with line operation', () => {
      test(['lorem'], [1], [[5, ' ipsum']])
    })

    it('two inserts', () => {
      test([], ['ipsum'], ['lorem', 1])
    })

    it('insert with retain', () => {
      test([], ['lorem'], [1])
    })

    it('insert with delete', () => {
      test([], ['lorem'], [-1])
    })

    it('insert with line operation', () => {
      test([], ['lorem'], [[5, ' ipsum']])
    })

    it('two deletes', () => {
      test(['lorem', 'ipsum'], [-1, 1], [-1])
    })

    it('delete with retain', () => {
      test(['lorem', 'ipsum'], [-1, 1], [1])
    })

    it('delete with insert', () => {
      test(['ipsum'], [-1], ['lorem'])
    })

    it('delete with line operation', () => {
      test(['lorem', 'ipsum'], [-1, 1], [[5, ' dolor']])
    })

    it('line operation with retain', () => {
      test(['lorem'], [[5, ' ipsum']], [1])
    })

    it('line operation with insert', () => {
      test(['ipsum'], [[5, ' dolor']], ['lorem', 1])
    })

    it('line operation with delete', () => {
      test(['lorem'], [[5, ' ipsum']], [-1])
    })

    it('line operations together', () => {
      test(['lorem'], [[5, ' ipsum']], [[11, ' dolor']])
    })

    it('fails when operations are incompatible', () => {
      expect(() => compose([1], [2])).to.throw()
    })

    it('produces optimal diff')
  })

  const transform = (a, b) => { const [ap, bp] = AceOperation.transform(AceOperation.fromJSON(a), AceOperation.fromJSON(b)); return [ap.toJSON(), bp.toJSON()] }

  describe('transform', () => {

    // property('[A1, B1] = transform(A, B); apply(apply(D, A), B1) === apply(apply(D, B), A1)') // requires D.length === A.source === B.source
    const test = (d, a, b, e) => {
      const [aPrime, bPrime] = transform(a, b)
      const da = apply(apply(d, a), bPrime), db = apply(apply(d, b), aPrime)
      expect(da).to.deep.equal(e, 'apply(apply(d, a), bPrime) does not match')
      expect(db).to.deep.equal(e, 'apply(apply(d, b), aPrime) does not match')
    }

    it('two retains', () => {
      test(['lorem'], [1], [1], ['lorem'])
    })

    it('retain and insert', () => {
      test(['ipsum'], [1], ['lorem', 1], ['lorem', 'ipsum'])
    })

    it('retain and delete', () => {
      test(['lorem'], [1], [-1], [])
    })

    it('retain and line operation', () => {
      test(['lorem'], [1], [[5, ' ipsum']], ['lorem ipsum'])
    })

    it('two inserts', () => {
      test([], ['lorem'], ['ipsum'], ['lorem', 'ipsum'])
    })

    it('insert and retain', () => {
      test(['ipsum'], ['lorem', 1], [1], ['lorem', 'ipsum'])
    })

    it('insert and delete', () => {
      test(['ipsum'], ['lorem', 1], [-1], ['lorem'])
    })

    it('insert and line operation', () =>  {
      test(['ipsum'], ['lorem', 1], [[5, ' dolor']], ['lorem', 'ipsum dolor'])
    })

    it('two deletes', () => {
      test(['lorem'], [-1], [-1], [])
    })

    it('delete and retain', () => {
      test(['lorem'], [-1], [1], [])
    })

    it('delete and insert', () => {
      test(['ipsum'], [-1], ['lorem', 1], ['lorem'])
    })

    it('delete and line operation', () => {
      test(['lorem'], [-1], [[5, 'ipsum']], [])
    })

    it('line operation and retain', () => {
      test(['lorem'], [[5, ' ipsum']], [1], ['lorem ipsum'])
    })

    it('line operation and insert', () => {
      test(['ipsum'], [[5, ' dolor']], ['lorem', 1], ['lorem', 'ipsum dolor'])
    })

    it('line operation and delete', () => {
      test(['lorem'], [[5, ' ipsum']], [-1], [])
    })

    it('line operations together', () => {
      test(['lorem'], [[5, ' ipsum']], [[5, ' dolor']], ['lorem ipsum dolor'])
    })

    it('produces optimal diff')
  })

  describe('fromAceDelta', () => {
    const test = (lines, delta, diff) => expect(AceOperation.fromAceDelta(delta, lines).toJSON()).to.deep.equal(diff)

    it('inserts single line at the beginning', () => {
      test(['lorem', ''], {action: 'insert', start: {row: 0, column: 0}, end: {row: 1, column: 0}, lines: ['lorem', '']}, ['lorem'])
    })

    it('modifies first line at the beggining', () => {
      test(['lorem'], {action: 'insert', start: {row: 0, column: 0}, end: {row: 0, column: 5}, lines: ['lorem']}, [['lorem']])
    })

    it('modifies first line at the end', () => {
      test(['lorem ipsum'], {action: 'insert', start: {row: 0, column: 5}, end: {row: 0, column: 11}, lines: [' ipsum']}, [[5, ' ipsum']])
    })

    it('modifies first line in the middle', () => {
      test(['lorem ipsum dolor'], {action: 'insert', start: {row: 0, column: 5}, end: {row: 0, column: 11}, lines: [' ipsum']}, [[5, ' ipsum', 6]])
    })

    it('inserts multiple lines in the middle of text', () => {
      test(['lorem', 'ipsum dolor', 'sit', 'amet consectetur', 'adipiscing'], {action: 'insert', start: {row: 1, column: 5}, end: {row: 3, column: 5}, lines: [' dolor', 'sit', 'amet ']}, [1, [5, ' dolor'], 'sit', ['amet ', 11], 1])
    })

    it('deletes at the beginning of a line', () => {
      test([''], {action: 'delete', start: {row: 0, column: 0}, end: {row: 0, column: 5}, lines: ['lorem']}, [[-5]])
    })

    it('deletes at the end of a line', () => {
      test(['lorem'], {action: 'delete', start: {row: 0, column: 5}, end: {row: 0, column: 11}, lines: [' ipsum']}, [[5, -6]])
    })
    
    it('deletes in the middle of a line', () => {
      test(['lorem dolor'], {action: 'delete', start: {row: 0, column: 5}, end: {row: 0, column: 11}, lines: [' ipsum']}, [[5, -6, 6]])
    })
    
    it('deletes a whole line', () => {
      test([''], {action: 'delete', start: {row: 0, column: 0}, end: {row: 1, column: 0}, lines: ['lorem', '']}, [-1, 1])
    })

    it('deletes multiple lines in the middle of text', () => {
      test(['lorem', 'ipsum consectetur', 'adipiscing'], {action: 'delete', start: {row: 1, column: 6}, end: {row: 3, column: 5}, lines: ['dolor', 'sit', 'amet ']}, [1, [6, -5], -1, [-5, 11], 1])
    })
  })
  
  describe('toAceDeltas', () => {
    it('works')
  })
})
