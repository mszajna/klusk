import {TextOperation} from 'ot'
import {reduce, isNumber} from 'lodash/fp'

// Ace Operation
export const isRetain = op => typeof op === 'number' && op > 0
export const isDelete = op => typeof op === 'number' && op < 0
export const isInsert = op => typeof op === 'string'
export const isModify = op => Array.isArray(op)
export const opLen = op => isRetain(op) ? op : isDelete(op) ? -op : 1

export const sourceLength = reduce((sum, op) => sum + (isRetain(op) ? op : isDelete(op) ? -op : isModify(op) ? 1 : 0), 0)
export const targetLength = reduce((sum, op) => sum + (isRetain(op) || isDelete(op) ? op : 1), 0)
export const splitOp = (op, index) =>
  isRetain(op) ? [index, op - index]
    : isDelete(op) ? [-index, op + index]
      : [op]

export class AceOperation {
  /*
  ops is an array of
    - positive number for retaining lines
    - negative number for deleting lines
    - string for inserting a line
    - array for inline modifications (see TextOperation)
      - positive number for retaining characters
      - negative number for deleting characters
      - string for inserting characters
  */
  constructor (ops) { this.ops = ops || [] }

  retain (numberOfLines) {
    if (numberOfLines === 0) {
      return this
    }
    const lastOp = this.ops[this.ops.length - 1]
    return isRetain(lastOp)
      ? new AceOperation([...this.ops.slice(0, -1), lastOp + numberOfLines])
      : new AceOperation([...this.ops, numberOfLines])
  }

  insert (line) {
    return new AceOperation([...this.ops, line])
  }

  ['delete'] (numberOfLines) {
    if (numberOfLines === 0) {
      return this
    }
    const lastOp = this.ops[this.ops.length - 1]
    return isDelete(lastOp)
      ? new AceOperation([...this.ops.slice(0, -1), lastOp - numberOfLines])
      : new AceOperation([...this.ops, -numberOfLines])
  }

  modify (op) {
    return new AceOperation([...this.ops, op])
  }

  apply (document) { // TODO: optimize
    let buffer = [], cursor = 0
    for (let i = 0; i < this.ops.length; i++) {
      const op = this.ops[i]
      if (isRetain(op)) {
        buffer = buffer.concat(document.slice(cursor, cursor + op))
        cursor += op
      } else if (isDelete(op)) {
        cursor -= op
      } else if (isInsert(op)) {
        buffer.push(op)
      } else if (isModify(op)) {
        buffer.push(TextOperation.fromJSON(op).apply(document[cursor]))
        cursor++
      } else {
        throw new Error('this should not happen')
      }
    }
    if (cursor !== document.length) {
      throw new Error('Operation length mismatch')
    }
    return buffer
  }

  // apply(apply(D, A), B) === apply(D, compose(A, B))
  compose (other) {
    let result = []
    const ops1 = this.ops, ops2 = other.ops
    let i1 = 0, i2 = 0
    let op1 = ops1[i1++], op2 = ops2[i2++]
    while (op1 || op2) {
      if (isDelete(op1)) {
        result.push(op1)
        op1 = ops1[i1++]
        continue
      }
      if (isInsert(op2)) {
        result.push(op2)
        op2 = ops2[i2++]
        continue
      }

      if (op1 === undefined || op2 === undefined) {
        throw new Error('Can not compose operations')
      }

      const l1 = opLen(op1), l2 = opLen(op2)
      let restOp1, restOp2
      if (l1 > l2) {
        ;[op1, restOp1] = splitOp(op1, l2)
      } else if (l1 < l2) {
        ;[op2, restOp2] = splitOp(op2, l1)
      }

      // at this point opLen(op1) === opLen(op2)

      if (isRetain(op1)) {
        result.push(op2)
      } else if (isRetain(op2)) {
        result.push(op1)
      } else if (isInsert(op1) && isDelete(op2)) {
        // Do nothing
      } else if (isInsert(op1) && isModify(op2)) {
        result.push(TextOperation.fromJSON(op2).apply(op1))
      } else if (isModify(op1) && isDelete(op2)) {
        result.push(op2)
      } else if (isModify(op1) && isModify(op2)) {
        const op = TextOperation.fromJSON(op1).compose(TextOperation.fromJSON(op2))
        result.push(op.isNoop() ? 1 : op.toJSON())
      } else {
        throw new Error('this should not happen')
      }

      op1 = restOp1 || ops1[i1++]
      op2 = restOp2 || ops2[i2++]
    }
    return new AceOperation(result)
  }

  // for A, B returns A`, B` such that
  // apply(apply(D, A), B`) === apply(apply(D, B), A`)
  static transform (operation1, operation2) {
    const ops1 = operation1.ops, ops2 = operation2.ops
    let i1 = 0, i2 = 0
    let op1 = ops1[i1++], op2 = ops2[i2++]
    let ops1prime = [], ops2prime = []
    while (op1 || op2) {
      if (isInsert(op1)) {
        ops1prime.push(op1)
        ops2prime.push(1)
        op1 = ops1[i1++]
        continue
      }

      if (isInsert(op2)) {
        ops1prime.push(1)
        ops2prime.push(op2)
        op2 = ops2[i2++]
        continue
      }

      if (op1 === undefined || op2 === undefined) {
        throw new Error('Can not transform operations')
      }

      const l1 = opLen(op1), l2 = opLen(op2)
      let restOp1, restOp2
      if (l1 > l2) {
        ;[op1, restOp1] = splitOp(op1, l2)
      } else if (l1 < l2) {
        ;[op2, restOp2] = splitOp(op2, l1)
      }

      // at this point opLen(op1) === opLen(op2)

      if (isModify(op1) && isModify(op2)) {
        const [op1prime, op2prime] = TextOperation.transform(TextOperation.fromJSON(op1), TextOperation.fromJSON(op2))
        ops1prime.push(op1prime.isNoop() ? 1 : op1prime.toJSON())
        ops2prime.push(op2prime.isNoop() ? 1 : op2prime.toJSON())
      } else {
        if (!isDelete(op2)) {
          ops1prime.push(op1)
        }
        if (!isDelete(op1)) {
          ops2prime.push(op2)
        }
      }

      op1 = restOp1 || ops1[i1++]
      op2 = restOp2 || ops2[i2++]
    }
    return [new AceOperation(ops1prime), new AceOperation(ops2prime)]
  }

  static fromJSON (json) { return new AceOperation(json) }
  toJSON () { return this.ops }

  // You have to compute it while it's hot!!!
  static fromAceDelta ({action, start, end, lines}, documentLines) {
    if (action === 'insert') {
      let op = new AceOperation()
        .retain(start.row)
      if (start.row === end.row) {
        op = op.modify(new TextOperation()
          .retain(start.column)
          .insert(lines[0])
          .retain(documentLines[start.row].length - end.column)
          .toJSON())
      } else {
        if (start.column > 0) {
          op = op.modify(new TextOperation()
            .retain(start.column)
            .insert(lines[0])
            .toJSON())
        } else {
          op = op.insert(lines[0])
        }
        for (let i = 1; i < lines.length - 1; i++) {
          op = op.insert(lines[i])
        }
        if (end.column > 0) {
          op = op.modify(new TextOperation()
            .insert(lines[lines.length - 1])
            .retain(documentLines[end.row].length - end.column)
            .toJSON())
        }
      }
      return op
        .retain(documentLines.length - end.row - 1)
    } else if (action === 'delete') {
      let op = new AceOperation()
        .retain(start.row)
      if (start.row === end.row) {
        op = op.modify(new TextOperation()
          .retain(start.column)
          .delete(lines[0].length)
          .retain(documentLines[start.row].length - start.column)
          .toJSON())
      } else {
        if (start.column > 0) {
          op = op.modify(new TextOperation()
            .retain(start.column)
            .delete(lines[0].length)
            .toJSON())
        } else {
          op = op.delete(1)
        }
        for (let i = 1; i < lines.length - 1; i++) {
          op = op.delete(1)
        }
        if (end.column > 0) {
          op = op.modify(new TextOperation()
            .delete(lines[lines.length - 1].length)
            .retain(documentLines[start.row].length - start.column)
            .toJSON())
        } else {
          op = op.retain(1)
        }
      }
      return op
        .retain(documentLines.length - start.row - 1)
    } else {
      throw new Error(`unrecognised action ${action}`)
    }
  }

  toAceDeltas () {
    const ops = this.ops
    let cursor = 0, result = []
    for (let i = 0; i < this.ops.length; i++) {
      const op = ops[i++]
      if (isRetain(op)) {
        cursor += op
      } else if (isInsert(op)) {
        result.push({action: 'insert', start: {row: cursor, column: 0}, end: {row: cursor + 1, column: 0}, lines: [op]})
        cursor++
      } else if (isDelete(op)) {
        result.push({action: 'delete', start: {row: cursor, column: 0}, end: {row: cursor - op, column: 0}})
      } else {
        let charCursor = 0
        for (let j = 0; j < op.length; j++) {
          let charOp = op[j]
          if (TextOperation.isRetain(charOp)) {
            charCursor += charOp
          } else if (TextOperation.isInsert(charOp)) {
            result.push({action: 'insert', start: {row: cursor, column: charCursor}, end: {row: cursor, column: charCursor + charOp}, lines: [charOp]})
            charCursor += charOp
          } else {
            result.push({action: 'delete', start: {row: cursor, column: charCursor}, end: {row: cursor, column: charCursor + charOp}})
          }
        }
      }
    }
    return result
  }
}
