'use strict'

const { test } = require('tap')
const assert = require('node:assert')

test('1', async () => assert.equal(1, 1))

test('2', async () => assert.equal(2, 3))

test('group', async (t) => {
  await t.test('3', async () => assert.equal(3, 4))
})
