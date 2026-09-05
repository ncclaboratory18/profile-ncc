// ===== Navbar Toggle (same as calculator.js) =====
const menuIcon = document.querySelector("#menu-icon");
const navbar = document.querySelector(".navbar");
const navbg = document.querySelector(".nav-bg");
menuIcon.addEventListener("click", () => {
    menuIcon.classList.toggle("bx-x");
    navbar.classList.toggle("active");
    navbg.classList.toggle("active");
});

// ===== Dynamic Price Calculation =====
const priceDisplay = document.getElementById("price-display");
const priceValue = document.getElementById("price-value");

const priceTable = {
    "Mahasiswa|A|Online": 250000,
    "Mahasiswa|B|Online": 250000,
    "Mahasiswa|A|Offline": 400000,
    "Mahasiswa|B|Offline": 400000,
    "Mahasiswa|Semua|Online": 400000,
    "Mahasiswa|Semua|Offline": 600000,
    "Umum|A|Online": 450000,
    "Umum|B|Online": 450000,
    "Umum|A|Offline": 600000,
    "Umum|B|Offline": 600000,
    "Umum|Semua|Online": 800000,
    "Umum|Semua|Offline": 1000000,
};

function updatePrice() {
    const kategori = document.querySelector('input[name="kategori"]:checked');
    const paket = document.querySelector('input[name="paket"]:checked');
    const pelatihan = document.querySelector('input[name="kategori_pelatihan"]:checked');

    if (!kategori || !paket || !pelatihan) {
        priceValue.textContent = "Pilih kategori, paket, dan jenis pelatihan terlebih dahulu";
        priceDisplay.classList.remove("price-ready");
        return;
    }

    const key = `${kategori.value}|${paket.value}|${pelatihan.value}`;
    const price = priceTable[key];

    if (price) {
        priceValue.textContent = "Rp" + price.toLocaleString("id-ID");
        priceDisplay.classList.add("price-ready");
    }
}

// Listen to all 3 radio groups
document.querySelectorAll('input[name="kategori"], input[name="paket"], input[name="kategori_pelatihan"]')
    .forEach(radio => radio.addEventListener("change", updatePrice));

// ===== File Upload: Show filename + prevent accidental clear =====
const fileKtm = document.getElementById("file_ktm");
const fileKtmName = document.getElementById("file-ktm-name");
const btnClearKtm = document.getElementById("btn-clear-ktm");
const fileBuktiBayar = document.getElementById("file_bukti_bayar");
const fileBayarName = document.getElementById("file-bayar-name");
const btnClearBayar = document.getElementById("btn-clear-bayar");

// Helper: setup file input with persistence
function setupFileInput(input, nameEl, clearBtn) {
    let savedFile = null;

    input.addEventListener("change", () => {
        const area = input.closest(".file-upload-area");
        if (input.files.length > 0) {
            savedFile = input.files[0];
            nameEl.textContent = savedFile.name;
            area.classList.add("has-file");
            clearBtn.style.display = "flex";
        } else if (savedFile) {
            // User cancelled file picker — restore saved file
            const dt = new DataTransfer();
            dt.items.add(savedFile);
            input.files = dt.files;
        }
    });

    clearBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const area = input.closest(".file-upload-area");
        savedFile = null;
        input.value = "";
        nameEl.textContent = "";
        area.classList.remove("has-file");
        clearBtn.style.display = "none";
    });

    // Return reset function for form reset
    return () => {
        savedFile = null;
        clearBtn.style.display = "none";
    };
}

const resetKtm = setupFileInput(fileKtm, fileKtmName, btnClearKtm);
const resetBayar = setupFileInput(fileBuktiBayar, fileBayarName, btnClearBayar);

// ===== File Upload: Drag & Drop visual feedback =====
document.querySelectorAll(".file-upload-area").forEach(area => {
    area.addEventListener("dragover", (e) => {
        e.preventDefault();
        area.classList.add("dragover");
    });
    area.addEventListener("dragleave", () => {
        area.classList.remove("dragover");
    });
    area.addEventListener("drop", () => {
        area.classList.remove("dragover");
    });
});

// ===== Form Submission =====
const form = document.getElementById("form-pendaftaran");
const formMessage = document.getElementById("form-message");
const submitBtn = document.getElementById("submit-btn");
const btnText = submitBtn.querySelector(".btn-text");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Disable button
    submitBtn.disabled = true;
    btnText.textContent = "Mengirim...";

    // Hide previous message
    formMessage.className = "form-message";
    formMessage.style.display = "none";

    // Collect form data (including files)
    const formData = new FormData(form);

    try {
        const response = await fetch("submit_pendaftaran.php", {
            method: "POST",
            body: formData
        });

        const responseText = await response.text();

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            // PHP returned non-JSON (likely an error page)
            formMessage.className = "form-message error";
            formMessage.textContent = "Server error (HTTP " + response.status + "): " + responseText.substring(0, 300);
            formMessage.style.display = "block";
            return;
        }

        if (result.status === "success") {
            formMessage.className = "form-message success";
            formMessage.textContent = result.message;
            formMessage.style.display = "block";
            form.reset();
            fileKtmName.textContent = "";
            fileBayarName.textContent = "";
            resetKtm();
            resetBayar();
            document.querySelectorAll(".file-upload-area").forEach(a => a.classList.remove("has-file"));
        } else {
            formMessage.className = "form-message error";
            formMessage.textContent = result.message;
            formMessage.style.display = "block";
        }
    } catch (error) {
        formMessage.className = "form-message error";
        formMessage.textContent = "Koneksi gagal: " + error.message;
        formMessage.style.display = "block";
    } finally {
        submitBtn.disabled = false;
        btnText.textContent = "Daftar Sekarang";
    }
});
