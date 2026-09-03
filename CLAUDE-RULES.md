# AI & Developer Operating Rules (CLAUDE-RULES.md)

## 1. Single Source of Truth
- Jangan pernah bertanya "sudah sampai mana progresnya" ke user. Selalu baca `CURRENT-STATUS.md`, `MIGRATION-PLAN.md`, dan `DECISIONS.md`.
- Update dokumen status setiap kali menyelesaikan milestone nyata.

## 2. Integrity & Quality Guardrails
- **No Big-Bang**: Kerjakan sesuai tahapan vertical slice per domain.
- **Strict Verification**: Setiap perubahan harus lolos `npm run lint` / `tsc --noEmit` / build check sebelum dilaporkan selesai.
- **Data Safety**: Skema Firestore `batutv-next` adalah live database. Jangan ubah nama field/koleksi tanpa keputusan tercatat di `DECISIONS.md`.
- **Firebase Admin SDK Isolation**: Admin SDK (`firebase-admin`) tidak boleh diimpor di komponen dengan directive `'use client'`.

## 3. Formatting & Standards
- Gunakan TypeScript strict mode.
- Gunakan Zod untuk validasi input dan skema repository.
- Gunakan Tailwind CSS + Shadcn UI untuk styling.
- Gunakan standard repository pattern `I<Domain>Repository` untuk layer data Firestore.
