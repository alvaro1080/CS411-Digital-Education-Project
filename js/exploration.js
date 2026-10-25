/**
 * Step 1 — Exploration.
 * Runs Bubble Sort and Merge Sort side by side on the same data.
 */

const INITIAL_DATA = [45, 23, 87, 12, 64, 38, 71, 9, 56, 31, 82, 17];
const MAX_VALUE = Math.max(...INITIAL_DATA);
const MAX_BAR_HEIGHT = 155; // px
const MIN_BAR_HEIGHT = 12; // px

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Indexes start … end-1. */
const range = (start, end) =>
    Array.from({ length: Math.max(0, end - start) }, (_, i) => start + i);

/* The arrays are kept between runs so that "Run again" sorts an
   already-sorted list (a nice way to see Bubble Sort's best case). */
let bubbleList = [...INITIAL_DATA];
let mergeList = [...INITIAL_DATA];
let mergeSorted = [];
let running = false;

const bubbleStats = { comparisons: 0, swaps: 0, passes: 0 };
const mergeStats = { comparisons: 0, merges: 0 };


/* =========================================================
   STATS & STATUS
   ========================================================= */

function renderBubbleStats() {
    $("count-bubble-comp").textContent = bubbleStats.comparisons;
    $("count-bubble-swap").textContent = bubbleStats.swaps;
    $("count-bubble-pass").textContent = bubbleStats.passes;
}

function renderMergeStats() {
    $("count-merge-comp").textContent = mergeStats.comparisons;
    $("count-merge-pass").textContent = mergeStats.merges;
}

const setBubbleAction = (text) => ($("bubble-action").textContent = text);
const setMergeAction = (text) => ($("merge-action").textContent = text);
const setGlobalStatus = (text) => ($("global-status").textContent = text);


/* =========================================================
   BUBBLE SORT
   ========================================================= */

function renderBars(list, active = [], sorted = []) {
    const container = $("container-bubble");
    container.innerHTML = "";

    list.forEach((value, i) => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height =
            `${Math.max(MIN_BAR_HEIGHT, (value / MAX_VALUE) * MAX_BAR_HEIGHT)}px`;

        if (active.includes(i)) bar.classList.add("compare");
        if (sorted.includes(i)) bar.classList.add("sorted");

        const label = document.createElement("span");
        label.textContent = value;

        const wrap = document.createElement("div");
        wrap.className = "bar-wrap";
        wrap.append(bar, label);

        container.appendChild(wrap);
    });
}

async function bubbleSort() {
    const a = [...bubbleList];

    for (let end = a.length - 1; end > 0; end--) {
        bubbleStats.passes++;
        renderBubbleStats();
        setBubbleAction(`Pass ${bubbleStats.passes}: checking neighbors`);
        await sleep(250);

        let swapped = false;

        for (let j = 0; j < end; j++) {
            bubbleStats.comparisons++;
            renderBubbleStats();
            setBubbleAction(`Compare ${a[j]} and ${a[j + 1]}`);
            renderBars(a, [j, j + 1]);
            await sleep(300);

            if (a[j] > a[j + 1]) {
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                bubbleStats.swaps++;
                swapped = true;

                renderBubbleStats();
                setBubbleAction(`Swap ${a[j + 1]} and ${a[j]}`);
                renderBars(a, [j, j + 1]);
                await sleep(280);
            }
        }

        /*
          PEDAGOGICAL POINT
          If a whole pass makes no swap, the array is already sorted and we
          stop. Best case = a single pass over n-1 neighbors => O(n).
        */
        if (!swapped) {
            setBubbleAction("No swaps → already sorted");
            await sleep(500);
            break;
        }

        renderBars(a, [], range(end, a.length));
        await sleep(250);
    }

    renderBars(a, [], range(0, a.length));
    setBubbleAction("Sorted");
    bubbleList = [...a];
}


/* =========================================================
   MERGE SORT
   The learner sees one array the whole time:
     purple = current range · yellow = comparing · green = sorted
   ========================================================= */

function renderMerge(array, rangeIdx = [], compare = [], sorted = [], phase = "", detail = "") {
    const items = array
        .map((value, index) => {
            let type = "";
            if (sorted.includes(index)) type = "sorted";
            if (rangeIdx.includes(index)) type = "current";
            if (compare.includes(index)) type = "compare";
            return `<div class="merge-item ${type}">${value}</div>`;
        })
        .join("");

    $("container-merge").innerHTML = `
        <div class="merge-array">${items}</div>
        <div class="merge-info">
            <div class="merge-phase">${phase}</div>
            <div class="merge-detail">${detail}</div>
        </div>`;
}

function renderMergeIdle() {
    renderMerge(
        INITIAL_DATA,
        [],
        [],
        [],
        "Ready",
        "The entire array will be divided, then rebuilt in sorted order."
    );
}

/** Merge the two sorted ranges [start, middle) and [middle, end) of `a`. */
async function mergeRanges(a, start, middle, end) {
    const left = a.slice(start, middle);
    const right = a.slice(middle, end);
    const section = range(start, end);
    const result = [];
    let i = 0;
    let j = 0;

    setMergeAction(`Merge positions ${start + 1}–${end}`);
    renderMerge(
        a, section, [], mergeSorted,
        "Merging",
        "These values are already sorted inside their smaller sections."
    );
    await sleep(550);

    while (i < left.length && j < right.length) {
        const leftIndex = start + i;
        const rightIndex = middle + j;

        mergeStats.comparisons++;
        renderMergeStats();
        setMergeAction(`Compare ${left[i]} and ${right[j]}`);
        renderMerge(
            a, section, [leftIndex, rightIndex], mergeSorted,
            "Comparing",
            `${left[i]} is compared with ${right[j]}`
        );
        await sleep(500);

        if (left[i] <= right[j]) {
            result.push(left[i]);
            setMergeAction(`Place ${left[i]}`);
            renderMerge(
                a, section, [leftIndex], mergeSorted,
                "Choosing smaller value",
                `${left[i]} goes next because it is smaller.`
            );
            i++;
        } else {
            result.push(right[j]);
            setMergeAction(`Place ${right[j]}`);
            renderMerge(
                a, section, [rightIndex], mergeSorted,
                "Choosing smaller value",
                `${right[j]} goes next because it is smaller.`
            );
            j++;
        }
        await sleep(400);
    }

    // One side is empty: the remaining values are already in order.
    while (i < left.length) {
        result.push(left[i]);
        setMergeAction(`Place remaining ${left[i]}`);
        renderMerge(
            a, section, [start + i], mergeSorted,
            "Appending",
            `${left[i]} has no smaller competitor left.`
        );
        i++;
        await sleep(300);
    }

    while (j < right.length) {
        result.push(right[j]);
        setMergeAction(`Place remaining ${right[j]}`);
        renderMerge(
            a, section, [middle + j], mergeSorted,
            "Appending",
            `${right[j]} has no smaller competitor left.`
        );
        j++;
        await sleep(300);
    }

    // Write the merged values back and mark the section as sorted.
    result.forEach((value, k) => (a[start + k] = value));
    section.forEach((k) => {
        if (!mergeSorted.includes(k)) mergeSorted.push(k);
    });

    mergeStats.merges++;
    renderMergeStats();
    renderMerge(
        a, [], [], mergeSorted,
        "Merged ✓",
        `The section is now sorted: ${result.join(" · ")}`
    );
    await sleep(600);
}

async function mergeSort(a, start = 0, end = a.length) {
    // Base case: a single element is already sorted.
    if (end - start <= 1) {
        renderMerge(
            a, [start], [], mergeSorted,
            "Single element",
            `${a[start]} is already sorted.`
        );
        await sleep(350);
        return;
    }

    const middle = Math.floor((start + end) / 2);

    setMergeAction(`Split positions ${start + 1}–${end}`);
    renderMerge(
        a, range(start, end), [], mergeSorted,
        "Splitting",
        `Divide ${a.slice(start, end).join(" · ")} into two smaller sections.`
    );
    await sleep(650);

    await mergeSort(a, start, middle);
    await mergeSort(a, middle, end);
    await mergeRanges(a, start, middle, end);
}

async function runMergeSort() {
    mergeStats.comparisons = 0;
    mergeStats.merges = 0;
    renderMergeStats();

    const a = [...mergeList];
    mergeSorted = [];

    renderMerge(
        a, [], [], [],
        "Starting",
        "First, the algorithm breaks the array into smaller sections."
    );
    await sleep(500);

    await mergeSort(a);

    mergeSorted = range(0, a.length);
    renderMerge(
        a, [], [], mergeSorted,
        "Sorted ✓",
        "All sections have been merged into one sorted array."
    );
    setMergeAction("Sorted");

    mergeList = [...a];
}


/* =========================================================
   START / RESET
   ========================================================= */

async function start() {
    if (running) return;
    running = true;

    $("btn-start-sim").disabled = true;
    $("btn-reset-sim").disabled = true;
    $("btn-start-sim").textContent = "Running...";
    setGlobalStatus("Watching both algorithms...");

    // Both algorithms run at the same time to make the comparison easier.
    await Promise.all([bubbleSort(), runMergeSort()]);

    setGlobalStatus("Experiment complete");
    $("btn-start-sim").disabled = false;
    $("btn-reset-sim").disabled = false;
    $("btn-start-sim").textContent = "↻ Run again";

    running = false;
}

function reset() {
    if (running) return;

    bubbleList = [...INITIAL_DATA];
    mergeList = [...INITIAL_DATA];

    Object.assign(bubbleStats, { comparisons: 0, swaps: 0, passes: 0 });
    Object.assign(mergeStats, { comparisons: 0, merges: 0 });
    renderBubbleStats();
    renderMergeStats();

    renderBars(bubbleList);
    renderMergeIdle();

    setBubbleAction("Waiting");
    setMergeAction("Waiting");
    setGlobalStatus("Ready to observe");
}


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    renderBars(bubbleList);
    renderMergeIdle();

    $("btn-start-sim").addEventListener("click", start);
    $("btn-reset-sim").addEventListener("click", reset);
});
