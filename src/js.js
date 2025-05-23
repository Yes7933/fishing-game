document.addEventListener("DOMContentLoaded", () => {
    let inventory = {
        "Catfish": 23,
        "Pike": 17,
        "Anchovy": 5,
        "Halibut": 2,
        "Bass": 3,
    }
    let menu = null;
    let cooldown = 100;

    let combo = 0;
    let time = 0;
    let progress = 0;
    let comboMulti = 0.25;
    let spaceDown = false;
    let cooldownTimer = 0;

    let comboSpeedMultiplier = 1.5;
    let progressLost = -1 / (100 * 1);
    let progressGain = 0.5;
    let comboZoneWidth = 20;

    let fps1, fps;
    let comboTextElement = document.getElementById("comboText");

    let comboFlavorText = [
        ["Combo Broken...", "Combo Lost..."],
        ["Good!", "Nice!"],
        ["Great!", "Cool!"],
        ["Amazing!", "Wow!"],
        ["SUPERB!", "CRAZY!"],
        ["SPECTACULAR!!", "UNBELIEVEABLE!!"],
        ["GODLIKE!!!", "IMPOSSIBLE!!!"],
    ];

    document.addEventListener("keydown", (e) => {
        if (!spaceDown && e.key === " " && cooldown <= cooldownTimer) {
            spaceDown = true;
            let lineTop = document.getElementById("line").getBoundingClientRect().top + document.getElementById("line").getBoundingClientRect().height / 2;
            let barTop = document.getElementById("innerMinigameBar").getBoundingClientRect().top;
            let barBottom = document.getElementById("innerMinigameBar").getBoundingClientRect().bottom;
            if (lineTop <= barBottom && lineTop >= barTop) {
                combo++;
                shake(20 * (combo / 2), 5 * combo, 10, 0.95);
                comboTextElement.style.transitionDuration = "0ms"
                comboTextElement.style.rotate = combo*360 + "deg"
                comboTextElement.style.transitionDuration = "500ms"
                setTimeout(() => {
                    comboTextElement.style.transitionDuration = "0ms"
                    comboTextElement.style.rotate = "0deg";
                }, 500)
            } else {
                combo = 0;
                shake(8, 5, 10, 1);
            }
            let tempList = comboFlavorText[Math.min(combo, 6)];
            comboTextElement.textContent = tempList[Math.floor(Math.random() * tempList.length)] + " x" + combo;
            comboTextElement.style.fontSize = (combo + 2) + "vmin";
            progress += (1 - Math.abs(lineTop / (window.innerHeight * 1) - 0.5) * 5.25) * progressGain * (1 + comboMulti * Math.min(6, combo)) + 0.01;
            progress = Math.min(1, progress);
            cooldownTimer = 0;
        } else {
        }
    });
    document.addEventListener("keyup", (e) => {
        if (spaceDown && e.key === " ") {
            spaceDown = false;
        }
    });
    /**
     * Triggers the fishing minigame with settings.
     * @param {Number} cSM - Mulitplier when a combo is reached. 
     * @param {Number} pL - Progress lost factor (divided by 100000).
     * @param {Number} pG - Progress gain factor (divided by 5).
     * @param {Number} cZW - Width for the zone where a combo is achieved (0, 70]
     */
    function startMinigame(cSM, pL, pG, cZW) {
        comboSpeedMultiplier = cSM;
        progressLost = (-1 * pL) / 100000;
        progressGain = pG / 5;
        comboZoneWidth = cZW;
        (combo = 0), (time = 0);
        progress = 0;
        let gradientSplit = (100 - cZW) / 6;
        document.getElementById("innerMinigameBar").style.height = comboZoneWidth + "%";
        document.getElementById("minigameBar").style.background = `linear-gradient(rgba(255, 0, 0, 1) 0%, rgba(255, 0, 0, 1) ${gradientSplit - 5}%, rgba(255, 127, 0, 1) ${gradientSplit + 5}%, rgba(255, 127, 0, 1) ${gradientSplit * 2 - 5}%, rgba(255, 255, 0, 1) ${gradientSplit * 2 + 5}%, rgba(255, 255, 0, 1) ${gradientSplit * 3}%, rgba(0, 255, 0, 1) ${
            gradientSplit * 3 + 2
        }%, rgba(0, 255, 0, 1) ${gradientSplit * 3 + cZW - 2}%, rgba(255, 255, 0, 1) ${gradientSplit * 3 + cZW}%, rgba(255, 255, 0, 1) ${gradientSplit * 4 + cZW - 5}%, rgba(255, 127, 0, 1) ${gradientSplit * 4 + cZW + 5}%, rgba(255, 127, 0, 1) ${gradientSplit * 5 + cZW - 5}%, rgba(255, 0, 0, 1) ${gradientSplit * 5 + cZW + 5}%,  rgba(255, 0, 0, 1) 100%)`;
        fps1 = Date.now();
        window.requestAnimationFrame(minigameLoop);
    }
    function shake(magnitude, repeat, interval, decay) {
        let elemen = document.getElementById("minigameUI");
        if (repeat == 0) {
            elemen.style.left = "10%";
            elemen.style.top = "30%";
        } else {
            let r1 = (Math.random() - 0.5) * magnitude;
            let r2 = (Math.random() - 0.5) * magnitude;
            elemen.style.left = "calc(10% + " + r1 + "px)";
            elemen.style.top = "calc(30% + " + r2 + "px)";
            setTimeout(shake, interval, magnitude * decay, repeat - 1, interval, decay);
        }
    }
    function minigameLoop() {
            document.getElementById("line").style.top = (document.getElementById("minigameBar").getBoundingClientRect().height / window.innerHeight) * 125 + (document.getElementById("minigameBar").getBoundingClientRect().height / window.innerHeight) * 115 * (Math.atan(2 * Math.sin(time / 100)) / Math.atan(2)) + "%";
            let fps2 = Date.now();
            fps = fps2 - fps1;
            time += fps * (comboSpeedMultiplier * (1 + combo));
            progress += fps * progressLost;
            cooldownTimer += fps;
            progress = Math.max(0, progress);
            document.getElementById("innerProgressBar").style.height = progress * 100 + "%";
            document.getElementById("line").style.backgroundColor = `rgb(${255 * Math.min(cooldownTimer / cooldown, 1)}, ${255 * Math.min(cooldownTimer / cooldown, 1)}, ${255 * Math.min(cooldownTimer / cooldown, 1)})`;
            document.getElementById("innerProgressBarTwo").style.opacity = Math.min(cooldownTimer / cooldown, 1);
            let lineTop = document.getElementById("line").getBoundingClientRect().top + document.getElementById("line").getBoundingClientRect().height / 2;
            let barTop = document.getElementById("innerMinigameBar").getBoundingClientRect().top;
            let barBottom = document.getElementById("innerMinigameBar").getBoundingClientRect().bottom;
            document.getElementById("innerProgressBarTwo").style.height = (1 - Math.abs((lineTop / (window.innerHeight * 1)) - 0.5) * 5.25) * progressGain * (1 + comboMulti * Math.min(6, combo)) * 100 + 1 + "%";
            if (lineTop <= barBottom && lineTop >= barTop) {
                 document.getElementById("innerProgressBarTwo").style.backgroundColor = "rgba(0, 255, 0, 0.5)";
            } else {
                document.getElementById("innerProgressBarTwo").style.backgroundColor = "rgb(255, 255, 255, 0.5)";
            }
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
    startMinigame(0.1, 6, 0.5, 10);
    document.querySelectorAll(".majorMenuButtons").forEach((e) => {
        e.addEventListener("click", () => {
            if (menu !== null) document.getElementById(menu + "Open").style.right = "-2.5vmin"; 
            menu = e.id.slice(0, e.id.length - 4);
            e.style.right = "0%";
            document.getElementById("menu").innerHTML = "";
            document.getElementById("menu").classList.replace(document.getElementById("menu").classList.item(0), menu);
            if (menu == "inventory") {
                for (item in inventory) {
                    let newElement = document.createElement("div");
                    document.getElementById("menu").appendChild(newElement);
                    newElement.innerHTML = `<img><div>${item}</div><div>${inventory[item]}</div>`;
                }
            }
        });
    });
});