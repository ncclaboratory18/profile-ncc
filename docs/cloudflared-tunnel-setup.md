# Cloudflare Tunnel — Setup Public Hostname Route

Catatan ini menjelaskan bagian **Service** (Type + URL) di form "Public Hostname" waktu bikin
route baru di sebuah Cloudflare Tunnel, karena bagian ini yang paling sering bikin bingung
(`localhost` vs `127.0.0.1` vs IP vs nama service Docker).

## Konsep dasar

Field **Service** = "ke mana `cloudflared` harus meneruskan traffic yang masuk lewat tunnel".
Yang sering salah kaprah: field ini diisi dari sudut pandang **`cloudflared` itu sendiri** — bukan
dari sudut pandang laptop kamu, bukan dari sudut pandang browser yang buka websitenya.

Jadi pertanyaan yang benar buat ngisi field ini adalah: **"dari tempat `cloudflared` jalan, gimana
caranya nyambung ke aplikasi target?"**

## Type

- `HTTP` — dipakai kalau aplikasi/server tujuan jalan plain HTTP (tidak ada TLS/sertifikat sendiri).
  Ini yang paling umum buat app internal (Next.js `next start`, `python -m http.server`, dst).
- `HTTPS` — dipakai kalau server tujuan sudah punya TLS sendiri di situ. Salah pilih `HTTPS` untuk
  server yang sebenarnya plain HTTP akan bikin `cloudflared` gagal SSL handshake.
- `SSH` / `TCP` — buat expose service non-HTTP (lihat `github-actions-self-hosted-runner.md`
  untuk pola serupa, atau baca dokumentasi Cloudflare Access buat SSH kalau butuh).

## URL (host:port)

Ini bagian yang paling sering salah. Tergantung **di mana `cloudflared` jalan**:

| cloudflared jalan di... | Target ada di mesin yang sama? | URL yang benar |
|---|---|---|
| Native di Windows/Linux (bukan container) | Ya, di mesin yang sama | `localhost:<port>` atau `127.0.0.1:<port>` |
| Container Docker (`docker run` mandiri, atau service di compose) | Ya, tapi di container LAIN | Nama service compose, misal `app:3000` — **cuma work kalau `cloudflared` ada di compose network yang sama** |
| Di mana saja | Tidak, di mesin fisik lain | IP asli mesin itu (`hostname -I` di mesin targetnya), misal `10.28.74.128:80` |

### Kenapa `localhost` bisa nyasar

`localhost` selalu berarti **"diri sendiri"** — tapi "diri sendiri" itu tergantung siapa yang lagi
connect:

- Kalau `cloudflared` jalan **native di Windows**, `localhost` = mesin Windows itu.
- Kalau `cloudflared` jalan **di dalam container** (baik `docker run` mandiri atau service compose),
  `localhost` = container itu sendiri — **bukan** Windows host-nya, **bukan** juga container lain.
  Tiap container punya network namespace + loopback sendiri-sendiri.
- Kalau target aplikasinya ada di **mesin fisik lain** (server Ubuntu terpisah, dst), `localhost`
  tidak akan pernah nyampe ke situ dari sisi manapun — harus pakai IP asli mesin itu.

### Kenapa `localhost` kadang connection refused padahal server-nya hidup

`localhost` itu **nama**, bukan alamat — dia di-resolve dulu ke IP, dan bisa resolve ke DUA
kemungkinan: `127.0.0.1` (IPv4) atau `::1` (IPv6). Kalau resolver nyoba IPv6 duluan tapi server
target cuma listen di IPv4 (contoh: `python3 -m http.server` default-nya begitu di sebagian
setup), koneksi ke `::1` gagal refused walau `127.0.0.1` sebenarnya jalan. Fix: pakai `127.0.0.1`
eksplisit, jangan `localhost`, kalau ketemu error seperti ini:

```
dial tcp [::1]:80: connect: connection refused
```

### Kalau target dan cloudflared beda container tapi masih Docker

Nama service (`app`, `postgres`, dst dari `docker-compose.yml`) itu di-resolve lewat DNS internal
yang dibikin otomatis oleh **jaringan compose project itu**. Ini cuma kekenal oleh container lain
yang **ikut** jaringan yang sama:

- Kalau `cloudflared` didaftarkan sebagai service di `docker-compose.yml` yang sama dengan `app`
  → otomatis satu jaringan → `app:3000` langsung kekenal.
- Kalau `cloudflared` dijalankan terpisah lewat `docker run` biasa (tanpa `--network` yang sama)
  → beda jaringan Docker → nama `app` **tidak** kekenal (DNS resolution failed), walaupun
  keduanya sama-sama "Docker" dan sama-sama di mesin Windows yang sama.
- Solusinya: satukan di compose file yang sama, atau join network compose target lewat
  `networks: <nama>: external: true` (lihat "Satu tunnel untuk banyak app" di bawah — ini pola
  yang dipakai `pc-ncc` sejak `cloudflared` dipisah dari `docker-compose.yml` project ini).

## Satu tunnel untuk banyak app di server yang sama

Kalau server yang sama menjalankan beberapa project Docker Compose independen (misal `pc-ncc`,
`nextcloud`, `lixyon-portfolio`), tidak perlu satu tunnel/token per app. Satu tunnel bisa punya
banyak Public Hostname route, masing-masing ke origin service yang beda — **asal** satu container
`cloudflared` itu bisa menjangkau (network-reachable) semua origin-nya.

Karena tiap compose project defaultnya bikin network sendiri yang terisolasi, `cloudflared`-nya
perlu di-join secara eksplisit ke network tiap project lewat `external: true`. Project ini
(`pc-ncc`) sengaja memberi nama eksplisit ke network-nya (`name: pc-ncc` di `docker-compose.yml`,
bukan pola default `<project>_default`) supaya gampang direferensikan dari compose file lain.

Contoh compose file `cloudflared` gabungan — sengaja hidup terpisah di server (misal
`~/cloudflared/docker-compose.yml`), **di luar** repo `pc-ncc`, karena isinya bukan spesifik punya
satu app:

```yaml
# ~/cloudflared/docker-compose.yml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: unless-stopped
    command: tunnel run
    env_file: .env       # isi TUNNEL_TOKEN
    networks:
      - pc-ncc
      - lixyon_default
      - nextcloud-setup_default

networks:
  pc-ncc:
    external: true
  lixyon_default:
    external: true
  nextcloud-setup_default:
    external: true
```

`external: true` artinya "network ini sudah dibuat compose project lain, jangan bikin baru, cukup
join". Nama network target (`lixyon_default`, `nextcloud-setup_default`) ambil dari
`docker network ls` / `docker ps --format "table {{.Names}}\t{{.Networks}}"` di server — pola
default compose adalah `<nama-folder-project>_default`, kecuali project itu juga kasih nama
eksplisit seperti `pc-ncc`.

Setelah itu, tiap app tinggal punya 1 Public Hostname route sendiri di tunnel yang sama:

| Public Hostname | Service |
|---|---|
| `pc-lab.domain.com` | `http://app:3000` |
| `nextcloud.domain.com` | `http://nextcloud:80` |
| `portfolio.domain.com` | `http://lixyon-portfolio:3000` |

**Trade-off**: kalau container `cloudflared` gabungan ini down, **semua app** ikut tidak bisa
diakses dari luar sekaligus (dulu kalau tunnel terpisah per app, downtime satu app tidak
mempengaruhi yang lain). Untuk server pribadi skala kecil ini biasanya trade-off yang wajar demi
tidak double resource untuk tiap tunnel.

### Kalau mau nembak ke Windows host dari dalam container Docker Desktop

Docker Desktop nyediain nama khusus `host.docker.internal` yang selalu merujuk ke mesin Windows
(host)-nya, bisa dipanggil dari container manapun — beda dari `localhost` yang cuma nunjuk ke
container itu sendiri.

## Studi kasus nyata (dari sesi debugging kita)

1. **Salah:** Type `HTTPS`, URL `localhost:80`, `cloudflared` jalan di container `docker run`
   mandiri, target-nya python server di server Ubuntu terpisah.
   → Error: SSL handshake gagal (server target plain HTTP, bukan HTTPS).
2. **Masih salah:** ganti Type ke `HTTP`, URL tetap `localhost:80`.
   → Error `dial tcp [::1]:80: connection refused` — karena `localhost` di dalam container
     `cloudflared` itu merujuk ke container itu sendiri, bukan ke server Ubuntu.
3. **Masih salah:** ganti URL ke `127.0.0.1:80` (mengira masalahnya cuma IPv4/IPv6).
   → Tetap refused — root cause-nya bukan IPv6, tapi memang salah mesin dari awal.
4. **Benar:** ganti URL ke IP asli server Ubuntu (`10.28.74.128:80`) hasil `hostname -I` di server
   itu. → Tunnel jalan.

## Ringkasan cara mikir

1. Cari tahu **di mana `cloudflared` sebenarnya jalan** (native OS? container mandiri? service
   compose?).
2. Cari tahu **di mana target aplikasinya jalan** — mesin/namespace yang **sama** dengan
   `cloudflared`, atau **beda**?
3. Sama → `localhost` atau `127.0.0.1` (paksa `127.0.0.1` kalau curiga masalah IPv6).
4. Beda container tapi satu compose project → nama service compose (`app:3000`).
5. Beda mesin fisik → IP asli mesin itu (`hostname -I`), atau `host.docker.internal` khusus buat
   balik ke Windows host dari dalam Docker Desktop.
