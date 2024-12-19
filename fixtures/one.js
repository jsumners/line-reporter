'use strict'

// This test suite covers a baseline setup with failures at every
// group level.

const test = require('node:test')
const assert = require('node:assert')

// pass: 1, complete: 1
test('1', () => assert.equal(1, 1))

// fail: 1, complete: 2
test('2', () => assert.equal(2, 3))

// fail: 2, complete: 3
test('group', async (t) => {
  // fail: 3, complete: 4
  await t.test('3', () => assert.equal(3, 4))

  // pass: 2, complete: 5
  await t.test('4', () => assert.equal(4, 4))

  // pass: 3, complete: 6
  await t.test('group 2', async t => {
    // pass: 4, complete: 7
    await t.test('5', () => assert.equal(5, 5))
  })
})
