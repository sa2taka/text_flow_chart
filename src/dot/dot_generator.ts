import { DotNode, NormalNode, DecisionNode, ConditionNode, RepeatNode, NextNode } from '~/types/syntax';

namespace Global {
  export const defaultSetting = `
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

  export const shapes: Record<DotNode['statement'], string> = {
    normal: 'box',
    decision: 'diamond',
    condition: '',
    repeat: 'house',
    next: '',
  };
  export const foundationWidth = 1;
  export const globalInformation = {
    maxLevel: 1,
  };
  export let nodes: DotNode[] = [];
}

export function createDot(nodes: DotNode[]) {
  Global.nodes = nodes;
  const maxLevel = findMaxLevel(Global.nodes);

  Global.globalInformation.maxLevel = maxLevel;

  return (
    'digraph {' +
    Global.defaultSetting +
    '\n\n' +
    Global.nodes.map((node, index) => createDotDefinition(node, index, [])).join('\n') +
    '\n' +
    '}'
  );
}

function createDotDefinition(node: DotNode, index: number, locus: number[]): String {
  switch (node.statement) {
    case 'normal':
      return createNormalDot(node, index, locus);
    case 'decision':
      return createDecisionDot(node, index, locus);
    case 'condition':
      return createConditionDot(node, index, locus);
    case 'repeat':
      return createRepeatDot(node, index, locus);
    case 'next':
      return createNextDot(node, index, locus);
  }
}

function createNormalDot(node: NormalNode, index: number, locus: number[]): String {
  const width = (Global.foundationWidth * Global.globalInformation.maxLevel) / (node.level + 1);
  const nodeDefinition = createNodeDot(node, getNodeId(index, locus), width);

  return nodeDefinition + '\n\n' + createLinkBeforeEdgeDot(node, index, locus);
}

function createDecisionDot(node: DecisionNode, index: number, locus: number[]): String {
  const width = (Global.foundationWidth * Global.globalInformation.maxLevel) / (node.level + 1);
  const nodeDefinition = createNodeDot(node, getNodeId(index, locus), width);
  const childLocus = locus.concat([index]);
  const childrenDifinition = node.children
    .map((node, childIndex) => createDotDefinition(node, childIndex, childLocus))
    .join('\n');

  return nodeDefinition + '\n' + childrenDifinition + '\n\n' + createLinkBeforeEdgeDot(node, index, locus);
}

function createConditionDot(node: ConditionNode, index: number, locus: number[]): String {
  console.assert(!(index === 0 && locus.length === 0), 'Condition statement does not locate at the top.');

  const childLocus = locus.concat([index]);
  const childrenDifinition = node.children
    .map((node, childIndex) => createDotDefinition(node, childIndex, childLocus))
    .join('\n');

  return childrenDifinition;
}

function createRepeatDot(node: RepeatNode, index: number, locus: number[]): String {
  const lastShape = 'invhouse';
  const width = (Global.foundationWidth * Global.globalInformation.maxLevel) / (node.level + 1);
  const nodeId = getNodeId(index, locus);

  const nodeDefinition = createNodeDot(node, nodeId, width);
  const repeatTerminatorNodeDefinition = `  ${nodeId}_end [shape = ${lastShape}, width = ${width}, label = ""];`;
  const childLocus = locus.concat([index]);
  const childrenDifinition = node.children
    .map((node, childIndex) => createDotDefinition(node, childIndex, childLocus))
    .join('\n');

  const lastChildIndex = node.children.length - 1;
  const lastChildNodeId = getNodeId(lastChildIndex, childLocus);

  const repeatTerminatorEdgeDefinition = `  ${lastChildNodeId} -> ${nodeId}_end`;
  return (
    nodeDefinition +
    '\n' +
    childrenDifinition +
    '\n' +
    repeatTerminatorNodeDefinition +
    '\n\n' +
    repeatTerminatorEdgeDefinition +
    '\n' +
    createLinkBeforeEdgeDot(node, index, locus)
  );
}

function createNextDot(node: NextNode, index: number, locus: number[]): String {
  console.assert(!(index === 0 && locus.length === 0), 'Next statement is not at the top.');
  console.assert(node.parentNode?.statement === 'condition', 'Next statement should be in condition statement');

  let prevId = '';

  if (index === 0) {
    let parentNode = node.parentNode;
    let workLocus = locus.slice();
    if (parentNode?.statement === 'condition') {
      workLocus.pop();
    }

    const parentIndex = workLocus[workLocus.length - 1];
    prevId = getNodeId(parentIndex, workLocus.slice(0, workLocus.length - 1));
  } else {
    prevId = getNodeId(index - 1, locus);
  }

  const nextNodeLocus = search(node.content);
  if (!nextNodeLocus || nextNodeLocus.length === 0) {
    throw Error('Id not find');
  }
  const nextIndex = nextNodeLocus.pop()!;
  const nextId = getNodeId(nextIndex, nextNodeLocus);

  const emptyEdgeFrom = `  ${nextId}_empty [width = 0; shape = point; label = "";];`;
  const emptyEdgeTo = `  ${prevId}_empty [width = 0; shape = point; label = "";];`;
  const rankFrom = `  { rank=same;  ${prevId}; ${prevId}_empty; };`;
  const rankTo = `  { rank=same; ${nextId}; ${nextId}_empty;  };`;
  const edges = `  ${prevId} -> ${prevId}_empty [dir = none; arrowhead = none]
  ${prevId}_empty -> ${nextId}_empty [dir = none; arrowhead = none];
  ${nextId} ->  ${nextId}_empty  [dir = back]`;

  return `${emptyEdgeFrom}\n${emptyEdgeTo}\n${rankFrom}\n${rankTo}\n${edges}`;
}

function createNodeDot(node: DotNode, nodeId: string, width: number) {
  console.assert(
    Global.shapes[node.statement] && Global.shapes[node.statement] !== '',
    'The node statement has not defined shape.'
  );

  const shape = Global.shapes[node.statement];
  const content = replaceSpecialCharacters(node.content);
  return `  ${nodeId} [shape = ${shape}, label = "${content}" width = ${width};];`;
}

function createLinkBeforeEdgeDot(targetNode: DotNode, targetIndex: number, locus: number[]) {
  console.assert(targetNode.statement !== 'condition', 'Condition node must not have edge.');
  if (targetNode.statement === 'condition') {
    return '';
  }

  if (targetIndex === 0 && locus.length === 0) {
    return '';
  }

  const parent = targetNode.parentNode!;
  const targetNodeId = getNodeId(targetIndex, locus);

  if (targetIndex === 0) {
    // Target node is first child.
    if (parent.statement !== 'condition') {
      const parentIndex = locus[locus.length - 1];
      const parentNodeId = getNodeId(parentIndex, locus.slice(0, locus.length - 1));
      return `  ${parentNodeId} -> ${targetNodeId}`;
    } else {
      const conditionLabel = replaceSpecialCharacters(parent.content);
      const parentIndex = locus[locus.length - 2];
      const parentNodeId = getNodeId(parentIndex, locus.slice(0, locus.length - 2));
      return `  ${parentNodeId} -> ${targetNodeId} [label = "${conditionLabel}"]`;
    }
  } else {
    const prevNode = (targetNode.parentNode?.children || Global.nodes)[targetIndex - 1];
    const prevNodeId = getNodeId(targetIndex - 1, locus);

    switch (prevNode.statement) {
      case 'normal':
        return `  ${prevNodeId} -> ${targetNodeId}`;
      case 'repeat':
        return `  ${prevNodeId}_end -> ${targetNodeId}`;
      case 'decision':
        return prevNode.children
          .map((conditionNode, conditionIndex) => {
            const childIndex = conditionNode.children.length - 1;
            const node = conditionNode.children[conditionNode.children.length - 1];
            if (node.statement === 'next') {
              return undefined;
            }

            const nodeId = getNodeId(
              childIndex,
              locus.slice(0, locus.length - 1).concat(targetIndex - 1, conditionIndex)
            );
            return `  ${nodeId} -> ${targetNodeId}`;
          })
          .filter((elm) => elm)
          .join('\n');
    }
  }
  return '';
}

function search(id: string, nodes?: DotNode[], nowLocus: number[] = []): number[] | undefined {
  nodes ||= Global.nodes;
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (equalsId(id, node.id)) {
      return nowLocus.concat(index);
    }

    if (node.statement === 'condition' || node.statement === 'decision' || node.statement === 'repeat') {
      const result = search(id, node.children, nowLocus.concat(index));
      if (result) {
        return result;
      }
    }
  }
  return undefined;
}

function equalsId(nextNodeContent: string, id?: string) {
  return id === nextNodeContent || id === nextNodeContent.replace(/\.$/, '');
}

function findMaxLevel(nodes: DotNode[]): number {
  return nodes.reduce((acc, s) => {
    if (s.statement === 'decision' || s.statement === 'condition' || s.statement === 'repeat') {
      return findMaxLevel(s.children);
    }
    return acc > s.level + 1 ? acc : s.level + 1;
  }, -1);
}

function getNodeId(index: number, locus: number[]) {
  return 'node_' + (locus.length === 0 ? '' : locus.join('_') + '_') + index.toString();
}

function replaceSpecialCharacters(str: string) {
  return str.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
