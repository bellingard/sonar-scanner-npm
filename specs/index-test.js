const assert = require('assert')
const index = require('../src/index')

describe('fromParam', function() {
  it('should provide the correct identity', function() {
    assert.deepEqual(index.fromParam(), ['--from=ScannerNpm/' + require('../package.json').version])
  })
})
