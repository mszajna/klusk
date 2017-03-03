import {TextOperation} from 'ot';
import {reduce, isNumber} from 'lodash/fp';

export const fromAceDelta = ({action, start, end, lines}, doc) => {
  const startIndex = doc.positionToIndex(start);
  const lastRowIndex = doc.getLength() - 1;
  const docLength = doc.positionToIndex({row: lastRowIndex, column: doc.getLine(lastRowIndex).length});
  const diffText = lines.join('\n');
  if (action === 'insert') {
    return new TextOperation()
      .retain(startIndex)
      .insert(diffText)
      .retain(docLength - startIndex - diffText.length);
  } else if (action === 'remove') {
    return new TextOperation()
      .retain(startIndex)
      .delete(diffText)
      .retain(docLength - startIndex);
  }
};

export const toAceDeltas = ({ops}, doc) => {
  const deltas = [];
  reduce((position, op) => {
    if (isNumber(op)) {
      if (op > 0) {
        return position + op; //advance cursor
      } else {
        deltas.push({
          action: 'remove',
          start: doc.indexToPosition(position),
          end: doc.indexToPosition(position - op) //op is negative so using double negation
        });
      }
    } else {
      deltas.push({
        action: 'insert',
        lines: op.split('\n'),
        start: doc.indexToPosition(position),
        end: doc.indexToPosition(position + op.length)
      });
    }
  }, 0)(ops);
  return deltas;
};
