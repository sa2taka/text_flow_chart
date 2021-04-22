import { DotNode, NormalNode, DecisionNode, ConditionNode, RepeatNode, NextNode } from '~/types/syntax';
import { parse } from './syntax_parser';

const defaultSetting = `
  graph [
    charset = "UTF-8";
    labelloc = "t";
    splines =  false;
    nodesep = 0.8;
  ];

  node [

  ];

  edge [

  ];
`;

const shapes: Record<DotNode['statement'], string> = {
  normal: 'box',
  decision: 'diamond',
  condition: '',
  repeat: 'house',
  next: '',
};
const foundationWidth = 1;

export function createDotFromText(text: String) {
  const nodes = parse(text);
  const maxLevel = nodes.reduce((acc, s) => (acc > s.level ? acc : s.level), -1);

  return nodes.map((node, index) => createDotDefinition(node, maxLevel, index)).join('\n');
}

function createDotDefinition(node: DotNode, maxLevel: number, index: number, locus: number[] = []): String {
  switch (node.statement) {
    case 'normal':
      return createNormalDot(node, maxLevel, index, locus);
    case 'decision':
      return createDecisionDot(node, maxLevel, index, locus);
    case 'condition':
      return createConditionDot(node, maxLevel, index, locus);
    case 'repeat':
      return createRepeatDot(node, maxLevel, index, locus);
    case 'next':
      return createNextDot(node, maxLevel, index, locus);
  }
}

function createNormalDot(node: NormalNode, maxLevel: number, index: number, locus: number[] = []): String {
  const width = (foundationWidth * maxLevel) / node.level;
  const nodeDefinition = createNodeDot(node, locus.join('-') + index.toString(), width);

  if (index === 0 && locus.length === 0) {
    return nodeDefinition;
  }

  return '';
}

function createDecisionDot(node: DecisionNode, maxLevel: number, index: number, locus: number[] = []): String {
  const width = (foundationWidth * maxLevel) / node.level;
  const nodeDefinition = createNodeDot(node, locus.join('-') + index.toString(), width);

  if (index === 0 && locus.length === 0) {
    return nodeDefinition;
  }
  return '';
}

function createConditionDot(node: ConditionNode, maxLevel: number, index: number, locus: number[] = []): String {
  return '';
}

function createRepeatDot(node: RepeatNode, maxLevel: number, index: number, locus: number[] = []): String {
  const lastShape = 'invhouse';
  const width = (foundationWidth * maxLevel) / node.level;
  const nodeDefinition = createNodeDot(node, locus.join('-') + index.toString(), width);

  if (index === 0 && locus.length === 0) {
    return nodeDefinition;
  }
  return '';
}

function createNextDot(node: NextNode, maxLevel: number, index: number, locus: number[] = []): String {
  return '';
}

function createNodeDot(node: DotNode, edgeId: string, width: number) {
  console.assert(shapes[node.statement] !== '', 'Should define shape.');
  const shape = shapes[node.statement];
  const content = replaceSpecialCharacters(node.content);
  return `  edge${edgeId} [shape = ${shape}, label = "${content}" width = ${width};];`;
}

function replaceSpecialCharacters(str: string) {
  return str.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
