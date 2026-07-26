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

// The guest track: a second, shorter talk on selected weeks, given by someone who built
// the thing the main lecture had just covered. Video IDs come from ../scripts/fetch_guests.sh;
// speakers, affiliations and talk titles from notes/guest_lectures.md, which took them off
// the slides rather than the captions. Week 12 (Dieter Fox) is a private video and is absent
// here for the same reason it is absent from the book.
export const GUESTS = [
  { n: 1, week: 2, slug: 'gupta', speaker: 'Abhishek Gupta', affiliation: 'University of Washington', title: 'Simulation for Robotic Manipulation, without the Pain', video: 'aG8NPTPhwkE', chapter: 12 },
  { n: 2, week: 3, slug: 'xu', speaker: 'Danfei Xu', affiliation: 'Georgia Tech & NVIDIA', title: 'Human Data as a Foundation for Robot Learning', video: 'qvTP6T5oq1w', chapter: 12 },
  { n: 3, week: 4, slug: 'kumar', speaker: 'Aviral Kumar', affiliation: 'CMU & Google DeepMind', title: 'How to Replicate the LLM Recipe in Robot Learning', video: 'fHHLmTu9sFk', chapter: 12 },
  { n: 4, week: 5, slug: 'wagenmaker', speaker: 'Andrew Wagenmaker', affiliation: 'UC Berkeley', title: 'Robots That Learn From Experience', video: 'CPmTpXA5azw', chapter: 12 },
  { n: 5, week: 6, slug: 'chi', speaker: 'Cheng Chi', affiliation: 'Sunday Robotics', title: 'Robotics Beyond Algorithms', video: 'tvFvIEOBKfM', chapter: 12 },
  { n: 6, week: 7, slug: 'xiao', speaker: 'Ted Xiao', affiliation: 'Project Prometheus', title: 'Three Eras of Robot Learning', video: 'VS7Ulaugevg', chapter: 13 },
  { n: 7, week: 8, slug: 'reed', speaker: 'Scott Reed', affiliation: 'NVIDIA GEAR', title: 'What is the Right Backbone for Embodied Agents?', video: 'fqkp_wkov6M', chapter: 13 },
  { n: 8, week: 9, slug: 'vuong', speaker: 'Quan Vuong', affiliation: 'Physical Intelligence', title: 'π0.7, a Generalist Model with Emergent Capabilities', video: 'pzolgvyWEFY', chapter: 13 },
  { n: 9, week: 10, slug: 'sharma', speaker: 'Archit Sharma', affiliation: 'Google DeepMind', title: 'Scaling Test-Time Compute at the Frontier', video: 'oBEkY6NeE_o', chapter: 13 },
  { n: 10, week: 11, slug: 'beyer', speaker: 'Lucas Beyer', affiliation: 'Meta Superintelligence Labs', title: 'Vision in the Age of LLMs', video: '0XB7fNS_ONg', chapter: 13 },
];

// The eleventh guest, whose talk cannot be recovered. Carried as data so the site can say
// so out loud rather than quietly showing ten where the course ran eleven.
export const MISSING_GUEST = {
  week: 12,
  speaker: 'Dieter Fox',
  affiliation: 'University of Washington & NVIDIA',
  reason: 'the recording is a private video, and the course page lists no other copy',
};

export const lectureByNumber = (n) => LECTURES.find((l) => l.n === n);

/** Directory and URL key for a deck: `lecture04`, `guest02_xu`. */
export const lectureKey = (n) => `lecture${String(n).padStart(2, '0')}`;
export const guestKey = (guest) => `guest${String(guest.n).padStart(2, '0')}_${guest.slug}`;

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
