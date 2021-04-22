export type Statement = DotNode['statement'];

export type DotNode = NormalNode | DecisionNode | ConditionNode | RepeatNode | NextNode;
export type HasChildNode = DecisionNode | ConditionNode | RepeatNode;

export interface ParentChildRelation {
  children: DotNode[];
  parentNode?: HasChildNode;
}

export interface DotNodeBase {
  id?: string;
  content: string;
  parentNode?: HasChildNode;
  level: number;
  children: DotNode[];
}

export interface NormalNode extends DotNodeBase {
  statement: 'normal';
  children: never[];
}

export interface DecisionNode extends DotNodeBase, ParentChildRelation {
  statement: 'decision';
}

export interface ConditionNode extends DotNodeBase, ParentChildRelation {
  statement: 'condition';
}

export interface RepeatNode extends DotNodeBase, ParentChildRelation {
  statement: 'repeat';
}

export interface NextNode extends DotNodeBase {
  statement: 'next';
  children: never[];
}
