import { interopDefault } from '../utils'
import type { OptionsOverrides, Rules, StylisticConfig, TypedFlatConfigItem } from '../types'

import { pluginAntfu } from '../plugins'

export const StylisticConfigDefaults: StylisticConfig = {
  indent: 2,
  jsx: true,
  quotes: 'single',
  semi: false,
}

export interface StylisticOptions extends StylisticConfig, OptionsOverrides {
  lessOpinionated?: boolean
}

export async function stylistic(
  options: StylisticOptions = {},
): Promise<TypedFlatConfigItem[]> {
  const {
    indent,
    jsx,
    lessOpinionated = false,
    overrides = {},
    quotes,
    semi,
  } = {
    ...StylisticConfigDefaults,
    ...options,
  }

  const pluginStylistic = await interopDefault(import('@stylistic/eslint-plugin'))

  const config = pluginStylistic.configs.customize({
    flat: true,
    indent,
    jsx,
    pluginName: 'style',
    quotes,
    semi,
  })

  return [
    {
      name: 'antfu/stylistic/rules',
      plugins: {
        antfu: pluginAntfu,
        style: pluginStylistic,
      },
      rules: {
        ...config.rules as Partial<Rules>,

        'antfu/consistent-list-newline': 'error',

        ...lessOpinionated
          ? {
              curly: ['error', 'all'],
            }
          : {
              'antfu/if-newline': 'error',
              'antfu/top-level-function': 'error',
              'curly': ['error', 'multi-or-nest', 'consistent'],
            },

        'style/arrow-parens': ['error', 'as-needed', { requireForBlockBody: false }],
        'style/jsx-one-expression-per-line': 'off',
        'style/linebreak-style': ['error', 'unix'],
        'style/no-extra-parens': ['error', 'all', {
          ignoreJSX: 'all',
          nestedBinaryExpressions: false,
          returnAssign: false,
          ternaryOperandBinaryExpressions: false,
        }],
        'style/quotes': ['error', quotes, { allowTemplateLiterals: true, avoidEscape: true }],

        ...overrides,
      },
    },
  ]
}
