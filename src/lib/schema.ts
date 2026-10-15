import { z } from 'zod';
import { SLUG_RE, CODEWORD_RE, RESERVED } from './rules.ts';

const slug = z
  .string()
  .regex(SLUG_RE, 'slug must be 1-40 characters of a-z, 0-9 and "-"')
  .refine((s) => !RESERVED.has(s), { message: 'slug is a reserved word' });

const isoDate = z.coerce.date();

const localImage = z.object({
  src: z
    .string()
    .refine((s) => !/^https?:\/\//i.test(s) && !s.startsWith('//'), { message: 'remote image URLs are not allowed; self-host the file' }),
  alt: z.string().min(1, 'alt text is required'),
  w: z.number().int().positive(),
  h: z.number().int().positive(),
});

export const common = {
  slug,
  title: z.string().min(1),
  titleHi: z.string().optional(),
  summary: z.string().max(140, 'summary must be 140 characters or fewer'),
  status: z.enum(['live', 'beta', 'private-beta', 'in-development', 'archived']),
  date: isoDate,
  tags: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  publish: z.boolean().default(false),
  standIn: z.boolean().default(false),
  approval: z
    .object({ status: z.enum(['own', 'approved', 'pending']), by: z.string().optional(), on: isoDate.optional() })
    .default({ status: 'own' }),
  employer: z.boolean().default(false), // true = made for an employer or client; needs approval.status approved
  links: z
    .object({ post: z.url().optional(), repo: z.url().optional(), demo: z.url().optional(), site: z.url().optional() })
    .default({}),
  cover: localImage.optional(),
  receipt: z
    .object({
      tool: z.string(),
      attempts: z.number().int().nonnegative().optional(),
      time: z.string().optional(),
      cost: z.string().optional(),
      failed: z.string().optional(),
      worked: z.string().optional(),
    })
    .optional(),
  tested: z.object({ on: isoDate, tool: z.string(), version: z.string() }).optional(),
  version: z.string().optional(),
  changelog: z.string().optional(),
};

const shot = z.object({ n: z.number().int(), seconds: z.number(), camera: z.string(), action: z.string(), audio: z.string().optional() });

export const resourceSchema = z
  .object({
    ...common,
    kind: z.literal('resource'),
    type: z.enum(['prompt-image', 'prompt-video', 'skill', 'template', 'cheat-sheet', 'guide']),
    intent: z.string().min(1), // the "I want to [...]" filter option
    codeWord: z.string().regex(CODEWORD_RE, 'code word must be 3-24 characters of a-z, 0-9 and "-"'),
    body: z.string().default(''), // the text to copy
    openInClaude: z.boolean().default(false),
    related: z.array(z.string()).default([]),
    sourcePost: z.url().optional(),
    files: z.array(z.object({ path: z.string(), label: z.string(), bytes: z.number().int().max(10 * 1024 * 1024, 'files over 10 MB go to external storage') })).default([]),
    image: z
      .object({ prompt: z.string(), negative: z.string().optional(), model: z.string(), aspect: z.string(), outputs: z.array(localImage).default([]) })
      .optional(),
    video: z
      .object({
        prompt: z.object({ en: z.string(), zh: z.string().optional() }),
        shots: z.array(shot).default([]),
        model: z.string(),
        aspect: z.string(),
        seconds: z.number(),
        refs: z.array(z.string()).default([]),
        outputs: z.array(localImage).default([]),
      })
      .optional(),
    skill: z
      .object({ skillPath: z.string(), installNote: z.string(), useWhen: z.string(), fileCount: z.number().int(), bytes: z.number().int(), zip: z.string().optional() })
      .optional(),
    howTo: z.string().default(''), // markdown body of the manifest
  })
  .refine((r) => !r.openInClaude || (r.body || r.image?.prompt || r.video?.prompt.en || '').length < 2000, {
    message: 'openInClaude is only allowed when the prompt is under 2000 characters',
    path: ['openInClaude'],
  });

export const toolSchema = z.object({
  ...common,
  kind: z.literal('tool'),
  category: z.enum(['video', 'image', 'audio', 'writing', 'automation', 'plugin', 'app']),
  cta: z.enum(['open', 'download', 'beta', 'talk', 'none']),
  url: z.url().optional(),
  platforms: z.array(z.string()).default([]),
  screenshots: z.array(localImage).default([]),
  howItWorks: z.array(z.string()).length(3, 'howItWorks needs exactly 3 steps'),
  whoFor: z.string().optional(),
  requirements: z.array(z.string()).default([]),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  repo: z.string().optional(), // owner/name, links to /code
  body: z.string().default(''),
});

export const experimentSchema = z.object({
  ...common,
  kind: z.literal('experiment'),
  question: z.string(),
  result: z.enum(['worked', 'partly', 'failed', 'ongoing']),
  repo: z.string().optional(),
  body: z.string().default(''),
});

export const workSchema = z.object({
  ...common,
  kind: z.literal('work'),
  type: z.enum(['video', 'image', 'design']),
  vertical: z.string().optional(),
  media: z.union([localImage, z.object({ youtube: z.string().regex(/^[A-Za-z0-9_-]{11}$/), poster: localImage })]).optional(),
  layers: z.array(z.object({ name: z.string(), madeBy: z.enum(['A', 'B']), image: localImage })).default([]),
  shots: z.array(z.object({ at: z.string(), note: z.string(), madeBy: z.enum(['A', 'B']) })).default([]),
  body: z.string().default(''),
});

export type Resource = z.infer<typeof resourceSchema>;
export type Tool = z.infer<typeof toolSchema>;
export type Experiment = z.infer<typeof experimentSchema>;
export type Work = z.infer<typeof workSchema>;
