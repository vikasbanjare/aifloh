// npm run new:resource -- my-slug   (also new:tool, new:experiment, new:work)
// Writes a manifest with publish: false so nothing goes live until you flip it.
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SLUG_RE, RESERVED } from '../src/lib/rules.ts';

const kind = process.argv[2] as 'resource' | 'tool' | 'experiment' | 'work';
const slug = (process.argv[3] || '').toLowerCase();
const DIR = { resource: 'resources', tool: 'tools', experiment: 'lab', work: 'work' }[kind];
if (!DIR) throw new Error('kind must be resource, tool, experiment or work');
if (!SLUG_RE.test(slug) || RESERVED.has(slug)) {
  console.error(`Usage: npm run new:${kind} -- <slug>   (a-z, 0-9 and "-", up to 40 characters, not a reserved word)`);
  process.exit(1);
}
const file = join(process.cwd(), 'content', DIR, `${slug}.md`);
if (existsSync(file)) {
  console.error(`${file} already exists.`);
  process.exit(1);
}
const today = new Date().toISOString().slice(0, 10);
const head = `slug: ${slug}\ntitle: "TODO"\nsummary: "TODO, 140 characters at most"\nstatus: live\ndate: ${today}\ntools: []\ntags: []\npublish: false\n`;
const extra = {
  resource: `type: prompt-image   # prompt-image | prompt-video | skill | template | cheat-sheet | guide\nintent: "make a thumbnail"\ncodeWord: ${slug.slice(0, 24)}\nbody: |-\n  The text people copy.\ntested: { on: ${today}, tool: TODO, version: "1" }\nreceipt: { tool: TODO, attempts: 0, time: "", failed: "", worked: "" }\n`,
  tool: `category: app   # video | image | audio | writing | automation | plugin | app\ncta: open        # open | download | beta | talk | none\nurl: https://example.com\nplatforms: [Web]\nhowItWorks:\n  - Step one.\n  - Step two.\n  - Step three.\n`,
  experiment: `question: "TODO?"\nresult: ongoing   # worked | partly | failed | ongoing\n`,
  work: `type: video   # video | image | design\napproval: { status: own }   # client or employer work: employer: true and approval { status: approved, by, on }\n`,
}[kind];
const body = kind === 'experiment' ? '## Question\n\n## What I tried\n\n## What happened\n\n## What I would do next\n\n## Try it\n' : 'Notes shown on the page.\n';
writeFileSync(file, `---\n${head}${extra}---\n${body}`);
console.log(`Created ${file} (publish: false). Fill it in, then set publish: true.`);
