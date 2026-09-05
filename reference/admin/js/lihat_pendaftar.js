// ===== DOM Elements =====
const tableBody = document.getElementById("table-body");
const dataTable = document.getElementById("data-table");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("error-msg");
const emptyMsg = document.getElementById("empty-msg");
const searchInput = document.getElementById("search-input");
const btnRefresh = document.getElementById("btn-refresh");

// Stats
const statTotal = document.getElementById("stat-total");
const statApproved = document.getElementById("stat-approved");
const statMahasiswa = document.getElementById("stat-mahasiswa");
const statUmum = document.getElementById("stat-umum");
const statOnline = document.getElementById("stat-online");
const statOffline = document.getElementById("stat-offline");

// Modal
const modalOverlay = document.getElementById("modal-overlay");
const modalName = document.getElementById("modal-name");
const modalCancel = document.getElementById("modal-cancel");
const modalConfirm = document.getElementById("modal-confirm");

let allData = [];
let deleteTargetId = null;

// ===== WhatsApp Message =====
// Pesan WA dihandle oleh wa_redirect.php (server-side, encoding aman)
// Edit isi pesan di file: admin/wa_redirect.php

// ===== Fetch Data =====
async function loadData() {
    loading.style.display = "";
    dataTable.style.display = "none";
    emptyMsg.style.display = "none";
    errorMsg.style.display = "none";

    try {
        const res = await fetch("get_pendaftar.php");
        const json = await res.json();

        if (json.status !== "success") {
            throw new Error(json.message || "Gagal memuat data");
        }

        allData = json.data;
        updateStats(allData);
        renderTable(allData);

    } catch (err) {
        loading.style.display = "none";
        errorMsg.textContent = "Error: " + err.message;
        errorMsg.style.display = "";
    }
}

// ===== Update Stats =====
function updateStats(data) {
    statTotal.textContent = data.length;
    statApproved.textContent = data.filter(d => d.approved).length;
    statMahasiswa.textContent = data.filter(d => d.kategori === "Mahasiswa").length;
    statUmum.textContent = data.filter(d => d.kategori === "Umum").length;
    statOnline.textContent = data.filter(d => d.kategori_pelatihan === "Online").length;
    statOffline.textContent = data.filter(d => d.kategori_pelatihan === "Offline").length;
}

// ===== Render Table =====
function renderTable(data) {
    loading.style.display = "none";

    if (data.length === 0) {
        dataTable.style.display = "none";
        emptyMsg.style.display = "";
        return;
    }

    const pending = data.filter(d => !d.approved);
    const approved = data.filter(d => d.approved);

    tableBody.innerHTML = "";
    let counter = 1;

    // Section: Belum Diapprove
    if (pending.length > 0) {
        const divider = document.createElement("tr");
        divider.className = "section-divider pending";
        divider.innerHTML = '<td colspan="15">Belum Diapprove (' + pending.length + ')</td>';
        tableBody.appendChild(divider);

        pending.forEach(row => {
            tableBody.appendChild(createRow(row, counter++));
        });
    }

    // Section: Sudah Diapprove
    if (approved.length > 0) {
        const divider = document.createElement("tr");
        divider.className = "section-divider approved";
        divider.innerHTML = '<td colspan="15">Sudah Diapprove (' + approved.length + ')</td>';
        tableBody.appendChild(divider);

        approved.forEach(row => {
            tableBody.appendChild(createRow(row, counter++));
        });
    }

    dataTable.style.display = "";
    emptyMsg.style.display = "none";
}

// ===== Create Table Row =====
function createRow(row, index) {
    const tr = document.createElement("tr");
    if (row.approved) tr.classList.add("row-approved");

    // Format date
    const date = new Date(row.created_at);
    const dateStr = date.toLocaleDateString("id-ID", {
        day: "2-digit", month: "short", year: "numeric"
    });
    const timeStr = date.toLocaleTimeString("id-ID", {
        hour: "2-digit", minute: "2-digit"
    });

    // Badge classes
    const kategoriBadge = row.kategori === "Mahasiswa"
        ? "badge badge-mahasiswa" : "badge badge-umum";
    const pelatihanBadge = row.kategori_pelatihan === "Online"
        ? "badge badge-online" : "badge badge-offline";

    // Status icon
    const statusIcon = row.approved
        ? '<i class="bx bx-check-circle status-icon approved"></i>'
        : '<i class="bx bx-x-circle status-icon pending"></i>';

    tr.innerHTML =
        '<td>' + index + '</td>' +
        '<td>' + statusIcon + '</td>' +
        '<td><input type="checkbox" class="approve-toggle" data-id="' + row.id + '" data-nama="' + escapeHtml(row.nama) + '" data-wa="' + escapeHtml(row.no_whatsapp) + '"' + (row.approved ? ' checked' : '') + '></td>' +
        '<td><strong>' + escapeHtml(row.nama) + '</strong></td>' +
        '<td>' + escapeHtml(row.email) + '</td>' +
        '<td>' + escapeHtml(row.nim_nik) + '</td>' +
        '<td>' + escapeHtml(row.no_whatsapp) + '</td>' +
        '<td>' + escapeHtml(row.asal_instansi) + '</td>' +
        '<td><span class="' + kategoriBadge + '">' + row.kategori + '</span></td>' +
        '<td><span class="badge badge-paket">Paket ' + row.paket + '</span></td>' +
        '<td><span class="' + pelatihanBadge + '">' + row.kategori_pelatihan + '</span></td>' +
        '<td>' + (row.file_ktm ? '<a href="' + row.file_ktm + '" target="_blank">Lihat</a>' : '-') + '</td>' +
        '<td>' + (row.file_bukti_bayar ? '<a href="' + row.file_bukti_bayar + '" target="_blank">Lihat</a>' : '-') + '</td>' +
        '<td class="date-cell">' + dateStr + '<br>' + timeStr + '</td>' +
        '<td><button class="btn-delete-row" data-id="' + row.id + '" data-nama="' + escapeHtml(row.nama) + '" title="Hapus"><i class="bx bx-trash"></i></button></td>';

    // Approve toggle listener
    const toggle = tr.querySelector(".approve-toggle");
    toggle.addEventListener("change", () => handleApprove(toggle));

    // Delete button listener
    const deleteBtn = tr.querySelector(".btn-delete-row");
    deleteBtn.addEventListener("click", () => showDeleteModal(deleteBtn.dataset.id, deleteBtn.dataset.nama));

    return tr;
}

// ===== Approve Handler =====
async function handleApprove(toggle) {
    const id = toggle.dataset.id;
    const nama = toggle.dataset.nama;
    const wa = toggle.dataset.wa;
    const approved = toggle.checked;

    try {
        const res = await fetch("approve_pendaftar.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: parseInt(id), approved: approved })
        });
        const json = await res.json();

        if (json.status !== "success") {
            throw new Error(json.message);
        }

        // Jika di-approve, buka wa.me link langsung
        if (approved) {
            var waNumber = wa.replace(/^0/, "62").replace(/[^0-9]/g, "");
            var msg = "Halo " + nama + "! " + String.fromCodePoint(0x1F389) + "\n\n"
                + "Selamat, pendaftaran ETAP Training 2026 kamu sudah di-approve " + String.fromCodePoint(0x2705) + "\n\n"
                + "Silakan join grup WhatsApp pelatihan melalui link berikut:\n"
                + "[Link Grup WA]\n\n"
                + "See you soon! " + String.fromCodePoint(0x1F44B, 0x1F3FB) + "\n\n"
                + String.fromCodePoint(0x2014) + " Tim LIPIST";
            window.open("https://api.whatsapp.com/send?phone=" + waNumber + "&text=" + encodeURIComponent(msg), "_blank");
        }

        // Reload data
        loadData();

    } catch (err) {
        toggle.checked = !approved; // Revert
        alert("Gagal update: " + err.message);
    }
}

// ===== Delete Modal =====
function showDeleteModal(id, nama) {
    deleteTargetId = id;
    modalName.textContent = nama;
    modalOverlay.style.display = "";
}

function hideDeleteModal() {
    deleteTargetId = null;
    modalOverlay.style.display = "none";
}

modalCancel.addEventListener("click", hideDeleteModal);
modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) hideDeleteModal();
});

modalConfirm.addEventListener("click", async function () {
    if (!deleteTargetId) return;

    modalConfirm.textContent = "Menghapus...";
    modalConfirm.disabled = true;

    try {
        const res = await fetch("delete_pendaftar.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: parseInt(deleteTargetId) })
        });
        const json = await res.json();

        if (json.status !== "success") {
            throw new Error(json.message);
        }

        hideDeleteModal();
        loadData();

    } catch (err) {
        alert("Gagal hapus: " + err.message);
    } finally {
        modalConfirm.textContent = "Hapus";
        modalConfirm.disabled = false;
    }
});

// ===== Search / Filter =====
searchInput.addEventListener("input", function () {
    var query = searchInput.value.toLowerCase().trim();
    if (!query) {
        renderTable(allData);
        return;
    }
    var filtered = allData.filter(function (row) {
        return row.nama.toLowerCase().indexOf(query) !== -1 ||
            row.email.toLowerCase().indexOf(query) !== -1 ||
            row.nim_nik.toLowerCase().indexOf(query) !== -1 ||
            row.no_whatsapp.toLowerCase().indexOf(query) !== -1 ||
            row.asal_instansi.toLowerCase().indexOf(query) !== -1;
    });
    renderTable(filtered);
});

// ===== Refresh =====
btnRefresh.addEventListener("click", function () {
    searchInput.value = "";
    loadData();
});

// ===== Helpers =====
function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ===== Init =====
loadData();
