import { ConditionNode, DecisionNode, DotNode, DotNodeBase, HasChildNode, Statement } from '../types/syntax';
import { gcd } from 'mathjs';

type DotNodeBaseWithoutStatement = Pick<DotNode, Exclude<keyof DotNodeBase, 'statement'>>;

export function parse(text: string): DotNode[] {
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
      if ((statement !== 'condition' || parentNode?.level !== level) && isConditionNodeHasSameLevelParent(parentNode)) {
        parentNode = parentNode?.parentNode;
      }
      if (parentNode) {
        parentNode = parentNode.parentNode;
      }
    }

    const nodeBase = parseLine(line, level);

    parentNode = divideNode(statement, nodeBase, parentNode, nodes, index);

    prevLevel = level;
  });

  return nodes;
}

function divideNode(
  statement: string,
  nodeBase: DotNodeBaseWithoutStatement,
  parentNode: HasChildNode | undefined,
  nodes: DotNode[],
  lineNumber: number
) {
  switch (statement) {
    case 'condition': {
      if (parentNode?.statement !== 'decision') {
        throw SyntaxError(`line ${lineNumber}: Condition node must be child of decision statement.`);
      }
      const conditionNode = { statement, ...nodeBase, children: [], parentNode } as ConditionNode;
      if (parentNode) {
        (parentNode as DecisionNode).children.push(conditionNode);
      } else {
        nodes.push(conditionNode);
      }
      parentNode = conditionNode;
      break;
    }
    case 'decision':
    case 'repeat': {
      if (parentNode?.statement === 'decision') {
        throw SyntaxError(`line ${lineNumber}:Decision node children must be condition statements.`);
      }
      const hasChildNode = { statement, ...nodeBase, children: [], parentNode };
      if (parentNode) {
        (parentNode.children as DotNode[]).push(hasChildNode);
      } else {
        nodes.push(hasChildNode);
      }
      parentNode = hasChildNode;
      break;
    }
    case 'normal':
    case 'next': {
      if (parentNode?.statement === 'decision') {
        throw SyntaxError(`line ${lineNumber}: Decision node children must be condition statements.`);
      }
      const singleNode = { statement, ...nodeBase, parentNode };
      if (parentNode) {
        (parentNode.children as DotNode[]).push(singleNode);
      } else {
        nodes.push(singleNode);
      }
      break;
    }
  }
  return parentNode;
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

  if (targetIndexLevel <= nextIndexLevel && nextLine.match(/^\s*-[^>]/)) {
    return 'decision';
  }

  if (targetIndexLevel < nextIndexLevel) {
    return 'repeat';
  }

  return 'normal';
}

function parseLine(targetLine: string, level: number): DotNodeBaseWithoutStatement {
  const { id, content } = extractContent(targetLine);

  return {
    id,
    content,
    level,
  };
}

function countIndentLevel(line: string, unit = 1) {
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

  const levels = uniq(lines.map((line) => countIndentLevel(line))).filter((level) => level !== 0);
  if (levels.length === 1) {
    return levels[0];
  } else if (levels.length === 0) {
    return 0;
  }
  return gcd(...levels);
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
