import { parse } from '../src/dot/syntax_parser';
import { DotNode } from '../src/types/syntax';
import TextFlowChart from '../src/text_flow_chart';

test('create dot', () => {
  const dot = TextFlowChart.convertToDot(`1. normal line
2. condition line
- if condition
  process in condition
  - nested if condition
    nested process
  - nested if another condition
    nested another process
- if another
  another process
  multi line
- if back to 1
  => 1
3. repeat line
  3.1. indent lines without condition is considered "repeat"
  3.2. multi repeat
`);
  console.log(dot);
});

test('parse syntax', () => {
  const actual = parse(originText);
  testNodes(actual, originParsed);
});

function testNodes(actual: DotNode[], expected: any[]) {
  for (let index in actual) {
    const actualNode = actual[index];
    const expectedNode = expected[index];
    expect(actualNode.id).toBe(expectedNode.id);
    expect(actualNode.content).toBe(expectedNode.content);
    expect(actualNode.statement).toBe(expectedNode.statement);
    expect(actualNode.level).toBe(expectedNode.level);
    if (
      actualNode.statement === 'condition' ||
      actualNode.statement === 'decision' ||
      actualNode.statement === 'repeat'
    ) {
      expect(actualNode.children.length).toBe(expectedNode.children.length);

      if (actualNode.children.length !== 0) {
        testNodes(actualNode.children, expectedNode.children);
      }
    }
  }
}

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
    content: 'test',
    id: '1',
    parent: undefined,
    children: [],
    level: 0,
  },
  {
    statement: 'normal',
    content: 'test',
    id: '2',
    parent: undefined,
    children: [],
    level: 0,
  },
  {
    statement: 'repeat',
    content: 'repeat test',
    id: '3',
    parent: undefined,
    level: 0,
    children: [
      {
        statement: 'normal',
        content: 'test',
        id: '3.1',
        children: [],
        level: 1,
      },
      {
        statement: 'normal',
        content: 'test',
        id: '3.2',
        children: [],
        level: 1,
      },
    ],
  },
  {
    statement: 'decision',
    content: 'decision test',
    id: '4',
    parent: undefined,
    level: 0,
    children: [
      {
        statement: 'condition',
        content: 'if a',
        id: undefined,
        level: 0,
        children: [
          {
            statement: 'normal',
            content: 'test',
            id: undefined,
            children: [],
            level: 1,
          },
          {
            statement: 'normal',
            content: 'test',
            id: undefined,
            children: [],
            level: 1,
          },
        ],
      },
      {
        statement: 'condition',
        content: 'if b',
        next: [],
        id: undefined,
        level: 0,
        children: [
          {
            statement: 'normal',
            content: 'test',
            id: undefined,
            children: [],
            level: 1,
          },
          {
            statement: 'normal',
            content: 'test',
            id: undefined,
            children: [],
            level: 1,
          },
          {
            statement: 'next',
            content: '1.',
            id: undefined,
            children: [],
            level: 1,
          },
        ],
      },
      {
        statement: 'condition',
        content: 'if c',
        id: undefined,
        parent: undefined,
        level: 0,
        children: [
          {
            statement: 'next',
            content: '4.',
            id: undefined,
            children: [],
            level: 1,
          },
        ],
      },
    ],
  },
  {
    statement: 'normal',
    content: 'last',
    id: '5',
    parent: undefined,
    children: [],
    level: 0,
  },
];
