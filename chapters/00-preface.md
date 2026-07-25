# Preface {.unnumbered}

\markboth{Preface}{Preface}

## What this book is {.unnumbered}

This is an unofficial textbook compiled from the recordings of **263-5911-00L, *Robot Learning: From Fundamentals to Foundation Models***, taught at ETH Zürich in the spring semester of 2026 by **Oier Mees**, with **Marc Pollefeys** as course mentor. It covers the eleven main lectures of that course, one chapter each, in the order they were given.

It is not endorsed by, affiliated with, or reviewed by the lecturer, the course, or ETH Zürich. The course itself is publicly available, and the primary sources are better than this book in every respect that matters except searchability and the ability to read on a train:

- Course page: <https://cvg.ethz.ch/lectures/Robot-Learning/>
- Main lecture playlist: <https://www.youtube.com/playlist?list=PLPU18BnWYUZJx3_d901-GD6BGpeWwE2vx>
- Guest lecture playlist: <https://www.youtube.com/playlist?list=PLPU18BnWYUZIpmc2GuFlSXVGJxXZVeZ2B>

If a passage in this book seems wrong, watch the lecture. The recordings are the authority.

## Why it exists {.unnumbered}

A lecture series is a bad medium for reference. You cannot skim it, search it, or check an equation against the one three lectures earlier. It is an excellent medium for a first pass — the lecturer's asides, corrections and hesitations carry information that no textbook preserves — and a poor one for the fifth time you need to remember how a probability ratio is clipped.

The eleven lectures total **ten hours and twenty-five minutes** of recording and about **91,000 words** of transcript. This book is an attempt to make that material referenceable without discarding what made it worth transcribing: the reasoning behind design choices, the failures the lecturer reports from his own work, and the places where the honest answer is that nobody knows.

## Who it is for, and what it assumes {.unnumbered}

The reader this book imagines has finished an introductory machine-learning course and can read a gradient. Concretely, it assumes:

- **Linear algebra and multivariable calculus** — matrices, gradients, the chain rule.
- **Probability** — conditional distributions, expectations, variance, and comfort with the notation $\mathbb{E}_{x\sim p}[f(x)]$.
- **Basic deep learning** — what a neural network is, what backpropagation does, what a loss function is for, and roughly what a convolutional network and a transformer are. Chapter 7 develops the transformer from attention upward, so a working knowledge is enough.

It assumes **no robotics background at all.** Chapter 2 builds the necessary geometry, kinematics and control from rigid bodies up, and the classical material is included precisely because most readers arriving at this subject come from machine learning rather than from robotics.

If you are coming from the other direction — a robotics background and less machine learning — Chapters 2 will be familiar and Chapters 6 and 7 are the ones to read slowly.

## How the sources were obtained, and one thing you should know about them {.unnumbered}

This matters for how much you trust individual sentences, so it is stated in full rather than buried.

**The transcripts are automatically generated captions.** No human-written subtitles exist for any of the eleven videos. Automatic captions are unreliable on exactly the words that matter here: technical terms, paper titles and people's names. Confirmed manglings encountered while writing include the lecturer's own name, the city of Freiburg rendered as "Framework", "UMI" as "Yumi", "ALVINN" as "the Alvin car", "PALO" as "PAL", and "reasoning at test time" as "reasoning subtest time" throughout one lecture. Where a caption and a slide disagreed, **the slide won.**

**The slides were reconstructed from the video recordings, not obtained as files.** All eleven slide decks are published on the course page and all eleven are encrypted with a user password that this project did not have. The password is displayed on-screen during Lecture 2, but the course redacted those fields before uploading the recording, so it is blank in the public video and not recoverable. No attempt was made to crack it.

Instead, the decks were rebuilt from the 1080p recordings, which are full-screen slide captures. A frame-differencing script recovered **484 slides** across the eleven lectures, each at the last stable state before the lecturer advanced — which has the useful side effect of capturing animated and progressively-built slides in their final, complete form. The reconstruction was verified as legible, and every equation in this book was transcribed by reading the slide **images**, not by trusting an optical-character-recognition layer, which garbles mathematics reliably. Equations that carried real weight were additionally checked on magnified crops.

The one cost of this method is that **slides shown while a video was playing could not always be recovered**, because the frame never stabilized. There are five such gaps — one in Lecture 9 and four in Lecture 11, the two lectures that lean most heavily on video — and each is marked in the text where it occurs:

> [UNCLEAR: a gap of this kind, with the lecture, the timestamps, and what could not be recovered.]

Those markers are deliberate and have been preserved into the final document rather than smoothed over. Where a claim rests on the transcript alone, the text says so, and where a paper's title could not be established, no citation is invented.

## Two conventions {.unnumbered}

**Editor's notes.** Everything outside a marked box is course material — traceable to a slide or to something the lecturer said. Where background is needed that the lecture assumed but never stated, or where the lecture contains a slip worth flagging, it appears in a box like this:

> **Editor's note.** Material in a box of this kind is not from the lecture. It is background, a correction, or a note about a discrepancy between what was said and what was on the slide.

There are a few dozen of these. They are used for genuinely assumed background (why the Bellman operator is a contraction), for slips (a date, an institution, an arithmetic figure spoken differently from the slide), and for notation changes.

**Notation.** The lectures are not internally consistent about symbols, which is normal and unremarkable in a lecture series and unacceptable in a book. Two clashes in particular had to be resolved: the actor and critic parameters are labelled one way in the reinforcement-learning lectures and the opposite way in the generative-modelling lecture, and the diffusion step index collides with the environment timestep. The back matter contains the full notation table, the rules used to resolve the collisions, and — this is the part to read if you are comparing the book against the slides — **a list of every place where this book deliberately uses a different symbol from the one on screen.** Each such change is also footnoted at the point of use.

## What is not here {.unnumbered}

**The guest lectures.** The course included eleven guest lectures from researchers in the field, on a separate playlist, with no slides available. They are not covered in this edition. Several are referenced in passing where the main lectures refer to them.

**Anything after the recordings.** The course ran in spring 2026 and the field moves quickly. Chapters 9 through 11 describe a state of the art that will date fastest.

**Exercises and the group project.** The course had a substantial practical component — students trained policies on inexpensive SO-101 arms and deployed them on a demo day. The chapters mention it only where the lecturer used it to make a point.

## A word about whose work this is {.unnumbered}

Robot learning is a small field, and the lecturer is an active researcher in it. A large share of the work presented in the second half of the course is his own or his collaborators': the Open X-Embodiment dataset, the Octo and CrossFormer policies, the SIMPLER evaluation framework, the FAST action tokenizer, embodied chain-of-thought and its efficient variants, and several of the early results in the final lecture.

This is a strength — the accounts of *why* design decisions were made, and which of them the author now regrets, are the most valuable material in the book, and nobody else could give them. It is also a bias, and the chapters flag it where it is relevant. A reader wanting a neutral survey of the field should treat this as one well-placed researcher's map rather than a census.

## How to read it {.unnumbered}

The chapters are ordered as the course was, and the first five are cumulative: Chapter 2 supplies the language the rest of the book speaks, Chapter 3 the problem, Chapters 4 and 5 the two halves of reinforcement learning. Read those in order.

The second half is more modular. Chapters 6 and 7 are machinery — generative models and sequence models — and both are used everywhere after. Chapters 8 and 9 are two competing answers to the same question and can be read in either order. Chapters 10 and 11 depend on 9.

Every chapter ends with the same three sections: **where this breaks**, which collects the failure modes and limitations discussed in the lecture; **what this connects to**, which points backwards and forwards explicitly; and **further reading**, which covers the papers assigned that week in the course, with a line on why each one is on the list. The reading lists are the part of this book most likely to remain useful.

## Acknowledgements {.unnumbered}

To Oier Mees, for teaching the course, for publishing the recordings, and for the unusual candour of the lectures — the broken robot, the mug, the design decision he says was probably wrong. To the teaching assistants he thanks by name in the final lecture, without whom, he says, the course would not have existed. And to the thirty-four laboratories who contributed the data that most of the second half of this book is about, an act of collective infrastructure-building that the field has benefited from more than any single paper in it.

The final lecture lists the sources the course's own materials drew on, and they are worth passing on: the Deep Learning Lab at the University of Freiburg, the deep reinforcement learning courses at UC Berkeley and Stanford, and Cornell's robot learning course.

## Errata {.unnumbered}

This is a compilation, and compilations introduce errors of their own — in transcription, in interpretation, and in the arithmetic of worked examples that the lecture did not itself work through. Where this book computes something the lecture only asserted, the computation is shown so it can be checked. Where the two disagree, the lecture is right.
