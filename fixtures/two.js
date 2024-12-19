'use strict'

// This test suite covers undefined behavior due to the setup being
// incorrect (groups should be async and subtests awaited).

const test = require('node:test')
const assert = require('node:assert')

// pass: 1, complete: 1
test('1', () => assert.equal(1, 1))

// fail: 1, complete: 2
test('2', () => assert.equal(2, 3))

// fail: 5, complete: 6
test('group', (t) => {
  // fail: 2, complete: 3
  t.test('3', () => assert.equal(3, 4))

  // fail: 3, complete: 4 (parent canceled)
  // fail: 6, complete: 7 (second report, parent canceled)
  t.test('4', () => assert.equal(4, 4))

  // fail: 4, complete: 5 (parent canceled)
  t.test('group 2', t => {
    // not seen due to parent canceled
    t.test('5', () => assert.equal(5, 5))
  })
})
