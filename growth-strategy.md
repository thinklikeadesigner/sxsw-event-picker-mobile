# Growth Strategy: Event-Based User Acquisition & Organizer Sales Pipeline

## Overview

Acquire users by attending wellness and tech events in person, sharing QR codes that link to the PWA. Track attribution per event so you can prove value back to organizers — turning user acquisition into your sales pipeline.

## QR Code Attribution System

### Setup
- Use Google Analytics 4 with UTM parameters for each QR code
- Generate unique QR codes per event using UTM-tagged URLs
- Format: `https://wandratx.com/?utm_source=qr&utm_medium=event&utm_campaign={event-name}&utm_content={date}`

### Example
```
Event: Founders Running Club, Apr 4
URL: https://wandratx.com/?utm_source=qr&utm_medium=event&utm_campaign=founders-running-club&utm_content=2026-04-04
```

### QR Code Tools
- Free: qr-code-generator.com, Google Charts API
- Branded: Beaconstac or QR Code Monkey (custom colors, logo overlay)
- Print: Generate at least 50 cards per event, business card size

## Google Analytics Setup

### Events to Track
- `qr_scan` — landing page hit with UTM params (automatic)
- `pwa_install` — user adds to home screen (track via `beforeinstallprompt` event)
- `event_starred` — user stars an event in the app
- `filter_used` — user engages with wellness/tech filters
- `return_visit` — user comes back within 7 days

### Key Reports to Build
1. **Acquisition by event** — which events drive the most installs
2. **Retention by source** — do wellness event users stick around vs tech event users
3. **Engagement depth** — how many events do QR-acquired users star on average

## On-the-Ground Playbook

### Before the Event
- [ ] Generate unique QR code with UTM tags for that specific event
- [ ] Print QR cards (business card size, front: "Plan your week in Austin" + QR, back: brief app description)
- [ ] Save the QR as a phone wallpaper or widget for quick sharing

### At the Event
- [ ] Arrive early, be a participant first — not a promoter
- [ ] Share naturally in conversation: "I built this app to find events like this one"
- [ ] Show your phone, let them scan your screen if you run out of cards
- [ ] Talk to the organizer — introduce yourself, mention the app, ask if they'd want their events featured
- [ ] Note organizer's reaction and contact info

### After the Event
- [ ] Check GA for scan count within 24 hours
- [ ] Follow up with organizer if they showed interest
- [ ] Log results in the tracker below

## Organizer Sales Pipeline

### The Pitch
"I run Wandr ATX — [X] founders use it to plan their week. I was at your event on [date] and [Y] people found you through the app. Want to be featured to the full audience?"

### What You Need Before Pitching
- At least 200+ weekly active users (check GA)
- Attribution data showing you drove attendees to their event
- Screenshots of their event listing in the app

### Pricing (Starting Point)
- **Free**: Basic listing (current default)
- **$50/month**: Featured placement + highlighted card in the app
- **$100/month**: Featured + push notification to users who starred similar events
- **Custom**: Sponsored day plans ("Start your Saturday with [Organizer]'s yoga, then...")

## Tracking Spreadsheet

| Date | Event | Organizer | QR Scans | PWA Installs | Organizer Interest? | Follow-up Date |
|------|-------|-----------|----------|--------------|--------------------|----|
| | | | | | | |

## Priority Events to Attend (April 2026)

These have high attendance and engaged organizers:

1. **Founders Running Club** (Apr 4) — 500+ attendees, recurring
2. **Pitch and Run ATX** (Apr 3) — 468+ attendees, founder crowd
3. **The Health Hustlers** (Apr 7) — 138+ attendees, wellness professionals
4. **Business + Birdies** (Apr 9) — 44+ attendees, founder networking
5. **Austin Adult Field Day** (Apr 11) — broad appeal, social
6. **Pickle & Pints** (Apr 22) — tech + research community
7. **founders & funders: social dance** (Apr 25) — 35+ attendees, mixed crowd

## Milestones

- [ ] **Week 1**: Attend 2-3 events, distribute QR codes, validate that people actually scan and use the app
- [ ] **Week 2-3**: Hit 200+ total users, refine the pitch based on what resonates in conversation
- [ ] **Month 1**: Reach 500+ users, approach first 3 organizers with attribution data
- [ ] **Month 2**: First paying organizer, iterate on pricing based on feedback
