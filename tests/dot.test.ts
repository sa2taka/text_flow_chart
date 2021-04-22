import { parse } from '../src/dot/syntax_parser';
import { DotNode } from '../src/types/syntax';

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
    expect(actualNode.children.length).toBe(expectedNode.children.length);

    if (actualNode.children.length !== 0) {
      testNodes(actualNode.children, expectedNode.children);
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
  },
  {
    statement: 'normal',
    content: 'test',
    id: '2',
    parent: undefined,
    children: [],
  },
  {
    statement: 'repeat',
    content: 'repeat test',
    id: '3',
    parent: undefined,
    children: [
      {
        statement: 'normal',
        content: 'test',
        id: '3.1',
        children: [],
      },
      {
        statement: 'normal',
        content: 'test',
        id: '3.2',
        children: [],
      },
    ],
  },
  {
    statement: 'decision',
    content: 'decision test',
    id: '4',
    parent: undefined,
    children: [
      {
        statement: 'condition',
        content: 'if a',
        id: undefined,
        children: [
          {
            statement: 'normal',
            content: 'test',
            id: undefined,
            children: [],
          },
          {
            statement: 'normal',
            content: 'test',
            id: undefined,
            children: [],
          },
        ],
      },
      {
        statement: 'condition',
        content: 'if b',
        next: [],
        id: undefined,
        children: [
          {
            statement: 'normal',
            content: 'test',
            id: undefined,
            children: [],
          },
          {
            statement: 'normal',
            content: 'test',
            id: undefined,
            children: [],
          },
          {
            statement: 'next',
            content: '1.',
            id: undefined,
            children: [],
          },
        ],
      },
      {
        statement: 'condition',
        content: 'if c',
        id: undefined,
        parent: undefined,
        children: [
          {
            statement: 'next',
            content: '4.',
            id: undefined,
            children: [],
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
  },
];
