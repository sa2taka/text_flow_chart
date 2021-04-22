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
const foundationWidth = 1;

export function createDotFromText(text: String) {
  const nodes = parse(text);

  return '';
}

function createDotDefinition(node: DotNode): String {
  switch (node.statement) {
    case 'normal':
      return createNormalNodeDot(node);
    case 'decision':
      return createDecisionNodeDot(node);
    case 'condition':
      return createConditionNodeDot(node);
    case 'repeat':
      return createRepeatNodeDot(node);
    case 'next':
      return createNextNodeDot(node);
  }
}

function createNormalNodeDot(node: NormalNode): String {
  return '';
}

function createDecisionNodeDot(node: DecisionNode): String {
  return '';
}

function createConditionNodeDot(node: ConditionNode): String {
  return '';
}

function createRepeatNodeDot(node: RepeatNode): String {
  return '';
}

function createNextNodeDot(node: NextNode): String {
  return '';
}
