/**
 * JSON for embedding inside a <script> tag. Escapes the characters that could close the tag or
 * change how the HTML parser reads it, so a title like "</script><script>…" stays plain text.
 */
export function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
