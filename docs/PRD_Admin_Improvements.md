# PRD — Admin Panel Improvements (Raycode Studio)

> **Versi:** 1.0  
> **Tanggal:** 2026-10-13  
> **Status:** Draft — menunggu review  
> **Tujuan:** Memperbaiki UX admin panel agar usable oleh non-teknis, mengurangi error operasional, dan mempercepat workflow harian.

---

## 1. Latar Belakang & Masalah (Problem Statement)

Admin panel saat ini fungsional tapi **tidak user-friendly untuk non-teknis**:

| Area | Masalah Utama | Dampak Bisnis |
|------|---------------|---------------|
| **Navigasi** | Sidebar flat, tanpa grouping, tanpa search | Waktu cari fitur > 30 detik |
| **Konten** | Langsung live saat save, tanpa preview/draft | Typo/typo langsung ke production |
| **Order/Project** | Status manual, tanpa workflow visual, tanpa timeline | Admin bingung urutan status, client nanya "kemarin status apa?" |
| **Form** | Error message teknis, required field tidak jelas, tanpa help text | Submit gagal → admin bingung field mana |
| **User/Permission** | Role cuma admin/client, tanpa audit log, tanpa 2FA | Risiko keamanan & traceability |
| **Dashboard** | Statis, tanpa trend/grafik, tanpa export | Tidak bisa ambil keputusan berbasis data |
| **Setting** | Tersebar, tanpa validasi env, tanpa test mode toggle | Setup awal ribet, ganti sandbox/prod manual |

---

## 2. User Personas

| Persona | Deskripsi | Kebutuhan Utama |
|---------|-----------|-----------------|
| **Admin Operasional (Non-Tech)** | Kelola order, project, konten harian | Workflow jelas, error message manusiawi, preview sebelum publish |
| **Admin Teknis / Owner** | Setup integrasi, monitoring, laporan | Validasi env, audit log, export data, dashboard analytics |
| **Content Manager** | Kelola Service, Portfolio, Blog, Faq, Pricing | Draft/publish, clone/duplicate, image crop, rich text |

---

## 3. Scope — In Scope vs Out of Scope

### In Scope (Phase 1 - Quick Wins, 1-2 minggu)
- [x] Breadcrumb di semua halaman admin (VERIFIED: `AdminBreadcrumb.tsx` otomatis di `AdminLayout.tsx`)
- [x] Toast notification system (ganti alert browser) (VERIFIED: `ToastProvider.tsx` auto-listen Inertia `flash.success/error`)
- [x] Confirm modal sebelum delete/destructive action (VERIFIED: `ConfirmProvider` + `useConfirm` ganti 11 `confirm()` browser di semua halaman)
- [x] Inline help text (tooltip `?` dan hint) di field ambigu (VERIFIED: `HelpTooltip` & `hint` di `ui.tsx`, diterapkan di form `Services.tsx`, `PricingPlans.tsx`)
- [x] Search + filter di tabel utama (Order, Project, User, Service, Portfolio, Blog) (VERIFIED: search q/status aktif dengan pagination)
- [x] Bulk actions (delete multiple, role update multiple) (VERIFIED: `Users.tsx` checkbox + floating toolbar, `admin.users.bulk` controller, 5 tests passed)
- [x] Required field indicator + validasi client-side yang jelas (VERIFIED: bintang merah `*` otomatis via `FieldLabel` di `ui.tsx` saat `required`)

### In Scope (Phase 2 - Core UX, 2-3 minggu)
- [ ] Draft/Publish workflow di Service, Portfolio, Blog, Faq, PricingPlan
- [ ] Preview button (buka tab baru ke halaman publik)
- [ ] Clone/Duplicate content
- [ ] Image upload dengan crop/preview + aspect ratio guide
- [ ] Rich text editor (TipTap/Quill) untuk deskripsi panjang
- [ ] Order/Project status workflow visual + timeline history
- [ ] Invoice preview PDF sebelum kirim WA

### In Scope (Phase 3 - Governance & Analytics, 2-3 minggu)
- [ ] Audit log (admin_logs table) — siapa, apa, kapan, IP
- [ ] Granular permission (RBAC) — minimal: Superadmin, Admin, Content Editor
- [ ] 2FA untuk admin panel
- [ ] Dashboard analytics: trend order, revenue, conversion, top services
- [ ] Export CSV/Excel di semua tabel utama
- [ ] Setting terpusat dengan validasi env + test mode toggle

### Out of Scope (Future)
- Multi-language admin UI
- Advanced reporting (cohort, retention, LTV)
- Workflow engine visual (drag-drop status)
- Mobile app admin

---

## 4. Functional Requirements (FR)

### FR-1: Navigation & Discoverability
| ID | Requirement | Detail |
|----|-------------|--------|
| FR-1.1 | Sidebar grouped by domain | Groups: **Konten** (Service, Portfolio, Blog, Faq, Pricing), **Transaksi** (Order, Project, Invoice), **Pengguna** (User, Message), **Pengaturan** (Setting, Homepage, Estimator) |
| FR-1.2 | Global search (Cmd+K) | Search across: Order code, Project code, User email, Service title, Blog slug |
| FR-1.3 | Breadcrumb di semua halaman | Format: `Admin > Transaksi > Order > RAY-20261013-0001` |
| FR-1.4 | Active state visual di sidebar | Highlight parent group + child item |

### FR-2: Notification & Feedback
| ID | Requirement | Detail |
|----|-------------|--------|
| FR-2.1 | Toast system | Success (hijau), Error (merah), Warning (kuning), Info (biru) — auto-dismiss 4s, persistent untuk error kritis |
| FR-2.2 | Confirm modal | Sebelum: delete, bulk delete, status change ke "Cancelled/Rejected", publish/unpublish |
| FR-2.3 | Loading state | Skeleton/loader saat fetch data, disable button saat submit |

### FR-3: Form & Validasi
| ID | Requirement | Detail |
|----|-------------|--------|
| FR-3.1 | Required field indicator | Bintang merah `*` + label "Wajib diisi" |
| FR-3.2 | Inline help text | Icon `?` di samping label → tooltip/expandable help text |
| FR-3.3 | Client-side validasi | Real-time: email format, URL format, number range, unique slug check (debounced) |
| FR-3.4 | Error message manusiawi | Contoh: `"Email sudah terdaftar"` bukan `"unique constraint failed on users.email"` |
| FR-3.5 | Auto-save draft | Setiap 30s saat edit konten panjang (Blog, Service desc) |

### FR-4: Content Management (Service, Portfolio, Blog, Faq, PricingPlan)
| ID | Requirement | Detail |
|----|-------------|--------|
| FR-4.1 | Draft/Publish toggle | Status: `Draft` (hidden dari publik) / `Published` (visible) |
| FR-4.2 | Preview button | Buka tab baru ke `/services/{slug}`, `/portfolio/{slug}`, `/blog/{slug}` dengan query `?preview=1` |
| FR-4.3 | Clone/Duplicate | Tombol "Salin" → buat entry baru dengan slug `-copy-{n}`, status Draft |
| FR-4.4 | Image crop/preview | Upload → cropper modal (aspect ratio: Service 4:3, Portfolio 16:9, Blog 16:9) → preview sebelum save |
| FR-4.5 | Rich text editor | TipTap/Quill untuk: Service.description, Blog.content, Portfolio.description |
| FR-4.6 | Slug auto-generate + unique check | Auto dari title, editable, real-time unique check, suggestion jika konflik |

### FR-5: Order & Project Management
| ID | Requirement | Detail |
|----|-------------|--------|
| FR-5.1 | Status workflow visual | Diagram: `Inquiry → DP Paid → On Progress → Final Invoice → Final Paid → Revision → Done` |
| FR-5.2 | Status transition rules | Hanya boleh next/prev, tidak bisa lompat (mis. Inquiry → Done tidak boleh) |
| FR-5.3 | Timeline history per project | Log: status change, payment, file upload, message, note — dengan timestamp & actor |
| FR-5.4 | Invoice preview PDF | Modal preview sebelum "Kirim WA" / "Resend" |
| FR-5.5 | Bulk status update | Pilih multiple order → ubah status sekaligus (dengan validasi rules) |
| FR-5.6 | Auto-notify client | Saat status berubah → trigger WA notification (existing WhatsappService) |

### FR-6: User & Permission
| ID | Requirement | Detail |
|----|-------------|--------|
| FR-6.1 | RBAC minimal 3 role | `Superadmin` (full), `Admin` (transaksi + konten, no setting critical), `Content Editor` (hanya konten) |
| FR-6.2 | Audit log | Table `admin_logs`: id, user_id, action, model_type, model_id, old_values, new_values, ip, ua, created_at |
| FR-6.3 | 2FA (TOTP) | Optional per user, wajib untuk Superadmin |
| FR-6.4 | Impersonate user | Superadmin bisa "Login as client" untuk debug (dengan audit log) |

### FR-7: Dashboard & Analytics
| ID | Requirement | Detail |
|----|-------------|--------|
| FR-7.1 | KPI cards | Total Order (bulan ini), Revenue, Conversion Rate, Avg Order Value |
| FR-7.2 | Trend chart | Order harian (30 hari), Revenue bulanan (12 bulan) — pakai Chart.js/Recharts |
| FR-7.3 | Top Services | Most ordered, highest revenue |
| FR-7.4 | Export CSV | Semua tabel utama: Order, Project, User, Service, Portfolio, Blog, Invoice |

### FR-8: Settings & Configuration
| ID | Requirement | Detail |
|----|-------------|--------|
| FR-8.1 | Settings terpusat | Single page dengan tabs: General, Midtrans, WhatsApp, Email, SEO, Appearance |
| FR-8.2 | Env validation | Cek format: MIDTRANS_SERVER_KEY (prefix `SB-Mid-server-`/`Mid-server-`), WA token, SMTP |
| FR-8.3 | Test Mode toggle | Switch Sandbox/Production untuk Midtrans & WA — simpan ke DB, override env |
| FR-8.2 | Test buttons | "Test Kirim WA", "Test Midtrans Snap", "Test Email" |

---

## 5. Non-Functional Requirements (NFR)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Page load (admin) | < 1.5s (p95) |
| NFR-2 | Toast appears | < 100ms after action |
| NFR-3 | Search results | < 300ms (debounced 200ms) |
| NFR-4 | Mobile responsive | Usable di ≥ 375px width |
| NFR-5 | Keyboard navigation | Tab order logis, focus visible, Escape close modal |
| NFR-6 | A11y | WCAG 2.1 AA — contrast, labels, ARIA |
| NFR-7 | Audit log retention | 2 tahun (archive policy nanti) |
| NFR-8 | Zero downtime deploy | Migration tidak lock tabel lama > 5s |

---

## 6. UI/UX Specifications

### 6.1 Design Tokens (Existing — gunakan yang ada)
- Colors: `brand-600` primary, `brand-50` light, `emerald-500` success, `red-500` error, `amber-500` warning
- Radius: `rounded-2xl` card, `rounded-xl` input, `rounded-full` badge
- Shadow: `shadow-sm` default, `shadow-lg` hover/modal
- Font: Inter (sans), JetBrains Mono (code/slug)

### 6.2 Component Library (Tambahkan ke `resources/js/Components/ui/`)
| Component | Props | Variants |
|-----------|-------|----------|
| `AdminLayout` | children, breadcrumbs | - |
| `Sidebar` | groups, activePath, onSearch | collapsed/expanded |
| `Toast` | type, message, duration, action? | success/error/warning/info |
| `ConfirmModal` | title, description, onConfirm, variant | danger/primary |
| `DataTable` | columns, data, pagination, sorting, filtering, selection, bulkActions | - |
| `StatusBadge` | status, workflow? | default/outlined/soft |
| `WorkflowTimeline` | steps, currentStep, logs[] | horizontal/vertical |
| `ImageCropper` | aspectRatio, onCropComplete | modal/inline |
| `RichTextEditor` | value, onChange, placeholder | minimal/full |
| `SettingsTabs` | tabs[], activeTab, onChange | - |

### 6.3 Responsive Breakpoints
- `< 640px`: Sidebar collapsible (off-canvas), tabel horizontal scroll, card stack
- `640-1024px`: Sidebar collapsed by default (icon only), hover expand
- `> 1024px`: Sidebar expanded default

---

## 7. Database Changes (Migration)

| Table | Columns | Index |
|-------|---------|-------|
| `admin_logs` | id, user_id (FK), action (string), model_type (string), model_id (bigint), old_values (json), new_values (json), ip (string), user_agent (string), created_at | (user_id, created_at), (model_type, model_id) |
| `users` (add) | two_factor_secret (nullable), two_factor_recovery_codes (json), role (enum: superadmin, admin, content_editor) default 'admin' | role |
| `services`, `portfolios`, `blog_posts`, `faqs`, `pricing_plans` (add) | status (enum: draft, published) default 'draft', published_at (nullable) | status, published_at |

---

## 8. API Endpoints (Tambahan)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/search` | Global search q=... → { orders[], projects[], users[], services[] } |
| POST | `/admin/toast` | Internal: trigger toast dari server (optional) |
| GET | `/admin/export/{resource}` | Export CSV: orders, projects, users, services, portfolios, blogs, invoices |
| POST | `/admin/impersonate/{user}` | Superadmin login as user |
| POST | `/admin/2fa/enable` | Generate TOTP secret + QR |
| POST | `/admin/2fa/disable` | Disable 2FA |
| POST | `/admin/2fa/verify` | Verify TOTP code |
| PATCH | `/admin/{resource}/{id}/status` | Bulk status update dengan validasi workflow |
| GET | `/admin/dashboard/stats` | KPI + chart data |

---

## 9. Acceptance Criteria (Definition of Done)

### Phase 1 (Quick Wins)
- [x] Semua halaman admin punya breadcrumb yang benar (`AdminBreadcrumb.tsx` otomatis di `AdminLayout.tsx`)
- [x] Semua aksi destructive (delete, status critical) punya confirm modal (`ConfirmProvider` + `useConfirm` - 0 alert/confirm browser)
- [x] Toast muncul untuk semua CRUD sukses/error — tidak ada lagi `alert()` (`ToastProvider.tsx` flash auto-catch)
- [x] Semua form punya required indicator (`*`) + help text (`HelpTooltip` & `hint`) di field ambigu
- [x] Search + filter kerja di tabel: Order, Project, User, Service, Portfolio, Blog
- [x] Bulk delete & bulk role change kerja di tabel utama (`admin.users.bulk` + floating action bar)
- [x] Validasi client-side mencegah submit kosong/error format (HTML5 required + field validation)

### Phase 2 (Core UX)
- [ ] Service, Portfolio, Blog, Faq, PricingPlan punya Draft/Publish toggle
- [ ] Preview button buka halaman publik di tab baru dengan benar
- [ ] Clone/Duplicate buat entry baru dengan slug unik
- [ ] Image upload punya cropper + preview sebelum save
- [ ] Rich text editor jalan di deskripsi panjang
- [ ] Order/Project status workflow visual + timeline history
- [ ] Invoice preview PDF sebelum kirim WA

### Phase 3 (Governance)
- [ ] Audit log tercatat untuk semua CRUD admin
- [ ] RBAC 3 role berfungsi (Superadmin, Admin, Content Editor)
- [ ] 2FA bisa enable/disable/verify
- [ ] Dashboard punya KPI cards + trend chart + export CSV
- [ ] Settings terpusat dengan validasi env + test mode toggle

---

## 10. Risks & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|--------------|--------|----------|
| Migration `admin_logs` lock tabel besar | Rendah | Tinggi | Buat tabel baru, tidak alter existing; backfill async nanti |
| RBAC break existing admin access | Sedang | Tinggi | Default role `admin` = full access kecuali setting kritis; test di staging dulu |
| Rich text editor bundle size besar | Tinggi | Sedang | Pakai TipTap headless + load lazy (dynamic import) |
| Chart.js bundle di admin | Sedang | Sedang | Load lazy hanya di dashboard |
| Auto-save draft conflict | Rendah | Sedang | Optimistic locking dengan `version` column atau timestamp check |

---

## 11. Dependensi Eksternal

| Library | Alasan | Size Impact |
|---------|--------|-------------|
| `tiptap` / `@tiptap/vue-3` (atau react) | Rich text editor | ~50kb gz (lazy load) |
| `chart.js` + `react-chartjs-2` | Dashboard charts | ~30kb gz (lazy load) |
| `cropperjs` | Image crop | ~15kb gz |
| `react-hot-toast` / `sonner` | Toast system | ~5kb gz |

> Catatan: Semua library load **lazy** (dynamic import) agar tidak memperbesar bundle awal.

---

## 12. Rollout Plan

| Phase | Durasi | Deliverable | Testing |
|-------|--------|-------------|---------|
| **Phase 1** | 1 minggu | Quick Wins (breadcrumb, toast, confirm, search, bulk) | Manual test semua halaman admin |
| **Phase 2** | 2 minggu | Draft/Publish, Preview, Clone, Image Crop, Rich Text, Workflow | E2E test: create→draft→preview→publish |
| **Phase 3** | 2 minggu | Audit log, RBAC, 2FA, Dashboard Analytics, Settings | Security test + load test |

---

## 13. Success Metrics (KPI)

| Metrik | Baseline | Target (3 bln) |
|--------|----------|----------------|
| Waktu rata-rata cari fitur admin | ~45 detik | < 10 detik |
| Error submit form (user-reported) | ~5/minggu | < 1/minggu |
| Waktu generate invoice + kirim WA | ~3 menit | < 1 menit |
| Admin login dengan 2FA | 0% | 100% Superadmin, 50% Admin |
| Audit log coverage | 0% | 100% CRUD actions |

---

## 14. Appendix: Current Admin Routes (Reference)

```
GET|HEAD  admin/dashboard                    admin.dashboard
GET|HEAD  admin/orders                       admin.orders.index
GET|HEAD  admin/orders/create                admin.orders.create
POST      admin/orders                       admin.orders.store
GET|HEAD  admin/orders/{order}               admin.orders.show
GET|HEAD  admin/orders/{order}/edit          admin.orders.edit
PUT|PATCH admin/orders/{order}               admin.orders.update
DELETE    admin/orders/{order}               admin.orders.destroy
POST      admin/orders/{order}/generate-dp-invoice
POST      admin/orders/{order}/generate-final-invoice
POST      admin/orders/{order}/resend-invoice
POST      admin/orders/{order}/send-dp-wa
POST      admin/orders/{order}/send-final-wa
GET|HEAD  admin/projects                     admin.projects.index
GET|HEAD  admin/projects/create              admin.projects.create
POST      admin/projects                     admin.projects.store
GET|HEAD  admin/projects/{project}           admin.projects.show
GET|HEAD  admin/projects/{project}/edit      admin.projects.edit
PUT|PATCH admin/projects/{project}           admin.projects.update
DELETE    admin/projects/{project}           admin.projects.destroy
POST      admin/projects/{project}/files
DELETE    admin/projects/{project}/files/{file}
GET|HEAD  admin/services                     admin.services.index
GET|HEAD  admin/services/create              admin.services.create
POST      admin/services                     admin.services.store
GET|HEAD  admin/services/{service}           admin.services.show
GET|HEAD  admin/services/{service}/edit      admin.services.edit
PUT|PATCH admin/services/{service}           admin.services.update
DELETE    admin/services/{service}           admin.services.destroy
GET|HEAD  admin/joki-services                admin.joki-services.index
... (similar CRUD for joki-services, portfolios, users, testimonials, pricing-plans, faqs, blogs, settings, homepage, estimator, messages)
```

---

## 15. Next Steps

1. **Review PRD ini** — konfirmasi prioritas & scope
2. **Breakdown ke task** — buat GitHub Issues / Linear tickets per FR
3. **Setup branch** — `feature/admin-improvements-phase-1`
4. **Mulai Phase 1** — breadcrumb, toast, confirm modal, search, bulk actions

---

> **Catatan:** PRD ini living document. Update saat ada keputusan baru selama implementasi.