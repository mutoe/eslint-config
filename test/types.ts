/* eslint-disable unicorn/no-unreadable-iife */
import type { Linter } from 'eslint'
import type { TypedFlatConfigItem } from '../src';

// Make sure they are compatible
((): Linter.FlatConfig => ({} as TypedFlatConfigItem))();
((): TypedFlatConfigItem => ({} as Linter.FlatConfig))()
