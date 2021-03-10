interface Syntax {
  statement: 'normal' | 'decision' | 'condition' | 'repeat-start' | 'repeat-end';
  level: number;
  content: string;
  next: number[];
  id?: string;
}

export function createDotFromText(text: String) {
  const parsed = parse(text);

  const nodeDefinition = createNodeDefinition(parsed);
  const edgeDefinition = createEdgeDefinition(parsed);
  return `digraph {\n ${defaultSetting}\n${nodeDefinition}\n${edgeDefinition}\n}`;
}

function createNodeDefinition(syntaxes: Syntax[]) {
  function getShape(s: Syntax) {
    switch (s.statement) {
      case 'normal':
        return 'box';
      case 'decision':
        return 'diamond';
      case 'repeat-start':
        return 'house';
      case 'repeat-end':
        return 'invhouse';
      case 'condition':
        return '';
    }
  }

  return syntaxes
    .map((s, index) => {
      if (s.statement === 'condition') {
        return null;
      }
      const shape = getShape(s);
      return `  edge${index} [shape = ${shape}, label = "${s.content}"];`;
    })
    .filter((s) => s)
    .join('\n');
}

function createEdgeDefinition(syntaxes: Syntax[]) {
  function findConditions(targetSyntax: Syntax, startIndex: number, syntaxes: Syntax[]) {
    const conditions = [];
    for (let i = startIndex + 1; i < syntaxes.length; i++) {
      if (syntaxes[i].level <= targetSyntax.level && syntaxes[i].statement !== 'condition') {
        break;
      }

      if (syntaxes[i].level <= targetSyntax.level && syntaxes[i].statement === 'condition') {
        conditions.push(syntaxes[i].content);
      }
    }
    return conditions;
  }
  return syntaxes
    .map((s, index) => {
      if (s.statement === 'condition') {
        return null;
      }
      if (s.statement !== 'decision') {
        return s.next.map((n) => `  edge${index} -> edge${n}`).join('\n');
      }

      const conditions = findConditions(s, index, syntaxes);

      return s.next.map((n, nIndex) => `  edge${index} -> edge${n} [label = "${conditions[nIndex]}"];`).join('\n');
    })
    .filter((s) => s)
    .join('\n');
}

function parse(text: String): Syntax[] {
  let parsed = text
    .trim()
    .split('\n')
    .map((l) => parseLine(l))
    .filter((l) => typeof l !== 'undefined') as Syntax[];
  adjustLevel(parsed);
  setStatement(parsed);
  setRepeatEnd(parsed);
  setLink(parsed);
  return parsed;
}

function parseLine(line: string): Syntax | undefined {
  if (line.trim() === '') {
    return undefined;
  }
  const indentMatch = line.match(/^\s*/g);
  let indent = '';
  if (indentMatch !== null) {
    indent = indentMatch[0];
  }
  const tabs = indent.match(/\t/g);
  const spaces = indent.match(/  /g);
  const level = (tabs ? tabs.length : 0) + (spaces ? spaces.length : 0) + 1;
  const content = line.match(/^\s*(?:(\d+(?:\.\d+)*)\.?|-?)\s+(.+)?$/);
  const statement = line.match(/^\s*-/) ? 'condition' : 'normal';

  return {
    statement,
    level,
    content: content ? content[2] : '',
    next: [],
    id: content && content[1] !== '' ? content[1] : undefined,
  };
}

function adjustLevel(syntaxes: Syntax[]) {
  function uniq<T>(array: T[]) {
    return Array.from(new Set(array));
  }

  function gcdList(numbers: number[]) {
    if (numbers[0]) {
      return 1;
    }

    if (numbers[0] == 1) {
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

  const levels = uniq(syntaxes.map((s) => s.level));
  const gcd = gcdList(levels);
  syntaxes.forEach((s) => {
    s.level = s.level / gcd;
  });
  return syntaxes;
}

function setStatement(syntaxes: Syntax[]) {
  function isRepeatStatement(syntaxes: Syntax[], targetSyntax: Syntax, targetSyntaxIndex: number) {
    if (targetSyntaxIndex >= syntaxes.length) {
      return false;
    }

    if (
      targetSyntax.level < syntaxes[targetSyntaxIndex + 1]?.level &&
      syntaxes[targetSyntaxIndex + 1]?.statement !== 'condition'
    ) {
      return true;
    }

    return false;
  }

  function isIfStatement(syntaxes: Syntax[], targetSyntax: Syntax, targetSyntaxIndex: number) {
    if (targetSyntaxIndex >= syntaxes.length) {
      return false;
    }

    if (
      targetSyntax.level <= syntaxes[targetSyntaxIndex + 1]?.level &&
      syntaxes[targetSyntaxIndex + 1]?.statement === 'condition'
    ) {
      return true;
    }

    return false;
  }

  syntaxes.forEach((s, index) => {
    if (s.statement === 'condition') {
      return;
    }

    if (isRepeatStatement(syntaxes, s, index)) {
      s.statement = 'repeat-start';
    } else if (isIfStatement(syntaxes, s, index)) {
      s.statement = 'decision';
    }
  });
  return syntaxes;
}

function setLink(syntaxes: Syntax[]) {
  function findNextLink(syntaxes: Syntax[], targetSyntax: Syntax, targetSyntaxIndex: number) {
    if (targetSyntaxIndex + 1 >= syntaxes.length) {
      return [];
    }
    if (targetSyntax.statement === 'condition') {
      return [];
    }
    if (targetSyntax.statement !== 'decision' && syntaxes[targetSyntaxIndex + 1]?.statement !== 'condition') {
      return [targetSyntaxIndex + 1];
    } else if (targetSyntax.statement !== 'decision') {
      for (let i = targetSyntaxIndex; i < syntaxes.length; i++) {
        if (targetSyntax.level > syntaxes[i].level && syntaxes[i].statement !== 'condition') {
          return [i];
        }
      }
      return [];
    }

    const retVal = [];
    for (let i = targetSyntaxIndex; i < syntaxes.length; i++) {
      if (syntaxes[i].statement === 'condition' && i + 1 < syntaxes.length) {
        retVal.push(i + 1);
      }
    }
    return retVal;
  }

  function findPrevLink(syntaxes: Syntax[], targetSyntax: Syntax, targetSyntaxIndex: number) {
    const retVal = [];
    let canCount = true;
    for (let i = targetSyntaxIndex - 1; i >= 0; i--) {
      const s = syntaxes[i];
      if (targetSyntax.level === s.level || targetSyntax.level > s.level) {
        if (canCount) {
          retVal.push(i);
        }
        break;
      }

      if (targetSyntax.level < s.level && targetSyntax.statement === 'condition') {
        canCount = true;
      }

      if (canCount && targetSyntax.level < s.level) {
        retVal.push(i);
        break;
      }
    }
    return retVal;
  }

  syntaxes.forEach((s, index) => {
    s.next = findNextLink(syntaxes, s, index);
  });
  return syntaxes;
}

function setRepeatEnd(syntaxes: Syntax[]) {
  interface State {
    index: number;
    level: number;
  }
  function isRepeatEnd(state: State, nowSyntax: Syntax) {
    return state.level >= nowSyntax.level;
  }
  let i = 0;
  const repeatStack: State[] = [];
  while (syntaxes[i]) {
    const reversed = repeatStack.reverse().slice();
    reversed.forEach((s) => {
      if (isRepeatEnd(s, syntaxes[i])) {
        repeatStack.pop();
        const newSyntax: Syntax = {
          statement: 'repeat-end',
          level: s.level,
          content: '',
          next: [],
        };
        syntaxes.splice(i, 0, newSyntax);
      }
    });

    if (syntaxes[i].statement === 'repeat-start') {
      repeatStack.push({ index: i, level: syntaxes[i].level });
    }
    i += 1;
  }
  return syntaxes;
}

const defaultSetting = `
  graph [
    charset = "UTF-8";
    labelloc = "t";
  ];

  node [

  ];

  edge [

  ];
`;
