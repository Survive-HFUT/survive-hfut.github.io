import { MarkdownRenderer } from 'vitepress';

export default function preserveMarkSyntaxInsideContainers(
  md: MarkdownRenderer,
) {
  md.block.ruler.before(
    'tab',
    'mark_line_in_container',
    (state, startLine, endLine, silent) => {
      // @ts-expect-error
      if (state.parentType !== 'container') {
        return false;
      }

      const start = state.bMarks[startLine] + state.tShift[startLine];
      const line = state.src.slice(start, state.eMarks[startLine]).trim();

      // vitepress-plugin-tabs treats any line beginning with `==` inside a
      // container as a tab. Let the mark plugin handle complete `==...==`
      // lines first, so highlighted text in admonitions remains highlighted.
      if (!/^==\S.*==\s*$/.test(line)) {
        return false;
      }

      if (silent) {
        return true;
      }

      const oldParent = state.parentType;
      const nextLine = startLine + 1;
      state.parentType = 'paragraph';

      const paragraphOpen = state.push('paragraph_open', 'p', 1);
      paragraphOpen.map = [startLine, nextLine];

      const inline = state.push('inline', '', 0);
      inline.map = [startLine, nextLine];
      inline.content = state
        .getLines(startLine, nextLine, state.blkIndent, false)
        .trim();
      inline.children = [];

      state.push('paragraph_close', 'p', -1);
      state.parentType = oldParent;
      state.line = nextLine;
      return true;
    },
  );
}
