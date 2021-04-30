import { DotNode, NormalNode, DecisionNode, ConditionNode, RepeatNode, NextNode } from '~/types/syntax';

class Global {
  static defaultSetting = `
  splines = false
  graph [
    charset = "UTF-8";
    labelloc = "t";
    splines =  false;
    nodesep = 0.8;
    ranksep = 0.6;
  ];

  node [

  ];

  edge [

  ];
`;

  static shapes: Record<DotNode['statement'], string> = {
    normal: 'box',
    decision: 'diamond',
    condition: '',
    repeat: 'house',
    next: '',
  };
  static foundationWidth = 1;
  static information = {
    maxLevel: 1,
  };
  static nodes: DotNode[] = [];
}

export function createDot(nodes: DotNode[]): string {
  Global.nodes = nodes;
  const maxLevel = findMaxLevel(Global.nodes);

  Global.information.maxLevel = maxLevel;

  return (
    'digraph {' +
    Global.defaultSetting +
    '\n\n' +
    Global.nodes.map((node, index) => createDotDefinition(node, index, [])).join('\n') +
    '\n' +
    '}'
  );
}

function createDotDefinition(node: DotNode, index: number, locus: number[]): string {
  switch (node.statement) {
    case 'normal':
      return createNormalDot(node, index, locus);
    case 'decision':
      return createDecisionDot(node, index, locus);
    case 'condition':
      return createConditionDot(node, index, locus);
    case 'repeat':
      return `subgraph repeat {
  label="repeat";
${createRepeatDot(node, index, locus)}
}`;
    case 'next':
      return createNextDot(node, index, locus);
  }
}

function createNormalDot(node: NormalNode, index: number, locus: number[]): string {
  const width = calculateWidth(node.level);
  const nodeDefinition = createNodeDot(node, getNodeId(index, locus), width);

  return nodeDefinition + '\n\n' + createLinkBeforeEdgeDot(node, index, locus);
}

function createDecisionDot(node: DecisionNode, index: number, locus: number[]): string {
  const width = calculateWidth(node.level);
  const nodeDefinition = createNodeDot(node, getNodeId(index, locus), width);
  const childLocus = locus.concat([index]);
  const childrenDifinition = node.children
    .map((node, childIndex) => createDotDefinition(node, childIndex, childLocus))
    .join('\n');

  return nodeDefinition + '\n' + childrenDifinition + '\n\n' + createLinkBeforeEdgeDot(node, index, locus);
}

function createConditionDot(node: ConditionNode, index: number, locus: number[]): string {
  console.assert(!(index === 0 && locus.length === 0), 'Condition statement does not locate at the top.');

  const childLocus = locus.concat([index]);
  return node.children.map((node, childIndex) => createDotDefinition(node, childIndex, childLocus)).join('\n');
}

function createRepeatDot(node: RepeatNode, index: number, locus: number[]): string {
  const lastShape = 'invhouse';
  const width = calculateWidth(node.level);
  const nodeId = getNodeId(index, locus);

  const nodeDefinition = createNodeDot(node, nodeId, width);
  const repeatTerminatorNodeId = `${nodeId}_end`;
  const repeatTerminatorNodeDefinition = `  ${repeatTerminatorNodeId} [shape = ${lastShape}; width = ${width}; label = ""];`;
  const childLocus = locus.concat([index]);
  const childrenDifinition = node.children
    .map((node, childIndex) => createDotDefinition(node, childIndex, childLocus))
    .join('\n');

  const repeatTerminatorEdgeDefinitions: string[] = [];
  const lastChildIndex = node.children.length - 1;
  const lastChild = node.children[lastChildIndex];

  switch (lastChild.statement) {
    case 'decision':
      repeatTerminatorEdgeDefinitions.push(
        ...getDicisionEdges(lastChild, childLocus.concat(lastChildIndex), repeatTerminatorNodeId)
      );
      break;
    case 'repeat':
      repeatTerminatorEdgeDefinitions.push(
        `${getNodeId(lastChildIndex, childLocus) + '_end'} -> ${repeatTerminatorNodeId}`
      );
      break;
    case 'next':
    case 'normal':
      repeatTerminatorEdgeDefinitions.push(`${getNodeId(lastChildIndex, childLocus)} -> ${repeatTerminatorNodeId}`);
      break;
  }

  return (
    nodeDefinition +
    '\n' +
    childrenDifinition +
    '\n' +
    repeatTerminatorNodeDefinition +
    '\n\n' +
    repeatTerminatorEdgeDefinitions.join('\n') +
    '\n' +
    createLinkBeforeEdgeDot(node, index, locus)
  );
}

function calculateWidth(level: number) {
  return (Global.foundationWidth * Global.information.maxLevel) / (level + 1);
}

function createNextDot(node: NextNode, index: number, locus: number[]): string {
  console.assert(!(index === 0 && locus.length === 0), 'Next statement is not at the top.');
  console.assert(node.parentNode?.statement === 'condition', 'Next statement should be in condition statement');

  let prevId = '';

  if (index === 0) {
    const parentNode = node.parentNode;
    const workLocus = locus.slice();
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
  const nextId = getNodeId(nextNodeLocus[nextNodeLocus.length - 1], nextNodeLocus.slice(0, nextNodeLocus.length - 1));

  const emptyEdgeFrom = `  ${nextId}_empty [width = 0; shape = point; label = "";];`;
  const emptyEdgeTo = `  ${prevId}_empty [width = 0; shape = point; label = "";];`;
  const rankFrom = `  { rank=same; ${prevId}; ${prevId}_empty; };`;
  const rankTo = `  { rank=same; ${nextId}; ${nextId}_empty; };`;
  const edges = `  ${prevId} -> ${prevId}_empty [dir = none; arrowhead = none; weight=999; ]
  ${prevId}_empty -> ${nextId}_empty [dir = none; arrowhead = none];
  ${nextId} ->  ${nextId}_empty  [dir = back; weight=999;]`;

  return `${emptyEdgeFrom}\n${emptyEdgeTo}\n${rankFrom}\n${rankTo}\n${edges}`;
}

function createNodeDot(node: DotNode, nodeId: string, width: number) {
  console.assert(
    Global.shapes[node.statement] && Global.shapes[node.statement] !== '',
    'The node statement has not defined shape.'
  );

  const shape = Global.shapes[node.statement];
  const content = replaceSpecialCharacters(node.content);
  return `  ${nodeId} [shape = ${shape}; label = "${content}"; width = ${width};];`;
}

function createLinkBeforeEdgeDot(targetNode: DotNode, targetIndex: number, locus: number[]) {
  console.assert(targetNode.statement !== 'condition', 'Condition node must not have edge.');
  console.assert(targetNode.statement !== 'next', 'Next node must not have edge.');
  if (targetNode.statement === 'condition') {
    return '';
  }

  if (targetIndex === 0 && locus.length === 0) {
    return '';
  }

  const parent = targetNode.parentNode;
  const targetNodeId = getNodeId(targetIndex, locus);

  if (targetIndex === 0) {
    if (!parent) {
      return '';
    }
    // Target node is first child.
    switch (parent?.statement) {
      case 'repeat': {
        const parentIndex = locus[locus.length - 1];
        const parentNodeId = getNodeId(parentIndex, locus.slice(0, locus.length - 1));
        return `  ${parentNodeId} -> ${targetNodeId}`;
      }
      case 'condition': {
        const parentIndex = locus[locus.length - 2];
        const parentNodeId = getNodeId(parentIndex, locus.slice(0, locus.length - 2));
        const conditionLabel = replaceSpecialCharacters(parent.content);

        return `  ${parentNodeId} -> ${targetNodeId} [label = "${conditionLabel}"]`;
      }
    }
  } else {
    const prevNodeIndex = targetIndex - 1;
    const prevNode = (targetNode.parentNode?.children || Global.nodes)[prevNodeIndex];
    const prevNodeId = getNodeId(prevNodeIndex, locus);

    switch (prevNode.statement) {
      case 'normal':
        return `  ${prevNodeId} -> ${targetNodeId}`;
      case 'repeat':
        return `  ${prevNodeId}_end -> ${targetNodeId}`;
      case 'decision':
        return getDicisionEdges(prevNode, locus.concat(prevNodeIndex), targetNodeId).join('\n');
    }
  }
  return '';
}

function getDicisionEdges(
  decisionNode: DecisionNode,
  decisionNodeLocus: readonly number[],
  targetNodeId: string
): string[] {
  return decisionNode.children
    .flatMap((conditionNode, conditionIndex) => {
      if (conditionNode.children.length === 0) {
        const decisionNodeId = getNodeId(
          decisionNodeLocus[decisionNodeLocus.length - 1],
          decisionNodeLocus.slice(0, decisionNodeLocus.length - 1)
        );
        return `  ${decisionNodeId}-> ${targetNodeId}  [label = "${conditionNode.content}"]`;
      }
      const childIndex = conditionNode.children.length - 1;
      const node = conditionNode.children[conditionNode.children.length - 1];

      const lastChildNodeId = getNodeId(childIndex, decisionNodeLocus.concat(conditionIndex));
      switch (node.statement) {
        case 'decision':
          return getDicisionEdges(node, decisionNodeLocus.concat(conditionIndex, childIndex), targetNodeId);
        case 'next':
          return undefined;
        case 'repeat':
          return `  ${lastChildNodeId}_end -> ${targetNodeId}`;
        case 'normal':
          return `  ${lastChildNodeId} -> ${targetNodeId}`;
      }
    })
    .filter((nodeId) => nodeId) as string[];
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
      const childMaxLevel = findMaxLevel(s.children);
      return acc > childMaxLevel ? acc : childMaxLevel;
    }
    return acc > s.level + 1 ? acc : s.level + 1;
  }, 1);
}

function getNodeId(index: number, locus: readonly number[]) {
  return 'node_' + (locus.length === 0 ? '' : locus.join('_') + '_') + index.toString();
}

function replaceSpecialCharacters(str: string) {
  return str.replaceAll('"', '\\"');
}
