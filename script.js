const initialData = [
  45, 23, 87, 12, 64, 38,
  71, 9, 56, 31, 82, 17
];

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
    ai
      ? "Experimental group · AI tutor"
      : "Control group · Independent";
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/* =========================================================
   BUBBLE SORT
   ========================================================= */

function renderBars(
  id,
  list,
  active = [],
  sorted = []
) {

  const box = $(id);

  box.innerHTML = "";

  const max = Math.max(...initialData);

  list.forEach((value, i) => {

    const wrap = document.createElement("div");

    wrap.className = "bar-wrap";


    const bar = document.createElement("div");

    bar.className = "bar";


    if (active.includes(i)) {
      bar.classList.add("compare");
    }

    if (sorted.includes(i)) {
      bar.classList.add("sorted");
    }


    bar.style.height =
      `${Math.max(12, value / max * 155)}px`;


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


    $("count-bubble-pass").textContent = passes;


    $("bubble-action").textContent =
      `Pass ${passes}: checking neighbors`;

    await sleep(250);


    for (let j = 0; j < end; j++) {

      comparisons++;

      $("count-bubble-comp").textContent =
        comparisons;


      $("bubble-action").textContent =
        `Compare ${a[j]} and ${a[j + 1]}`;


      renderBars(
        "container-bubble",
        a,
        [j, j + 1]
      );


      await sleep(300);


      if (a[j] > a[j + 1]) {

        [a[j], a[j + 1]] =
          [a[j + 1], a[j]];


        swaps++;

        swapped = true;


        $("count-bubble-swap").textContent =
          swaps;


        $("bubble-action").textContent =
          `Swap ${a[j + 1]} and ${a[j]}`;


        renderBars(
          "container-bubble",
          a,
          [j, j + 1]
        );


        await sleep(280);

      }
    }


    /*
      IMPORTANT PEDAGOGICAL POINT:

      If no swap happened during the entire pass,
      the array is already sorted.

      We stop immediately.

      Therefore:

      Best case = one pass
      One pass checks n-1 neighbors
      => O(n)
    */

    if (!swapped) {

      $("bubble-action").textContent =
        "No swaps → already sorted";


      await sleep(500);

      break;
    }


    const sortedIndexes = [];

    for (
      let i = end;
      i < a.length;
      i++
    ) {
      sortedIndexes.push(i);
    }


    renderBars(
      "container-bubble",
      a,
      [],
      sortedIndexes
    );


    await sleep(250);
  }


  renderBars(
    "container-bubble",
    a,
    [],
    a.map((_, i) => i)
  );


  $("bubble-action").textContent =
    "Sorted";


  bubbleList = [...a];
}


/* =========================================================
   MERGE SORT
   ========================================================= */

/*
  The important change here is that we DO NOT show
  separate LEFT / RIGHT / RESULT boxes.

  The learner sees one array.

  During splitting:
      current range = purple

  During comparison:
      two values = yellow

  After merging:
      current range = green
*/


let mergeArray = [...initialData];

let mergeActiveRange = [];

let mergeCompare = [];

let mergeSorted = [];

let mergePhase = "";


function renderMerge(
  array = mergeArray,
  range = [],
  compare = [],
  sorted = [],
  phase = "",
  detail = ""
) {

  const container =
    $("container-merge");


  if (!array.length) {

    container.innerHTML = `
      <div class="merge-help">
        Press <strong>Start experiment</strong>
        to watch the array.
      </div>
    `;

    return;
  }


  let html = `
    <div class="merge-array">
  `;


  array.forEach((value, index) => {

    let type = "";


    if (sorted.includes(index)) {
      type = "sorted";
    }


    if (range.includes(index)) {
      type = "current";
    }


    if (compare.includes(index)) {
      type = "compare";
    }


    html += `
      <div class="merge-item ${type}">
        ${value}
      </div>
    `;
  });


  html += `
    </div>

    <div class="merge-info">

      <div class="merge-phase">
        ${phase}
      </div>

      <div class="merge-detail">
        ${detail}
      </div>

    </div>
  `;


  container.innerHTML = html;
}


function renderMergeIdle() {

  mergeArray = [...initialData];

  renderMerge(
    mergeArray,
    [],
    [],
    [],
    "Ready",
    "The entire array will be divided, then rebuilt in sorted order."
  );
}


/*
  Merge two sorted ranges.

  The array itself stays visible the entire time.
*/

async function mergeRanges(
  a,
  start,
  middle,
  end,
  depth
) {

  const left = a.slice(start, middle);
  const right = a.slice(middle, end);

  let i = 0;
  let j = 0;

  const result = [];

  let comparisons = 0;


  /*
    Show the two sections that are about to be merged.
  */

  const range = [];

  for (let x = start; x < end; x++) {
    range.push(x);
  }


  $("merge-action").textContent =
    `Merge positions ${start + 1}–${end}`;


  renderMerge(
    a,
    range,
    [],
    mergeSorted,
    "Merging",
    "These values are already sorted inside their smaller sections."
  );


  await sleep(550);


  while (
    i < left.length &&
    j < right.length
  ) {

    const leftIndex = start + i;
    const rightIndex = middle + j;


    comparisons++;

    $("count-merge-comp").textContent =
      Number($("count-merge-comp").textContent) + 1;


    $("merge-action").textContent =
      `Compare ${left[i]} and ${right[j]}`;


    renderMerge(
      a,
      range,
      [leftIndex, rightIndex],
      mergeSorted,
      "Comparing",
      `${left[i]} is compared with ${right[j]}`
    );


    await sleep(500);


    if (left[i] <= right[j]) {

      result.push(left[i]);

      $("merge-action").textContent =
        `Place ${left[i]}`;


      renderMerge(
        a,
        range,
        [leftIndex],
        mergeSorted,
        "Choosing smaller value",
        `${left[i]} goes next because it is smaller.`
      );


      i++;

    } else {

      result.push(right[j]);

      $("merge-action").textContent =
        `Place ${right[j]}`;


      renderMerge(
        a,
        range,
        [rightIndex],
        mergeSorted,
        "Choosing smaller value",
        `${right[j]} goes next because it is smaller.`
      );


      j++;
    }


    await sleep(400);
  }


  /*
    Remaining values are already in sorted order.
  */

  while (i < left.length) {

    result.push(left[i]);

    const index = start + i;

    $("merge-action").textContent =
      `Place remaining ${left[i]}`;


    renderMerge(
      a,
      range,
      [index],
      mergeSorted,
      "Appending",
      `${left[i]} has no smaller competitor left.`
    );


    i++;

    await sleep(300);
  }


  while (j < right.length) {

    result.push(right[j]);

    const index = middle + j;

    $("merge-action").textContent =
      `Place remaining ${right[j]}`;


    renderMerge(
      a,
      range,
      [index],
      mergeSorted,
      "Appending",
      `${right[j]} has no smaller competitor left.`
    );


    j++;

    await sleep(300);
  }


  /*
    Put the merged values back into the original array.
  */

  for (
    let k = 0;
    k < result.length;
    k++
  ) {

    a[start + k] = result[k];
  }


  /*
    The entire newly merged section is now sorted.
  */

  for (let k = start; k < end; k++) {

    if (!mergeSorted.includes(k)) {
      mergeSorted.push(k);
    }
  }


  $("count-merge-pass").textContent =
    Number($("count-merge-pass").textContent) + 1;


  renderMerge(
    a,
    [],
    [],
    mergeSorted,
    "Merged ✓",
    `The section is now sorted: ${result.join(" · ")}`
  );


  await sleep(600);
}


async function mergeSort(
  a,
  start = 0,
  end = a.length
) {

  /*
    Base case:
    one element is already sorted.
  */

  if (end - start <= 1) {

    renderMerge(
      a,
      [start],
      [],
      mergeSorted,
      "Single element",
      `${a[start]} is already sorted.`
    );


    await sleep(350);

    return;
  }


  const middle =
    Math.floor((start + end) / 2);


  /*
    Show the split.
  */

  const range = [];

  for (
    let i = start;
    i < end;
    i++
  ) {
    range.push(i);
  }


  $("merge-action").textContent =
    `Split positions ${start + 1}–${end}`;


  renderMerge(
    a,
    range,
    [],
    mergeSorted,
    "Splitting",
    `Divide ${a.slice(start, end).join(" · ")} into two smaller sections.`
  );


  await sleep(650);


  /*
    Sort the left half.
  */

  await mergeSort(
    a,
    start,
    middle
  );


  /*
    Sort the right half.
  */

  await mergeSort(
    a,
    middle,
    end
  );


  /*
    Merge the two sorted halves.
  */

  await mergeRanges(
    a,
    start,
    middle,
    end
  );
}


async function runMergeSort() {

  $("count-merge-comp").textContent = "0";

  $("count-merge-pass").textContent = "0";


  mergeArray = [...mergeList];

  mergeSorted = [];


  renderMerge(
    mergeArray,
    [],
    [],
    [],
    "Starting",
    "First, the algorithm breaks the array into smaller sections."
  );


  await sleep(500);


  await mergeSort(
    mergeArray,
    0,
    mergeArray.length
  );


  /*
    Everything is sorted.
  */

  mergeSorted =
    mergeArray.map((_, i) => i);


  renderMerge(
    mergeArray,
    [],
    [],
    mergeSorted,
    "Sorted ✓",
    "All sections have been merged into one sorted array."
  );


  $("merge-action").textContent =
    "Sorted";


  mergeList = [...mergeArray];
}


/* =========================================================
   START / RESET
   ========================================================= */

async function start() {

  if (running) return;


  running = true;


  $("btn-start-sim").disabled = true;

  $("btn-reset-sim").disabled = true;

  $("btn-start-sim").textContent =
    "Running...";


  $("global-status").textContent =
    "Watching both algorithms...";


  /*
    Both algorithms run at the same time.
    This makes the comparison easier to see.
  */

  await Promise.all([
    bubbleSort(),
    runMergeSort()
  ]);


  $("global-status").textContent =
    "Experiment complete";


  $("btn-start-sim").disabled = false;

  $("btn-reset-sim").disabled = false;

  $("btn-start-sim").textContent =
    "↻ Run again";


  running = false;
}


function reset() {

  if (running) return;


  bubbleList = [...initialData];

  mergeList = [...initialData];


  [
    "count-bubble-comp",
    "count-bubble-swap",
    "count-bubble-pass",
    "count-merge-comp",
    "count-merge-pass"
  ].forEach(id => {

    $(id).textContent = "0";

  });


  renderBars(
    "container-bubble",
    bubbleList
  );


  renderMergeIdle();


  $("bubble-action").textContent =
    "Waiting";


  $("merge-action").textContent =
    "Waiting";


  $("global-status").textContent =
    "Ready to observe";
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showHypothesis() {

  $("step-exploration")
    .classList.add("hidden");


  $("step-hypothesis")
    .classList.remove("hidden");


  const ai =
    $("group-badge")
      .textContent
      .includes("AI");


  $(ai ? "ui-ai-group" : "ui-control-group")
    .classList
    .remove("hidden");


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}


function showTheory() {

  $("step-hypothesis")
    .classList.add("hidden");


  $("step-telling")
    .classList.remove("hidden");


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}


/* =========================================================
   LOCAL TUTOR
   ========================================================= */

function chat() {

  const input =
    $("ai-input");


  const text =
    input.value.trim();


  if (!text) return;


  const user =
    document.createElement("div");


  user.className =
    "user-message";


  user.textContent =
    "You: " + text;


  $("chat-box")
    .appendChild(user);


  input.value = "";


  setTimeout(() => {

    const reply =
      document.createElement("div");


    reply.className =
      "chat-message";


    if (aiStep === 0) {

      reply.innerHTML =
        `
        <b>✦ Tutor</b>
        <p>
          Good observation. Think about what happens
          when the list becomes much larger. Does the
          amount of work grow slowly or very quickly?
        </p>
        `;

    } else {

      reply.innerHTML =
        `
        <b>✦ Tutor</b>
        <p>
          Exactly. You are now ready to compare the
          theoretical growth of the two algorithms.
        </p>
        `;

    }


    $("chat-box")
      .appendChild(reply);


    $("chat-box").scrollTop =
      $("chat-box").scrollHeight;


    aiStep++;

  }, 500);
}


/* =========================================================
   RESTART
   ========================================================= */

function restart() {

  $("step-telling")
    .classList.add("hidden");


  $("step-hypothesis")
    .classList.add("hidden");


  $("step-exploration")
    .classList.remove("hidden");


  aiStep = 0;


  reset();


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}
