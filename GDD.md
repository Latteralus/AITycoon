AI Tycoon — MVP Game Design Document (GDD)
1. Game Overview

Title: AI Tycoon (working title)

Genre: Spreadsheet / Incremental Tycoon Simulator

Theme: You own and operate an AI service, earning revenue as customers use your API. Upgrade infrastructure, improve your model, and grow your business to industry dominance. Prestige to start fresh with permanent bonuses.

Target Platform: Web browser (desktop/mobile), spreadsheet-friendly UI

MVP Goal: Implement the core loop — earn money → upgrade → increase revenue → prestige — with basic UI, upgrade system, and save/load.

2. Core Loop

Earn Revenue: API requests from customers generate money per second.

Upgrade: Spend revenue to improve:

Infrastructure (server capacity, uptime)

Model Quality (accuracy, features)

API Features (streaming, fine-tuning)

Business Growth (marketing, enterprise contracts)

Attract Customers: Better AI and uptime increases request rate.

Repeat until reaching prestige milestone.

Prestige: Reset progress for permanent bonuses toward next AI.

3. Systems
Economy

Base Formula:

Revenue per second = Requests/sec × Price per request × Uptime multiplier


Requests/sec is determined by customer base × satisfaction multiplier.

Price per request is fixed at $0.01 for MVP (can increase via upgrades in later versions).

Uptime multiplier = 1 – (Downtime %).

Upgrades

Each upgrade type has a Base Cost, Cost Multiplier, and Effect.

Base Cost: Starting purchase price.

Cost Multiplier: Price increase per level (MVP default: ×1.15).

Effect: % increase in relevant stat.

Upgrade Category	Name	Effect	Base Cost	Cost Multiplier
Infrastructure	GPUs	+10% Requests/sec	$100	1.15
Infrastructure	Edge Servers	+5% Uptime	$200	1.15
Model Quality	Accuracy	+5% Customer Satisfaction	$150	1.15
Model Quality	Context Length	+5% Requests/sec	$300	1.15
API Features	Streaming API	+5% Requests/sec	$250	1.15
Business Growth	Marketing Campaign	+10% Customer Acquisition Rate	$400	1.15
Customers

MVP will simulate a single customer pool:

Customer Base = 100 × (1 + total % acquisition bonuses).

Every second, customer base requests (base rate × satisfaction multiplier) calls.

Satisfaction increases with uptime and model quality.

Prestige System

Unlock Requirement: Earn $1 billion lifetime revenue.

Effect: Resets all progress, upgrades, and customers.

Reward: 1 Prestige Point (PP) per $1 billion revenue earned.

PP Spending Options:

+2% Revenue per second per PP.

–2% Upgrade costs per PP.

Scaling: Bonuses stack additively.

Events (Optional, MVP Lite)

For MVP, events are not required. If time allows:

Good: “Tech blog feature” (+20% customers for 30 sec)

Bad: “Server outage” (–50% uptime for 10 sec)

4. Progression Flow

Start:

$100 starting cash.

100 customers at 1 request/sec each.

Price per request = $0.01.

Uptime = 95%.

Goal for MVP Session:

Buy upgrades until reaching $1B revenue milestone.

Prestige and restart with permanent bonuses.

5. UI Layout (MVP)

Dashboard:

Current Revenue/sec

Current Requests/sec

Uptime %

Lifetime Revenue

Prestige Points

Upgrades Tab:

List of all upgrades with level, cost, and effect.

Prestige Tab:

Requirements

Current PP

Available prestige bonuses

Save/Load:

Auto-save to localStorage every 5 seconds.

6. Technical Notes

Tech Stack: HTML, CSS, JavaScript (vanilla or lightweight framework).

Data Storage: localStorage JSON object with:

Money

Lifetime Revenue

Requests/sec

Upgrade levels

Prestige Points

Bonuses applied

Tick Rate: Game updates once per second (setInterval or requestAnimationFrame).

Upgrade Formula:

New Cost = Base Cost × (Cost Multiplier ^ Upgrade Level)


Revenue Formula:

Revenue/sec = Customers × Requests/sec × Price × Uptime

7. MVP Build Plan

Phase 1: Core Systems

Revenue per tick.

Upgrade purchases & stat changes.

Prestige reset & bonuses.

Phase 2: UI

Minimal text-based UI with buttons for upgrades and prestige.

Real-time updating stats.

Phase 3: Save/Load

Auto-save & load with localStorage.

Phase 4 (Optional Polish)

Event system.

Graphs for revenue and customers.

Animations.