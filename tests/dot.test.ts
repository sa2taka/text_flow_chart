import { createDotFromText } from '../src/dot';
import rewire from 'rewire';

test('generate dot', () => {
  const dot = createDotFromText(originText);
  console.log(dot);
});

test('parse syntax', () => {
  const wired = rewire('../dist/dot');
  const parse = wired.__get__('parse');

  const actual = parse(originText);
  originParsed.forEach((e, index) => {
    expect(actual[index]).toEqual(e);
  });
});

const originText = `
1. test

2. test

3. repeat test
  3.1. test
  3.2. test

4. decision test
- if a
  test
  test
- if b
  test
  test
  => 1.
- if c
  -> 4.

5. last
`;

const originParsed = [
  {
    statement: 'normal',
    level: 1,
    content: 'test',
    next: [1],
    id: '1',
  },
  {
    statement: 'normal',
    level: 1,
    content: 'test',
    next: [2],
    id: '2',
  },
  {
    statement: 'repeat-start',
    level: 1,
    content: 'repeat test',
    next: [3],
    id: '3',
  },
  {
    statement: 'normal',
    level: 2,
    content: 'test',
    next: [4],
    id: '3.1',
  },
  {
    statement: 'normal',
    level: 2,
    content: 'test',
    next: [5],
    id: '3.2',
  },
  {
    statement: 'repeat-end',
    level: 1,
    content: '',
    next: [6],
  },
  {
    statement: 'decision',
    level: 1,
    content: 'decision test',
    next: [8, 11, 15],
    id: '4',
  },
  {
    statement: 'condition',
    level: 1,
    content: 'if a',
    next: [],
    id: undefined,
  },
  {
    statement: 'normal',
    level: 2,
    content: 'test',
    next: [9],
    id: undefined,
  },
  {
    statement: 'normal',
    level: 2,
    content: 'test',
    next: [16],
    id: undefined,
  },
  {
    statement: 'condition',
    level: 1,
    content: 'if b',
    next: [],
    id: undefined,
  },
  {
    statement: 'normal',
    level: 2,
    content: 'test',
    next: [12],
    id: undefined,
  },
  {
    statement: 'normal',
    level: 2,
    content: 'test',
    next: [13],
    id: undefined,
  },
  {
    statement: 'next',
    level: 2,
    content: '4.',
    next: [7],
    id: undefined,
  },
  {
    statement: 'condition',
    level: 1,
    content: 'if c',
    next: [],
    id: undefined,
  },
  {
    statement: 'next',
    level: 2,
    content: '1.',
    next: [0],
    id: undefined,
  },
  {
    statement: 'normal',
    level: 1,
    content: 'last',
    next: [],
    id: '5',
  },
];
