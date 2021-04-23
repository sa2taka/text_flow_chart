export type Statement = DotNode['statement'];

export type DotNode = NormalNode | DecisionNode | ConditionNode | RepeatNode | NextNode;
export type HasChildNode = DecisionNode | ConditionNode | RepeatNode;

export interface DotNodeBase {
  readonly statement: Statement;
  readonly id?: string;
  readonly content: string;
  readonly level: number;
}

export interface NormalChildNode extends DotNodeBase {
  readonly parentNode?: ConditionNode | RepeatNode;
}

export interface NormalNode extends NormalChildNode {
  statement: 'normal';
  readonly parentNode?: ConditionNode | RepeatNode;
}

export interface DecisionNode extends NormalChildNode {
  statement: 'decision';
  readonly children: ConditionNode[];
}

export interface ConditionNode extends DotNodeBase {
  statement: 'condition';
  readonly parentNode: DecisionNode;
  readonly children: (NormalNode | DecisionNode | RepeatNode | NextNode)[];
}

export interface RepeatNode extends NormalChildNode {
  statement: 'repeat';
  readonly children: (NormalNode | DecisionNode | RepeatNode | NextNode)[];
}

export interface NextNode extends NormalChildNode {
  statement: 'next';
  readonly parentNode?: ConditionNode | RepeatNode;
}
