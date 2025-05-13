document.addEventListener("DOMContentLoaded", () => {
    let cooldown = 2000;

    let combo = 0;
    let time = 0;
    let progress = 0;
    let comboMulti = 1;
    let spaceDown = false;
    let cooldownTimer = 0;

    let comboSpeedMultiplier = 1.5;
    let progressLost = -1 / (100 * 1);
    let progressGain = 0.5;
    let comboZoneWidth = 20;

    let fps1, fps;
    document.addEventListener("keydown", (e) => {
        if (!spaceDown && e.key === " " && cooldown <= cooldownTimer) {
            spaceDown = true;
            let lineTop = document.getElementById("line").getBoundingClientRect().top + document.getElementById("line").getBoundingClientRect().height / 2;
            let barTop = document.getElementById("innerMinigameBar").getBoundingClientRect().top;
            let barBottom = document.getElementById("innerMinigameBar").getBoundingClientRect().bottom;
            progress += (1 - Math.abs(lineTop / (window.innerHeight * 1) - 0.5) * 2) * progressGain * (1 + (comboMulti * combo));
            progress = Math.min(1, progress);
            if (lineTop <= barBottom && lineTop >= barTop) {
                combo++;
            } else {
                combo = 0;
            }
            cooldownTimer = 0;
        }
    });
    document.addEventListener("keyup", (e) => {
        if (spaceDown && e.key === " ") {
            spaceDown = false;
        }
    })
    function startMinigame(cSM, pL, pG, cZW) {
        comboSpeedMultiplier = cSM
        progressLost = pL
        progressGain = pG
        comboZoneWidth = cZW
        combo = 0,
        time = 0;
        progress = 0,
        document.getElementById("innerMinigameBar").style.height = (comboZoneWidth + "%")
        fps1 = Date.now();
        window.requestAnimationFrame(minigameLoop);
    }
    function minigameLoop() {
        document.getElementById("line").style.top = (document.getElementById("minigameBar").getBoundingClientRect().height/2/window.innerHeight * 100 + document.getElementById("minigameBar").getBoundingClientRect().height/2/window.innerHeight * 100 * (Math.atan(2 * Math.sin(time / 100)) / Math.atan(2))) + "%";
        let fps2 = Date.now()
        fps = fps2 - fps1;
        time += fps * (comboSpeedMultiplier * (1 + combo));
        progress += fps * progressLost;
        cooldownTimer += fps;
        progress = Math.max(0, progress);
        document.getElementById("line").style.backgroundColor = (cooldown <= cooldownTimer) ? "white" : "black";
        document.getElementById("innerProgressBar").style.height = progress * 100 + "%";
        fps2 = fps1;
        fps1 = Date.now();
        /*
        if (fps >= 166.7) {
            window.requestAnimationFrame(minigameLoop);
        } else {
            setTimeout(minigameLoop, 167);
        }
        */
       window.requestAnimationFrame(minigameLoop); 
    }
    startMinigame(0.1,-1/100000,1/5,25)
});