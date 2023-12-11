import { ensurePackages, interopDefault } from '../utils'
import type { FlatConfigItem, OptionsCypress, OptionsFiles, OptionsIsInEditor, OptionsOverrides } from '../types'
import { GLOB_SRC_EXT, GLOB_TESTS } from '../globs'

export async function test(
  options: OptionsFiles & OptionsIsInEditor & OptionsOverrides & OptionsCypress = {},
): Promise<FlatConfigItem[]> {
  const {
    cypress = false,
    files = GLOB_TESTS,
    isInEditor = false,
    overrides = {},
  } = options

  if (cypress)
    await ensurePackages(['eslint-plugin-cypress'])

  const [
    pluginVitest,
    pluginNoOnlyTests,
    pluginCypress,
  ] = await Promise.all([
    interopDefault(import('eslint-plugin-vitest')),
    // @ts-expect-error missing types
    interopDefault(import('eslint-plugin-no-only-tests')),
    // @ts-expect-error missing types
    cypress ? interopDefault(import('eslint-plugin-cypress')) : undefined,
  ] as const)

  return [
    {
      name: 'antfu:test:setup',
      plugins: {
        test: {
          ...pluginVitest,
          ...pluginCypress,
          rules: {
            ...pluginVitest.rules,
            // extend `test/no-only-tests` rule
            ...pluginNoOnlyTests.rules,
            ...cypress ? pluginCypress.configs.recommended.rules : {},
          },
        },
      },
    },
    {
      files,
      name: 'antfu:test:rules',
      rules: {
        'node/prefer-global/process': 'off',

        'test/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
        'test/no-identical-title': 'error',
        'test/no-only-tests': isInEditor ? 'off' : 'error',
        'test/prefer-hooks-in-order': 'error',
        'test/prefer-lowercase-title': 'error',

        'ts/no-unsafe-assignment': 'off',
        'ts/no-unsafe-member-access': 'off',
        'ts/unbound-method': 'off',

        ...overrides,
      },
    },
    cypress
      ? {
          files: [`**/cypress/support/**/*.${GLOB_SRC_EXT}`],
          rules: {
            'ts/no-namespace': 'off',
          },
        }
      : {},
  ]
}
