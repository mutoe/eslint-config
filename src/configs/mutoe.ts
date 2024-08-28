import type {
  OptionsComponentExts,
  OptionsStylistic,
  OptionsTypeScriptParserOptions,
  OptionsTypeScriptWithTypes,
  TypedFlatConfigItem,
} from '../types'
import { GLOB_ASTRO_TS, GLOB_MARKDOWN, GLOB_TESTS, GLOB_TS, GLOB_TSX, GLOB_VUE } from '../globs'
import { pluginUnicorn } from '../plugins'
import { StylisticConfigDefaults } from './stylistic'

export async function mutoe(
  options: OptionsComponentExts & OptionsStylistic & OptionsTypeScriptWithTypes & OptionsTypeScriptParserOptions & {
    typescript?: boolean
    vue?: boolean
    test?: boolean
  } = {},
): Promise<TypedFlatConfigItem[]> {
  const {
    componentExts = [],
    stylistic,
    typescript,
    vue,
  } = options

  const filesTypeAware = options.filesTypeAware ?? [GLOB_TS, GLOB_TSX]
  const ignoresTypeAware = options.ignoresTypeAware ?? [
    `${GLOB_MARKDOWN}/**`,
    GLOB_ASTRO_TS,
  ]
  const tsconfigPath = options?.tsconfigPath ? options.tsconfigPath : undefined
  const isTypeAware = !!tsconfigPath

  const rules: TypedFlatConfigItem[] = [
    {
      files: ['**/package.json'],
      name: 'mutoe/sort/package-json',
      rules: {
        'jsonc/array-bracket-newline': [
          'warn',
          {
            minItems: 0,
            multiline: true,
          },
        ],
        'jsonc/array-element-newline': ['warn', 'always'],
        'jsonc/object-curly-newline': ['warn', 'always'],
        'jsonc/object-property-newline': 'warn',
        'jsonc/sort-array-values': [
          'warn',
          {
            order: [
              { valuePattern: 'index.*' },
              { valuePattern: 'main.*' },
              { order: { type: 'asc' } },
            ],
            pathPattern: '^files$',
          },
        ],
        'jsonc/sort-keys': [
          'error',
          {
            order: [
              'name',
              'displayName',
              'publisher',
              'private',
              'publishConfig',
              'version',

              'description',
              'license',
              'author',
              'contributes',
              'contributors',
              'maintainers',
              'keywords',
              'categories',
              'funding',
              'homepage',
              'repository',
              'bugs',

              'engines',
              'packageManager',
              'workspaces',
              'type',
              'os',
              'cpu',
              'bin',
              'exports',
              'main',
              'module',
              'unpkg',
              'jsdelivr',
              'types',
              'typings',
              'typesVersions',
              'icon',
              'files',
              'sideEffects',
              'activationEvents',
              'scripts',

              'peerDependencies',
              'peerDependenciesMeta',
              'bundledDependencies',
              'dependencies',
              'optionalDependencies',
              'devDependencies',
              'pnpm',
              'overrides',
              'resolutions',

              'gitHooks',
              'husky',
              'simple-git-hooks',
              'lint-staged',
              'changelog',

              'config',
              'browserLists',
              'prettier',
              'eslintIgnore',
              'eslintConfig',
              'stylelint',
              'jest',
            ],
            pathPattern: '^$',
          },
          {
            order: { type: 'asc' },
            pathPattern: '^(?:dev|peer|optional|bundled)?[Dd]ependencies(Meta)?$',
          },
          {
            order: { type: 'asc' },
            pathPattern: '^(?:resolutions|overrides|pnpm.overrides)$',
          },
          {
            order: [
              'types',
              'import',
              'require',
              'default',
            ],
            pathPattern: '^exports.*$',
          },
          {
            order: [
              'prepare',
              'prepack',
              'pack',
              'postpack',
              'prerelease',
              'release',
              'postrelease',
              'prepublish',
              'prepublishOnly',
              'publish',
              'postpublish',
              'preinstall',
              'install',
              'postinstall',
              'preuninstall',
              'uninstall',
              'postuninstall',
              'preversion',
              'version',
              'postversion',
              { keyPattern: '^start' },
              { keyPattern: '^restart' },
              { keyPattern: '^stop' },
              'dev',
              { keyPattern: '^build' },
              'serve',
              'preview',
              'typecheck',
              'type-check',
              { keyPattern: '^lint' },
              { keyPattern: '^test' },
            ],
            pathPattern: '^scripts$',
          },
          {
            order: [
              // client hooks only
              'pre-commit',
              'prepare-commit-msg',
              'commit-msg',
              'post-commit',
              'pre-rebase',
              'post-rewrite',
              'post-checkout',
              'post-merge',
              'pre-push',
              'pre-auto-gc',
            ],
            pathPattern: '^(?:gitHooks|husky|simple-git-hooks)$',
          },
          {
            order: [
              'extends',
              'plugins',
              'processors',
              'defaultSeverity',
              'ignoreFiles',
              'ignoreDisables',
              'customSyntax',
              'reportNeedlessDisables',
              'reportInvalidScopeDisables',
              'reportDescriptionlessDisables',
              'rules',
              'overrides',
            ],
            pathPattern: '^stylelint$',
          },
        ],
      },
    },
    {
      name: 'mutoe/imports',
      rules: {
        'import/order': [
          'error',
          {
            'alphabetize': {
              caseInsensitive: true,
              order: 'asc',
              orderImportKind: 'asc',
            },
            'groups': [
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index',
            ],
            'newlines-between': 'never',
            'pathGroups': [
              {
                group: 'external',
                pattern: '{react,vue}*',
                position: 'before',
              },
              {
                group: 'internal',
                pattern: '{src,test,lib,type}?(s)/**',
              },
            ],
            'pathGroupsExcludedImportTypes': [],
          },
        ],
      },
    },
    {
      name: 'mutoe/javascript',
      rules: {
        'camelcase': ['error', {
          allow: ['^(UNSAFE_|unstable_)'],
          ignoreGlobals: true,
        }],
        'no-cond-assign': ['error', 'except-parens'],
        'prefer-arrow-callback': ['error', {
          allowNamedFunctions: true,
          allowUnboundThis: true,
        }],
      },
    },
    {
      name: 'mutoe/unicorn/rules',
      rules: {
        ...pluginUnicorn.configs.recommended.rules,

        'unicorn/better-regex': 'off',
        'unicorn/consistent-destructuring': 'off',
        'unicorn/consistent-function-scoping': ['error', { checkArrowFunctions: false }],
        // Pass error message when throwing errors
        'unicorn/error-message': 'error',
        // Uppercase regex escapes
        'unicorn/escape-case': 'error',
        'unicorn/explicit-length-check': 'off',
        'unicorn/filename-case': 'off',
        'unicorn/new-for-builtins': 'off',
        'unicorn/no-abusive-eslint-disable': 'off',
        'unicorn/no-array-callback-reference': 'off',
        'unicorn/no-hex-escape': 'off',
        // Array.isArray instead of instanceof
        'unicorn/no-instanceof-array': 'error',
        'unicorn/no-lonely-if': 'off',
        'unicorn/no-nested-ternary': 'off',
        // Ban `new Array` as `Array` constructor's params are ambiguous
        'unicorn/no-new-array': 'error',
        // Prevent deprecated `new Buffer()`
        'unicorn/no-new-buffer': 'error',
        'unicorn/no-null': 'off',
        'unicorn/no-useless-spread': 'off',
        'unicorn/no-useless-undefined': 'off',
        // Lowercase number formatting for octal, hex, binary (0x1'error' instead of 0X1'error')
        'unicorn/number-literal-case': 'error',
        'unicorn/numeric-separators-style': 'off',
        // textContent instead of innerText
        'unicorn/prefer-dom-node-text-content': 'error',
        // includes over indexOf when checking for existence
        'unicorn/prefer-includes': 'error',
        'unicorn/prefer-module': 'off',
        // Prefer using the node: protocol
        'unicorn/prefer-node-protocol': 'error',
        // Prefer using number properties like `Number.isNaN` rather than `isNaN`
        'unicorn/prefer-number-properties': 'error',
        'unicorn/prefer-regexp-test': 'off',
        'unicorn/prefer-spread': 'off',
        // String methods startsWith/endsWith instead of more complicated stuff
        'unicorn/prefer-string-starts-ends-with': 'error',
        'unicorn/prefer-ternary': 'off',
        'unicorn/prefer-top-level-await': 'off',
        // Enforce throwing type error when throwing error while checking typeof
        'unicorn/prefer-type-error': 'error',
        'unicorn/prevent-abbreviations': 'off',
        'unicorn/text-encoding-identifier-case': 'off',
        // Use new when throwing error
        'unicorn/throw-new-error': 'error',
      },
    },
  ]

  if (typescript) {
    const files = [GLOB_TS, GLOB_TSX, ...componentExts.map(ext => `**/*.${ext}`)]

    rules.push({
      files,
      name: 'mutoe/typescript/rules',
      rules: {
        'ts/no-unused-expressions': ['error', {
          allowShortCircuit: true,
          allowTaggedTemplates: true,
        }],
        'ts/strict-boolean-expressions': 'off',
      },
    })

    if (isTypeAware) {
      rules.push({
        files: filesTypeAware,
        ignores: ignoresTypeAware,
        name: 'mutoe/typescript/rules-type-aware',
        rules: {
          'ts/consistent-type-assertions': 'error',
          'ts/promise-function-async': ['error', {
            checkArrowFunctions: false,
          }],
        },
      })
    }

    rules.push({
      files: GLOB_TESTS,
      name: 'mutoe/typescript/tests-rules',
      rules: {
        'ts/no-namespace': 'off',
        'ts/no-unsafe-assignment': 'off',
        'ts/no-unsafe-call': 'off',
        'ts/no-unsafe-member-access': 'off',
        'ts/no-unsafe-return': 'off',
        'ts/unbound-method': 'off',
      },
    })
  }

  if (vue) {
    rules.push({
      files: [GLOB_VUE],
      name: 'mutoe/vue/rules',
      rules: {
        'vue/block-order': ['error', {
          order: [
            'template',
            'script:not([setup])',
            'script',
            'style:not([scoped])',
            'style',
            'i18n[local=en]',
            'i18n[local=zh]',
            'i18n',
          ],
        }],
        'vue/max-attributes-per-line': ['error', { singleline: 3 }],
        'vue/singleline-html-element-content-newline': 'off',

        ...typescript
          ? {
              'ts/no-use-before-define': 'off',
            }
          : {},
      },
    },
    )
  }

  if (stylistic) {
    const { quotes } = {
      ...StylisticConfigDefaults,
      ...stylistic === true ? {} : stylistic,
    }
    rules.push({
      name: 'mutoe/stylistic',
      rules: {
        'antfu/if-newline': 'off',
        'style/arrow-parens': ['error', 'as-needed', { requireForBlockBody: false }],
        'style/jsx-one-expression-per-line': 'off',
        'style/linebreak-style': ['error', 'unix'],
        'style/no-extra-parens': ['error', 'all', {
          ignoreJSX: 'multi-line',
          nestedBinaryExpressions: false,
          returnAssign: false,
          ternaryOperandBinaryExpressions: false,
        }],
        'style/quotes': ['error', quotes, {
          allowTemplateLiterals: true,
          avoidEscape: true,
        }],
      },
    })
  }

  return rules
}
