import { ConditionNode, DotNode, DotNodeBase, HasChildNode, Statement } from '../types/syntax';

export function parse(text: String): DotNode[] {
  const lines = text.trim().split('\n');
  const indentUnit = findIndentUnit(lines);
  const nodes: DotNode[] = [];

  let parentNode: HasChildNode | undefined = undefined;
  let prevLevel = 0;

  lines.forEach((line, index) => {
    if (line.trim() === '') {
      return;
    }
    const statement = parseStatement(line, index, lines);
    const level = countIndentLevel(line, indentUnit);

    for (let times = 0; times < prevLevel - level; times += 1) {
      if (parentNode) {
        if (isConditionNodeHasSameLevelParent(parentNode)) {
          parentNode = parentNode.parentNode;
        }
        parentNode = parentNode!.parentNode;
      }
    }

    const nodeBase = parseLine(line, parentNode, level);

    switch (statement) {
      case 'decision':
      case 'condition':
      case 'repeat':
        const hasChildNode = { statement, ...nodeBase };
        if (parentNode) {
          parentNode.children.push(hasChildNode);
        } else {
          nodes.push(hasChildNode);
        }
        parentNode = hasChildNode;
        break;
      case 'normal':
      case 'next':
        const singleNode = { statement, ...nodeBase };
        if (parentNode) {
          parentNode.children.push(singleNode);
        } else {
          nodes.push(singleNode);
        }
        break;
    }

    prevLevel = level;
  });

  return nodes;
}

function parseStatement(targetLine: string, targetIndex: number, lines: readonly string[]): Statement {
  if (targetLine.match(/^\s*->/) || targetLine.match(/^\s*=>/)) {
    return 'next';
  }

  if (targetLine.match(/^\s*-/)) {
    return 'condition';
  }

  const nextLine = lines[targetIndex + 1];

  if (!nextLine) {
    return 'normal';
  }

  const targetIndexLevel = countIndentLevel(targetLine);
  const nextIndexLevel = countIndentLevel(nextLine);

  if (targetIndexLevel <= nextIndexLevel && nextLine.match(/^\s*-/)) {
    return 'decision';
  }

  if (targetIndexLevel < nextIndexLevel) {
    return 'repeat';
  }

  return 'normal';
}

function parseLine(targetLine: string, parentNode: HasChildNode | undefined, level: number) {
  const { id, content } = extractContent(targetLine);

  return {
    id,
    content,
    parentNode,
    level,
    children: [],
  };
}

function countIndentLevel(line: string, unit: number = 1) {
  const indentMatch = line.match(/^\s*/g);
  let indent = '';
  if (indentMatch !== null) {
    indent = indentMatch[0];
  }
  const tabs = indent.match(/\t/g);
  const spaces = indent.match(/ /g);
  return ((tabs ? tabs.length : 0) + (spaces ? spaces.length : 0)) / unit;
}

function extractContent(line: string) {
  const contentMatch = line.match(/^\s*(?:(\d+(?:\.\d+)*)\.?|(?:->)|(?:=>)|-)?\s*(.+)$/);

  const content = contentMatch ? contentMatch[2] : '';
  const id = contentMatch && contentMatch[1] !== '' ? contentMatch[1] : undefined;

  return {
    id,
    content,
  };
}

function findIndentUnit(lines: string[]) {
  function uniq<T>(array: T[]) {
    return Array.from(new Set(array));
  }

  function gcdList(numbers: number[]) {
    if (!numbers[0]) {
      return 1;
    }

    if (numbers[0] === 1) {
      return 1;
    }

    return numbers.reduce((acc, number) => {
      let x = acc;
      let y = number;
      while (y === 0) {
        const t = y;
        y = x % y;
        x = t;
      }
      return x;
    }, numbers[0]);
  }

  const levels = uniq(lines.map((line) => countIndentLevel(line))).filter((level) => level !== 0);
  return gcdList(levels);
}

function isConditionNodeHasSameLevelParent(parentNode: DotNode | undefined) {
  return (
    parentNode &&
    parentNode.statement === 'condition' &&
    parentNode.parentNode &&
    parentNode.parentNode.statement === 'decision' &&
    parentNode.level === parentNode.parentNode.level
  );
}
