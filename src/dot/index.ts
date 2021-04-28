import { parse } from './syntax_parser';
import { createDot } from './dot_generator';

export function createDotFromText(text: string): string {
  const nodes = parse(text);
  return createDot(nodes);
}
