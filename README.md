# 📱 SmartSpend AI – Multi-Tenant Engineering Portfolio Dashboard

SmartSpend AI is a premium, high-performance financial intelligence dashboard engineered with an absolute focus on security isolation and granular transactional tracking. Built on Next.js 16 (React 19) and backed by a Supabase PostgreSQL infrastructure, the application features an isolated sandboxed matrix architecture that bypasses typical public API scaling barriers.

---

## 🚀 Key Engineering Core Features

* **Strict Multi-Tenant Sandbox Isolation:** Automatically computes unique transactional identification hashes (`user_id_username`) down to the database row layer. New logins initialize a pristine blank slate ledger, while existing session tokens pull tightly scoped relational blocks.
* **Custom Database-Driven Inline Auth Engine:** Implements a custom structural credentials mapper (`users_credential` table in Postgres). This eliminates standard email rate limits (`2/hr` on cloud edge nodes) and domain validation constraints completely for instant logins.
* **Dynamic Intelligence Ledger UI:** High-performance dashboard featuring responsive metric cards (Net Liquid Balance, Capital Burn), an interactive Category Allocation Pie Chart, and localized INR formatting.
* **Extension-Shielded Hydration Architecture:** Leverages custom DOM attributes and tag termination patterns to prevent hydration crashing caused by browser autofill systems and extension injections (Grammarly, Password Managers).

---

## 🛠️ Tech Stack & Architecture

* **Frontend UI Matrix:** Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons.
* **Database Engine:** Supabase / Cloud PostgreSQL Core.
* **State Hydration Safeguard:** Integrated `suppressHydrationWarning` and strict self-closing component architectures.

---

## 🚦 Getting Started (Local Development)

### 1. Install Project Dependencies
```bash
npm install
