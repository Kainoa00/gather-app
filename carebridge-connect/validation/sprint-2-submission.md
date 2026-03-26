# Sprint 2: Validate & Commit — CareBridge Connect

**Your Name:** Kainoa Shintaku

---

## **1. Problem Discovery Worksheet**

**Worksheet URL:** https://docs.google.com/spreadsheets/d/1z4EjGcwBEQn2B5_E8YFYPfsvQEry9DmhmkjS6Cy1n6g/edit?usp=sharing

See `problem-discovery-worksheet.csv` in this folder for full scored worksheet.

---

## **2. AI Interview**

**Conversation URL:** https://claude.ai/share/aa7c456d-cfca-4e3c-9aac-4e0706d2e1ef

### AI Interview Prompt to Use

Copy the block below into Claude.ai, ChatGPT, or Gemini and fill in the two problems:

```
I'm exploring 2 problems for a product I want to build. Here is
the Problem Discovery Framework my course uses:

PROBLEM DISCOVERY FRAMEWORK

OPPORTUNITY SIGNALS
- Frustration → Pain Reliever: Reduce friction, remove obstacles, solve problems
- Delight → Gain Creator: Amplify joy, create more of what works, enhance experiences

OPPORTUNITY SCORE (1-5 scales)
Frequency:      1=Rarely, 2=Yearly, 3=Monthly, 4=Weekly, 5=Daily
Intensity (F):  1=Shrug, 2=Minor annoyance, 3=Annoying, 4=Frustrating, 5=I hate this
Intensity (D):  1=Meh, 2=Mildly pleasant, 3=Enjoyable, 4=Love it, 5=Can't live without
Willingness:    1=Wouldn't pay, 2=Unlikely, 3=Might pay, 4=Probably would, 5=Already paying
Market Size:    1=Just me, 2=Small niche, 3=Moderate group, 4=Large segment, 5=Widespread

CONVICTION SCORE (0/1 checkboxes, sum of 4)
- Personal Pain: You live this problem yourself
- Close Relationship: Someone you love experiences this
- Moral Calling: You believe it's wrong that this problem exists
- Unique Insight or Skills: You see something others don't

Sum 0-1 = Low | 2 = Moderate | 3-4 = High conviction

TECHNICAL FEASIBILITY (0/1, sum of 3)
- Data/API Access
- Technology Readiness
- No Hardware or Regulatory Blockers

Sum 3 = Clear | 1-2 = Caution | 0 = Blocked

GOSPEL FRAMEWORK
- Expands Agency
- Supports Becoming
- Deepens Connection

Here are my 2 problems:

1. WHO: Adult family members of skilled nursing facility (SNF) patients (e.g., a son/daughter who
   is healthcare POA for their elderly parent).
   FRUSTRATION: They feel completely in the dark about daily care. They call the nursing station
   repeatedly, get vague updates, and go to bed not knowing if their loved one ate, slept, or had
   a good day. The anxiety is constant and the nurses don't have time to call everyone.
   JTBD: I'm trying to stay informed about my loved one's daily care so I can feel peace of mind,
   make good medical decisions, and not feel like a burden when I call.
   VALUE PROP: We help SNF family members stay connected to their loved one's care by translating
   clinical documentation into plain-English daily updates through a HIPAA-compliant family portal.

2. WHO: Charge nurses and CNAs at skilled nursing facilities.
   FRUSTRATION: A significant portion of their shift is spent fielding repetitive phone calls from
   anxious family members asking questions already documented in the chart — "Did she eat today?",
   "Did he sleep okay?", "What did the doctor say?" — pulling them away from direct patient care.
   JTBD: I'm trying to focus on patient care so I can do my job effectively without being
   constantly interrupted by family calls about information I've already documented.
   VALUE PROP: We help SNF nursing staff reduce family communication burden by giving families
   self-serve access to care updates, so nurses can focus on patients instead of phones.

Take them one at a time. For each problem, walk me through the scoring dimensions:
Opportunity (Frequency, Intensity, Willingness to Pay, Market Size), Conviction, Feasibility,
and Mission Fit. Ask me questions, then YOU assign scores based on my answers. Don't ask me to
pick scores. Push back where my thinking seems shallow. Number your questions, max 3 at a time.

After scoring both, give me a side-by-side scorecard table comparing every dimension.
Then ask: "All things considered, which of these ideas would you be most excited to build?"
```

---

## **3. Customer Interview**

**Loom Recording URL:** _(paste Loom URL here)_

**Who did you interview?**

11 interviews conducted — Administrators, Social Services, and Senior Placement Specialists across California and Utah. See `Valiation Interviews - Sheet1.csv` for raw data and `interview-analysis.md` for full analysis.

| # | Name | Role | Location |
|---|---|---|---|
| 1 | Alex Roper | Administrator | UT |
| 2 | Kyle Haroldsen | Administrator | CA |
| 3 | Jeremy Jergensen | Administrator | CA |
| 4 | Shaun Dahl | Administrator | CA |
| 5 | Cindy Turner | Senior Placement | CA |
| 6 | Shane Dahl | Administrator | CA |
| 7 | Jeff Beltran | Administrator | CA |
| 8 | Annaliese Haroldson | Social Services | CA |
| 9 | Seth Braithwaite | Administrator | CA |

### AI Transcript Analysis

**Key Quotes:**
- *"Figure out how to inform families without having to interrupt staff and delay care."* — Shane Dahl, Administrator CA
- *"Families complain they don't get any information. Nobody picks up the phone at facilities."* — Cindy Turner, Senior Placement CA
- *"We're only as good as the paperwork they come with."* — Shane Dahl, Administrator CA
- *"People's expectations are not met or they are not well informed."* — Seth Braithwaite, Administrator CA
- *"Insurance doesn't want to approve more days so they like family members being out of the loop. This software would be good to keep family informed and extra paper trail."* — Cindy Turner

**Patterns:**
1. The phone system is the universal default — and universally broken
2. Therapy progress is the #1 most requested update (named by 6/11 interviewees unprompted)
3. HIPAA compliance is more complex than anticipated — requires patient-signed release, POA distinctions, psychiatric record protections
4. Charting accuracy is an upstream risk the product doesn't control
5. Families care about daily living tasks (meals, bathing, activities) as much as clinical data
6. Appointment notification is a clear, underserved gap
7. Facilities want to reduce interruptions — staff efficiency is the real buyer motivation

**Surprises:**
- CareBridge Connect could serve as an **insurance dispute documentation tool** — informed families win more appeals (Cindy Turner)
- Real-time data can be counterproductive — blood sugar spikes, for example, self-correct before families should see them
- Point Click Care was named as the dominant EHR to integrate with — unprompted (Shane Dahl)
- **Competitor identified:** Informed Medical (informedmedical.com) — positioned as facility-protection-first, not family-experience-first

**Personal Reflections:**

The biggest confimation is that families need more updates on their loved ones care. With the current systems in place it is inconvienient and diffuclt for families to understand what is really happening. there are some challenges with data confidentiality and hipaa compliance that makes it difficult to understand what really is going on. Carebridge Connect can really help families mmaintain connection and involvement with their loved ones at a facility. J

---

## **4. Job to be Done + Value Proposition + Ideal Customer Profile**

### Job to be Done

> "I'm trying to **stay informed and connected to my loved one's daily care** so I can **feel peace of mind, make good decisions, and not feel like a burden when I reach out.**"

### Value Proposition

> "We help **adult family members of skilled nursing facility residents** **stay connected to their loved one's care** by **translating clinical documentation into plain-English daily updates through a HIPAA-compliant family portal.**"

---

### Ideal Customer Profile

**Who they are:**

- **Name:** Sarah Nakamura
- **Demographics:** 48 years old, works full-time, lives 45 minutes from the SNF where her father (82) has been a resident for 7 months. She is the designated healthcare Power of Attorney.
- **Context:** Sarah experiences this problem every weekday evening after work when she wonders how her dad's day went. She feels guilty she can't visit more often, and anxious when she doesn't hear anything.

**Their problem:**

- **Goals:** Stay informed about her father's daily health, meals, and mood without having to disrupt nursing staff. Feel confident in care decisions. Coordinate updates with her two siblings across different time zones.
- **Frustrations:** Calling the nursing station and getting "he had a good day" with no details. Not knowing when the doctor visited or what was said. Siblings asking her for updates she doesn't have. Feeling like a bad daughter for not knowing more.
- **Current solutions:** Calling the facility 1-2x per day. Occasional visits. A family group text where information is secondhand and inconsistent. Asking the social worker for more — but she's overloaded too.

**Why it matters:**

- **Frequency:** Daily — the anxiety and uncertainty don't stop on weekends.
- **Intensity:** 4/5 — emotionally draining, affects sleep and work focus. Not life-threatening, but deeply stressful.
- **Willingness to Pay:** Moderate-to-high. She already pays for monitoring devices for her own home. If a facility offered this as a premium add-on ($15–30/month), she would likely pay. If marketed directly to families, similar to a subscription app, probably $10–20/month.

**Market size:**

- **How many people like this exist?** ~1.3 million SNF residents in the US at any given time. Most have 2-4 active family contacts. That's 2.6M–5.2M potential users on the family side alone, not counting facility staff.
- **Where do they congregate?** Facebook groups for caregiver support, AARP communities, AgingCare.com, r/AgingParents on Reddit, local caregiver support groups, hospital discharge planners.
- **How would you reach them?** B2B2C — partner with SNF operators and chains (BeachBridge, Ensign Group, Genesis, etc.) to deploy facility-wide; families onboard through facility invitation. Direct-to-consumer via caregiver communities as secondary channel.

---

## **5. Loom Reflection Video**

**Loom URL:** https://www.loom.com/share/461d77b1f6cd4ac0a31d683cb2d8340a

### Reflection Prompts

Use these to guide your 2-minute Loom:

1. What problem did you commit to building, and why this one over the others?
2. What surprised you most from the customer interview?
3. What's one thing you're still uncertain about going into Sprint 3?
4. How does CareBridge Connect align with your personal conviction (moral calling, unique insight)?

---

## Scoring Summary (fill in after AI interview)

| Dimension | Problem 1: Family Disconnection | Problem 2: Nurse Interruption |
|---|---|---|
| Frequency | /5 | /5 |
| Intensity | /5 | /5 |
| Willingness to Pay | /5 | /5 |
| Market Size | /5 | /5 |
| **Opportunity Total** | **/20** | **/20** |
| Personal Pain | /1 | /1 |
| Close Relationship | /1 | /1 |
| Moral Calling | /1 | /1 |
| Unique Insight | /1 | /1 |
| **Conviction Total** | **/4** | **/4** |
| Data/API Access | /1 | /1 |
| Tech Readiness | /1 | /1 |
| No Blockers | /1 | /1 |
| **Feasibility Total** | **/3** | **/3** |
| Expands Agency | /1 | /1 |
| Supports Becoming | /1 | /1 |
| Deepens Connection | /1 | /1 |
| **Gospel Fit** | **/3** | **/3** |

**Decision:** _(which problem you committed to and why)_
