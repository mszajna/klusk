import assert from 'assert';
import AceOperation from './AceOperation';

describe('AceOperation', () => {
  describe('isRetain()', () => {

    it('is true when advancing row', () => {
      assert(AceOperation.isRetain({row: 1}));
    });

    it('is true when advancing column', () => {
      assert(AceOperation.isRetain({column: 1}))
    });

    it('is false when inserting text', () => {
      assert(!AceOperation.isRetain(['a']));
    });

    it('is false when deleting rows', () => {
      assert(!AceOperation.isRetain({row: -1}));
    });

    it('is false when deleting columns', () => {
      assert(!AceOperation.isRetain({column: -1}));
    });
  });

  

  it('has more tests', () => {
    assert.fail('need more tests');
  });
});
