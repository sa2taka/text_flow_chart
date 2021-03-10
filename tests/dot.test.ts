import { createDotFromText } from '../src/dot';
import rewire from 'rewire';

test('generate dot', () => {
  const dot = createDotFromText(originText);
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
  4.1 test
  4.2 test
- if b
  4.1 test
  4.2 test
5. last
`;

const originParsed = [
  {
    statement: 'normal',
    level: 1,
    content: 'test',
    next: [1],
  },
  {
    statement: 'normal',
    level: 1,
    content: 'test',
    next: [2],
  },
  {
    statement: 'repeat-start',
    level: 1,
    content: 'repeat test',
    next: [3],
  },
  {
    statement: 'normal',
    level: 2,
    content: 'test',
    next: [4],
  },
  {
    statement: 'normal',
    level: 2,
    content: 'test',
    next: [5],
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
    next: [8, 11],
  },
  {
    statement: 'condition',
    level: 1,
    content: 'if a',
    next: [],
  },
  {
    statement: 'normal',
    level: 2,
    content: 'test',
    next: [9],
  },
  {
    statement: 'normal',
    level: 2,
    content: 'test',
    next: [13],
  },
  {
    statement: 'condition',
    level: 1,
    content: 'if b',
    next: [],
  },
  {
    statement: 'normal',
    level: 2,
    content: 'test',
    next: [12],
  },
  {
    statement: 'normal',
    level: 2,
    content: 'test',
    next: [13],
  },
  {
    statement: 'normal',
    level: 1,
    content: 'last',
    next: [],
  },
];
