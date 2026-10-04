// --- CONFIGURATION INITIALE DE L'ACTIVITÉ ---
// Répartition aléatoire dans un groupe pour l'expérimentation A/B (Just-in-Time Telling)
const groups = ['CONTROL', 'AI_ASSISTED'];
const currentGroup = groups[Math.floor(Math.random() * groups.length)];

// Données de départ pour les animations (Corrigé : valeurs injectées pour le rendu)
let initialData =;
let bubbleList = [...initialData];
let insertionList = [...initialData];

// Dom Elements
document.addEventListener("DOMContentLoaded", () => {
    // Mise à jour de l'UI du groupe assigné
    const badge = document.getElementById("group-badge");
    if (currentGroup === 'AI_ASSISTED') {
        badge.innerText = "Mode : Groupe expérimental (Avec Tuteur IA)";
        badge.className = "px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-semibold tracking-wider uppercase";
    } else {
        badge.innerText = "Mode : Groupe de contrôle (Autonome)";
        badge.className = "px-3 py-1 bg-amber-600 text-white rounded-full text-xs font-semibold tracking-wider uppercase";
    }

    // Génération visuelle initiale des barres
    renderBars('container-bubble', bubbleList);
    renderBars('container-insertion', insertionList);

    // Bindings des boutons
    document.getElementById("btn-start-sim").addEventListener("click", startSimulations);
    document.getElementById("btn-reset-sim").addEventListener("click", resetSimulations);
    
    document.getElementById("btn-go-to-hypothesis").addEventListener("click", () => {
        document.getElementById("step-exploration").classList.add("hidden");
        document.getElementById("step-hypothesis").classList.remove("hidden");
        
        // Afficher l'interface correspondante au groupe testé
        if(currentGroup === 'AI_ASSISTED') {
            document.getElementById("ui-ai-group").classList.remove("hidden");
        } else {
            document.getElementById("ui-control-group").classList.remove("hidden");
        }
    });

    document.getElementById("btn-go-to-telling").addEventListener("click", () => {
        document.getElementById("step-hypothesis").classList.add("hidden");
        document.getElementById("step-telling").classList.remove("hidden");
    });

    document.getElementById("btn-send-ai").addEventListener("click", handleAiChat);
});

// --- RENDER MOTEUR GRAPHIQUE SIMPLE ---
function renderBars(containerId, list, activeIndices = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const maxVal = Math.max(...initialData);

    list.forEach((val, idx) => {
        const barWrapper = document.createElement('div');
        barWrapper.className = "flex flex-col items-center flex-1";

        const bar = document.createElement('div');
        // Calcul proportionnel de la hauteur
        const percentHeight = (val / maxVal) * 100;
        bar.style.height = `${percentHeight}px`;
        
        // Changement de couleur si l'élément est en train d'être comparé
        if (activeIndices.includes(idx)) {
            bar.className = "w-full bg-rose-500 rounded-t transition-all duration-200 shadow-lg shadow-rose-500/50";
        } else {
            bar.className = "w-full bg-indigo-500 rounded-t transition-all duration-200";
        }

        const label = document.createElement('span');
        label.className = "text-xs font-mono font-bold text-slate-400 mt-2";
        label.innerText = val;

        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        container.appendChild(barWrapper);
    });
}

// --- LOGIQUE ET ANIMATION DU TRI À BULLES ---
async function runBubbleSort() {
    let arr = [...bubbleList];
    let compCount = 0;
    let swapCount = 0;
    const compEl = document.getElementById("count-bubble-comp");
    const swapEl = document.getElementById("count-bubble-swap");

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            compCount++;
            compEl.innerText = compCount;
            renderBars('container-bubble', arr, [j, j + 1]);
            await new Promise(r => setTimeout(r, 600));

            if (arr[j] > arr[j + 1]) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapCount++;
                swapEl.innerText = swapCount;
                renderBars('container-bubble', arr, [j, j + 1]);
                await new Promise(r => setTimeout(r, 600));
            }
        }
    }
    renderBars('container-bubble', arr);
}

// --- LOGIQUE ET ANIMATION DU TRI PAR INSERTION ---
async function runInsertionSort() {
    let arr = [...insertionList];
    let compCount = 0;
    let swapCount = 0;
    const compEl = document.getElementById("count-insert-comp");
    const swapEl = document.getElementById("count-insert-swap");

    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;

        compCount++;
        compEl.innerText = compCount;
        renderBars('container-insertion', arr, [i, j]);
        await new Promise(r => setTimeout(r, 600));

        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            swapCount++;
            swapEl.innerText = swapCount;
            renderBars('container-insertion', arr, [j, j + 1]);
            j = j - 1;
            if (j >= 0) {
                compCount++;
                compEl.innerText = compCount;
            }
            await new Promise(r => setTimeout(r, 600));
        }
        arr[j + 1] = key;
        renderBars('container-insertion', arr);
        await new Promise(r => setTimeout(r, 400));
    }
    renderBars('container-insertion', arr);
}

function startSimulations() {
    document.getElementById("btn-start-sim").disabled = true;
    document.getElementById("btn-start-sim").classList.add("opacity-50", "cursor-not-allowed");
    runBubbleSort();
    runInsertionSort();
}

function resetSimulations() {
    bubbleList = [...initialData];
    insertionList = [...initialData];
    document.getElementById("count-bubble-comp").innerText = "0";
    document.getElementById("count-bubble-swap").innerText = "0";
    document.getElementById("count-insert-comp").innerText = "0";
    document.getElementById("count-insert-swap").innerText = "0";
    renderBars('container-bubble', bubbleList);
    renderBars('container-insertion', insertionList);
    
    const btn = document.getElementById("btn-start-sim");
    btn.disabled = false;
    btn.classList.remove("opacity-50", "cursor-not-allowed");
}

// --- PLACEHOLDER INTERACTIF DU CHATBOT IA ---
let aiStep = 0;
function handleAiChat() {
    const inputEl = document.getElementById("ai-input");
    const chatBox = document.getElementById("chat-box");
    const text = inputEl.value.trim();
    
    if (!text) return;

    // Bulle Utilisateur
    const userMsg = document.createElement("div");
    userMsg.className = "text-slate-300 pl-2 border-l border-slate-700";
    userMsg.innerHTML = `<span class="text-indigo-400">👤 Vous :</span> ${text}`;
    chatBox.appendChild(userMsg);
    inputEl.value = "";

    // Simulation de la réponse guidée de l'IA
    setTimeout(() => {
        const aiMsg = document.createElement("div");
        aiMsg.className = "text-indigo-300";
        
        if (aiStep === 0) {
            aiMsg.innerHTML = `🤖 Tuteur IA : <span class="text-white">Bonne observation. En effet, le tri par insertion avance bloc par bloc en insérant au bon endroit. Maintenant, imaginez que notre liste contienne 10 000 éléments au lieu de 6. Pensez-vous que le nombre de comparaisons va augmenter de manière linéaire (proportionnelle) ou beaucoup plus vite ? À votre avis, pourquoi ?</span>`;
            aiStep++;
        } else {
            aiMsg.innerHTML = `🤖 Tuteur IA : <span class="text-white">Exactement. Comme chaque élément doit potentiellement être comparé à tous les autres, le travail se multiplie très vite. C'est ce qu'on appelle un comportement quadratique. Vous êtes maintenant prêt à passer à l'étape suivante pour officialiser cette règle !</span>`;
        }
        
        chatBox.appendChild(aiMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
}
