import {TextOperation} from 'ot'
import {reduce, isNumber} from 'lodash/fp'

export const fromAceDelta = ({action, start, end, lines}, doc) => {
  const startIndex = doc.positionToIndex(start)
  const lastRowIndex = doc.getLength() - 1
  const docLength = doc.positionToIndex({row: lastRowIndex, column: doc.getLine(lastRowIndex).length})
  const diffText = lines.join('\n')
  if (action === 'insert') {
    return new TextOperation()
      .retain(startIndex)
      .insert(diffText)
      .retain(docLength - startIndex - diffText.length)
  } else if (action === 'remove') {
    return new TextOperation()
      .retain(startIndex)
      .delete(diffText)
      .retain(docLength - startIndex)
  }
}
// patched to support negative index values
var indexToPosition2 = function (index, startRow) {
  var lines = this.$lines || this.getAllLines()
  var newlineLength = this.getNewLineCharacter().length
  var sign = index > 0 ? 1 : -1
  for (var i = startRow || 0, l = lines.length; i >= 0 && i < l; i += sign) {
    if (index >= 0 && index < lines[i].length + newlineLength) return {row: i, column: index}
    else index -= sign * (lines[i].length + newlineLength)
  }
  return index < 0 ? {row: 0, column: 0} : {row: l - 1, column: lines[l - 1].length}
}

export const toAceDeltas = ({ops}, doc) => {
  doc.indexToPosition = indexToPosition2
  const newline = doc.getNewLineCharacter()
  const deltas = []

  reduce((position, op) => {
    if (!isNumber(op)) {
      const lines = op.split(newline)
      const end = {
        row: position.row + lines.length - 1,
        column: lines[lines.length - 1].length + (lines.length > 1 ? position.column : 0)
      }
      deltas.push({action: 'insert', lines, start: position, end})
      return end
    } else if (op < 0) {
      const end = doc.indexToPosition(op + position.column, position.row)
      deltas.push({action: 'remove', start: position, end})
      return end
    } else {
      return doc.indexToPosition(op + position.column, position.row)
    }
  }, {row: 0, column: 0})(ops)
  return deltas
}
