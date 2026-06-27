# SmartSpend AI 💸

An enterprise-grade, multi-tenant personal finance tracker and automated budgeting system engineered with Next.js and a cloud PostgreSQL instance. The platform features an isolated custom session authentication architecture, automated one-way cryptographic credentials protection, and a serverless pipeline orchestrating Generative AI to deliver personalized, context-bounded financial strategy insights.

**Key Skills:** Full-Stack Software Engineering • Database Schema Design • Multi-Tenant Architecture • Cryptographic Security • Generative AI Orchestration • Serverless API Design • Data Isolation

---

## Table of Contents
- [Overview](#overview)
- [Project Highlights](#project-highlights)
- [System Architecture & Data Flow](#system-architecture--data-flow)
- [Database Schema Design](#database-schema-design)
- [Security & Cryptographic Implementation](#security--cryptographic-implementation)
- [Automated AI Budget Coach Orchestration](#automated-ai-budget-coach-orchestration)
- [Repository Structure](#repository-structure)
- [Engineering Challenges & Resolving Technical Debt](#engineering-challenges--resolving-technical-debt)
- [Future Enhancements](#future-enhancements)

---

## Overview
This repository documents the end-to-end full-stack engineering of **SmartSpend AI**. Rather than relying on rigid, out-of-the-box software-as-a-service frameworks, this platform was designed from the ground up to explore custom multi-tenant data structures, state management optimization, and modern serverless application paradigms.

The core engineering objective was to solve the problem of secure data isolation in a shared-database environment while introducing an asynchronous AI analytics pipeline. The resulting web application provides users with real-time financial tracking, fluid visual expense distribution parsing via interactive vector analytics, and context-aware financial planning insights powered by large language models.

---

## 📋 Project Highlights
- **Custom Auth Framework:** Bypassed third-party managed authentication providers to build a custom session management protocol executing secure tracking using optimized unique identity string handles.
- **Data Isolation Sandbox:** Secured database queries down to individual tenant levels, eliminating multi-client data cross-contamination across all interactive dashboard components.
- **Cryptographic Protection:** Integrated industry-standard password salting and hashing mechanisms to completely eliminate plaintext credentials storage vulnerabilities.
- **Generative AI Orchestration Node:** Engineered a secure, isolated serverless backend controller that shapes, sanitizes, and streams compressed raw ledger arrays to advanced semantic analysis engines.

---

## ⚙️ System Architecture & Data Flow
The platform is built on a decoupled, highly responsive full-stack model optimized for deployment on serverless edge networks:
Client View: React/Next.js]
│
▼ (Secure HTTP POST Payload + Session Identity Token)
[Serverless API Layer: Node.js Route Handlers]
│
├─► [Security Module: bcryptjs verification & isolation checks]
│
├─► [Cloud Storage: Supabase PostgreSQL DB Client Instance]
│
└─► [AI Intelligence: Google Gen AI SDK Engine via Gemini 2.5]

1. **The Client Tier:** An asynchronous React single-page application built using Next.js client-side states, styled with Tailwind CSS, and using Lucide icons for UI instrumentation. Data distribution arrays are managed locally and mapped seamlessly onto dynamic vectors using Recharts.
2. **The Serverless Backend Tier:** Handles state transmission, input validation, and secure execution loops through Next.js App Router API directory routes.
3. **The Infrastructure Storage Tier:** A high-availability cloud PostgreSQL relational database instance communicating over a secured client channel wrapper.

---

## 🧩 Database Schema Design
The application structures relational records across two main core tables inside PostgreSQL to manage accounting flows with tight storage efficiency:

### 1. `users_credential`
Tracks core access management fields. Passwords are protected via one-way cryptographic transformations.
| Column Name | Data Type | Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `username` | `TEXT` | `PRIMARY KEY`, `UNIQUE` | Unique user identity token identifier |
| `password` | `TEXT` | `NOT NULL` | One-way cryptographic hash value |

### 2. `transactions`
Maintains financial records mapping dynamically back to the user identity handle.
| Column Name | Data Type | Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` / `TEXT` | `PRIMARY KEY` | Unique transaction trace key |
| `user_id` | `TEXT` | `NOT NULL` | Multi-tenant isolation reference key |
| `type` | `TEXT` | `NOT NULL` | Distinguishes `income` vs `expense` states |
| `category` | `TEXT` | `NOT NULL` | Structural classification string |
| `amount` | `NUMERIC` | `NOT NULL` | Precision value mapping ledger amounts |
| `description` | `TEXT` | `DEFAULT 'Misc'` | User-defined context notes |
| `transaction_date`| `DATE` | `NOT NULL` | Core calendar index index tracking |

---

## 🔒 Security & Cryptographic Implementation
To move the platform from an open prototype to a secure, production-ready environment, a comprehensive defense-in-depth framework was integrated into the identity architecture:

- **Password Cryptography Engine:** Plaintext strings are blocked from entering the database layer. The platform implements `bcryptjs` execution routines, applying a computing cost factor of **10 salt rounds** to dynamically generate cryptographically unique hashes. This completely safeguards user profiles against dictionary and pre-computed rainbow-table hacking vectors.
- **Strict Query Scoping:** All operations targeting database rows are wrapped inside precise PostgreSQL filter hooks. By running explicit `.eq('user_id', targetUserId)` clauses on every single database call, data access boundaries are securely locked down at the database request level.

---

## 🧠 Automated AI Budget Coach Orchestration
The **SmartSpend AI Budget Coach** bypasses standard chatbot configurations by utilizing a contextual data injection pipeline. Rather than expecting users to type out financial summaries manually, the platform automates data synthesis:

1. **State Aggregation:** Upon an execution click, the application isolates the user's specific backend ledger profile, completely stripping out identifiers belonging to foreign database records.
2. **Data Compression & Token Optimization:** The raw row arrays are parsed, cleansed of database metadata bloat, and reassembled into a dense, newline-separated markdown matrix tracking date, type, amount, and description string attributes.
3. **Prompt Boundary Engineering:** The compressed string matrix is injected into a protected instructions layout bound to strict execution rules. The configuration forces the engine to behave as a dedicated financial planner, deliver exactly 3 high-impact behavioral spending critique points, and format responses in clean markdown without leaking internal query variables.
4. **Execution Model:** The payload is processed using Google's high-speed **`gemini-2.5-flash`** model through the official low-latency SDK, streaming strategic budgeting insights back to the client interface within milliseconds.

---

## 📁 Repository Structure
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai-analyze/   # Secure serverless AI orchestration entry point
│   │   │   ├── auth/         # Cryptographic login/signup server scripts
│   │   │   └── transactions/ # Isolated PostgreSQL transactional CRUD routines
│   │   ├── layout.tsx
│   │   └── page.tsx          # Main high-performance ledger user interface
│   └── utils/
│       └── supabase.js       # Secured database communication abstraction client
├── public/
├── README.md
├── package.json
└── tailwind.config.js


---

## 💡 Engineering Challenges & Resolving Technical Debt
Developing this application involved tackling critical backend and data design architectural bugs:

### 1. Eliminating Multi-Tenant Data Leaks
- **The Problem:** The initial implementation of the AI Budget Coach compiled financial analysis summaries pulling from every single record present within the global database table, exposing private transaction entries across distinct client accounts.
- **The Solution:** Restructured the API endpoint configuration from an unverified open query architecture into a hardened `POST` request routine. Implemented frontend string interpolation logic to securely pull the verified session token object identifier, passing it directly to backend database filter layers to ensure absolute multi-client data sandbox isolation.

### 2. Resolving Strict Data Type Constraints in PostgreSQL
- **The Problem:** Upgrading the application identity framework from native UUID generation systems to custom runtime string handles caused database collision failures. PostgreSQL rejected queries with an `invalid input syntax for type uuid` error due to mismatch criteria on the `user_id` column.
- **The Solution:** Executed a system schema migration utilizing targeted SQL alter data scripts to dynamically re-type the column constraints from standard 36-character `UUID` allocations to a flexible, high-performance `TEXT` schema layout, resolving transaction parsing failures instantly.

---

## 🚀 Future Enhancements
- **Granular Custom Alerts:** Implementing background webhook monitors to trigger threshold alerts when spending tracking nears targeted budget caps.
- **Automated Recurring Ledger Rows:** Engineering automated data cron-jobs to manage monthly student subscription allocations cleanly.
- **OAuth Integration:** Expanding the security stack to support multi-factor single sign-on protocols alongside the custom credentials hashing pipeline.

---

## Acknowledgements
Developed independently to analyze multi-tenant full-stack design patterns, secure database token architectures, and serverless edge computation frameworks utilizing the Next.js ecosystem.

---
**Developer:** Abhishek Tagalpallewar
**Institution:** Indian Institute of Technology Gandhinagar (IITGN)
