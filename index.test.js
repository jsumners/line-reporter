'use strict'

const test = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const { spawnSync: spawn } = require('node:child_process')

const node = process.execPath
const runner = path.resolve('./index.mjs')
const fixtures = path.resolve('./fixtures')

function getFixture (name) {
  return path.join(fixtures, name)
}

test('all pass', (t) => {
  const fixture = getFixture('all-pass.js')
  const child = spawn(
    node,
    ['--test', `--test-reporter=${runner}`, fixture],
    { env: {} }
  )

  const stdout = child.stdout.toString()
  const stderr = child.stderr.toString()

  assert.equal(stderr.length, 0)
  assert.match(stdout, RegExp(`passed: ${fixture} \\(\\d+(.\\d+)? ms\\)\\n`))
  assert.match(stdout, /Passed: 3\n/)
  assert.match(stdout, /Failed: 0\n/)
  assert.match(stdout, /Total: 3\n/)
})

test('tap', (t) => {
  const fixture = getFixture('tap.js')
  const child = spawn(
    node,
    ['--test', `--test-reporter=${runner}`, fixture],
    { env: {} }
  )

  const stdout = child.stdout.toString()
  const stderr = child.stderr.toString()

  assert.equal(stderr.length, 0)
  assert.match(stdout, RegExp(`failed: ${fixture} \\(\\d+(.\\d+)? ms\\)\\n`))
  assert.match(stdout, /Passed: 0\n/)
  assert.match(stdout, /Failed: 1\n/)
  assert.match(stdout, /Total: 1\n/)
})

test('valid suite with failures', (t) => {
  const fixture = getFixture('one.js')
  const child = spawn(
    node,
    ['--test', `--test-reporter=${runner}`, fixture],
    { env: {} }
  )

  const stdout = child.stdout.toString()
  const stderr = child.stderr.toString()

  assert.equal(stderr.length, 0)
  assert.match(stdout, RegExp(`failed: ${fixture} \\(\\d+(.\\d+)? ms\\)\\n`))
  assert.match(stdout, RegExp(`Failed tests:\\n\\n${fixture}\\n`))
  assert.match(stdout, /Passed: 4\n/)
  assert.match(stdout, /Failed: 3\n/)
  assert.match(stdout, /Total: 7\n/)
})

test('invalid suite with failures', (t) => {
  const fixture = getFixture('two.js')
  const child = spawn(
    node,
    ['--test', `--test-reporter=${runner}`, fixture],
    { env: {} }
  )

  const stdout = child.stdout.toString()
  const stderr = child.stderr.toString()

  assert.equal(stderr.length, 0)
  assert.match(stdout, RegExp(`failed: ${fixture} \\(\\d+(.\\d+)? ms\\)\\n`))
  assert.match(stdout, RegExp(`Failed tests:\\n\\n${fixture}\\n`))
  assert.match(stdout, /Passed: 1\n/)
  assert.match(stdout, /Failed: 6\n/)
  assert.match(stdout, /Total: 7\n/)
})

test('passing suite and failing suite', (t) => {
  const fixture1 = getFixture('one.js')
  const fixture2 = getFixture('all-pass.js')
  const child = spawn(
    node,
    ['--test', `--test-reporter=${runner}`, fixture1, fixture2],
    { env: {} }
  )

  const stdout = child.stdout.toString()
  const stderr = child.stderr.toString()

  assert.equal(stderr.length, 0)
  assert.match(stdout, RegExp(`failed: ${fixture1} \\(\\d+(.\\d+)? ms\\)\\n`))
  assert.match(stdout, RegExp(`passed: ${fixture2} \\(\\d+(.\\d+)? ms\\)\\n`))
  assert.match(stdout, RegExp(`Failed tests:\\n\\n${fixture1}\\n`))
  assert.match(stdout, /Passed: 7\n/)
  assert.match(stdout, /Failed: 3\n/)
  assert.match(stdout, /Total: 10\n/)
})
