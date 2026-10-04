const initialData=[45,23,87,12,64,38];

let bubbleList=[...initialData];
let insertionList=[...initialData];
let running=false;
let aiStep=0;

const $=id=>document.getElementById(id);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

/* GROUP */

const currentGroup=Math.random()<.5?"CONTROL":"AI_ASSISTED";

$("group-badge").textContent=
  currentGroup==="AI_ASSISTED"
  ? "Mode : Tuteur IA"
  : "Mode : Autonome";

/* BARS */

function renderBars(id,list,active=[]){

  const container=$(id);

  if(!container)return;

  container.innerHTML="";

  const max=Math.max(...initialData);

  list.forEach((value,index)=>{

    const wrapper=document.createElement("div");
    wrapper.className="bar-wrapper";

    const bar=document.createElement("div");
    bar.className="bar";

    if(active.includes(index)){
      bar.classList.add("active");
    }

    bar.style.height=Math.max(8,value/max*120)+"px";

    const label=document.createElement("small");
    label.textContent=value;

    wrapper.append(bar,label);
    container.appendChild(wrapper);
  });
}

/* BUBBLE SORT */

async function runBubbleSort(){

  const arr=[...bubbleList];

  let comparisons=0;
  let swaps=0;

  for(let i=0;i<arr.length;i++){

    for(let j=0;j<arr.length-i-1;j++){

      comparisons++;
      $("count-bubble-comp").textContent=comparisons;

      renderBars("container-bubble",arr,[j,j+1]);
      $("bubble-action").textContent="Comparaison";

      await sleep(350);

      if(arr[j]>arr[j+1]){

        [arr[j],arr[j+1]]=[arr[j+1],arr[j]];

        swaps++;
        $("count-bubble-swap").textContent=swaps;

        $("bubble-action").textContent="Échange";

        renderBars("container-bubble",arr,[j,j+1]);

        await sleep(350);
      }
    }

    $("count-bubble-pass").textContent=i+1;
  }

  bubbleList=[...arr];

  renderBars("container-bubble",arr);

  $("bubble-action").textContent="Terminé";
}

/* INSERTION SORT */

async function runInsertionSort(){

  const arr=[...insertionList];

  let comparisons=0;
  let movements=0;

  for(let i=1;i<arr.length;i++){

    const key=arr[i];
    let j=i-1;

    renderBars("container-insertion",arr,[i]);

    $("insertion-action").textContent="Insertion";

    await sleep(350);

    while(j>=0&&arr[j]>key){

      comparisons++;
      movements++;

      $("count-insert-comp").textContent=comparisons;
      $("count-insert-swap").textContent=movements;

      arr[j+1]=arr[j];

      renderBars("container-insertion",arr,[j,j+1]);

      $("insertion-action").textContent="Déplacement";

      await sleep(350);

      j--;
    }

    if(j>=0){
      comparisons++;
      $("count-insert-comp").textContent=comparisons;
    }

    arr[j+1]=key;

    $("count-insert-pass").textContent=i+1;

    renderBars("container-insertion",arr);

    await sleep(250);
  }

  insertionList=[...arr];

  renderBars("container-insertion",arr);

  $("insertion-action").textContent="Terminé";
}

/* START */

async function startSimulations(){

  if(running)return;

  running=true;

  const button=$("btn-start-sim");

  button.disabled=true;
  button.textContent="⏳ Animations en cours...";

  $("global-status").textContent="Animations en cours";

  await Promise.all([
    runBubbleSort(),
    runInsertionSort()
  ]);

  running=false;

  button.disabled=false;
  button.textContent="↻ Relancer les animations";

  $("global-status").textContent="Expérience terminée";
}

/* RESET */

function resetSimulations(){

  if(running)return;

  bubbleList=[...initialData];
  insertionList=[...initialData];

  $("count-bubble-comp").textContent="0";
  $("count-bubble-swap").textContent="0";
  $("count-bubble-pass").textContent="0";

  $("count-insert-comp").textContent="0";
  $("count-insert-swap").textContent="0";
  $("count-insert-pass").textContent="1";

  $("bubble-action").textContent="En attente";
  $("insertion-action").textContent="En attente";
  $("global-status").textContent="Prêt à observer";

  renderBars("container-bubble",bubbleList);
  renderBars("container-insertion",insertionList);

  const button=$("btn-start-sim");

  button.disabled=false;
  button.textContent="▶ Lancer l'expérience";
}

/* NAVIGATION */

function showSection(id){

  ["step-exploration","step-hypothesis","step-telling"]
    .forEach(section=>$(section).classList.add("hidden"));

  $(id).classList.remove("hidden");

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}

function goToHypothesis(){

  showSection("step-hypothesis");

  if(currentGroup==="AI_ASSISTED"){
    $("ui-ai-group").classList.remove("hidden");
  }else{
    $("ui-control-group").classList.remove("hidden");
  }
}

function goToTelling(){
  showSection("step-telling");
}

/* AI CHAT */

function handleAiChat(){

  const input=$("ai-input");
  const text=input.value.trim();

  if(!text)return;

  const box=$("chat-box");

  const user=document.createElement("div");

  user.className="chat-message";
  user.innerHTML=`<b>Vous</b><p>${text}</p>`;

  box.appendChild(user);

  input.value="";
  box.scrollTop=box.scrollHeight;

  setTimeout(()=>{

    const answer=document.createElement("div");
    answer.className="chat-message";

    if(aiStep===0){

      answer.innerHTML=`
        <b>✦ Tuteur</b>
        <p>
          Bonne observation. Imaginez maintenant une liste de
          10 000 éléments. Le nombre de comparaisons augmenterait-il
          linéairement ou beaucoup plus vite ?
        </p>
      `;

      aiStep++;

    }else{

      answer.innerHTML=`
        <b>✦ Tuteur</b>
        <p>
          Exactement. Lorsque les éléments doivent être comparés
          avec beaucoup d'éléments précédents, le comportement
          devient quadratique : O(n²).
        </p>
      `;
    }

    box.appendChild(answer);
    box.scrollTop=box.scrollHeight;

  },600);
}

/* RESTART */

function restartActivity(){

  aiStep=0;
  running=false;

  $("ui-control-group").classList.add("hidden");
  $("ui-ai-group").classList.add("hidden");

  resetSimulations();
  showSection("step-exploration");
}

/* EVENTS */

document.addEventListener("DOMContentLoaded",()=>{

  renderBars("container-bubble",bubbleList);
  renderBars("container-insertion",insertionList);

  $("btn-start-sim").onclick=startSimulations;
  $("btn-reset-sim").onclick=resetSimulations;

  $("btn-go-to-hypothesis").onclick=goToHypothesis;
  $("btn-go-to-telling").onclick=goToTelling;

  $("btn-send-ai").onclick=handleAiChat;

  $("ai-input").addEventListener("keydown",event=>{
    if(event.key==="Enter"){
      event.preventDefault();
      handleAiChat();
    }
  });

  $("btn-restart").onclick=restartActivity;
});
