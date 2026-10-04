const initialData = [45,23,87,12,64,38];

let bubbleList = [...initialData];
let mergeList = [...initialData];

let running = false;
let aiStep = 0;


/* ---------- HELPERS ---------- */

const $ = id => document.getElementById(id);

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve,ms));
}


/* ---------- STARTUP ---------- */

document.addEventListener("DOMContentLoaded",()=>{

  setupGroup();

  renderBars("container-bubble",bubbleList);

  $("btn-start-sim").onclick = start;
  $("btn-reset-sim").onclick = reset;

  $("btn-go-to-hypothesis").onclick = showHypothesis;
  $("btn-go-to-telling").onclick = showTheory;

  $("btn-send-ai").onclick = chat;

  $("ai-input").onkeydown = e=>{
    if(e.key==="Enter") chat();
  };

  $("btn-restart").onclick = restart;

});


function setupGroup(){

  const ai = Math.random() < .5;

  $("group-badge").textContent =
    ai
      ? "Experimental group · AI tutor"
      : "Control group · Independent";
}


/* =====================================================
   BUBBLE SORT
   ===================================================== */

function renderBars(id,list,active=[],sorted=[]){

  const box = $(id);

  box.innerHTML = "";

  const max = Math.max(...initialData);

  list.forEach((value,i)=>{

    const wrap = document.createElement("div");

    wrap.className = "bar-wrap";

    const bar = document.createElement("div");

    bar.className = "bar";

    if(active.includes(i)){
      bar.classList.add("compare");
    }

    if(sorted.includes(i)){
      bar.classList.add("sorted");
    }

    bar.style.height =
      `${Math.max(12,value/max*130)}px`;

    const label = document.createElement("span");

    label.textContent = value;

    wrap.append(bar,label);

    box.appendChild(wrap);

  });
}


async function bubbleSort(){

  let a = [...bubbleList];

  let comparisons = 0;
  let swaps = 0;
  let passes = 0;


  for(let end=a.length-1;end>0;end--){

    passes++;

    $("count-bubble-pass").textContent = passes;

    for(let j=0;j<end;j++){

      comparisons++;

      $("count-bubble-comp").textContent =
        comparisons;

      $("bubble-action").textContent =
        `Comparing ${a[j]} and ${a[j+1]}`;

      $("bubble-message-title").textContent =
        "Compare";

      $("bubble-message").textContent =
        `${a[j]} and ${a[j+1]} are neighbors.`;

      renderBars(
        "container-bubble",
        a,
        [j,j+1]
      );

      await sleep(450);


      if(a[j] > a[j+1]){

        [a[j],a[j+1]] =
        [a[j+1],a[j]];

        swaps++;

        $("count-bubble-swap").textContent =
          swaps;

        $("bubble-action").textContent =
          "Swap";

        $("bubble-message-title").textContent =
          "Swap";

        $("bubble-message").textContent =
          "The larger value moves to the right.";

        renderBars(
          "container-bubble",
          a,
          [j,j+1]
        );

        await sleep(350);

      }else{

        $("bubble-message-title").textContent =
          "No swap";

        $("bubble-message").textContent =
          "They are already in the correct order.";

        await sleep(250);
      }

    }
  }


  renderBars(
    "container-bubble",
    a,
    [],
    a.map((_,i)=>i)
  );

  $("bubble-action").textContent =
    "Sorted";

  $("bubble-message-title").textContent =
    "Complete";

  $("bubble-message").textContent =
    "Bubble Sort has finished.";

  bubbleList = [...a];
}


/* =====================================================
   MERGE SORT
   ===================================================== */


/*
  Update the little phase indicator above
  the Merge Sort animation.
*/

function setMergePhase(number,text){

  $("merge-phase-number").textContent = number;

  $("merge-phase-text").textContent = text;
}


/*
  Update the explanation below the animation.
*/

function setMergeMessage(title,text){

  $("merge-message-title").textContent =
    title;

  $("merge-message").textContent =
    text;
}


/* ---------- SPLIT DISPLAY ---------- */

function buildSplitLevels(array){

  const levels = [];


  function split(list,depth){

    if(!levels[depth]){
      levels[depth] = [];
    }

    levels[depth].push([...list]);


    if(list.length<=1){
      return;
    }

    const mid =
      Math.floor(list.length/2);

    split(
      list.slice(0,mid),
      depth+1
    );

    split(
      list.slice(mid),
      depth+1
    );
  }


  split(array,0);

  return levels;
}


function renderSplit(levels){

  const container =
    $("container-merge");

  container.innerHTML = "";


  levels.forEach((level,levelIndex)=>{

    const row =
      document.createElement("div");

    row.className =
      "split-level";


    level.forEach(group=>{

      const groupBox =
        document.createElement("div");

      groupBox.className =
        "split-group";


      const label =
        document.createElement("span");

      label.className =
        "split-label";

      label.textContent =
        group.length===1
          ? "READY"
          : "GROUP";


      const items =
        document.createElement("div");

      items.className =
        "split-items";


      group.forEach(value=>{

        const item =
          document.createElement("span");

        item.className =
          "split-item";

        if(group.length===1){
          item.classList.add("single");
        }

        item.textContent =
          value;

        items.appendChild(item);
      });


      groupBox.append(label,items);

      row.appendChild(groupBox);

    });


    container.appendChild(row);

  });
}


async function animateSplit(array){

  setMergePhase(
    1,
    "Split the array"
  );

  setMergeMessage(
    "Step 1 — Split",
    "The list is repeatedly divided until every group contains one value."
  );


  const levels =
    buildSplitLevels(array);


  for(let i=0;i<levels.length;i++){

    renderSplit(
      levels.slice(0,i+1)
    );

    $("merge-action").textContent =
      i === levels.length-1
        ? "Smallest groups reached"
        : `Split level ${i+1}`;

    await sleep(750);
  }


  await sleep(500);
}


/* ---------- MERGE DISPLAY ---------- */

function renderMerge(
  left,
  right,
  result,
  leftIndex=-1,
  rightIndex=-1
){

  const container =
    $("container-merge");

  container.innerHTML = "";


  const instruction =
    document.createElement("div");

  instruction.className =
    "merge-instruction";

  instruction.textContent =
    "Compare the first remaining value in each sorted group.";

  container.appendChild(instruction);


  const columns =
    document.createElement("div");

  columns.className =
    "merge-columns";


  /* LEFT */

  const leftBox =
    document.createElement("div");

  leftBox.className =
    "merge-source";

  leftBox.innerHTML =
    `<div class="merge-source-title">
      LEFT — SORTED
    </div>`;


  const leftItems =
    document.createElement("div");

  leftItems.className =
    "merge-items";


  left.forEach((value,i)=>{

    const item =
      document.createElement("span");

    item.className =
      "merge-item";

    item.textContent =
      value;


    if(i===leftIndex){
      item.classList.add("current");
    }

    if(i<leftIndex){
      item.classList.add("used");
    }


    leftItems.appendChild(item);
  });


  leftBox.appendChild(leftItems);


  /* ARROW */

  const operator =
    document.createElement("div");

  operator.className =
    "merge-operator";

  operator.textContent =
    "→";


  /* RIGHT */

  const rightBox =
    document.createElement("div");

  rightBox.className =
    "merge-source";

  rightBox.innerHTML =
    `<div class="merge-source-title">
      RIGHT — SORTED
    </div>`;


  const rightItems =
    document.createElement("div");

  rightItems.className =
    "merge-items";


  right.forEach((value,i)=>{

    const item =
      document.createElement("span");

    item.className =
      "merge-item";

    item.textContent =
      value;


    if(i===rightIndex){
      item.classList.add("current");
    }

    if(i<rightIndex){
      item.classList.add("used");
    }


    rightItems.appendChild(item);

  });


  rightBox.appendChild(rightItems);


  columns.append(
    leftBox,
    operator,
    rightBox
  );

  container.appendChild(columns);


  /* RESULT */

  const resultBox =
    document.createElement("div");

  resultBox.className =
    "merge-result";


  const resultTitle =
    document.createElement("div");

  resultTitle.className =
    "merge-result-title";

  resultTitle.textContent =
    "RESULT BEING BUILT";


  resultBox.appendChild(resultTitle);


  const resultItems =
    document.createElement("div");

  resultItems.className =
    "merge-result-items";


  result.forEach(value=>{

    const item =
      document.createElement("span");

    item.className =
      "merge-item";

    item.textContent =
      value;

    resultItems.appendChild(item);

  });


  resultBox.appendChild(resultItems);

  container.appendChild(resultBox);
}


/* ---------- MERGING ---------- */

async function merge(left,right){

  let result = [];

  let i = 0;
  let j = 0;


  $("count-merge-pass").textContent =
    Number($("count-merge-pass").textContent)+1;


  setMergePhase(
    2,
    "Compare and merge"
  );


  while(
    i<left.length &&
    j<right.length
  ){

    const a = left[i];
    const b = right[j];


    renderMerge(
      left,
      right,
      result,
      i,
      j
    );


    $("merge-action").textContent =
      `${a} vs ${b}`;


    setMergeMessage(
      "Compare",
      `Which is smaller: ${a} or ${b}?`
    );


    await sleep(800);


    $("count-merge-comp").textContent =
      Number($("count-merge-comp").textContent)+1;


    if(a<=b){

      result.push(a);
      i++;

      $("merge-action").textContent =
        `Take ${a}`;

      setMergeMessage(
        "Take the left value",
        `${a} is smaller, so it goes into the result.`
      );

    }else{

      result.push(b);
      j++;

      $("merge-action").textContent =
        `Take ${b}`;

      setMergeMessage(
        "Take the right value",
        `${b} is smaller, so it goes into the result.`
      );
    }


    renderMerge(
      left,
      right,
      result,
      i,
      j
    );


    await sleep(650);

  }


  /* Remaining left values */

  while(i<left.length){

    result.push(left[i]);

    $("merge-action").textContent =
      `Take remaining ${left[i]}`;

    setMergeMessage(
      "No comparison needed",
      "Everything remaining on this side is already larger than the values we placed."
    );

    i++;

    renderMerge(
      left,
      right,
      result,
      i,
      j
    );

    await sleep(450);
  }


  /* Remaining right values */

  while(j<right.length){

    result.push(right[j]);

    $("merge-action").textContent =
      `Take remaining ${right[j]}`;

    setMergeMessage(
      "No comparison needed",
      "The remaining values are already sorted."
    );

    j++;

    renderMerge(
      left,
      right,
      result,
      i,
      j
    );

    await sleep(450);
  }


  /* Finished this merge */

  $("merge-action").textContent =
    "Merged!";


  setMergeMessage(
    "Group sorted",
    `[ ${result.join(" · ")} ] is now sorted.`
  );


  $("container-merge").innerHTML = `

    <div class="merge-complete">

      <strong>
        [ ${result.join(" · ")} ]
      </strong>

      This group is sorted.

    </div>

  `;


  await sleep(650);

  return result;
}


/* ---------- RECURSION ---------- */

async function mergeSort(a){

  if(a.length<=1){
    return a;
  }


  const mid =
    Math.floor(a.length/2);


  const left =
    a.slice(0,mid);

  const right =
    a.slice(mid);


  const sortedLeft =
    await mergeSort(left);

  const sortedRight =
    await mergeSort(right);


  return merge(
    sortedLeft,
    sortedRight
  );
}


/* ---------- COMPLETE MERGE SORT ---------- */

async function runMergeSort(){

  $("count-merge-comp").textContent =
    "0";

  $("count-merge-pass").textContent =
    "0";


  const data =
    [...mergeList];


  /*
    First show the entire splitting process.
  */

  await animateSplit(data);


  /*
    Then show the rebuilding process.
  */

  setMergePhase(
    2,
    "Compare and merge"
  );


  setMergeMessage(
    "Step 2 — Rebuild",
    "Now the one-value groups are combined into larger sorted groups."
  );


  await sleep(500);


  const result =
    await mergeSort(data);


  mergeList =
    [...result];


  setMergePhase(
    3,
    "Finished"
  );


  $("merge-action").textContent =
    "Sorted";


  setMergeMessage(
    "Complete",
    "Merge Sort split the problem, then rebuilt it in sorted order."
  );


  $("container-merge").innerHTML = `

    <div class="merge-complete">

      <strong>
        [ ${result.join(" · ")} ]
      </strong>

      Merge Sort is finished.

    </div>

  `;
}


/* =====================================================
   START / RESET
   ===================================================== */

async function start(){

  if(running){
    return;
  }


  running = true;


  $("btn-start-sim").disabled =
    true;

  $("btn-start-sim").textContent =
    "Running...";


  $("global-status").textContent =
    "Watching both algorithms...";


  await Promise.all([
    bubbleSort(),
    runMergeSort()
  ]);


  $("global-status").textContent =
    "Experiment complete";


  $("btn-start-sim").disabled =
    false;

  $("btn-start-sim").textContent =
    "↻ Run again";


  running = false;
}


function reset(){

  if(running){
    return;
  }


  bubbleList =
    [...initialData];

  mergeList =
    [...initialData];


  [
    "count-bubble-comp",
    "count-bubble-swap",
    "count-bubble-pass",
    "count-merge-comp",
    "count-merge-pass"
  ].forEach(id=>{
    $(id).textContent = "0";
  });


  renderBars(
    "container-bubble",
    bubbleList
  );


  $("container-merge").innerHTML = `

    <div class="merge-help">

      <div class="merge-help-icon">
        ↓
      </div>

      <strong>
        Press Start experiment
      </strong>

      <span>
        First we split the list.
        Then we compare and merge the pieces.
      </span>

    </div>

  `;


  setMergePhase(
    1,
    "Split the array"
  );


  $("bubble-action").textContent =
    "Waiting";

  $("merge-action").textContent =
    "Waiting";


  $("bubble-message-title").textContent =
    "Ready";

  $("bubble-message").textContent =
    "Watch two neighboring elements being compared.";


  setMergeMessage(
    "Follow the three stages",
    "Split → compare → take the smaller → merge."
  );


  $("global-status").textContent =
    "Ready to observe";
}


/* =====================================================
   NAVIGATION
   ===================================================== */

function updateSteps(active){

  document
    .querySelectorAll(".step")
    .forEach((step,i)=>{

      step.classList.toggle(
        "active",
        i===active
      );

    });
}


function showHypothesis(){

  $("step-exploration")
    .classList.add("hidden");

  $("step-hypothesis")
    .classList.remove("hidden");


  const ai =
    $("group-badge")
      .textContent
      .includes("AI");


  $(ai
    ? "ui-ai-group"
    : "ui-control-group"
  ).classList.remove("hidden");


  updateSteps(1);


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}


function showTheory(){

  $("step-hypothesis")
    .classList.add("hidden");

  $("step-telling")
    .classList.remove("hidden");


  updateSteps(2);


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}


/* =====================================================
   LOCAL AI TUTOR
   ===================================================== */

function chat(){

  const input =
    $("ai-input");

  const text =
    input.value.trim();


  if(!text){
    return;
  }


  const user =
    document.createElement("div");

  user.className =
    "user-message";

  user.textContent =
    "You: " + text;


  $("chat-box")
    .appendChild(user);


  input.value = "";


  setTimeout(()=>{

    const reply =
      document.createElement("div");

    reply.className =
      "chat-message";


    if(aiStep===0){

      reply.innerHTML = `
        <b>✦ Tutor</b>
        <p>
          Good observation. Now think about what happens
          when the list becomes much larger. Does the amount
          of work grow slowly or very quickly?
        </p>
      `;

    }else{

      reply.innerHTML = `
        <b>✦ Tutor</b>
        <p>
          Exactly. You are now ready to compare the theoretical
          growth of the two algorithms.
        </p>
      `;

    }


    $("chat-box")
      .appendChild(reply);


    $("chat-box").scrollTop =
      $("chat-box").scrollHeight;


    aiStep++;

  },500);
}


/* =====================================================
   RESTART
   ===================================================== */

function restart(){

  $("step-telling")
    .classList.add("hidden");

  $("step-hypothesis")
    .classList.add("hidden");

  $("step-exploration")
    .classList.remove("hidden");


  aiStep = 0;

  updateSteps(0);

  reset();


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}
