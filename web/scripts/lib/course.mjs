// Course metadata. Video IDs come from ../scripts/fetch_videos.sh; titles from PROGRESS.md.
export const COURSE = {
  code: '263-5911-00L',
  title: 'Robot Learning: From Fundamentals to Foundation Models',
  institution: 'ETH Zürich',
  term: 'Spring 2026',
  lecturer: 'Oier Mees',
  mentor: 'Marc Pollefeys',
  homepage: 'https://cvg.ethz.ch/lectures/Robot-Learning/',
  playlist:
    'https://www.youtube.com/playlist?list=PLPU18BnWYUZJx3_d901-GD6BGpeWwE2vx',
};

export const LECTURES = [
  { n: 1, slug: 'introduction', title: 'Introduction to Robot Learning', video: 'X0k14u6pSxw' },
  { n: 2, slug: 'control-mdp', title: 'Robot Control & Markov Decision Processes', video: '5-Bb84eTTqQ' },
  { n: 3, slug: 'imitation', title: 'Imitation Learning', video: 'Ef4R5s1LqoQ' },
  { n: 4, slug: 'rl-i', title: 'Reinforcement Learning I', video: '90raNpc11tQ' },
  { n: 5, slug: 'rl-ii', title: 'Reinforcement Learning II', video: 'AdTGz8YnnlE' },
  { n: 6, slug: 'generative', title: 'Generative Models', video: 'qd6Ldsuu46I' },
  { n: 7, slug: 'sequence-modeling', title: 'Sequence Modeling & Transformers', video: 'imSTfMJjp7M' },
  { n: 8, slug: 'world-models', title: 'World Models', video: 'cTTmUZlOF2s' },
  { n: 9, slug: 'generalist-policies', title: 'Generalist Robot Policies', video: 'dtofzDY9zuo' },
  { n: 10, slug: 'reasoning', title: 'Embodied Reasoning & Test-time Scaling', video: 'CxhrjQuGEuE' },
  { n: 11, slug: 'frontiers', title: 'Frontier & Open Problems', video: 'eL4lcy1KNzE' },
];

export const lectureByNumber = (n) => LECTURES.find((l) => l.n === n);

/** Seconds -> `M:SS` / `H:MM:SS`, the way a timecode is written on a slate. */
export function timecode(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (x) => String(x).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

export function watchUrl(videoId, seconds) {
  const t = Math.max(0, Math.floor(seconds ?? 0));
  return `https://www.youtube.com/watch?v=${videoId}&t=${t}s`;
}
