# 🤖 eelienX Protocol

**Autonomous trading agent with a gamified interface — powered by real exchange data, copy trading, and AI-driven decision cycles.**

> "Our agent doesn't just execute trades — it explains every decision, lets you copy the best traders in the world, and wraps the entire experience in an addictive game."

🎮 **Live demo:** [eelienx-protocol-5lx7.vercel.app](https://eelienx-protocol-5lx7.vercel.app)
📄 **Agent manifest:** [/agent.json](https://eelienx-protocol-5lx7.vercel.app/agent.json)
📊 **Execution log:** [/agent_log.json](https://eelienx-protocol-5lx7.vercel.app/agent_log.json)

---

## 🧠 What the Agent Does

eelienX is a fully autonomous trading agent that:

1. **Discovers** — scans ETH/MXN market in real time (Bitso API)
2. **Plans** — generates a signal using RSI, volume, and whale sentiment
3. **Executes** — places trades autonomously with position sizing
4. **Verifies** — confirms post-trade price delta and profit
5. **Submits** — logs the result and updates session portfolio

---

## 📊 Strategy

The agent implements three autonomous strategies:

| Signal | Condition | Action |
|---|---|---|
| Dip Accumulation | RSI < 30 + volume spike > 200% | BUY |
| Momentum | Price up > 5% in 1H + bullish divergence | LONG |
| Copy Trading | Whale signals with >80% historical win rate | COPY |
| Risk Guard | Volatility index > 0.7 → cancel before execution | CANCEL |

**Risk management is built-in:**
- 20% of trades are cancelled by the volatility safeguard
- Max trade size enforced server-side
- Stop-loss baked into copy trading positions

---

## 📈 Simulation Results

Recent autonomous cycles (see [agent_log.json](/agent_log.json)):

| Trade | Strategy | Result |
|---|---|---|
| BUY ETH/MXN | Dip Accumulation (RSI oversold) | +1.80% |
| RISK CANCEL | Volatility spike detected | 0 (protected) |
| COPY Vitalik | 91% win-rate strategy | +2.10% |

**Session total: +3.90%** across 3 decision cycles, 1 safeguard triggered.

---

## 🎮 Game Interface

The agent lives inside a **2D gamified world** (mobile-first):

- 🏠 **Home screen** — shows ETH + MXN balance, agent status
- 🤖 **Agent screen** — select strategy (aggressive / conservative / copy trade), pick a whale to follow (Vitalik, CZ, Elon, Trump, SBF), execute
- 📊 **Results** — win/loss animation, coin sound (Web Audio API), NPC dialog explaining the decision
- 🏆 **Podium screen** — leaderboard of whale win rates

**No audio files** — all sounds are generated in real time via Web Audio API.

---

## 🔗 Technical Architecture

```
User → /game2 (React, mobile-first)
     → /api/trade (autonomous cycle endpoint)
         → price_feed → market_analysis → strategy_engine → risk_guard
         → Bitso Exchange API (real trades when session exists)
         → structured response: action + profit + log + x402 metadata

User → /register → Bitso credentials encrypted → Supabase (AES-256)
     → /api/agent-action (real ETH trades via Bitso REST API)
```

**Stack:** Next.js 14 · TypeScript · Supabase · JWT sessions · React Three Fiber (3D world at `/game`) · Tailwind · Web Audio API

---

## ⚡ x402 Agent Service

The trading signal endpoint is exposed as an **x402 pay-per-query service** on Base:

```bash
# Free tier
POST /api/trade

# Premium signals (x402)
POST /api/trade
X-Payment: <usdc-payment-proof>
X-402-Price: 0.01 USDC
X-402-Network: Base
```

GET `/api/trade` returns service discovery metadata — discoverable by other agents.

---

## 🆔 Agent Identity

| Field | Value |
|---|---|
| Agent manifest | `/agent.json` |
| Execution log | `/agent_log.json` |
| ERC-8004 identity | `PENDING_REGISTRATION` |
| Operator network | Base Mainnet |
| Hackathon tracks | Autonomous Trading · Protocol Labs · Base x402 Service |

---

## 🚀 Roadmap

- [ ] ERC-8004 identity registration on Base
- [ ] Multi-agent swarm: analyzer + executor + risk + reporter
- [ ] Lido stETH yield treasury for agent operating budget
- [ ] OpenServ orchestration for multi-agent coordination
- [ ] MetaMask delegation for permissioned autonomous spending

---

## 💬 The Pitch

> "eelienX doesn't just run a script. It's an agent that thinks: should I buy now? What are the best traders doing? Is it too risky? It decides, acts, and explains — all without a human in the loop. Wrapped in a game that makes trading feel like a quest."

---

## 🏆 Hackathon

Built for **Synthesis 2026** — targeting:
- Agente de Comercio Autónomo ($5,000)
- Protocol Labs "Let the Agent Cook" ($4,000)
- Base Agent Service x402 ($5,000)
- OpenServ multi-agent DeFi ($4,500)
