const groups=["CONTROL","AI_ASSISTED"];
const currentGroup=groups[Math.floor(Math.random()*groups.length)];

const initial=[45,23,87,12,64,38];
let bubble=[...initial],merge=[...initial];
let running=false,aiStep=0;

document.addEventListener("DOMContentLoaded",()=>{
  setupGroup();
  render("container-bubble",bubble);
  render("container-merge",merge);

  $("btn-start-sim").onclick=start;
  $("btn-reset-sim").onclick=reset;
  $("btn-go-to-hypothesis").onclick=goHypothesis;
  $("btn-go-to-telling").onclick=goTheory;
  $("btn-send-ai").onclick=chat;
  $("ai-input").onkeydown=e=>{if(e.key==="Enter")chat()};
  $("btn-restart").onclick=restart;
});

const $=id=>document.getElementById(id);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

function setupGroup(){
  const b=$("group-badge");
  b.textContent=currentGroup==="AI_ASSISTED"?"Mode: AI-assisted":"Mode: Control";
  b.style.background=currentGroup==="AI_ASSISTED"?"#059669":"#d97706";

  if(currentGroup==="AI_ASSISTED")
    $("ui-ai-group").classList.remove("hidden");
  else
    $("ui-control-group").classList.remove("hidden");
}

function render(id,list,states={}){
  const box=$(id);
  box.innerHTML="";
  const max=Math.max(...initial);

  list.forEach((v,i)=>{
    const w=document.createElement("div");
    w.className="bar-wrapper";

    const b=document.createElement("div");
    b.className="bar "+(states[i]||"");
    b.style.height=Math.max(8,v/max*130)+"px";

    const label=document.createElement("div");
    label.className="bar-label";
    label.textContent=v;

    w.append(b,label);
    box.appendChild(w);
  });
}


/* BUBBLE SORT */

async function bubbleSort(){
  let a=[...bubble],comp=0,swap=0;

  for(let end=a.length-1;end>0;end--){
    let changed=false;

    for(let j=0;j<end;j++){
      comp++;
      $("count-bubble-comp").textContent=comp;
      $("bubble-action").textContent="Comparing";

      render("container-bubble",a,{[j]:"compare",[j+1]:"compare"});
      await wait(450);

      if(a[j]>a[j+1]){
        [a[j],a[j+1]]=[a[j+1],a[j]];
        swap++;
        changed=true;

        $("count-bubble-swap").textContent=swap;
        $("bubble-action").textContent="Swapping";

        render("container-bubble",a,{[j]:"sorted",[j+1]:"sorted"});
        await wait(300);
      }
    }

    $("count-bubble-pass").textContent=
      Number($("count-bubble-pass").textContent)+1;

    if(!changed)break;
  }

  render("container-bubble",a);
  $("bubble-action").textContent="Complete";
  bubble=[...a];
}


/* MERGE SORT */

async function mergeSort(){
  let a=[...merge],comp=0,writes=0,level=0;

  async function sort(left,right,depth){
    if(right-left<=1)return;

    level=Math.max(level,depth);
    $("count-merge-level").textContent=level;
    $("merge-action").textContent="Splitting";

    const mid=Math.floor((left+right)/2);

    render("container-merge",a,
      Object.fromEntries(
        Array.from({length:right-left},(_,i)=>[left+i,"merge"])
      )
    );

    await wait(550);

    await sort(left,mid,depth+1);
    await sort(mid,right,depth+1);

    $("merge-action").textContent="Merging";

    const temp=[];
    let i=left,j=mid;

    while(i<mid&&j<right){
      comp++;
      $("count-merge-comp").textContent=comp;

      render("container-merge",a,{
        [i]:"compare",
        [j]:"compare"
      });

      await wait(350);

      if(a[i]<=a[j])temp.push(a[i++]);
      else temp.push(a[j++]);
    }

    while(i<mid)temp.push(a[i++]);
    while(j<right)temp.push(a[j++]);

    for(let k=0;k<temp.length;k++){
      a[left+k]=temp[k];
      writes++;

      $("count-merge-write").textContent=writes;

      render("container-merge",a,{
        [left+k]:"sorted"
      });

      await wait(180);
    }
  }

  await sort(0,a.length,1);

  render("container-merge",a,
    Object.fromEntries(a.map((_,i)=>[i,"sorted"]))
  );

  $("merge-action").textContent="Complete";
  merge=[...a];
}


/* START */

async function start(){
  if(running)return;

  running=true;
  $("btn-start-sim").disabled=true;
  $("btn-start-sim").textContent="⏳ Running...";

  await Promise.all([
    bubbleSort(),
    mergeSort()
  ]);

  running=false;
  $("btn-start-sim").disabled=false;
  $("btn-start-sim").textContent="⚡ Run again";
}


/* RESET */

function reset(){
  if(running)return;

  bubble=[...initial];
  merge=[...initial];

  [
    "count-bubble-comp",
    "count-bubble-swap",
    "count-bubble-pass",
    "count-merge-comp",
    "count-merge-write",
    "count-merge-level"
  ].forEach(id=>$(id).textContent="0");

  render("container-bubble",bubble);
  render("container-merge",merge);

  $("bubble-action").textContent="Waiting";
  $("merge-action").textContent="Waiting";

  $("btn-start-sim").disabled=false;
  $("btn-start-sim").textContent="▶ Start experiment";
}


/* NAVIGATION */

function goHypothesis(){
  $("step-exploration").classList.add("hidden");
  $("step-hypothesis").classList.remove("hidden");
  $("step-hypothesis").classList.add("animate-fade-in");
  window.scrollTo({top:0,behavior:"smooth"});
}

function goTheory(){
  $("step-hypothesis").classList.add("hidden");
  $("step-telling").classList.remove("hidden");
  $("step-telling").classList.add("animate-fade-in");
  window.scrollTo({top:0,behavior:"smooth"});
}


/* LOCAL TUTOR */

function chat(){
  const input=$("ai-input"),box=$("chat-box");
  const text=input.value.trim();
  if(!text)return;

  const user=document.createElement("div");
  user.className="user-message";
  user.textContent="You: "+text;
  box.appendChild(user);
  input.value="";

  setTimeout(()=>{
    const msg=document.createElement("div");
    msg.className="chat-message";
    const p=document.createElement("p");

    p.textContent=aiStep++===0
      ?"Good observation. Now compare how many times Bubble Sort repeatedly examines neighboring elements with how Merge Sort divides the list into smaller parts. Which approach do you think scales better?"
      :"Exactly. Merge Sort reduces the problem by repeatedly dividing it, then processes each level of the list during merging. This leads to O(n log n) growth.";

    msg.innerHTML="<b>✦ Tutor</b>";
    msg.appendChild(p);
    box.appendChild(msg);
    box.scrollTop=box.scrollHeight;
  },600);
}


/* RESTART */

function restart(){
  aiStep=0;
  running=false;
  $("step-telling").classList.add("hidden");
  $("step-hypothesis").classList.add("hidden");
  $("step-exploration").classList.remove("hidden");
  reset();
  window.scrollTo({top:0,behavior:"smooth"});
}
