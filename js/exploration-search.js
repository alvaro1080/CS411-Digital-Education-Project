/**
 * Step 2 — Search exploration.
 * Runs linear search and binary search side by side on the same data.
 */

const DEFAULT_SIZE = 12;
const DEFAULT_ORDER = "unsorted";

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildSortedList(size) {
    return Array.from({ length: size }, (_, index) => index + 1);
}

function buildAlmostSortedList(size) {
    const values = buildSortedList(size);
    const swaps = Math.max(1, Math.floor(size * 0.15));

    for (let i = 0; i < swaps; i++) {
        const left = randomInt(0, size - 1);
        const right = randomInt(0, size - 1);
        [values[left], values[right]] = [values[right], values[left]];
    }

    return values;
}

function buildUnsortedList(size) {
    const values = buildSortedList(size);
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
}

function buildInitialData(size, order) {
    if (order === "sorted") return buildSortedList(size);
    if (order === "almost-sorted") return buildAlmostSortedList(size);
    return buildUnsortedList(size);
}

let currentSize = DEFAULT_SIZE;
let currentOrder = DEFAULT_ORDER;
let SEARCH_DATA = [];
let TARGET = 0;

let running = false;
const linearStats = { comparisons: 0, status: "-" };
const binaryStats = { comparisons: 0, status: "-" };

const range = (start, end) =>
    Array.from({ length: Math.max(0, end - start) }, (_, i) => start + i);

function syncSettingsUI() {
    const slider = $("element-count");
    const value = $("element-count-value");
    const orderSelect = $("initial-order");
    const dataLabel = document.querySelector(".status-bar .data");

    if (slider) slider.value = String(currentSize);
    if (value) value.textContent = String(currentSize);
    if (orderSelect) orderSelect.value = currentOrder;
    if (dataLabel) {
        const label = currentOrder.replace("-", " ");
        dataLabel.textContent = `${currentSize} elements · ${label}`;
    }

    if ($("count-linear-target")) $("count-linear-target").textContent = String(TARGET);
    if ($("count-binary-target")) $("count-binary-target").textContent = String(TARGET);
}

function renderSearch(containerId, values, current = [], found = []) {
    const container = $(containerId);
    if (!container) return;

    container.innerHTML = "";
    values.forEach((value, index) => {
        const item = document.createElement("div");
        item.className = "search-item";
        item.textContent = value;

        if (current.includes(index)) item.classList.add("compare");
        if (found.includes(index)) item.classList.add("found");

        container.appendChild(item);
    });
}

function renderLinearStats() {
    $("count-linear-comp").textContent = linearStats.comparisons;
    $("count-linear-status").textContent = linearStats.status;
}

function renderBinaryStats() {
    $("count-binary-comp").textContent = binaryStats.comparisons;
    $("count-binary-status").textContent = binaryStats.status;
}

const setLinearAction = (text) => $("linear-action").textContent = text;
const setBinaryAction = (text) => $("binary-action").textContent = text;
const setGlobalStatus = (text) => $("global-status").textContent = text;

function regenerateSearchState() {
    SEARCH_DATA = buildInitialData(currentSize, currentOrder);
    TARGET = SEARCH_DATA[Math.floor(SEARCH_DATA.length / 2)] ?? SEARCH_DATA[0];
    syncSettingsUI();
}

async function runLinearSearch() {
    linearStats.comparisons = 0;
    linearStats.status = "-";
    renderLinearStats();

    for (let i = 0; i < SEARCH_DATA.length; i++) {
        linearStats.comparisons++;
        renderLinearStats();
        setLinearAction(`Check ${SEARCH_DATA[i]}`);
        renderSearch("container-linear", SEARCH_DATA, [i]);
        await sleep(350);

        if (SEARCH_DATA[i] === TARGET) {
            linearStats.status = "Found";
            renderLinearStats();
            setLinearAction(`Found ${TARGET} at index ${i}`);
            renderSearch("container-linear", SEARCH_DATA, [i], [i]);
            return;
        }
    }

    linearStats.status = "Miss";
    renderLinearStats();
    setLinearAction("Target not found");
}

async function runBinarySearch() {
    binaryStats.comparisons = 0;
    binaryStats.status = "-";
    renderBinaryStats();

    const values = [...SEARCH_DATA];
    let low = 0;
    let high = values.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        binaryStats.comparisons++;
        renderBinaryStats();
        setBinaryAction(`Check middle ${values[mid]}`);
        renderSearch("container-binary", values, [mid]);
        await sleep(450);

        if (values[mid] === TARGET) {
            binaryStats.status = "Found";
            renderBinaryStats();
            setBinaryAction(`Found ${TARGET} at index ${mid}`);
            renderSearch("container-binary", values, [mid], [mid]);
            return;
        }

        if (values[mid] < TARGET) {
            low = mid + 1;
            setBinaryAction(`Look right of ${values[mid]}`);
            renderSearch("container-binary", values, range(low, high + 1));
        } else {
            high = mid - 1;
            setBinaryAction(`Look left of ${values[mid]}`);
            renderSearch("container-binary", values, range(low, high + 1));
        }
        await sleep(350);
    }

    binaryStats.status = "Miss";
    renderBinaryStats();
    setBinaryAction("Target not found");
}

async function start() {
    if (running) return;
    running = true;

    $("btn-start-sim").disabled = true;
    $("btn-reset-sim").disabled = true;
    $("btn-start-sim").textContent = "Running...";
    setGlobalStatus("Watching both search algorithms...");

    renderSearch("container-linear", SEARCH_DATA);
    renderSearch("container-binary", SEARCH_DATA);

    await Promise.all([runLinearSearch(), runBinarySearch()]);

    setGlobalStatus("Experiment complete");
    $("btn-start-sim").disabled = false;
    $("btn-reset-sim").disabled = false;
    $("btn-start-sim").textContent = "↻ Run again";
    running = false;
}

function reset() {
    if (running) return;

    regenerateSearchState();
    linearStats.comparisons = 0;
    linearStats.status = "-";
    binaryStats.comparisons = 0;
    binaryStats.status = "-";

    renderLinearStats();
    renderBinaryStats();
    renderSearch("container-linear", SEARCH_DATA);
    renderSearch("container-binary", SEARCH_DATA);
    setLinearAction("Waiting");
    setBinaryAction("Waiting");
    setGlobalStatus("Ready to observe");
    syncSettingsUI();
}

document.addEventListener("DOMContentLoaded", () => {
    const slider = $("element-count");
    const orderSelect = $("initial-order");

    regenerateSearchState();
    renderSearch("container-linear", SEARCH_DATA);
    renderSearch("container-binary", SEARCH_DATA);
    renderLinearStats();
    renderBinaryStats();
    syncSettingsUI();

    if (slider) {
        slider.addEventListener("input", (event) => {
            currentSize = Number(event.target.value);
            regenerateSearchState();
            reset();
        });
    }

    if (orderSelect) {
        orderSelect.addEventListener("change", (event) => {
            currentOrder = event.target.value;
            regenerateSearchState();
            reset();
        });
    }

    $("btn-start-sim").addEventListener("click", start);
    $("btn-reset-sim").addEventListener("click", reset);
});
