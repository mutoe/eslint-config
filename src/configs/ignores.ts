import type { TypedFlatConfigItem } from '../types'
import { GLOB_EXCLUDE } from '../globs'

export async function ignores(customIgnores: string[] = []): Promise<TypedFlatConfigItem[]> {
  return [
    {
      ignores: [...GLOB_EXCLUDE, ...customIgnores],
      // Awaits https://github.com/humanwhocodes/config-array/pull/131
      // name: 'antfu/ignores',
    },
  ]
}
