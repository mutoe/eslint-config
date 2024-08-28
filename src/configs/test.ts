import { isPackageExists } from 'local-pkg'
import { GLOB_CYPRESS, GLOB_TESTS } from '../globs'
import { ensurePackages, interopDefault } from '../utils'
import type { OptionsFiles, OptionsIsInEditor, OptionsOverrides, TypedFlatConfigItem } from '../types'

// Hold the reference so we don't redeclare the plugin on each call
let _pluginTest: any

export async function test(
  options: OptionsFiles & OptionsIsInEditor & OptionsOverrides & { cypress?: boolean } = {},
): Promise<TypedFlatConfigItem[]> {
  const {
    cypress,
    files = GLOB_TESTS,
    isInEditor = false,
    overrides = {},
  } = options

  const enableCypress = cypress || isPackageExists('cypress')
  if (enableCypress) {
    await ensurePackages(['eslint-plugin-cypress'])
  }

  const [
    pluginVitest,
    pluginNoOnlyTests,
    pluginCypress,
  ] = await Promise.all([
    interopDefault(import('@vitest/eslint-plugin')),
    // @ts-expect-error missing types
    interopDefault(import('eslint-plugin-no-only-tests')),
    // @ts-expect-error missing types
    enableCypress ? interopDefault(import('eslint-plugin-cypress/flat')) : null,
  ] as const)

  _pluginTest = _pluginTest || {
    ...pluginVitest,
    rules: {
      ...pluginVitest.rules,
      // extend `test/no-only-tests` rule
      ...pluginNoOnlyTests.rules,
    },
  }

  return [
    {
      name: 'antfu/test/setup',
      plugins: {
        test: _pluginTest,
      },
    },
    {
      files,
      name: 'antfu/test/rules',
      rules: {
        'node/prefer-global/process': 'off',

        'test/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
        'test/no-identical-title': 'error',
        'test/no-import-node-test': 'error',
        'test/no-only-tests': isInEditor ? 'off' : 'error',
        'test/prefer-hooks-in-order': 'error',
        'test/prefer-lowercase-title': 'error',

        'ts/explicit-function-return-type': 'off',
        'unicorn/consistent-function-scoping': 'off',

        ...overrides,
      },
    },
    ...(pluginCypress
      ? [{
          files: GLOB_CYPRESS,
          ...pluginCypress.configs.recommended,
          name: 'mutoe/test/cypress-rules',
        }]
      : []),
  ]
}
