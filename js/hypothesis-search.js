function replaceChatWithExploreButton() {
    const controls = $("chat-controls");
    if (!controls) return;

    controls.classList.add("chat-input--cta");
    controls.innerHTML = "";

    const link = document.createElement("a");
    link.href = "explore-search.html";
    link.className = "btn btn-dark chat-explore-button";
    link.textContent = "← Go back to explore";

    controls.appendChild(link);
}
