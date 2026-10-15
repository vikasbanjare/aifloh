# usage: python3 iterations/tools/record.py NN "hypothesis" "scores H,T,C,S,D,M,I,K,A,P" kept|rejected "note" "log body (markdown)"
import sys, re
nn, hyp, sc, decision, note, body = sys.argv[1:7]
s = [int(x) for x in sc.split(',')]; tot = sum(s)
root = 'iterations/'
sb = open(root + 'SCOREBOARD.md').read()
row = f"| {nn} | " + ' | '.join(map(str, s)) + f" | **{tot}** | {decision} | {note} |\n"
sb = sb.replace('\n**CURRENT BEST', row + '\n**CURRENT BEST', 1) if False else re.sub(r'(\n)(\*\*CURRENT BEST.*)', lambda m: '\n' + row.rstrip('\n') + '\n\n' + m.group(2) if False else m.group(0), sb)
lines = sb.split('\n'); idx = max(i for i, l in enumerate(lines) if l.startswith('| '))
lines.insert(idx + 1, row.rstrip('\n'))
sb = '\n'.join(lines)
if decision == 'KEPT':
    sb = re.sub(r'\*\*CURRENT BEST: iter-\d+\*\*', f'**CURRENT BEST: iter-{nn}**', sb)
open(root + 'SCOREBOARD.md', 'w').write(sb)
open(root + 'LOG.md', 'a').write(f"\n## iter-{nn} · {hyp}\n{body}\n- Scores: " + ' '.join(f'{k}{v}' for k, v in zip('H T C S D M I K A P'.split(), s)) + f" = {tot}.\n- Decision: {decision}.\n")
print('recorded', nn, tot, decision)
