/** Each skill's demo video. The files live on Aliyun OSS: set NEXT_PUBLIC_SKILL_VIDEO_BASE (at build
    time) to the public URL of their folder and upload `<skill id>.mp4`, with an optional `<skill id>.jpg`
    poster. A skill whose file is not there yet keeps its placeholder. A `videoUrl` in the catalog
    overrides the convention. */
const BASE = (process.env.NEXT_PUBLIC_SKILL_VIDEO_BASE ?? "").replace(/\/+$/, "");

export type SkillVideoSource = { src: string; poster?: string };

export function skillVideo(skill: { id: string; videoUrl: string | null; posterUrl: string | null }): SkillVideoSource | null {
  if (skill.videoUrl) return { src: skill.videoUrl, poster: skill.posterUrl ?? undefined };
  if (!BASE) return null;
  const file = encodeURIComponent(skill.id);
  return { src: `${BASE}/${file}.mp4`, poster: skill.posterUrl ?? `${BASE}/${file}.jpg` };
}
