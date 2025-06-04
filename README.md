# zkResume Snapshot 🧠🔐

**A privacy-first credentialing dApp using iExec Confidential Computing and Neon EVM.**

## 🧩 Overview

**zkResume Snapshot** allows users to **prove their work experience** or employment history without revealing sensitive details such as employer names, roles, or dates.

This is done by:
1. Processing encrypted employment proofs inside iExec Trusted Execution Environments (TEEs).
2. Generating a verifiable hash representing the proof.
3. Minting a **non-transferable NFT on Neon EVM** as a zero-knowledge employment badge.

The result: a cryptographic resume snapshot that protects user privacy and proves credibility.

---

## 🚀 Use Case

- ✅ Freelancers and contractors under NDAs.
- ✅ People leaving controversial companies but needing to prove experience.
- ✅ On-chain identity or DeFi credit scoring, while maintaining job data privacy.

---

## 🔧 Tech Stack

| Layer        | Stack                                       |
|-------------|---------------------------------------------|
| Confidential Computing | [iExec TEE](https://iex.ec) + iApp Generator |
| Smart Contract | Solidity + Neon EVM                      |
| Frontend     | React / Next.js (optional)                 |
| Deployment   | Hardhat + Neon Devnet                      |

---

## 📦 Installation

```bash
git clone https://github.com/your-repo/zkresume-snapshot.git
cd zkresume-snapshot
npm install