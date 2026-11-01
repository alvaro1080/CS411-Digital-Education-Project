/**
 * Step 2 — Search exploration.
 * Runs linear search and binary search side by side on the same data.
 */

const SEARCH_DATA = [8, 12, 17, 23, 31, 45, 52, 64, 72, 80, 88, 96];
const TARGET = 64;

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let running = false;
const linearStats = { comparisons: 0, status: "-" };
const binaryStats = { comparisons: 0, status: "-" };

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

const setLinearAction = (text) => ($("linear-action").textContent = text);
const setBinaryAction = (text) => ($("binary-action").textContent = text);
const setGlobalStatus = (text) => ($("global-status").textContent = text);

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

    let low = 0;
    let high = SEARCH_DATA.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        binaryStats.comparisons++;
        renderBinaryStats();
        setBinaryAction(`Check middle ${SEARCH_DATA[mid]}`);
        renderSearch("container-binary", SEARCH_DATA, [mid]);
        await sleep(450);

        if (SEARCH_DATA[mid] === TARGET) {
            binaryStats.status = "Found";
            renderBinaryStats();
            setBinaryAction(`Found ${TARGET} at index ${mid}`);
            renderSearch("container-binary", SEARCH_DATA, [mid], [mid]);
            return;
        }

        if (SEARCH_DATA[mid] < TARGET) {
            low = mid + 1;
            setBinaryAction(`Look right of ${SEARCH_DATA[mid]}`);
            renderSearch("container-binary", SEARCH_DATA, range(low, high + 1));
        } else {
            high = mid - 1;
            setBinaryAction(`Look left of ${SEARCH_DATA[mid]}`);
            renderSearch("container-binary", SEARCH_DATA, range(low, high + 1));
        }
        await sleep(350);
    }

    binaryStats.status = "Miss";
    renderBinaryStats();
    setBinaryAction("Target not found");
}

const range = (start, end) =>
    Array.from({ length: Math.max(0, end - start) }, (_, i) => start + i);

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
}

document.addEventListener("DOMContentLoaded", () => {
    renderSearch("container-linear", SEARCH_DATA);
    renderSearch("container-binary", SEARCH_DATA);
    renderLinearStats();
    renderBinaryStats();

    $("btn-start-sim").addEventListener("click", start);
    $("btn-reset-sim").addEventListener("click", reset);
});
