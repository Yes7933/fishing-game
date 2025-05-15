document.addEventListener("DOMContentLoaded", () => {
    let cooldown = 150;

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
    let comboTextElement = document.getElementById("comboText")

    let comboFlavorText = [
        "COMBO LOST",
        "Good",
        "Great",
        "Amazing",
        "SUPERB!",
        "SPECTACULAR!!",
        "GODLIKE!!!"
    ];

    document.addEventListener("keydown", (e) => {
        if (!spaceDown && e.key === " " && cooldown <= cooldownTimer) {
            spaceDown = true;
            let lineTop = document.getElementById("line").getBoundingClientRect().top + document.getElementById("line").getBoundingClientRect().height / 2;
            let barTop = document.getElementById("innerMinigameBar").getBoundingClientRect().top;
            let barBottom = document.getElementById("innerMinigameBar").getBoundingClientRect().bottom;
            if (lineTop <= barBottom && lineTop >= barTop) {
                combo++;
                shake(20 * (combo / 2),5 * combo,10,0.95)
                comboTextElement.innerHTML = "Combo X"+combo+" "+comboFlavorText[((combo > 6) ? 6 : combo)]
            } else {
                if (combo > 1) {
                    // show combo has beel lost
                }
                combo = 0;
                comboTextElement.innerHTML = "Combo X"+combo+" "+comboFlavorText[((combo > 6) ? 6 : combo)]
                shake(8,5,10,1)
            }
            progress += (1 - Math.abs(lineTop / (window.innerHeight * 1) - 0.5) * 2) * progressGain * (1 + (comboMulti * combo));
            progress = Math.min(1, progress);
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
        progressLost = pL / 100000
        progressGain = pG / 5
        comboZoneWidth = cZW
        combo = 0,
        time = 0;
        progress = 0,
        document.getElementById("innerMinigameBar").style.height = (comboZoneWidth + "%")
        fps1 = Date.now();
        window.requestAnimationFrame(minigameLoop);
    }
    function shake(magnitude, repeat, interval, decay) {
        let elemen = document.getElementById("minigameUI")
        if (repeat == 0) {
            elemen.style.left = '10%'
            elemen.style.top = '30%'
        }
        else {
            let r1 = (Math.random() - 0.5) * magnitude
            let r2 = (Math.random() - 0.5) * magnitude
            elemen.style.left = 'calc(10% + '+r1+'px)'
            elemen.style.top = 'calc(30% + '+r2+'px)'
            setTimeout(shake, interval, magnitude * decay, repeat - 1, interval, decay)
        }
    }
    function minigameLoop() {
        document.getElementById("line").style.top = (document.getElementById("minigameBar").getBoundingClientRect().height/window.innerHeight * 125 + document.getElementById("minigameBar").getBoundingClientRect().height/window.innerHeight * 125 * (Math.atan(2 * Math.sin(time / 100)) / Math.atan(2))) + "%";
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
    startMinigame(0.1,-5,0.75,150)
});