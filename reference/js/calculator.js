// ===== Navbar Toggle =====
const menuIcon = document.querySelector("#menu-icon");
const navbar = document.querySelector(".navbar");
const navbg = document.querySelector(".nav-bg");
menuIcon.addEventListener("click", () => {
    menuIcon.classList.toggle("bx-x");
    navbar.classList.toggle("active");
    navbg.classList.toggle("active");
});

// ===== Module Data Structure =====
const modulesData = {
    loadFlow: {
        title: "Load Flow Analysis",
        submodules: [
            { id: "subModul1", name: "Sub Modul 1" },
            { id: "subModul2", name: "Sub Modul 2" }
        ]
    },
    transient: {
        title: "Transient Stability Analysis",
        submodules: [
            { id: "bebanTigaLangkah", name: "Pelepasan Beban 3 Langkah" },
            { id: "bebanEnamLangkah", name: "Pelepasan Beban 6 Langkah" }
        ]
    },
    shortCircuit: {
        title: "Short Circuit Analysis",
        submodules: [
            { id: "ansi", name: "ANSI" },
            { id: "iec", name: "IEC" }
        ]
    },
    protection: {
        title: "Protection Coordination",
        submodules: [
            { id: "ocrPhase", name: "Setting Relay OCR Phase" },
            { id: "timeDial", name: "Perhitungan Time Dial" },
            { id: "ocrGround", name: "Setting Relay OCR Ground" },
            { id: "resetTrafo", name: "Reset Trafo" }
        ]
    }
};

// ===== DOM References =====
const moduleDashboard = document.getElementById("module-dashboard");
const calculatorView = document.getElementById("calculator-view");
const moduleTitle = document.getElementById("module-title");
const backBtn = document.getElementById("back-to-dashboard");
const tabMenu = document.querySelector(".tab-menu");
const btnLeft = document.querySelector(".left-btn");
const btnRight = document.querySelector(".right-btn");

let currentModule = null;

// ===== Tab Navigation Scroll =====
const IconVisibility = () => {
    let scrollLeftValue = Math.ceil(tabMenu.scrollLeft);
    let scrollableWidth = tabMenu.scrollWidth - tabMenu.clientWidth;
    btnLeft.style.display = scrollLeftValue > 0 ? "block" : "none";
    btnRight.style.display = scrollableWidth > scrollLeftValue ? "block" : "none";
};

btnRight.addEventListener("click", () => {
    tabMenu.scrollLeft += 150;
    setTimeout(() => IconVisibility(), 50);
});

btnLeft.addEventListener("click", () => {
    tabMenu.scrollLeft -= 150;
    setTimeout(() => IconVisibility(), 50);
});

// ===== Tab Drag =====
let activeDrag = false;

tabMenu.addEventListener("mousemove", (drag) => {
    if (!activeDrag) return;
    tabMenu.scrollLeft -= drag.movementX;
    IconVisibility();
    tabMenu.classList.add("dragging");
});

document.addEventListener("mouseup", () => {
    activeDrag = false;
    tabMenu.classList.remove("dragging");
});

tabMenu.addEventListener("mousedown", () => {
    activeDrag = true;
});

// ===== Module Navigation =====
const selectModule = (moduleId) => {
    const moduleData = modulesData[moduleId];
    if (!moduleData) return;

    currentModule = moduleId;

    // Switch views
    moduleDashboard.style.display = "none";
    calculatorView.style.display = "";

    // Update title
    moduleTitle.textContent = moduleData.title;

    // Generate tab buttons
    tabMenu.innerHTML = "";
    moduleData.submodules.forEach((sub, index) => {
        const li = document.createElement("li");
        li.classList.add("tab-btn");
        if (index === 0) li.classList.add("active");
        li.textContent = sub.name;
        li.addEventListener("click", () => {
            selectSubmodule(moduleId, sub.id, index);
        });
        tabMenu.appendChild(li);
    });

    // Show the first submodule tab
    showAllTabs(moduleId);
    selectSubmodule(moduleId, moduleData.submodules[0].id, 0);

    // Update scroll buttons
    setTimeout(() => {
        IconVisibility();
        btnLeft.style.display = "none";
    }, 100);
};

const showAllTabs = (moduleId) => {
    // Hide all tabs first
    const allTabs = document.querySelectorAll(".tab");
    allTabs.forEach(tab => {
        tab.classList.remove("active");
    });
};

const selectSubmodule = (moduleId, submoduleId, btnIndex) => {
    // Update tab buttons
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => btn.classList.remove("active"));
    if (tabBtns[btnIndex]) tabBtns[btnIndex].classList.add("active");

    // Hide all tabs, show matching one
    const allTabs = document.querySelectorAll(".tab");
    allTabs.forEach(tab => {
        tab.classList.remove("active");
    });

    const targetTab = document.querySelector(`.tab[data-module="${moduleId}"][data-submodule="${submoduleId}"]`);
    if (targetTab) targetTab.classList.add("active");
};

// ===== Back Button =====
backBtn.addEventListener("click", () => {
    calculatorView.style.display = "none";
    moduleDashboard.style.display = "";
    currentModule = null;
});

// ===== Module Card Click Handlers =====
document.querySelectorAll(".module-card").forEach(card => {
    card.addEventListener("click", () => {
        const moduleId = card.dataset.module;
        selectModule(moduleId);
    });
});

// ===== Window Events =====
window.onload = function () {
    // Dashboard is shown by default, calculator is hidden
    btnRight.style.display = "none";
    btnLeft.style.display = "none";
};

window.onresize = function () {
    if (currentModule) {
        IconVisibility();
    }
};

// ===== Automatic Calculations (Protection Coordination) =====
const inputFla = document.getElementById("input-fla");
const inputPrimCt = document.getElementById("input-prim-ct");
const inputIset = document.getElementById("input-iset");
const inputIset2 = document.getElementById("input-iset-2");
const inputIscMin = document.getElementById("input-isc-min");

const outputFla105 = document.getElementById("output-fla-105");
const outputFla14 = document.getElementById("output-fla-14");
const outputFla16 = document.getElementById("output-fla-16");
const output105In = document.getElementById("output-105-in");
const outputIpickup = document.getElementById("output-ipickup");
const output14In = document.getElementById("output-14-in");
const output08IscMin = document.getElementById("output-08-isc-min");
const outputTap16 = document.getElementById("output-tap-16");
const outputTapIset = document.getElementById("output-tap-iset");
const outputTap08Isc = document.getElementById("output-tap-08-isc");

const calculateAll = () => {
    const flaValue = parseFloat(inputFla?.value);
    const primCtValue = parseFloat(inputPrimCt?.value);
    const isetValue = parseFloat(inputIset?.value);
    const iset2Value = parseFloat(inputIset2?.value);
    const iscMinValue = parseFloat(inputIscMin?.value);

    const flaValid = !isNaN(flaValue) && inputFla?.value.trim() !== "";
    const primCtValid = !isNaN(primCtValue) && inputPrimCt?.value.trim() !== "" && primCtValue !== 0;
    const isetValid = !isNaN(isetValue) && inputIset?.value.trim() !== "";
    const iset2Valid = !isNaN(iset2Value) && inputIset2?.value.trim() !== "";
    const iscMinValid = !isNaN(iscMinValue) && inputIscMin?.value.trim() !== "";

    // === Overcurrent Pickup ===
    if (flaValid) {
        if (outputFla105) outputFla105.value = (flaValue * 1.05).toFixed(3);
        if (outputFla14) outputFla14.value = (flaValue * 1.4).toFixed(3);
    } else {
        if (outputFla105) outputFla105.value = "";
        if (outputFla14) outputFla14.value = "";
    }

    if (flaValid && primCtValid) {
        if (output105In) output105In.value = (flaValue * 1.05 / primCtValue).toFixed(3);
    } else {
        if (output105In) output105In.value = "";
    }

    if (isetValid && primCtValid) {
        if (outputIpickup) outputIpickup.value = (isetValue / primCtValue).toFixed(3);
    } else {
        if (outputIpickup) outputIpickup.value = "";
    }

    if (flaValid && primCtValid) {
        if (output14In) output14In.value = (flaValue * 1.4 / primCtValue).toFixed(3);
    } else {
        if (output14In) output14In.value = "";
    }

    // === Instantaneous Pickup ===
    if (flaValid) {
        if (outputFla16) outputFla16.value = (flaValue * 1.6).toFixed(3);
    } else {
        if (outputFla16) outputFla16.value = "";
    }

    if (iscMinValid) {
        if (output08IscMin) output08IscMin.value = (iscMinValue * 0.8).toFixed(3);
    } else {
        if (output08IscMin) output08IscMin.value = "";
    }

    if (flaValid && primCtValid) {
        if (outputTap16) outputTap16.value = (flaValue * 1.6 / primCtValue).toFixed(3);
    } else {
        if (outputTap16) outputTap16.value = "";
    }

    if (iset2Valid && primCtValid) {
        if (outputTapIset) outputTapIset.value = (iset2Value / primCtValue).toFixed(3);
    } else {
        if (outputTapIset) outputTapIset.value = "";
    }

    if (iscMinValid && primCtValid) {
        if (outputTap08Isc) outputTap08Isc.value = (iscMinValue * 0.8 / primCtValue).toFixed(3);
    } else {
        if (outputTap08Isc) outputTap08Isc.value = "";
    }
};

if (inputFla) inputFla.addEventListener("input", calculateAll);
if (inputPrimCt) inputPrimCt.addEventListener("input", calculateAll);
if (inputIset) inputIset.addEventListener("input", calculateAll);
if (inputIset2) inputIset2.addEventListener("input", calculateAll);
if (inputIscMin) inputIscMin.addEventListener("input", calculateAll);