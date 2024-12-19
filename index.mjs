import { format, styleText } from 'node:util'

const OUTPUT_MODE = process.env.LINE_REPORTER_MODE?.toLowerCase() ?? ''
const isSilent = OUTPUT_MODE === 'quiet' || OUTPUT_MODE === 'silent'

const locale = process.env.LINE_REPORTER_LOCALE ?? 'en-US'
const durationFormatter = new Intl.NumberFormat(locale, {
  style: 'unit',
  unit: 'millisecond',
  maximumSignificantDigits: 4
})

function reportLine (file, details) {
  if (isSilent === true) {
    return ''
  }

  const lead = details.passed === true
    ? styleText('green', 'passed:')
    : styleText('red', 'failed:')
  const time = durationFormatter.format(Number(details.duration_ms))
  return `${lead} ${file} (${time})\n`
}

function formatCause (error) {
  return format(error).split('\n').map(l => `\t\t${l}`).join('\n')
}

async function * reporter (source) {
  const tracker = new Map()

  for await (const event of source) {
    const file = event.data.file || event.data.name

    switch (event.type) {
      case 'test:stderr': {
        console.log('err', event)
        break
      }

      case 'test:complete': {
        const { data } = event
        const { details } = data
        if (data.nesting === 0 && data.line === 1) {
          // This should be the summary for the whole test suite.
          yield reportLine(file, details)

          // If the file is not `node:test` based, but is instead `tap` based,
          // this event will be the only event we see for the file. So we need
          // to update the tracker here.
          let tracked = tracker.get(file)
          if (tracked === undefined) {
            tracked = {
              passed: details.passed ? 1 : 0,
              failed: details.passed ? 0 : 1,
              errors: details.passed
                ? []
                : [{
                    line: data.line,
                    column: data.column,
                    cause: details.error.cause
                  }]
            }
          }
          tracker.set(file, tracked)
          break
        }

        // Otherwise, the report is for a subtest.
        let tracked = tracker.get(file)
        if (tracked === undefined) {
          tracked = {
            passed: 0,
            failed: 0,
            errors: []
          }
        }
        if (details.passed === true) {
          tracked.passed += 1
        } else {
          tracked.failed += 1
          tracked.errors.push({
            line: data.line,
            column: data.column,
            cause: details.error.cause
          })
        }
        tracker.set(file, tracked)
        break
      }
    }
  }

  let passes = 0
  let failures = 0
  const failed = []
  for (const [file, tracked] of tracker.entries()) {
    passes += tracked.passed
    failures += tracked.failed
    if (tracked.failed > 0) {
      failed.push(file)
    }
  }
  if (failed.length > 0) {
    yield styleText('red', '\n\nFailed tests:\n')
    for (const file of failed) {
      yield `\n${file}\n`

      const { errors } = tracker.get(file)
      for (const error of errors) {
        yield `\tline: ${error.line}, column: ${error.column}\n`
        yield formatCause(error.cause) + '\n'
      }
    }
  }
  yield '\n\n'
  yield `Passed: ${passes}\n`
  yield `Failed: ${failures}\n`
  yield `Total: ${passes + failures}\n`
}

export default reporter
