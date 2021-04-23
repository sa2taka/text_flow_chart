export type Statement = DotNode['statement'];

export type DotNode = NormalNode | DecisionNode | ConditionNode | RepeatNode | NextNode;
export type HasChildNode = DecisionNode | ConditionNode | RepeatNode;

export interface DotNodeBase {
  readonly statement: Statement;
  readonly id?: string;
  readonly content: string;
  readonly parentNode?: HasChildNode;
  readonly level: number;
}

export interface NormalNode extends DotNodeBase {
  statement: 'normal';
}

export interface DecisionNode extends DotNodeBase {
  statement: 'decision';
  readonly children: ConditionNode[];
}

export interface ConditionNode extends DotNodeBase {
  statement: 'condition';
  readonly parentNode: DecisionNode;
  readonly children: DotNode[];
}

export interface RepeatNode extends DotNodeBase {
  statement: 'repeat';
  readonly children: DotNode[];
}

export interface NextNode extends DotNodeBase {
  statement: 'next';
}
