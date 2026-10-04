const groups = ["CONTROL", "AI_ASSISTED"];
const currentGroup = groups[Math.floor(Math.random() * groups.length)];

const initialData = [45, 23, 87, 12, 64, 38];

let bubbleList = [...initialData];
let mergeList = [...initialData];
let running = false;
let aiStep = 0;

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

document.addEventListener("DOMContentLoaded", () => {
  setupGroup();
  renderBars("container-bubble", bubbleList);
  renderBars("container-merge", mergeList);

  $("btn-start-sim").onclick = startSimulations;
  $("btn-reset-sim").onclick = resetSimulations;
  $("btn-go-to-hypothesis").onclick = goToHypothesis;
  $("btn-go-to-telling").onclick = goToTelling;
  $("btn-send-ai").onclick = handleAiChat;
  $("btn-restart").onclick = restartActivity;

  $("ai-input").addEventListener("keydown", e => {
    if (e.key === "Enter") handleAiChat();
  });
});


function setupGroup() {
  const badge = $("group-badge");

  if (currentGroup === "AI_ASSISTED") {
    badge.textContent = "Experimental Group · AI Tutor";
    badge.classList.add("green-badge");
  } else {
    badge.textContent = "Control Group · Independent";
  }
}


function renderBars(containerId, list, active = [], color = "") {
  const container = $(containerId);
  container.innerHTML = "";

  const max = Math.max(...initialData);

  list.forEach((value, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "bar-wrapper";

    const bar = document.createElement("div");
    bar.className = "bar";

    if (active.includes(i)) bar.classList.add("active");
    if (color) bar.classList.add(color);

    bar.style.height = `${Math.max(8, value / max * 130)}px`;

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = value;

    wrapper.append(bar, label);
    container.appendChild(wrapper);
  });
}


/* ---------------- BUBBLE SORT ---------------- */

async function runBubbleSort() {
  let arr = [...bubbleList];
  let comparisons = 0;
  let swaps = 0;
  let passes = 0;

  for (let i = 0; i < arr.length - 1; i++) {
    passes++;
    $("count-bubble-pass").textContent = passes;

    for (let j = 0; j < arr.length - i - 1; j++) {
      comparisons++;
      $("count-bubble-comp").textContent = comparisons;
      $("bubble-action").textContent = "Comparing";

      renderBars("container-bubble", arr, [j, j + 1]);
      await sleep(350);

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;

        $("count-bubble-swap").textContent = swaps;
        $("bubble-action").textContent = "Swapping";

        renderBars("container-bubble", arr, [j, j + 1], "sorted");
        await sleep(350);
      }
    }
  }

  $("bubble-action").textContent = "Complete";
  renderBars("container-bubble", arr, [], "sorted");
  bubbleList = [...arr];
}


/* ---------------- MERGE SORT ---------------- */

async function runMergeSort() {
  let comparisons = 0;
  let merges = 0;
  let splits = 0;

  async function sort(arr, start = 0) {
    if (arr.length <= 1) return arr;

    splits++;
    $("count-merge-pass").textContent = splits;
    $("merge-action").textContent = "Splitting";

    const mid = Math.floor(arr.length / 2);

    await sleep(400);

    const left = await sort(arr.slice(0, mid), start);
    const right = await sort(arr.slice(mid), start + mid);

    const result = [];

    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      comparisons++;
      $("count-merge-comp").textContent = comparisons;

      $("merge-action").textContent = "Comparing";
      await sleep(250);

      if (left[i] <= right[j]) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }

    while (i < left.length) result.push(left[i++]);
    while (j < right.length) result.push(right[j++]);

    merges++;
    $("count-merge-swap").textContent = merges;
    $("merge-action").textContent = "Merging";

    renderBars("container-merge", result, [], "sorted");
    await sleep(450);

    return result;
  }

  mergeList = await sort([...mergeList]);

  $("merge-action").textContent = "Complete";
  renderBars("container-merge", mergeList, [], "sorted");
}


/* ---------------- START ---------------- */

async function startSimulations() {
  if (running) return;

  running = true;

  const button = $("btn-start-sim");
  button.disabled = true;
  button.textContent = "⏳ Running...";

  $("global-status").textContent = "Algorithms are working...";

  await Promise.all([
    runBubbleSort(),
    runMergeSort()
  ]);

  $("global-status").textContent = "Experiment complete";
  button.disabled = false;
  button.textContent = "↻ Run again";

  running = false;
}


/* ---------------- RESET ---------------- */

function resetSimulations() {
  if (running) return;

  bubbleList = [...initialData];
  mergeList = [...initialData];

  [
    "count-bubble-comp",
    "count-bubble-swap",
    "count-bubble-pass",
    "count-merge-comp",
    "count-merge-swap",
    "count-merge-pass"
  ].forEach(id => $(id).textContent = "0");

  renderBars("container-bubble", bubbleList);
  renderBars("container-merge", mergeList);

  $("bubble-action").textContent = "Waiting";
  $("merge-action").textContent = "Waiting";
  $("global-status").textContent = "Ready to observe";

  $("btn-start-sim").disabled = false;
  $("btn-start-sim").textContent = "▶ Start experiment";
}


/* ---------------- NAVIGATION ---------------- */

function goToHypothesis() {
  $("step-exploration").classList.add("hidden");
  $("step-hypothesis").classList.remove("hidden");

  if (currentGroup === "AI_ASSISTED") {
    $("ui-ai-group").classList.remove("hidden");
  } else {
    $("ui-control-group").classList.remove("hidden");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}


function goToTelling() {
  $("step-hypothesis").classList.add("hidden");
  $("step-telling").classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}


/* ---------------- LOCAL TUTOR ---------------- */

function handleAiChat() {
  const input = $("ai-input");
  const chat = $("chat-box");
  const text = input.value.trim();

  if (!text) return;

  const user = document.createElement("div");
  user.className = "user-message";
  user.innerHTML = `<b>You:</b> ${escapeHtml(text)}`;

  chat.appendChild(user);
  input.value = "";
  chat.scrollTop = chat.scrollHeight;

  setTimeout(() => {
    const message = document.createElement("div");
    message.className = "ai-message";

    const response = aiStep === 0
      ? "Good observation. Now compare the growth of the two algorithms. Which one do you think will handle a list of 10,000 elements better?"
      : "Exactly. Merge Sort reduces the problem by repeatedly splitting it into smaller pieces. This leads to O(n log n) growth.";

    message.innerHTML = `<b>✦ Tutor:</b> ${response}`;
    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;
    aiStep++;
  }, 600);
}


function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}


/* ---------------- RESTART ---------------- */

function restartActivity() {
  $("step-telling").classList.add("hidden");
  $("step-hypothesis").classList.add("hidden");
  $("step-exploration").classList.remove("hidden");

  aiStep = 0;
  running = false;

  $("ui-control-group").classList.add("hidden");
  $("ui-ai-group").classList.add("hidden");

  resetSimulations();

  window.scrollTo({ top: 0, behavior: "smooth" });
}
