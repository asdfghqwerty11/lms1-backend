# Automated Video Generation for LinkedIn — Design Notes

**Drafted:** 2026-08-09
**Status:** Architecture and recommendations. Vendor comparison in the section below is being verified separately; treat any figure there as provisional until confirmed against a live quote.

---

## 1. The honest framing first

The request was "set up automated video generation for posts like these." Before the tooling, the uncomfortable part:

**The posts above work because they sound like a person thinking, not like content.** That is the entire asset. A fully synthetic avatar reading them at 9 AM daily will produce videos that are technically flawless and completely inert — and worse, it puts the one thing that is actually scarce here (a founder with real clinical credibility and a distinct voice) behind a synthetic proxy that anyone can buy for $30/month.

So the goal should not be "automate the video." It should be **automate everything around the video so that the only thing Vikas spends time on is talking.**

That reframing changes the build substantially, and it's the recommendation this document argues for.

---

## 2. Three architectures, and which one to pick

### Option A — Full synthetic avatar
A cloned avatar of Vikas + cloned voice reads a generated script. Zero recording time.

- **Cost:** lowest. **Time:** minutes per video. **Volume:** unlimited.
- **Risk:** high, and specifically reputational. LinkedIn audiences in 2026 are well-calibrated to spotting avatars, and a dentist audience judging a *dental supply CEO* on authenticity is the worst possible crowd to be caught by. There is also a real disclosure question — an audience that discovers retroactively that the "founder" videos were synthetic will not be forgiving.
- **Verdict:** not for the main feed. Genuinely useful for a narrow slice — see §4.

### Option B — Batch-record, automate the rest ← **recommended**
Vikas records 8-10 scripts in one sitting, straight to phone or a simple setup. Everything downstream is automated: transcription, cutting, subtitle burn-in, b-roll insertion, end-card, format variants, scheduling, and the LinkedIn post copy.

- **Cost:** low. **Time:** ~90 minutes of Vikas per month for a month of output. **Volume:** 8-12/month comfortably.
- **Risk:** low. It's genuinely him.
- **Why this wins:** the bottleneck people *think* they have is "making the video." The actual bottleneck is editing, subtitling, resizing and scheduling — which is 90% of the labour and 100% automatable. Recording ten 70-second scripts back-to-back takes about an hour. Automating that hour costs authenticity; automating the other twenty hours costs nothing.

### Option C — Faceless / narrator-led
No face. Voiceover over motion graphics, data cards, and generated b-roll.

- **Cost:** low-medium. **Time:** fully automatable. **Volume:** unlimited.
- **Verdict:** strong as a *second* channel, not a replacement. Works especially well for the data-hook posts (stat cards animating) where a face adds nothing. Higgsfield's `faceless-channel-video` workflow is built precisely for this and is already available on the current Ultra plan.

**Recommendation: build B as the primary, add C as a secondary lane for data posts, and hold A in reserve for the narrow use in §4.**

---

## 3. The pipeline (Option B)

```
  ┌─ MONTHLY (human, ~90 min) ─────────────────────────────┐
  │  1. Approve 8-10 scripts from the drafted post backlog │
  │  2. Record all of them in one sitting                  │
  │  3. Drop raw files into a watched folder               │
  └────────────────────────────────────────────────────────┘
                        ↓
  ┌─ PER VIDEO (automated) ────────────────────────────────┐
  │  4. Transcribe → align to approved script              │
  │  5. Cut silences + retakes, keep intentional pauses     │
  │  6. Generate b-roll for flagged sections                │
  │  7. Burn in subtitles (3-4 words/line, brand styling)   │
  │  8. Append end card from the post's branded image       │
  │  9. Render 1:1 + 4:5 + 9:16 variants                    │
  │ 10. Draft the LinkedIn post copy from the script        │
  └────────────────────────────────────────────────────────┘
                        ↓
  ┌─ GATE (human, ~5 min/video) ───────────────────────────┐
  │ 11. Review and approve → schedule                       │
  └────────────────────────────────────────────────────────┘
```

**Step 5 needs a guardrail.** Every automated silence-cutter will remove the 1.5-second pause after "Nobody teaches us how to buy," because it looks like dead air. Mark intentional pauses in the script with a token the cutter respects, or set the silence threshold long enough (>2s) that deliberate beats survive.

**Step 11 is not optional.** No auto-posting. The volume here is 8-12 videos/month — a five-minute review each is 45 minutes a month, which is a trivial price for never having a broken subtitle or a mangled Hindi word go out under Vikas's name.

---

## 4. Where a synthetic avatar genuinely earns its place

Not the main feed. But three real uses:

1. **Multi-language versions.** Record once in English, dub to Hindi/Tamil/Telugu/Marathi for a dentist audience that is overwhelmingly not in metros. This is the single highest-leverage use of AI video here — the same reflective post reaching a Tier-2/Tier-3 dentist in their own language. Disclose it as a dub, which is uncontroversial and expected.
2. **Product explainers for Waldent.** Nobody needs the founder's face to explain a composite's working time. Faceless or synthetic is entirely appropriate.
3. **High-volume Shorts/Reels experiments.** Testing hooks at volume where the cost of a miss is zero.

---

## 5. LinkedIn-specific constraints to design around

- **Vertical or square, never 16:9.** The feed crops landscape badly.
- **Burned-in subtitles**, not platform auto-captions — most of the feed is muted and auto-captions are unreliable on Indian-accented English and unusable on Hinglish.
- **Native upload beats a YouTube link** by a wide margin on reach. Whatever the pipeline outputs must be uploadable as native video.
- **Hook in the first 2 seconds**, which is why the script opens on the claim and not on a greeting or a logo sting.
- **Programmatic posting is the fragile link.** LinkedIn's video posting API is materially more restricted than text posting and typically requires elevated partner access. Assume the last step may need to stay manual and design the pipeline to end at "approved file + drafted copy, ready to upload" rather than betting the whole build on automated publish. Verified detail in §6.

---

## 6. Vendor comparison

*Being verified — this section will be completed with confirmed capabilities, current pricing, and API constraints rather than estimates. Known first-hand as of this session:*

- **Higgsfield** — connected and available on an **Ultra plan with ~2,624 credits**. Exposes generation tools (image/video/audio, dubbing, voice cloning, upscaling, reframing) plus prebuilt workflows. Relevant ones: `faceless-channel-video` (narrator-led, matches Option C directly), `ugc-flow` (talking-head creator video), and `youtube-thumbnail-generator`. Notably there is **no "read my script with my own cloned face" avatar workflow** in its catalog — it is oriented toward generative creators and b-roll rather than corporate avatar cloning. Best fit here: **b-roll generation (step 6), the faceless lane, and dubbing for §4.1** — not as the talking-head engine.

- **HeyGen** — the natural candidate for §4 avatar/dubbing work. Pending verification.
- **ElevenLabs** — candidate for voice cloning and the dub track. The "sochiye" test in the video script is the acceptance criterion. Pending verification.
- **Orchestration and LinkedIn API constraints** — pending verification.

---

## 7. Suggested first move

Do not build the whole pipeline. Do this instead, in order:

1. **Record Post 1 on a phone this week.** No pipeline, no avatar. Subtitle it manually. Post it. See whether video actually outperforms the text post for this audience before investing in automation — for a reflective, text-friendly format like this, it genuinely might not.
2. If it performs, **build step 7-10 first** (subtitles, formats, end cards, copy). That is the boring 80% of the labour and carries zero authenticity risk.
3. **Then** add b-roll generation and the faceless lane.
4. **Then**, and only if the audience is demonstrably outside English metros, add dubbing.

The failure mode to avoid is spending three weeks wiring five APIs together to discover that the format doesn't land, or that it lands precisely because it was obviously homemade.
