/* =========================================================
   CONFIGURATION
========================================================= */


const groups = [
    "CONTROL",
    "AI_ASSISTED"
];

const currentGroup =
    groups[Math.floor(Math.random() * groups.length)];


/* =========================================================
   DONNÉES
========================================================= */

const initialData = [
    45,
    23,
    87,
    12,
    64,
    38
];

let bubbleList = [...initialData];
let insertionList = [...initialData];

let aiStep = 0;

let simulationRunning = false;


/* =========================================================
   DOM
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    setupGroup();

    renderBars(
        "container-bubble",
        bubbleList
    );

    renderBars(
        "container-insertion",
        insertionList
    );


    /* Boutons */

    document
        .getElementById("btn-start-sim")
        .addEventListener(
            "click",
            startSimulations
        );


    document
        .getElementById("btn-reset-sim")
        .addEventListener(
            "click",
            resetSimulations
        );


    document
        .getElementById("btn-go-to-hypothesis")
        .addEventListener(
            "click",
            goToHypothesis
        );


    document
        .getElementById("btn-go-to-telling")
        .addEventListener(
            "click",
            goToTelling
        );


    document
        .getElementById("btn-send-ai")
        .addEventListener(
            "click",
            handleAiChat
        );


    /*
        Permet d'envoyer le message avec Enter.
    */

    document
        .getElementById("ai-input")
        .addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    handleAiChat();
                }

            }
        );


    /*
        Bouton recommencer.
    */

    document
        .getElementById("btn-restart")
        .addEventListener(
            "click",
            restartActivity
        );

});


/* =========================================================
   GROUPE
========================================================= */

function setupGroup() {

    const badge =
        document.getElementById("group-badge");

    if (!badge) {
        return;
    }


    if (currentGroup === "AI_ASSISTED") {

        badge.textContent =
            "Mode : Groupe expérimental (Avec Tuteur IA)";

        badge.style.background =
            "#059669";

    } else {

        badge.textContent =
            "Mode : Groupe de contrôle (Autonome)";

        badge.style.background =
            "#d97706";
    }

}


/* =========================================================
   RENDU DES BARRES
========================================================= */

function renderBars(
    containerId,
    list,
    activeIndices = []
) {

    const container =
        document.getElementById(containerId);

    if (!container) {
        return;
    }


    container.innerHTML = "";


    const maxVal =
        Math.max(...initialData);


    list.forEach(
        function (value, index) {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "bar-wrapper";


            const bar =
                document.createElement("div");

            bar.className = "bar";


            if (
                activeIndices.includes(index)
            ) {

                bar.classList.add("active");

            }


            /*
                La hauteur maximale est 130px.
            */

            const height =
                Math.max(
                    8,
                    (value / maxVal) * 130
                );


            bar.style.height =
                height + "px";


            const label =
                document.createElement("div");

            label.className =
                "bar-label";

            label.textContent =
                value;


            wrapper.appendChild(bar);

            wrapper.appendChild(label);

            container.appendChild(wrapper);

        }
    );

}


/* =========================================================
   PETITE PAUSE POUR LES ANIMATIONS
========================================================= */

function sleep(milliseconds) {

    return new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


/* =========================================================
   TRI À BULLES
========================================================= */

async function runBubbleSort() {

    let arr =
        [...bubbleList];


    let comparisonCount = 0;

    let swapCount = 0;


    const comparisonElement =
        document.getElementById(
            "count-bubble-comp"
        );

    const swapElement =
        document.getElementById(
            "count-bubble-swap"
        );


    for (
        let i = 0;
        i < arr.length;
        i++
    ) {

        for (
            let j = 0;
            j < arr.length - i - 1;
            j++
        ) {

            comparisonCount++;


            if (comparisonElement) {

                comparisonElement.textContent =
                    comparisonCount;

            }


            renderBars(
                "container-bubble",
                arr,
                [j, j + 1]
            );


            await sleep(500);


            if (
                arr[j] >
                arr[j + 1]
            ) {

                const temp =
                    arr[j];

                arr[j] =
                    arr[j + 1];

                arr[j + 1] =
                    temp;


                swapCount++;


                if (swapElement) {

                    swapElement.textContent =
                        swapCount;

                }


                renderBars(
                    "container-bubble",
                    arr,
                    [j, j + 1]
                );


                await sleep(500);
            }

        }

    }


    renderBars(
        "container-bubble",
        arr
    );


    bubbleList =
        [...arr];

}


/* =========================================================
   TRI PAR INSERTION
========================================================= */

async function runInsertionSort() {

    let arr =
        [...insertionList];


    let comparisonCount = 0;

    let movementCount = 0;


    const comparisonElement =
        document.getElementById(
            "count-insert-comp"
        );

    const movementElement =
        document.getElementById(
            "count-insert-swap"
        );


    for (
        let i = 1;
        i < arr.length;
        i++
    ) {

        const key =
            arr[i];


        let j =
            i - 1;


        renderBars(
            "container-insertion",
            arr,
            [i]
        );


        await sleep(500);


        while (
            j >= 0 &&
            arr[j] > key
        ) {

            comparisonCount++;


            if (comparisonElement) {

                comparisonElement.textContent =
                    comparisonCount;

            }


            arr[j + 1] =
                arr[j];


            movementCount++;


            if (movementElement) {

                movementElement.textContent =
                    movementCount;

            }


            renderBars(
                "container-insertion",
                arr,
                [j, j + 1]
            );


            await sleep(500);


            j--;

        }


        /*
            Si aucun déplacement n'a eu lieu,
            on compte quand même la comparaison
            finale.
        */

        if (j >= 0) {

            comparisonCount++;

            if (comparisonElement) {

                comparisonElement.textContent =
                    comparisonCount;

            }

        }


        arr[j + 1] =
            key;


        renderBars(
            "container-insertion",
            arr
        );


        await sleep(350);

    }


    renderBars(
        "container-insertion",
        arr
    );


    insertionList =
        [...arr];

}


/* =========================================================
   LANCER LES DEUX ANIMATIONS
========================================================= */

async function startSimulations() {

    if (simulationRunning) {
        return;
    }


    simulationRunning = true;


    const button =
        document.getElementById(
            "btn-start-sim"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "⏳ Animations en cours...";

    }


    /*
        Les deux algorithmes sont lancés
        en même temps.
    */

    await Promise.all([
        runBubbleSort(),
        runInsertionSort()
    ]);


    simulationRunning = false;


    if (button) {

        button.disabled =
            false;

        button.textContent =
            "⚡ Relancer les animations";

    }

}


/* =========================================================
   RESET
========================================================= */

function resetSimulations() {

    if (simulationRunning) {
        return;
    }


    bubbleList =
        [...initialData];

    insertionList =
        [...initialData];


    document.getElementById(
        "count-bubble-comp"
    ).textContent = "0";


    document.getElementById(
        "count-bubble-swap"
    ).textContent = "0";


    document.getElementById(
        "count-insert-comp"
    ).textContent = "0";


    document.getElementById(
        "count-insert-swap"
    ).textContent = "0";


    renderBars(
        "container-bubble",
        bubbleList
    );


    renderBars(
        "container-insertion",
        insertionList
    );


    const button =
        document.getElementById(
            "btn-start-sim"
        );


    if (button) {

        button.disabled =
            false;

        button.textContent =
            "⚡ Lancer les animations simultanément";

    }

}


/* =========================================================
   PASSAGE À L'ÉTAPE 2
========================================================= */

function goToHypothesis() {

    const exploration =
        document.getElementById(
            "step-exploration"
        );

    const hypothesis =
        document.getElementById(
            "step-hypothesis"
        );


    exploration.classList.add(
        "hidden"
    );


    hypothesis.classList.remove(
        "hidden"
    );


    hypothesis.classList.add(
        "animate-fade-in"
    );


    /*
        Affichage de l'interface
        correspondant au groupe.
    */

    if (
        currentGroup ===
        "AI_ASSISTED"
    ) {

        document
            .getElementById(
                "ui-ai-group"
            )
            .classList.remove(
                "hidden"
            );

    } else {

        document
            .getElementById(
                "ui-control-group"
            )
            .classList.remove(
                "hidden"
            );

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   PASSAGE À L'ÉTAPE 3
========================================================= */

function goToTelling() {

    document
        .getElementById(
            "step-hypothesis"
        )
        .classList.add(
            "hidden"
        );


    const telling =
        document.getElementById(
            "step-telling"
        );


    telling.classList.remove(
        "hidden"
    );


    telling.classList.add(
        "animate-fade-in"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   CHAT IA SIMULÉ
========================================================= */

function handleAiChat() {

    const input =
        document.getElementById(
            "ai-input"
        );

    const chatBox =
        document.getElementById(
            "chat-box"
        );


    if (!input || !chatBox) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    /*
        Message utilisateur
    */

    const userMessage =
        document.createElement("div");

    userMessage.className =
        "user-message";


    const userLabel =
        document.createElement("span");

    userLabel.textContent =
        "👤 Vous : ";


    userMessage.appendChild(
        userLabel
    );


    userMessage.appendChild(
        document.createTextNode(text)
    );


    chatBox.appendChild(
        userMessage
    );


    input.value = "";


    chatBox.scrollTop =
        chatBox.scrollHeight;


    /*
        Réponse simulée.
        Il ne s'agit PAS d'une véritable IA distante.
    */

    setTimeout(
        function () {

            const aiMessage =
                document.createElement("div");

            aiMessage.className =
                "ai-message";


            const label =
                document.createTextNode(
                    "🤖 Tuteur IA : "
                );


            const response =
                document.createElement("span");


            if (aiStep === 0) {

                response.textContent =
                    "Bonne observation. En effet, " +
                    "le tri par insertion avance bloc " +
                    "par bloc en insérant chaque élément " +
                    "à sa bonne position. Maintenant, " +
                    "imaginez que notre liste contienne " +
                    "10 000 éléments au lieu de 6. " +
                    "Pensez-vous que le nombre de " +
                    "comparaisons va augmenter de manière " +
                    "linéaire ou beaucoup plus vite ? " +
                    "À votre avis, pourquoi ?";

                aiStep++;

            } else {

                response.textContent =
                    "Exactement. Lorsque chaque élément " +
                    "peut devoir être comparé avec de " +
                    "nombreux éléments précédents, " +
                    "le nombre d'opérations augmente " +
                    "rapidement. C'est ce qu'on appelle " +
                    "un comportement quadratique, " +
                    "noté O(n²). Vous êtes maintenant " +
                    "prêt à passer à l'étape suivante.";

            }


            aiMessage.appendChild(
                label
            );

            aiMessage.appendChild(
                response
            );


            chatBox.appendChild(
                aiMessage
            );


            chatBox.scrollTop =
                chatBox.scrollHeight;

        },
        800
    );

}


/* =========================================================
   RECOMMENCER
========================================================= */

function restartActivity() {

    bubbleList =
        [...initialData];

    insertionList =
        [...initialData];


    simulationRunning =
        false;


    aiStep =
        0;


    /*
        Retour à l'étape 1.
    */

    document
        .getElementById(
            "step-telling"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "step-hypothesis"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "step-exploration"
        )
        .classList.remove(
            "hidden"
        );


    /*
        Réinitialiser les compteurs.
    */

    document.getElementById(
        "count-bubble-comp"
    ).textContent = "0";


    document.getElementById(
        "count-bubble-swap"
    ).textContent = "0";


    document.getElementById(
        "count-insert-comp"
    ).textContent = "0";


    document.getElementById(
        "count-insert-swap"
    ).textContent = "0";


    /*
        Réinitialiser les barres.
    */

    renderBars(
        "container-bubble",
        bubbleList
    );


    renderBars(
        "container-insertion",
        insertionList
    );


    /*
        Réinitialiser le bouton.
    */

    const button =
        document.getElementById(
            "btn-start-sim"
        );


    button.disabled =
        false;

    button.textContent =
        "⚡ Lancer les animations simultanément";


    /*
        Revenir en haut.
    */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}
