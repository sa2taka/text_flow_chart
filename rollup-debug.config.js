import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { babel } from '@rollup/plugin-babel';

import * as path from 'path';

import pkg from './package.json';

const moduleName = pkg.name.replace(/^@.*\//, '');
function toCamelCase(p) {
  return p.replace(/_./g, function (s) {
    return s.charAt(1).toUpperCase();
  });
}
export default (commandLineArgs) => [
  {
    input: `src/${moduleName}.ts`,
    output: [
      {
        name: toCamelCase(moduleName),
        file: pkg.browser,
        format: 'iife',
        sourcemap: 'inline',
      },
    ],
    plugins: [
      typescript(),
      commonjs({
        extensions: ['.js', '.ts'],
      }),
      babel({
        babelHelpers: 'bundled',
        configFile: path.resolve(__dirname, 'babel.config.js'),
      }),
      nodeResolve({
        browser: true,
      }),
    ],
  },
];
