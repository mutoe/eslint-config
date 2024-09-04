import type {
  OptionsComponentExts,
  OptionsStylistic,
  OptionsTypeScriptParserOptions,
  OptionsTypeScriptWithTypes,
  TypedFlatConfigItem,
} from '../types'
import path from 'node:path'
import pluginPerfectionistVue from '@mutoe/eslint-plugin-perfectionist-vue'
import { GLOB_ASTRO_TS, GLOB_MARKDOWN, GLOB_TESTS, GLOB_TS, GLOB_TSX, GLOB_VUE, GLOB_YAML } from '../globs'
import { StylisticConfigDefaults } from './stylistic'

export async function mutoe(
  options: OptionsComponentExts & OptionsStylistic & OptionsTypeScriptWithTypes & OptionsTypeScriptParserOptions & {
    typescript?: boolean
    vue?: boolean
    react?: boolean
    test?: boolean
    unicorn?: boolean
    unocss?: boolean
  } = {},
): Promise<TypedFlatConfigItem[]> {
  const { componentExts = [], react, stylistic, typescript, unicorn, unocss, vue } = options

  const filesTypeAware = options.filesTypeAware ?? [GLOB_TS, GLOB_TSX]
  const ignoresTypeAware = options.ignoresTypeAware ?? [
    `${GLOB_MARKDOWN}/**`,
    GLOB_ASTRO_TS,
  ]
  const tsconfigPath = options?.tsconfigPath ? options.tsconfigPath : undefined
  const isTypeAware = !!tsconfigPath

  const configs: TypedFlatConfigItem[] = [
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
      name: 'mutoe/perfectionist',
      rules: {
        'perfectionist/sort-exports': ['error', { ignoreCase: false, type: 'natural' }],
        'perfectionist/sort-imports': ['error', {
          customGroups: [
            {
              elementNamePattern: '^(vue|react|svelte|astro).*',
              groupName: 'type-frameworks',
              selector: 'type',
            },
            {
              elementNamePattern: '^(vue|react|svelte|astro).*',
              groupName: 'value-frameworks',
            },
          ],
          groups: [
            ['value-builtin', 'type-builtin'],
            ['value-frameworks', 'type-frameworks'],
            ['value-external', 'type-external'],
            ['value-internal', 'type-internal'],
            ['value-parent', 'type-parent'],
            ['value-sibling', 'type-sibling'],
            ['value-index', 'type-index'],
            'unknown',
            'side-effect',
            'side-effect-style',
            'style',
          ],
          ignoreCase: false,
          internalPattern: ['^~/(.+)', '^@/(.+)', '^@?(src|test|lib|type)s?(/.+)?'],
          newlinesBetween: 0,
          sortSideEffects: false,
          ...(tsconfigPath
            ? { tsconfig: {
                rootDir: path.dirname(tsconfigPath),
              } }
            : {}),
          type: 'natural',
        }],
        'perfectionist/sort-named-exports': ['error', { ignoreCase: false, type: 'natural' }],
        'perfectionist/sort-named-imports': ['error', { ignoreCase: false, type: 'natural' }],
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
  ]

  if (unicorn) {
    configs.push({
      name: 'mutoe/unicorn/rules',
      rules: {
        'unicorn/explicit-length-check': 'off',
        'unicorn/filename-case': ['error', {
          cases: { kebabCase: true, pascalCase: true },
          ignore: [
            '[A-Z]+\.md$',
            '.+_lock.toml$',
          ],
        }],
        'unicorn/no-lonely-if': 'off',
        'unicorn/no-null': 'off',
        'unicorn/no-useless-spread': 'off',
        'unicorn/no-useless-undefined': 'off',
        'unicorn/prefer-spread': 'off',
        'unicorn/prefer-switch': 'off',
        'unicorn/prefer-ternary': 'off',
        'unicorn/prevent-abbreviations': 'off',
      },
    })
    configs.push({
      files: ['**/{locale,lang}?(s)/**'],
      name: 'mutoe/unicorn/locale-rules',
      rules: {
        'unicorn/filename-case': 'off',
      },
    })
  }

  if (typescript) {
    const files = [GLOB_TS, GLOB_TSX, ...componentExts.map(ext => `**/*.${ext}`)]

    configs.push({
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
      configs.push({
        files: filesTypeAware,
        ignores: ignoresTypeAware,
        name: 'mutoe/typescript/rules-type-aware',
        rules: {
          'ts/consistent-type-assertions': 'error',
          'ts/promise-function-async': ['error', {
            checkArrowFunctions: false,
          }],
          'ts/return-await': ['error', 'always'],
        },
      })
    }

    configs.push({
      files: GLOB_TESTS,
      name: 'mutoe/typescript/tests-rules',
      rules: {
        'ts/no-namespace': 'off',
        'ts/no-unsafe-argument': 'off',
        'ts/no-unsafe-assignment': 'off',
        'ts/no-unsafe-call': 'off',
        'ts/no-unsafe-member-access': 'off',
        'ts/no-unsafe-return': 'off',
        'ts/unbound-method': 'off',
      },
    })
  }

  if (vue) {
    configs.push({
      files: [GLOB_VUE],
      name: 'mutoe/vue/rules',
      plugins: {
        'perfectionist-vue': pluginPerfectionistVue,
      },
      rules: {
        'perfectionist-vue/sort-vue-attributes': ['error', {
          customGroups: {
            /* eslint-disable perfectionist/sort-objects */
            'definition': '{?(:){is,as},v-is}',
            'list-rendering': 'v-for',
            'conditionals': '{v-if,v-else-if,v-else,v-show,v-cloak}',
            'render-modifiers': '{v-pre,v-once}',
            'unique': '{ref,?(:){key,index}}',
            'global': '?(:){id,for}',
            'slot': '{slot,v-slot*,#*}',
            'attr-dynamic': 'v-bind',
            'type': '?(:)type',
            'class': 'class',
            'class-dynamic': ':class',
            'style': 'style',
            'style-dynamic': ':style',
            'aria-role': '?(:)role',
            'aria-attributes': '?(:){alt,tabindex,tab-index,aria-*}',
            'name': '?(:)name',
            'two-way-binding': 'v-model*',
            'value': '?(:){value,model-value}',
            'router': '?(:)to',
            'status': '?(:){loading,disabled,required,readonly}',
            'data': '?(:)data-*',
            'events': '{v-on,@}*',
            'content': '{v-html,v-text,?(:)label}',
            'other-directives': 'v-*',
            /* eslint-enable perfectionist/sort-objects */
          },
          groups: [
            'definition',
            'list-rendering',
            'conditionals',
            'render-modifiers',
            'unique',
            'global',
            'slot',
            'attr-dynamic',
            'type',
            'class',
            'class-dynamic',
            'style',
            'style-dynamic',
            'aria-role',
            'aria-attributes',
            'other-directives',
            'name',
            'two-way-binding',
            'value',
            'router',
            'status',
            'unknown',
            'data',
            'events',
            'content',
          ],
          specialCharacters: 'trim',
          type: 'natural',
        }],
        'unicorn/prefer-module': 'off',
        'vue/attributes-order': 'off',
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
        'vue/component-name-in-template-casing': ['error', 'PascalCase', {
          globals: ['RouterView', 'RouterLink'],
        }],
        'vue/define-emits-declaration': 'error',
        'vue/define-props-declaration': 'error',
        'vue/html-comment-content-newline': 'error',
        'vue/html-comment-indent': 'error',
        'vue/max-attributes-per-line': ['error', { singleline: 3 }],
        'vue/no-ref-object-reactivity-loss': 'error',
        'vue/no-required-prop-with-default': 'error',
        'vue/no-template-target-blank': 'error',
        'vue/no-useless-mustaches': ['error', {
          ignoreIncludesComment: true,
          ignoreStringEscape: true,
        }],
        'vue/padding-line-between-tags': ['error', [
          { blankLine: 'consistent', next: '*', prev: '*' },
        ]],
        'vue/singleline-html-element-content-newline': 'off',

        ...unocss ? { 'unocss/order-attributify': 'off' } : {},
        ...typescript ? { 'ts/no-use-before-define': 'off' } : {},
      },
    })
  }

  if (react) {
    if (isTypeAware) {
      configs.push({
        files: [GLOB_TSX],
        name: 'mutoe/react/type-aware-rules',
        rules: {
          'ts/no-misused-promises': 'off',
        },
      })
    }
  }

  if (stylistic) {
    const { quotes } = {
      ...StylisticConfigDefaults,
      ...stylistic === true ? {} : stylistic,
    }
    configs.push({
      name: 'mutoe/stylistic',
      rules: {
        'antfu/consistent-chaining': 'off',
        'antfu/if-newline': 'off',
        'style/arrow-parens': ['error', 'as-needed', { requireForBlockBody: false }],
        'style/jsx-one-expression-per-line': 'off',
        'style/linebreak-style': ['error', 'unix'],
        'style/quotes': ['error', quotes, {
          allowTemplateLiterals: true,
          avoidEscape: true,
        }],
      },
    })
    configs.push({
      files: [GLOB_YAML],
      name: 'mutoe/stylistic/yaml/rules',
      rules: {
        'yaml/flow-sequence-bracket-spacing': ['error', 'always'],
      },
    })
  }

  configs.push({
    files: ['**/generated/**'],
    name: 'mutoe/generated-rules',
    rules: {
      'ts/no-unnecessary-type-constraint': 'off',
      'ts/no-unsafe-argument': 'off',
      'ts/no-unsafe-assignment': 'off',
      'ts/no-unsafe-call': 'off',
      'ts/no-unsafe-member-access': 'off',
      'ts/no-unsafe-return': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  })

  return configs
}
