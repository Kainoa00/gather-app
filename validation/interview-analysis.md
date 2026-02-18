# CareBridge Connect: Customer Discovery Interview Analysis
## Skilled Nursing Facility Family Communication Study
### 11 Interviews | Administrators, Social Services, Senior Placement | CA & UT

---

## Executive Summary

Eleven interviews were conducted with SNF administrators, social services professionals, and a senior placement specialist across California and Utah to validate CareBridge Connect — a HIPAA-compliant family portal that translates clinical documentation into plain-English updates for families. The data reveals a consistent and significant pain point: families are chronically underinformed, staff are chronically interrupted, and the current "phone call" system is inefficient for all parties. There is strong directional validation for the product concept, tempered by important cautions around HIPAA compliance, data accuracy, and the downstream risks of clinical misinterpretation.

---

## 1. Most Powerful Direct Quotes

**Shane Dahl, Administrator, CA — the core product opportunity:**
> "Figure out how to inform families without having to interrupt staff and delay care."

**Shane Dahl, Administrator, CA — on data quality constraints:**
> "We're only as good as the paperwork they come with."

**Cindy Turner, Senior Placement, CA — on the insurance dynamic:**
> "Insurance doesn't want to approve more days so they like family members being out of the loop. This software would be good to keep family informed and extra paper trail."

**Cindy Turner, Senior Placement, CA — on why this problem persists:**
> "Families complain they don't get any information. Nobody picks up the phone at facilities."

**Alex Roper, Administrator, UT — on real-time data risk:**
> "If it's instant it may be hard because they might have high blood sugar for a second but then the nurses will fix it and update the charts."

**Shaun Dahl, Administrator, CA — unprompted feature spec:**
> "Something like 'all medication was taken as ordered by the doctor' at a specific time."

**Seth Braithwaite, Administrator, CA — root cause:**
> "People's expectations are not met or they are not well informed."

---

## 2. Key Patterns & Themes

**Theme 1: The Phone System Is Broken**
Every interviewee described communication as phone-based, reactive, and disruptive. Shane Dahl: "Medication nurses get bugged a lot from family members." Alex Roper described "Angel rounds" — proactive calls every two weeks — as the only structured protocol, and even that is a manual workaround.

**Theme 2: Therapy Progress Is the #1 Most Requested Update**
Named without prompting by at least 6 of 11 interviewees. Alex Roper: "Therapy data is the biggest." Cindy Turner flagged clinical shorthand like "min/mod/max assist" as needing plain-English translation.

**Theme 3: HIPAA Is More Complex Than a Single Gate**
Cindy Turner explained the distinction between financial vs. medical power of attorney, patient-signed release requirements, and heightened psychiatric record protections. This is not a checkbox — it is an authorization architecture.

**Theme 4: Charting Accuracy Is an Upstream Risk**
Multiple interviewees flagged inconsistent charting. Annaliese Haroldson: "CNAs are charting different stuff than what the therapy is charting." The product surfaces what staff chart — if charting is unreliable, so is the portal.

**Theme 5: Families Ask About Daily Life as Much as Clinical Data**
Shane Dahl: "Did mom eat today, did she get a shower, did she get out of bed, did she go to activities — physical tasks." Emotional reassurance about daily routine matters as much as health metrics.

**Theme 6: Appointment Notification Is a Clear, Underserved Need**
Alex Roper ranked it "the second biggest thing." Facilities sometimes don't even have appointment data. It's a low-risk, high-value feature.

**Theme 7: Facilities Want to Reduce Interruptions, Not Just Improve Satisfaction**
Shane Dahl's explicit ask: reduce calls. Kyle Haroldsen: "help save time for social services." The facility buyer cares about operational efficiency first.

---

## 3. Surprises

**Surprise 1: CareBridge Connect Could Be an Insurance Dispute Tool**
Cindy Turner revealed that insurance companies *prefer* families to be uninformed because informed families appeal discharge decisions more effectively. CareBridge Connect creates a paper trail that benefits families in appeals — an unanticipated and potentially differentiating value proposition.

**Surprise 2: Real-Time Data Can Be Counterproductive**
Raw metrics (blood sugar spikes, etc.) can alarm families before clinical staff have a chance to address and document corrections. The product should aggregate and contextualize, not stream raw data.

**Surprise 3: Some Facilities Already Have Proactive Protocols**
"Angel rounds" (bi-weekly family calls) means CareBridge Connect competes against institutionalized workarounds, not just inaction. Must show clear superiority.

**Surprise 4: Families Care About Social/Daily Life More Than Expected**
The dominant family questions are: did she eat, bathe, and participate in activities — not her vitals.

**Surprise 5: The Primary EHR Integration Target Was Named**
Shane Dahl specifically identified **Point Click Care** as the dominant EMR to integrate with — unprompted.

---

## 4. Biggest Cautions

| Risk | Source |
|---|---|
| HIPAA authorization is more complex than assumed | Turner, multiple |
| AI summaries can make conditions sound worse than they are | Roper |
| Families could use data to manipulate patients | Roper, K. Haroldsen |
| Data quality is outside the product's control | Haroldson, Jergensen, S. Dahl |
| Older family members may not use a digital platform | Shane Dahl |
| Additional charting burden will create staff resistance | Braithwaite |

---

## 5. Most Requested Features (Ranked by Frequency)

| Rank | Feature | Mentioned By |
|---|---|---|
| 1 | Therapy progress (plain English) | 6/11 interviewees |
| 2 | Appointment notification | 4/11 |
| 3 | Medication status (abstracted) | 4/11 |
| 4 | Change of condition alerts | 3/11 |
| 5 | Daily living updates (meals, bathing, activities) | 3/11 |
| 6 | Discharge plan / timeline | 3/11 |
| 7 | Nurse on-call contact info | 1/11 (explicitly requested) |
| 8 | Review / satisfaction requests | 1/11 |

---

## 6. Competitor Intelligence

**Informed Medical** (informedmedical.com) — named by Jeff Beltran, Administrator CA.
- Positioned as protecting *facilities*, not serving *families*
- Differentiation opportunity: lead with family experience + staff efficiency; treat compliance as foundational requirement, not the headline pitch

---

## 7. Revised JTBD & Value Propositions

**Family JTBD:**
> "When my parent is in a SNF and I can't be there, help me know they are safe, progressing, and cared for — in terms I understand — without having to chase down a nurse."

**Facility JTBD:**
> "When families call repeatedly for updates, help me give them what they need — safely and accurately — so my care team can focus on delivering care instead of answering phones."

**Bonus JTBD (insurance appeals — Cindy Turner):**
> "When insurance tries to discharge my loved one prematurely, give me the documented evidence to appeal effectively."

---

## 8. Strategic Build Priorities (from interview data)

1. **Build therapy progress translation first** — highest frequency, most differentiated
2. **Pursue Point Click Care integration immediately** — named specifically, dominant EHR
3. **Engage HIPAA legal counsel before launch** — authorization complexity is greater than anticipated
4. **Design for abstraction, not streaming** — aggregate and interpret before surfacing to families
5. **Sell to administrators on call volume reduction** — family satisfaction is the outcome, not the pitch
6. **Validate the insurance dispute use case** in the next round — if confirmed, strongest differentiation angle
