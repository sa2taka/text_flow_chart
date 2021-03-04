import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

import * as path from 'path';

import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        name: moduleName,
        file: pkg.browser,
        format: 'iife',
        sourcemap: 'inline',
      },
      {
        name: moduleName,
        // minifyするので.minを付与する
        file: pkg.browser.replace('.js', '.min.js'),
        format: 'iife',
        plugins: [terser()],
      },
    ],
    plugins: [
      typescript(),
      commonjs({
        extensions: ['.js', '.ts'],
      }),
      babel({
        babelHelpers: 'bundled',
        configFile: path.resolve(__dirname, '.babelrc.js'),
      }),
      nodeResolve({
        browser: true,
      }),
    ],
  },
  {
    input: `src/${pkg.name}.ts`,
    output: [
      {
        file: pkg.module,
        format: 'es',
        sourcemap: 'inline',
        exports: 'named',
      },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})],
    plugins: [
      typescript(),
      babel({
        babelHelpers: 'bundled',
        configFile: path.resolve(__dirname, '.babelrc.js'),
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: 'inline',
        exports: 'default',
      },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})],
    plugins: [
      typescript(),
      babel({
        babelHelpers: 'bundled',
        configFile: path.resolve(__dirname, '.babelrc.js'),
      }),
    ],
  },
];
