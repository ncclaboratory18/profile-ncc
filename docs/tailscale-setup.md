# Tailscale Setup — Ubuntu Server (`ncc@ncc-server`)

Tujuan: bisa SSH ke Ubuntu server dari luar jaringan lokalnya, tanpa expose port SSH ke internet
dan tanpa perlu IP publik/port-forwarding router.

## Konsep singkat

Tailscale bikin **jaringan privat mesh** (WireGuard-based) — bukan ngasih IP publik beneran. Tiap
device yang login ke akun/tailnet yang sama dapat satu IP privat (`100.x.y.z`), dan cuma
device-device di tailnet yang sama itu yang bisa saling connect, di manapun mereka secara fisik.
SSH server tidak pernah "kebuka ke internet" — cuma kebuka ke device yang sudah login Tailscale.

## Setup di server (`ncc@ncc-server`)

1. Install:
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```
2. Login & aktifkan:
   ```bash
   sudo tailscale up
   ```
   Command ini kasih URL — buka di browser (device manapun), login ke akun Tailscale, approve
   device ini masuk tailnet.
3. Cek IP Tailscale server ini:
   ```bash
   tailscale ip -4
   ```
   Contoh: `100.101.102.103`.
4. Pastikan SSH server-nya jalan:
   ```bash
   sudo apt install -y openssh-server
   sudo systemctl enable --now ssh
   ```
5. Kalau `ufw` aktif, izinkan interface Tailscale:
   ```bash
   sudo ufw allow in on tailscale0
   ```

## (Opsional) MagicDNS

Di admin console Tailscale (Settings → DNS), aktifkan MagicDNS supaya server bisa diakses pakai
nama host (`ssh ncc@ncc-server`) alih-alih hafal IP `100.x.y.z`.

## Akses dari device lain (laptop kamu / teman)

1. Install Tailscale di device itu, login pakai akun yang sama (atau lihat bagian "share" di
   bawah kalau bukan akun kamu sendiri).
2. Langsung:
   ```bash
   ssh ncc@100.101.102.103
   ```
   Jalan dari mana saja selama device itu tersambung Tailscale — beda WiFi, beda kota, dst.

## Kasih akses ke teman

Tailscale cuma buka jalur jaringan — akun SSH & auth-nya tetap harus disiapkan terpisah (lihat
bagian bawah).

**Opsi A — invite ke tailnet penuh** (dia lihat semua device kamu):
Admin console → Users → Invite user → masukin email teman.

**Opsi B — share 1 device saja (direkomendasikan, lebih scoped):**
Admin console → Machines → pilih server ini → **Share** → kirim link ke teman. Teman klik link,
login/daftar Tailscale pakai akunnya sendiri, device ini otomatis muncul di jaringannya dia —
tanpa dia lihat device lain kamu, tanpa jadi member resmi tailnet kamu.

## Setup akun SSH buat teman di server

Tailscale cuma bikin server-nya "kejangkau" — tetap butuh akun Linux + key SSH biar teman bisa
login beneran.

**Opsi A — pakai akun `ncc` yang sama:**
```bash
echo "ssh-ed25519 AAAA...isinya... teman@laptop" >> ~/.ssh/authorized_keys
```
Teman SSH: `ssh ncc@100.101.102.103`.

**Opsi B — akun terpisah (direkomendasikan, ada jejak siapa ngapain):**
```bash
sudo adduser namatemanmu
sudo mkdir -p /home/namatemanmu/.ssh
sudo nano /home/namatemanmu/.ssh/authorized_keys   # paste public key teman di sini
sudo chown -R namatemanmu:namatemanmu /home/namatemanmu/.ssh
sudo chmod 700 /home/namatemanmu/.ssh
sudo chmod 600 /home/namatemanmu/.ssh/authorized_keys
```
Teman SSH: `ssh namatemanmu@100.101.102.103`.

## (Opsional) Tailscale SSH

Alternatif dari authorized_keys manual: `sudo tailscale up --ssh` mengaktifkan Tailscale SSH,
yang mengatur otorisasi SSH pakai identitas Tailscale + ACL (siapa boleh SSH sebagai user apa),
tanpa perlu urus SSH key satu-satu secara manual. Belum di-setup di sesi ini — dokumentasi
tambahan kalau nanti mau dipakai.
