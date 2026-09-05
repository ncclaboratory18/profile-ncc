# Panduan Commit

Project ini mengikuti [Conventional Commits](https://www.conventionalcommits.org/).
Setiap commit message harus punya **type**, opsional **scope**, dan deskripsi
singkat.

## Format

```
<type>(<scope opsional>): <deskripsi singkat>

<body opsional — jelaskan kenapa, bukan apa>
```

Contoh:

```
feat(api): add support for pagination in user endpoint
fix: null pointer handling
docs: update README to include installation steps
```

- Gunakan present tense ("add", bukan "added")
- Deskripsi singkat, jelas, tanpa titik di akhir
- `scope` menunjukkan bagian mana yang terdampak (misal `ui`, `api`, `auth`,
  `deps`) — boleh diabaikan kalau perubahannya lintas area

---

## Daftar Type

### `feat` — Fitur baru

Menambah fitur atau kemampuan baru ke codebase.

**Kapan dipakai:**
- Memperkenalkan fitur yang benar-benar baru
- Mengimplementasi fungsionalitas yang sebelumnya belum ada
- Menambah behavior baru (misal komponen UI)
- Menambah opsi konfigurasi/parameter baru

**Contoh:**
```
feat: provide google sheets adapter
feat(ui): add dark mode to the user interface
feat(api): add support for pagination in user endpoint
```

### `fix` — Perbaikan bug

Memperbaiki bug yang menyebabkan behavior salah di production.

**Kapan dipakai:**
- Memperbaiki behavior yang tidak disengaja/salah
- Memperbaiki bug yang sudah diketahui
- Memperbaiki style visual yang rusak
- Menyelesaikan crash atau runtime error

**Contoh:**
```
fix: correct CSS color for button background
fix: null pointer handling
fix(frontend): remove flickering effect on page refresh
```

### `perf` — Peningkatan performa

Perubahan yang memberi peningkatan performa yang terukur.

**Kapan dipakai:**
- Optimasi kecepatan atau penggunaan memori
- Mengurangi overhead query database/API call
- Meningkatkan waktu render/load
- Menambah mekanisme caching

**Contoh:**
```
perf: reduce number of redundant API calls
perf(ui): improve table rendering performance
perf: add caching for user session data
```

### `refactor` — Restrukturisasi kode

Perbaikan struktur internal **tanpa** mengubah behavior eksternal. Beda
dengan `style`: `refactor` fokus ke logika/struktur, bukan sekadar kosmetik.

**Kapan dipakai:**
- Restrukturisasi kode demi kejelasan, maintainability, atau skalabilitas
- Ekstrak logic yang berulang jadi utility function
- Memecah modul besar jadi lebih kecil
- Menyederhanakan kondisi/loop yang kompleks
- Rename variabel/method biar lebih jelas

**Contoh:**
```
refactor: extract utility functions for data validation
refactor(ui): separate styling logic from component logic
refactor: simplify nested loops
refactor: rename variable temp to temperature
```

### `style` — Format kode

Perubahan kosmetik yang tidak mempengaruhi behavior atau struktur.

**Kapan dipakai:**
- Formatting via tool (Prettier, ESLint)
- Menyesuaikan whitespace, indentasi, line break, tanda baca
- Perubahan kosmetik tanpa dampak behavior

**Contoh:**
```
style: reformat code with ESLint rules
style: change indentation from 2 to 4 spaces
style: fix formatting inconsistencies across multiple files
```

### `test` — Perubahan terkait test

Menambah, mengubah, memperbaiki, atau meningkatkan test.

**Kapan dipakai:**
- Menambah/update unit, integration, atau end-to-end test
- Refactor kode test atau ubah test data
- Memperbaiki test script yang rusak
- Menambah cakupan edge case

**Contoh:**
```
test: add integration tests for checkout process
test(auth): improve token validation tests
test: cover edge cases for user registration validation
```

### `docs` — Dokumentasi

Perubahan pada dokumentasi, komentar, atau deskripsi API.

**Kapan dipakai:**
- Mengubah file dokumentasi (README.md, CHANGELOG.md, file di `docs/`)
- Menambah/update komentar inline, docstring, atau usage guide
- Menulis dokumentasi API
- Update instruksi setup

**Contoh:**
```
docs: update README to include installation steps
docs: add comments to public methods
docs: document API usage examples for new endpoints
```

### `build` — Build process & dependency

Perubahan yang mempengaruhi build process atau dependency production.

**Kapan dipakai:**
- Update build script (Webpack, dsb)
- Mengubah/upgrade dependency production
- Mengubah konfigurasi bundling/deployment
- Menyesuaikan konfigurasi Docker/Kubernetes

**Contoh:**
```
build: upgrade webpack to version 5
build(deps): update express to v4.18.1
build: update Dockerfile for multi-stage builds
```

### `ci` — Continuous Integration

Perubahan pada konfigurasi atau workflow CI/CD.

**Kapan dipakai:**
- Mengubah file/script konfigurasi CI/CD
- Update workflow (GitHub Actions, dll)
- Menambah step CI baru (code coverage, security scan)

**Contoh:**
```
ci: add code quality checks in GitHub Actions
ci: configure pipeline for integration tests
ci: add security scan step in pipeline
```

### `chore` — Tugas rutin/administratif

Tugas administratif/pendukung yang tidak berdampak ke kode production.

**Kapan dipakai:**
- Hal-hal lain yang tidak masuk kategori di atas
- Update `.gitignore` atau setting project
- Rename/pindah file/folder tanpa perubahan logic
- Update dependency development

**Contoh:**
```
chore: update .gitignore to exclude .idea files
chore: reorganize folder structure for better clarity
chore(deps): update eslint to v8.14.0
```

### `revert` — Membatalkan commit sebelumnya

Roll back commit sebelumnya saat diperlukan. Biasanya referensi ke commit
message yang dibatalkan.

**Contoh:**
```
revert: "feat: add social login feature"
revert: "fix: correct CSS color for button background"
```

---

## Ringkasan cepat

| Type | Dipakai untuk |
|---|---|
| `feat` | Fitur/behavior baru |
| `fix` | Perbaikan bug |
| `perf` | Peningkatan performa terukur |
| `refactor` | Restrukturisasi kode, behavior tetap sama |
| `style` | Formatting/kosmetik, tanpa dampak logic |
| `test` | Menambah/mengubah test |
| `docs` | Dokumentasi |
| `build` | Build process & dependency production |
| `ci` | Konfigurasi CI/CD |
| `chore` | Tugas rutin/administratif lainnya |
| `revert` | Membatalkan commit sebelumnya |

---

Referensi: [Conventional Commit Types Cheatsheet](https://www.bavaga.com/blog/2025/01/27/my-ultimate-conventional-commit-types-cheatsheet/)
