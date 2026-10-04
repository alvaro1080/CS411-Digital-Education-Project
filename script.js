const data=[45,23,87,12,64,38];
let bubble=[...data], insertion=[...data], running=false,aiStep=0;
const $=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const group=Math.random()<.5?"CONTROL":"AI_ASSISTED";
$("group-badge").textContent=group==="AI_ASSISTED"?"Avec Tuteur IA":"Mode autonome";

function bars(id,list,active=[]){
  const el=$(id),max=Math.max(...data);
  el.innerHTML="";
  list.forEach((v,i)=>{
    const w=document.createElement("div");
    w.className="bar-wrapper";
    w.innerHTML=`<div class="bar ${active.includes(i)?"active":""}" style="height:${Math.max(8,v/max*120)}px"></div><small>${v}</small>`;
    el.appendChild(w);
  });
}

function reset(){
  bubble=[...data]; insertion=[...data];
  ["count-bubble-comp","count-bubble-swap","count-bubble-pass",
   "count-insert-comp","count-insert-swap"].forEach(id=>$(id).textContent="0");
  $("count-insert-pass").textContent="1";
  bars("container-bubble",bubble); bars("container-insertion",insertion);
}

async function bubbleSort(){
  let a=[...bubble],comp=0,swap=0;
  for(let i=0;i<a.length;i++){
    for(let j=0;j<a.length-i-1;j++){
      comp++; $("count-bubble-comp").textContent=comp;
      bars("container-bubble",a,[j,j+1]); await sleep(350);
      if(a[j]>a[j+1]){
        [a[j],a[j+1]]=[a[j+1],a[j]];
        swap++; $("count-bubble-swap").textContent=swap;
        bars("container-bubble",a,[j,j+1]); await sleep(350);
      }
    }
    $("count-bubble-pass").textContent=i+1;
  }
  bubble=a; bars("container-bubble",a);
}

async function insertionSort(){
  let a=[...insertion],comp=0,move=0;
  for(let i=1;i<a.length;i++){
    let key=a[i],j=i-1;
    bars("container-insertion",a,[i]); await sleep(350);
    while(j>=0&&a[j]>key){
      comp++; move++;
      $("count-insert-comp").textContent=comp;
      $("count-insert-swap").textContent=move;
      a[j+1]=a[j]; bars("container-insertion",a,[j,j+1]);
      await sleep(350); j--;
    }
    if(j>=0) $("count-insert-comp").textContent=++comp;
    a[j+1]=key;
    $("count-insert-pass").textContent=i+1;
  }
  insertion=a; bars("container-insertion",a);
}

async function start(){
  if(running)return;
  running=true;
  const b=$("btn-start-sim");
  b.disabled=true;b.textContent="⏳ En cours...";
  $("global-status").textContent="Animations en cours";
  await Promise.all([bubbleSort(),insertionSort()]);
  running=false;b.disabled=false;b.textContent="↻ Relancer";
  $("global-status").textContent="Expérience terminée";
}

function show(id){
  ["step-exploration","step-hypothesis","step-telling"].forEach(x=>$(x).classList.add("hidden"));
  $(id).classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}

function chat(){
  const input=$("ai-input"),text=input.value.trim();
  if(!text)return;
  const box=$("chat-box");
  box.innerHTML+=`<p class="user"><b>Vous</b><br>${text}</p>`;
  input.value="";box.scrollTop=box.scrollHeight;
  setTimeout(()=>{
    const reply=aiStep++?"Exactement. Ce comportement augmente rapidement avec n : c'est la croissance quadratique O(n²).":"Bonne observation. Si la liste passe de 6 à 10 000 éléments, pensez-vous que le nombre de comparaisons augmente linéairement ou beaucoup plus vite ?";
    box.innerHTML+=`<p><b>✦ Tuteur</b><br>${reply}</p>`;
    box.scrollTop=box.scrollHeight;
  },600);
}

$("btn-start-sim").onclick=start;
$("btn-reset-sim").onclick=reset;
$("btn-go-to-hypothesis").onclick=()=>{
  show("step-hypothesis");
  $(group==="AI_ASSISTED"?"ui-ai-group":"ui-control-group").classList.remove("hidden");
};
$("btn-go-to-telling").onclick=()=>show("step-telling");
$("btn-send-ai").onclick=chat;
$("ai-input").onkeydown=e=>e.key==="Enter"&&(e.preventDefault(),chat());
$("btn-restart").onclick=()=>{aiStep=0;reset();show("step-exploration")};

reset();
