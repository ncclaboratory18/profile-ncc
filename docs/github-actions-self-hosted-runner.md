# GitHub Actions Self-Hosted Runner (buat CI/CD tanpa IP publik)

Kenapa dokumen ini ada: server deploy kita (Ubuntu server, akses lewat Tailscale) tidak punya IP
publik, jadi GitHub-hosted runner (cloud runner default GitHub) tidak bisa SSH masuk buat deploy.
Self-hosted runner adalah cara ngakalinnya — dan pola koneksinya **sama persis** dengan
`cloudflared` (lihat `cloudflared-tunnel-setup.md`): server yang inisiatif konek keluar, bukan
dihubungi dari luar.

## Konsep

Normalnya (`runs-on: ubuntu-latest`): tiap workflow trigger, GitHub nyediain komputer sementara di
cloud mereka buat jalanin step-step-nya.

Self-hosted runner: **komputer kamu sendiri** (Ubuntu server) yang didaftarkan ke repo GitHub
sebagai runner. Programnya (`actions-runner`) jalan terus di server, **konek keluar** ke GitHub dan
nunggu (polling) ada job masuk — arah koneksinya server → GitHub, bukan GitHub → server. Jadi gak
masalah biarpun server gak punya IP publik / gak reachable dari luar.

| | cloudflared | self-hosted runner |
|---|---|---|
| Konek keluar ke | Cloudflare edge | GitHub |
| Nunggu apa | Traffic HTTP masuk, diteruskan ke `app:3000` | Job workflow buat dieksekusi |
| Efeknya | Orang luar akses app kamu tanpa server buka port | GitHub "nyuruh" server jalanin deploy tanpa GitHub SSH masuk |

Karena job dieksekusi **langsung di server yang sama tempat app di-deploy**, step deploy-nya jadi
sesederhana command lokal (`git pull && docker compose up -d --build`) — tidak perlu SSH dari luar
sama sekali.

## Peringatan keamanan

Job self-hosted runner jalan pakai privilege user yang install runner-nya (akses filesystem server
kamu). **Jangan** pasang self-hosted runner di repo publik yang nerima PR dari orang gak dikenal —
PR dari fork bisa dipakai buat eksekusi kode sembarangan di server kamu. Untuk repo pribadi/privat
(seperti `pc-ncc` ini, cuma kamu yang push/PR), resikonya kecil.

## Setup di Ubuntu Server (`ncc@ncc-server`)

1. Di GitHub: repo → **Settings → Actions → Runners → New self-hosted runner**, pilih OS Linux.
   GitHub kasih token + command install yang unik buat repo ini (token beda tiap kali generate,
   jangan disimpan permanen di sini — versi runner di bawah juga ikuti versi yang GitHub tampilkan
   saat itu, bisa lebih baru dari contoh ini).

2. Download runner:

   ```bash
   # Buat folder kerja
   mkdir actions-runner && cd actions-runner

   # Download package runner terbaru (URL & versi ambil dari halaman GitHub)
   curl -o actions-runner-linux-x64-2.337.0.tar.gz -L \
     https://github.com/actions/runner/releases/download/v2.337.0/actions-runner-linux-x64-2.337.0.tar.gz

   # Opsional: validasi hash (nilai hash ambil dari halaman GitHub)
   echo "70920811a4f8ad4328818682bca5c6469c1c942fab52448868071d0063816613  actions-runner-linux-x64-2.337.0.tar.gz" | shasum -a 256 -c

   # Ekstrak
   tar xzf ./actions-runner-linux-x64-2.337.0.tar.gz
   ```

3. Konfigurasi & jalankan:

   ```bash
   # Registrasi runner ke repo (token dari langkah 1, jangan disimpan permanen)
   ./config.sh --url https://github.com/ncclaboratory18/pc-ncc --token <TOKEN_DARI_GITHUB>

   # Jalankan runner
   ./run.sh
   ```

   Lalu di workflow YAML, pakai:

   ```yaml
   runs-on: self-hosted
   ```

4. Cek statusnya muncul "Idle" di GitHub → Settings → Actions → Runners.

## Contoh workflow yang pakai runner ini

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: self-hosted   # <- bukan ubuntu-latest, ini yang bikin job jalan di server kita
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via docker compose
        run: docker compose up -d --build
```

`runs-on: self-hosted` inilah kuncinya — tanpa itu, GitHub tetap pakai cloud runner default yang
gak bisa nyampe ke server tanpa IP publik.

## Menjalankan sebagai systemd service, bukan `./run.sh` manual

`./run.sh` (langkah 3 di atas) menjalankan runner **di foreground** — kalau dijalankan langsung di
sesi SSH biasa, runner mati begitu SSH terputus. Solusi umum adalah menjalankannya di dalam `tmux`
supaya tetap hidup walau SSH terputus — tapi ini tetap rapuh: kalau **server reboot**, tmux session
hilang dan runner tidak otomatis nyala lagi; kalau **tmux window/server crash**, tidak ada mekanisme
auto-restart.

`systemd` (init system bawaan Ubuntu) didesain justru untuk mengelola proses background seperti
ini: start otomatis saat boot, restart otomatis kalau crash, dikontrol dengan command standar tanpa
perlu tahu proses itu jalan di tmux window mana.

### Apa yang dilakukan `svc.sh install`

Package `actions-runner` sudah menyediakan script `svc.sh` yang membuatkan file unit systemd secara
otomatis:

```bash
sudo ./svc.sh install
```

Ini akan:
1. Membuat file di `/etc/systemd/system/actions.runner.<org>-<repo>.<hostname>.service`, isinya kira-kira:
   ```ini
   [Service]
   ExecStart=/home/ncc/actions-runner/runsvc.sh
   User=ncc
   WorkingDirectory=/home/ncc/actions-runner
   Restart=always
   ```
   (nama file otomatis mengikuti org/repo yang terdaftar saat `config.sh`, misal
   `actions.runner.ncclaboratory18-pc-ncc.ncc-server.service`)
2. Menjalankan `systemctl daemon-reload` supaya systemd "kenal" service baru ini.
3. **Belum langsung start** — install cuma mendaftarkan.

Baru start-nya terpisah:

```bash
sudo ./svc.sh start
```

Runner mulai jalan di background sebagai daemon, lepas dari sesi SSH/tmux.

### Command yang tersedia setelah ter-install

```bash
sudo ./svc.sh status     # cek jalan atau tidak
sudo ./svc.sh stop       # matikan
sudo ./svc.sh start      # nyalakan
sudo ./svc.sh uninstall  # hapus registrasi service (folder runner tetap bisa dipakai run.sh manual lagi)
```

Atau langsung pakai tooling systemd bawaan Linux:

```bash
sudo systemctl status actions.runner.ncclaboratory18-pc-ncc.ncc-server
sudo journalctl -u actions.runner.ncclaboratory18-pc-ncc.ncc-server -f   # log real-time
```

⚠️ Kalau runner sedang jalan manual (`./run.sh` di tmux, **bukan** lewat `svc.sh`), `sudo ./svc.sh
stop` akan gagal dengan error `Unit ... not loaded` — karena memang belum pernah terdaftar sebagai
service. Dalam kondisi ini, stop-nya harus manual: `tmux attach` ke session yang menjalankan
`run.sh`, lalu `Ctrl+C`.

### Rename folder runner yang sedang jalan

Jangan rename folder saat proses masih aktif — beberapa file konfigurasi internal (unit systemd,
`.path`, dll) menyimpan **path absolut** ke foldernya sendiri, jadi restart/reboot bisa gagal
setelah folder berpindah nama. Urutan aman:

```bash
# Kalau jalan sebagai service:
sudo ./svc.sh stop
sudo ./svc.sh uninstall
mv actions-runner actions-runner-nama-baru
cd actions-runner-nama-baru
sudo ./svc.sh install
sudo ./svc.sh start

# Kalau jalan manual (./run.sh di tmux):
# Ctrl+C di window itu dulu, baru:
mv actions-runner actions-runner-nama-baru
cd actions-runner-nama-baru
./run.sh
```

Tidak perlu `config.sh` ulang — registrasi ke GitHub (token, repo) tetap valid, cuma path lokal di
server yang berubah.

## Multi-runner: repo atau akun GitHub yang berbeda

Satu folder `actions-runner` = satu registrasi ke satu repo/akun. Untuk repo lain (termasuk dari
akun GitHub yang berbeda), buat **folder instalasi terpisah** dan ulangi langkah download +
`config.sh` dengan token dari repo itu:

```bash
mkdir actions-runner-repo-lain && cd actions-runner-repo-lain
# download & extract seperti biasa (lihat langkah 2 di atas)
./config.sh --url https://github.com/<akun-lain>/<repo-lain> --token <TOKEN_DARI_REPO_ITU>
./run.sh
```

Tidak bisa menjalankan `config.sh` kedua di folder yang sama — itu akan menimpa registrasi
sebelumnya (repo pertama kehilangan runner-nya). Kalau kedua runner perlu akses Docker, pastikan
user yang menjalankan masing-masing juga sudah di-`usermod -aG docker` (lihat catatan permission di
bawah).

## Isu-isu nyata yang ditemui saat setup

Beberapa masalah yang benar-benar muncul saat setup runner ini untuk `pc-ncc`, dicatat di sini biar
tidak perlu debug ulang dari nol kalau terulang:

- **`permission denied ... /var/run/docker.sock`** — user yang menjalankan runner belum jadi
  anggota grup `docker` (`sudo usermod -aG docker $USER`). Grup baru **tidak berlaku di sesi/proses
  yang sudah terlanjur jalan** — perlu `newgrp docker` (sesi aktif) atau logout-login ulang, **dan**
  restart proses runner-nya juga (bukan cuma sesi shell interaktif kamu), karena runner yang sudah
  lama nyala tetap pegang grup lama sampai di-restart.
- **`invalid containerPort` / build gagal aneh** — cek dulu tidak ada karakter nyasar (misal
  backtick) di `Dockerfile` hasil copy-paste dari web.
- **`COPY --from=builder /app/public ./public` gagal, `not found`** — project Next.js yang belum
  punya folder `public/` sama sekali akan bikin step ini gagal; perlu folder itu ada duluan
  (boleh kosong, pakai `.gitkeep`) sebelum Dockerfile bisa mengcopy-nya.
- **`Could not parse schema engine response` / Prisma gagal connect saat `migrate deploy`** —
  Prisma butuh OpenSSL yang tidak ada secara default di image `node:20-alpine`; tambahkan
  `RUN apk add --no-cache openssl` di Dockerfile.

## Catatan

Dokumen ini sudah pernah dipraktikkan langsung di server (`ncc@ncc-server`) untuk deploy `pc-ncc` —
bukan lagi sekadar rencana. Kalau mau setup runner baru dari nol, ikuti langkah 1-4 di atas, lalu
lanjut ke bagian systemd kalau mau runner-nya jalan permanen (disarankan untuk server produksi).
