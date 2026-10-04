const initialData = [45, 23, 87, 12, 64, 38];

let bubbleList = [...initialData];
let mergeList = [...initialData];
let running = false;
let aiStep = 0;

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  setupGroup();
  renderBars("container-bubble", bubbleList);
  renderMergeIdle();

  $("btn-start-sim").onclick = start;
  $("btn-reset-sim").onclick = reset;
  $("btn-go-to-hypothesis").onclick = showHypothesis;
  $("btn-go-to-telling").onclick = showTheory;
  $("btn-send-ai").onclick = chat;

  $("ai-input").onkeydown = e => {
    if (e.key === "Enter") chat();
  };

  $("btn-restart").onclick = restart;
});


function setupGroup() {
  const ai = Math.random() < .5;
  $("group-badge").textContent =
    ai ? "Experimental group · AI tutor" : "Control group · Independent";
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/* ---------- BUBBLE SORT ---------- */

function renderBars(id, list, active = [], sorted = []) {
  const box = $(id);
  box.innerHTML = "";

  const max = Math.max(...initialData);

  list.forEach((value, i) => {
    const wrap = document.createElement("div");
    wrap.className = "bar-wrap";

    const bar = document.createElement("div");
    bar.className = "bar";

    if (active.includes(i)) bar.classList.add("compare");
    if (sorted.includes(i)) bar.classList.add("sorted");

    bar.style.height = `${Math.max(12, value / max * 130)}px`;

    const label = document.createElement("span");
    label.textContent = value;

    wrap.append(bar, label);
    box.appendChild(wrap);
  });
}


async function bubbleSort() {
  let a = [...bubbleList];
  let comparisons = 0;
  let swaps = 0;
  let passes = 0;

  for (let end = a.length - 1; end > 0; end--) {
    passes++;
    let swapped = false;

    for (let j = 0; j < end; j++) {
      comparisons++;
      $("count-bubble-comp").textContent = comparisons;
      $("count-bubble-pass").textContent = passes;
      $("bubble-action").textContent = `Comparing ${a[j]} and ${a[j + 1]}`;

      renderBars("container-bubble", a, [j, j + 1]);
      await sleep(450);

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;

        $("count-bubble-swap").textContent = swaps;
        $("bubble-action").textContent = "Swap";

        renderBars("container-bubble", a, [j, j + 1]);
        await sleep(350);
      }
    }
  }

  renderBars("container-bubble", a, [], a.map((_, i) => i));
  $("bubble-action").textContent = "Sorted";
  bubbleList = [...a];
}


/* ---------- MERGE SORT ---------- */

function box(value, type = "") {
  return `<span class="merge-item ${type}">${value}</span>`;
}


function renderMerge(left, right, merged = [], active = []) {
  const boxEl = $("container-merge");

  boxEl.innerHTML = `
    <div class="merge-row">
      <label>LEFT</label>
      <div>
        ${left.map((v, i) => box(v, active[0] === i ? "compare" : "")).join("")}
      </div>
    </div>

    <div class="merge-row">
      <label>RIGHT</label>
      <div>
        ${right.map((v, i) => box(v, active[1] === i ? "compare" : "")).join("")}
      </div>
    </div>

    <div class="merge-arrow">↓ merge</div>

    <div class="merge-row result">
      <label>RESULT</label>
      <div>
        ${merged.map(v => box(v, "sorted")).join("")}
      </div>
    </div>
  `;
}


function renderMergeIdle() {
  renderMerge(
    initialData.slice(0, 3),
    initialData.slice(3),
    []
  );
}


async function merge(left, right) {
  const result = [];

  while (left.length && right.length) {
    const li = 0;
    const ri = 0;

    $("merge-action").textContent =
      `Compare ${left[0]} and ${right[0]}`;

    renderMerge(left, right, result, [li, ri]);
    await sleep(650);

    if (left[0] <= right[0]) {
      result.push(left.shift());
    } else {
      result.push(right.shift());
    }

    $("count-merge-comp").textContent =
      Number($("count-merge-comp").textContent) + 1;

    renderMerge(left, right, result);
    await sleep(400);
  }

  result.push(...left, ...right);

  $("count-merge-pass").textContent =
    Number($("count-merge-pass").textContent) + 1;

  renderMerge([], [], result);
  await sleep(500);

  return result;
}


async function mergeSort(a) {
  if (a.length <= 1) return a;

  const mid = Math.floor(a.length / 2);
  const left = a.slice(0, mid);
  const right = a.slice(mid);

  $("merge-action").textContent =
    `Split ${a.join(" · ")}`;

  renderMerge(left, right);
  await sleep(700);

  const sortedLeft = await mergeSort(left);
  const sortedRight = await mergeSort(right);

  return merge(sortedLeft, sortedRight);
}


async function runMergeSort() {
  $("count-merge-comp").textContent = "0";
  $("count-merge-pass").textContent = "0";

  const result = await mergeSort([...mergeList]);

  mergeList = [...result];

  $("merge-action").textContent = "Sorted";
  renderMerge([], [], result);
}


/* ---------- START / RESET ---------- */

async function start() {
  if (running) return;

  running = true;

  $("btn-start-sim").disabled = true;
  $("btn-start-sim").textContent = "Running...";

  $("global-status").textContent =
    "Watching both algorithms...";

  await Promise.all([
    bubbleSort(),
    runMergeSort()
  ]);

  $("global-status").textContent = "Experiment complete";
  $("btn-start-sim").disabled = false;
  $("btn-start-sim").textContent = "↻ Run again";

  running = false;
}


function reset() {
  if (running) return;

  bubbleList = [...initialData];
  mergeList = [...initialData];

  ["count-bubble-comp", "count-bubble-swap",
   "count-bubble-pass", "count-merge-comp",
   "count-merge-pass"].forEach(id => $(id).textContent = "0");

  renderBars("container-bubble", bubbleList);
  renderMergeIdle();

  $("bubble-action").textContent = "Waiting";
  $("merge-action").textContent = "Waiting";
  $("global-status").textContent = "Ready to observe";
}


/* ---------- NAVIGATION ---------- */

function showHypothesis() {
  $("step-exploration").classList.add("hidden");
  $("step-hypothesis").classList.remove("hidden");

  const ai = $("group-badge").textContent.includes("AI");

  $(ai ? "ui-ai-group" : "ui-control-group")
    .classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}


function showTheory() {
  $("step-hypothesis").classList.add("hidden");
  $("step-telling").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}


/* ---------- LOCAL TUTOR ---------- */

function chat() {
  const input = $("ai-input");
  const text = input.value.trim();

  if (!text) return;

  const user = document.createElement("div");
  user.className = "user-message";
  user.textContent = "You: " + text;

  $("chat-box").appendChild(user);
  input.value = "";

  setTimeout(() => {
    const reply = document.createElement("div");
    reply.className = "chat-message";

    reply.innerHTML = aiStep === 0
      ? "<b>✦ Tutor</b><p>Good observation. Now think about what happens when the list becomes much larger. Does the amount of work grow slowly or very quickly?</p>"
      : "<b>✦ Tutor</b><p>Exactly. You are now ready to compare the theoretical growth of the two algorithms.</p>";

    $("chat-box").appendChild(reply);
    $("chat-box").scrollTop = $("chat-box").scrollHeight;

    aiStep++;
  }, 500);
}


/* ---------- RESTART ---------- */

function restart() {
  $("step-telling").classList.add("hidden");
  $("step-hypothesis").classList.add("hidden");
  $("step-exploration").classList.remove("hidden");

  aiStep = 0;
  reset();

  window.scrollTo({ top: 0, behavior: "smooth" });
}
