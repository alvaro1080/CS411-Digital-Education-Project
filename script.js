const initialData = [45, 23, 87, 12, 64, 38];

let bubbleList = [...initialData];
let mergeList = [...initialData];
let running = false;
let aiStep = 0;

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

document.addEventListener("DOMContentLoaded", () => {
  setupGroup();
  resetVisuals();

  $("btn-start-sim").onclick = start;
  $("btn-reset-sim").onclick = reset;
  $("btn-go-to-hypothesis").onclick = goHypothesis;
  $("btn-go-to-telling").onclick = goTheory;
  $("btn-restart").onclick = restart;
  $("btn-send-ai").onclick = chat;

  $("ai-input").onkeydown = e => {
    if (e.key === "Enter") chat();
  };
});

function setupGroup() {
  const ai = Math.random() < .5;
  $("group-badge").textContent =
    ai ? "Experimental group · AI Tutor" : "Control group · Independent";
  $("group-badge").className = ai ? "ai-badge" : "control-badge";
}

function draw(id, list, active = [], type = "") {
  const box = $(id);
  box.innerHTML = "";

  const max = Math.max(...initialData);

  list.forEach((v, i) => {
    const wrap = document.createElement("div");
    wrap.className = "bar-wrap";

    const bar = document.createElement("div");
    bar.className = "bar " + type;

    if (active.includes(i)) bar.classList.add("active");

    bar.style.height = Math.max(8, v / max * 125) + "px";

    const label = document.createElement("small");
    label.textContent = v;

    wrap.append(bar, label);
    box.appendChild(wrap);
  });
}

/* ---------- Bubble Sort ---------- */

async function bubbleSort() {
  let a = [...bubbleList];
  let comparisons = 0, swaps = 0, passes = 0;

  for (let i = 0; i < a.length; i++) {
    passes++;
    $("count-bubble-pass").textContent = passes;

    let swapped = false;

    for (let j = 0; j < a.length - i - 1; j++) {
      comparisons++;
      $("count-bubble-comp").textContent = comparisons;
      $("bubble-action").textContent = "Comparing";

      draw("container-bubble", a, [j, j + 1], "bubble-bar");
      await sleep(400);

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        swapped = true;

        $("count-bubble-swap").textContent = swaps;
        $("bubble-action").textContent = "Moving";

        draw("container-bubble", a, [j, j + 1], "bubble-bar");
        await sleep(350);
      }
    }

    if (!swapped) break;
  }

  $("bubble-action").textContent = "Complete";
  draw("container-bubble", a, [], "bubble-bar");
  bubbleList = a;
}

/* ---------- Merge Sort ---------- */

async function mergeSort() {
  let comparisons = 0, merges = 0, level = 0;

  async function sort(a, depth = 0) {
    if (a.length <= 1) return a;

    level = Math.max(level, depth + 1);
    $("count-merge-pass").textContent = level;

    $("merge-action").textContent = "Splitting";

    draw("container-merge", a, [], "split-bar");
    await sleep(500);

    const mid = Math.floor(a.length / 2);
    const left = await sort(a.slice(0, mid), depth + 1);
    const right = await sort(a.slice(mid), depth + 1);

    $("merge-action").textContent = "Merging";
    merges++;
    $("count-merge-swap").textContent = merges;

    const result = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
      comparisons++;
      $("count-merge-comp").textContent = comparisons;

      if (left[i] <= right[j]) result.push(left[i++]);
      else result.push(right[j++]);

      draw("container-merge", result, [], "merge-bar");
      await sleep(220);
    }

    const final = result.concat(left.slice(i), right.slice(j));

    draw("container-merge", final, [], "merge-bar");
    await sleep(350);

    return final;
  }

  mergeList = await sort(mergeList);
  $("merge-action").textContent = "Complete";
  draw("container-merge", mergeList, [], "merge-bar");
}

/* ---------- Controls ---------- */

async function start() {
  if (running) return;

  running = true;
  $("btn-start-sim").disabled = true;
  $("global-status").textContent = "Algorithms running...";

  await Promise.all([bubbleSort(), mergeSort()]);

  $("global-status").textContent = "Experiment complete";
  $("btn-start-sim").disabled = false;
  $("btn-start-sim").textContent = "▶ Run again";
  running = false;
}

function reset() {
  if (running) return;

  bubbleList = [...initialData];
  mergeList = [...initialData];

  ["count-bubble-comp","count-bubble-swap",
   "count-bubble-pass","count-merge-comp",
   "count-merge-swap","count-merge-pass"]
   .forEach(id => $(id).textContent = id.includes("pass") ? "0" : "0");

  $("btn-start-sim").disabled = false;
  $("btn-start-sim").textContent = "▶ Start experiment";
  $("global-status").textContent = "Ready to observe";

  resetVisuals();
}

function resetVisuals() {
  draw("container-bubble", initialData, [], "bubble-bar");
  draw("container-merge", initialData, [], "merge-bar");
}

/* ---------- Navigation ---------- */

function goHypothesis() {
  $("step-exploration").classList.add("hidden");
  $("step-hypothesis").classList.remove("hidden");

  if (Math.random() < .5)
    $("ui-control-group").classList.remove("hidden");
  else
    $("ui-ai-group").classList.remove("hidden");

  window.scrollTo({top: 0, behavior: "smooth"});
}

function goTheory() {
  $("step-hypothesis").classList.add("hidden");
  $("step-telling").classList.remove("hidden");
  window.scrollTo({top: 0, behavior: "smooth"});
}

/* ---------- Local simulated tutor ---------- */

function chat() {
  const input = $("ai-input");
  const box = $("chat-box");
  const text = input.value.trim();

  if (!text) return;

  const user = document.createElement("div");
  user.className = "user-message";
  user.textContent = "You: " + text;
  box.appendChild(user);

  input.value = "";

  setTimeout(() => {
    const reply = document.createElement("div");
    reply.className = "chat-message";

    reply.innerHTML = aiStep++
      ? "<b>✦ Tutor</b><p>Exactly. Merge Sort keeps dividing the problem into smaller parts, which helps it scale much better for large lists.</p>"
      : "<b>✦ Tutor</b><p>Good observation. Notice how the list is repeatedly divided before the sorted parts are merged together. What might happen when the list becomes much larger?</p>";

    box.appendChild(reply);
    box.scrollTop = box.scrollHeight;
  }, 500);
}

function restart() {
  location.reload();
}
