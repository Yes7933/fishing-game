document.addEventListener("DOMContentLoaded", () => {
    let inventory = new Map([
        ["Catfish", [23, "Rare"]],
        ["Pike", [17, "Common"]],
        ["Anchovy", [5, "Rare"]],
        ["Halibut", [3, "Rare"]],
        ["Bass", [2, "Super_Rare"]],
        ["Carp", [4, "Common"]],
    ]);

    let rarityOrder = ["Common", "Rare", "Super_Rare"];
    let inventorySetting = "alphabet";
    let inventoryReversed = false;

    let menu = null;
    let menuclosed = false;
    let cooldown = 100;

    let combo = 0;
    let time = 0;
    let progress = 0;
    let comboMulti = 1;
    let spaceDown = false;
    let cooldownTimer = 0;
    let playing = false;
    let minigameOpen = false;
    let firstHit = false;

    let comboSpeedMultiplier = 1.5;
    let progressLost = -1 / (100 * 1);
    let progressGain = 0.5;
    let comboZoneWidth = 20;
    let currentRod = "Dirt_Rod";

    let fps1, fps;
    let comboTextElement = document.getElementById("comboText");

    let fish = ["Catfish", "Pike", "Dogfish", "Difficult_Fish"];

    let fishStats = {
        Catfish: [1, 1, 1, 1, 1],
        Pike: [0.5, 0.5, 0.5, 0.5, 0.5],
        Dogfish: [-1, -1, -1, -1, -1],
        Difficult_Fish: [100, 1000, 0.01, 0.1, 10],
    };
    let values = new Map([
        ["Catfish", 0.1],
        ["Pike", 2],
        ["Dogfish", 25],
        ["Difficult_Fish", 100],
        ["Wooden_Pole", 25],
        ["Metal_Pole", 250],
        ["Fishing_Line", 50],
        ["Worm", 3],
        ["Expensive_Fish", 10000],
        ["Red40", 35],
        ["Salmon_Roe", 80],
    ]);
    function getRandomItemFromMap(map) {
        const mapArray = Array.from(map);
        const randomIndex = Math.floor(Math.random() * mapArray.length);
        return mapArray[randomIndex];
    }

    //bar move speed
    //progress lost
    //progress gained
    //green zone size
    //cooldown multi
    let rodStats = {
        Wooden_Rod: [0.25, 10, 1, 15, 750],
        Dirt_Rod: [0.2, 10, 0.25, 17, 500],
        Test_Rod: [1, 1, 1, 1, 1],
        Good_Rod: [0.001, 0.01, 1000, 1000, 0],
        Net: [0, -25, 0, 0, 9999],
        Spam_Rod: [0.1, 10, 0.05, 199, 0],
    };

    let comboFlavorText = [
        ["Combo Broken...", "Combo Lost...", "keys"],
        ["Good!", "Nice!"],
        ["Great!", "Cool!"],
        ["Amazing!", "Wow!"],
        ["SUPERB!", "CRAZY!"],
        ["SPECTACULAR!!", "UNBELIEVEABLE!!"],
        ["GODLIKE!!!", "IMPOSSIBLE!!!"],
    ];

    function calculateProgressGain(v, v1) {
        return (1 - Math.abs(v1 / (window.innerHeight * 1) - 0.5) * 5.25) * progressGain * (1 + comboMulti * v);
    }

    document.addEventListener("keydown", (e) => {
        if (!spaceDown && e.key === " " && cooldown <= cooldownTimer && playing && minigameOpen) {
            spaceDown = true;
            let lineTop = document.getElementById("line").getBoundingClientRect().top + document.getElementById("line").getBoundingClientRect().height / 2;
            let barTop = document.getElementById("innerMinigameBar").getBoundingClientRect().top;
            let barBottom = document.getElementById("innerMinigameBar").getBoundingClientRect().bottom;
            if (lineTop <= barBottom && lineTop >= barTop) {
                combo++;
                let hit = new Audio("/assets/audio/youtube_y1xBzjVrGDo_audio (mp3cut (mp3cut.net).mp3");
                hit.play();
                shake(20 * (combo / 2), 5 * combo, 10, 0.95);
                comboTextElement.style.transitionDuration = "0ms";
                comboTextElement.style.rotate = 360 + "deg";
                comboTextElement.style.transitionDuration = "500ms";
                setTimeout(() => {
                    comboTextElement.style.transitionDuration = "0ms";
                    comboTextElement.style.rotate = "0deg";
                    setTimeout(() => {
                        comboTextElement.style.transitionDuration = "500ms";
                        comboTextElement.style.fontSize = "0vmin";
                    }, 300);
                }, 500);
                progress += calculateProgressGain(combo, lineTop);
                firstHit = true;
            } else {
                progress += calculateProgressGain(combo, lineTop);
                combo = 0;
                shake(8, 5, 10, 1);
                firstHit = true;
            }
            let tempList = comboFlavorText[Math.min(combo, 6)];
            comboTextElement.textContent = tempList[Math.floor(Math.random() * tempList.length)] + " x" + combo;
            comboTextElement.style.fontSize = combo + 2 + "vmin";
            if (combo >= 7) {
                comboTextElement.style.animation = "rainbow 2s linear 0s infinite forwards normal";
            } else {
                comboTextElement.style.animation = "inherit";
            }
            progress = Math.min(1, progress);
            if (progress >= 1) {
                catchFish(1);
            }
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
     * @param {Number} cSM - bar speed Mulitplier when a combo is reached.
     * @param {Number} pL - Progress lost factor (divided by 100000).
     * @param {Number} pG - Progress gain factor (divided by 5).
     * @param {Number} cZW - Width for the zone where a combo is achieved (0, 70)
     */
    function startMinigame(cSM, pL, pG, cZW) {
        comboSpeedMultiplier = cSM;
        progressLost = (-1 * pL) / 100000;
        progressGain = pG / 5;
        comboZoneWidth = cZW;
        (combo = 0), (time = 0);
        progress = 0.05;
        let gradientSplit = (100 - cZW) / 6;
        document.getElementById("innerMinigameBar").style.height = comboZoneWidth + "%";
        document.getElementById("minigameBar").style.background = `linear-gradient(rgba(255, 0, 0, 1) 0%, rgba(255, 0, 0, 1) ${gradientSplit - 5}%, rgba(255, 127, 0, 1) ${gradientSplit + 5}%, rgba(255, 127, 0, 1) ${gradientSplit * 2 - 5}%, rgba(255, 255, 0, 1) ${gradientSplit * 2 + 5}%, rgba(255, 255, 0, 1) ${
            gradientSplit * 3
        }%, rgba(0, 255, 0, 1) ${gradientSplit * 3 + 2}%, rgba(0, 255, 0, 1) ${gradientSplit * 3 + cZW - 2}%, rgba(255, 255, 0, 1) ${gradientSplit * 3 + cZW}%, rgba(255, 255, 0, 1) ${gradientSplit * 4 + cZW - 5}%, rgba(255, 127, 0, 1) ${gradientSplit * 4 + cZW + 5}%, rgba(255, 127, 0, 1) ${
            gradientSplit * 5 + cZW - 5
        }%, rgba(255, 0, 0, 1) ${gradientSplit * 5 + cZW + 5}%,  rgba(255, 0, 0, 1) 100%)`;
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
    function fall(element, start, end, time, easing) {
        function easingfunc(x) {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return (c3 * x * x * x - c1 * x * x + start / 50) * 50;
        }
        element.style.top = easingfunc(easing / time).toString() + "%";
        if (parseInt(window.getComputedStyle(document.getElementById("minigameUI")).top) < window.innerHeight) {
            setTimeout(fall, 1, element, start, end, time, easing + 2);
        }
    }
    function rotate(element, start, end, time, easing) {
        function easingfunc(x) {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return (c3 * x * x * x - c1 * x * x + start / 50) * 50;
        }
        element.style.rotate = easingfunc(easing / time).toString() + "deg";
        if (parseInt(window.getComputedStyle(document.getElementById("minigameUI")).rotate) < 120) {
            setTimeout(rotate, 1, element, start, end, time, easing + 2);
        }
    }
    function move(element, start, end, time, easing) {
        function easingfunc(x) {
            return x === 0 ? 0 : -Math.pow(2, 10 * x - 10);
        }
        element.style.right = easingfunc(easing / time).toString() + "%";
        if (parseInt(window.getComputedStyle(document.getElementById("menuUI")).right) >= end) {
            setTimeout(move, 1, element, start, end, time, easing + 1);
        }
    }
    function moveforward(element, start, end, time, easing) {
        function easingfunc(x) {
            return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
        }
        element.style.right = easingfunc(easing / time).toString() + "%";
        if (parseInt(element.style.right) <= end) {
            setTimeout(moveforward, 1, element, start, end, time, easing + 1);
        }
    }
    function minigameLoop() {
        if (playing)
            document.getElementById("line").style.top = (document.getElementById("minigameBar").getBoundingClientRect().height / window.innerHeight) * 125 + (document.getElementById("minigameBar").getBoundingClientRect().height / window.innerHeight) * 115 * (Math.atan(2 * Math.sin(time / 100)) / Math.atan(2)) + "%";
        let fps2 = Date.now();
        fps = fps2 - fps1;
        time += fps * (comboSpeedMultiplier * (1 + combo));
        if (progress >= 1 && playing) catchFish(1);
        if (progress <= 0 && playing) catchFish(0);
        if (playing && firstHit) progress += fps * progressLost;
        cooldownTimer += fps;
        progress = Math.max(0, progress);
        document.getElementById("innerProgressBar").style.height = progress * 100 + "%";
        document.getElementById("line").style.backgroundColor = `rgb(${255 * Math.min(cooldownTimer / cooldown, 1)}, ${255 * Math.min(cooldownTimer / cooldown, 1)}, ${255 * Math.min(cooldownTimer / cooldown, 1)})`;
        document.getElementById("innerProgressBarTwo").style.opacity = Math.min(cooldownTimer / cooldown, 1);
        let lineTop = document.getElementById("line").getBoundingClientRect().top + document.getElementById("line").getBoundingClientRect().height / 2;
        let barTop = document.getElementById("innerMinigameBar").getBoundingClientRect().top;
        let barBottom = document.getElementById("innerMinigameBar").getBoundingClientRect().bottom;
        if (lineTop <= barBottom && lineTop >= barTop) {
            document.getElementById("innerProgressBarTwo").style.backgroundColor = "rgba(90, 255, 90, 0.5)";
            document.getElementById("innerProgressBarTwo").style.height = calculateProgressGain(combo + 1, lineTop) * 100 + "%";
        } else {
            document.getElementById("innerProgressBarTwo").style.backgroundColor = "rgb(255, 255, 255, 0.5)";
            document.getElementById("innerProgressBarTwo").style.height = calculateProgressGain(combo, lineTop) * 100 + "%";
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
    function sortInventory(value = false) {
        let array = Array.from(inventory, ([key, value]) => ({ key, value }));
        let searchArray = [];
        let notSearchedArray = [];
        let r = inventoryReversed ? -1 : 1;
        if (value) {
            array.forEach((e) => {
                if (e.key.toLowerCase().startsWith(document.getElementById("searchBar").value.toLowerCase())) {
                    searchArray.push(e);
                } else {
                    notSearchedArray.push(e);
                }
            });
            if (inventorySetting === "alphabet") {
                searchArray.sort((a, b) => {
                    return r * a.key.toLowerCase().localeCompare(b.key.toLowerCase());
                });
                notSearchedArray.sort((a, b) => {
                    return r * a.key.toLowerCase().localeCompare(b.key.toLowerCase());
                });
            }
            if (inventorySetting === "amount") {
                searchArray.sort((a, b) => {
                    if (a.value[0] > b.value[0]) return r * -1;
                    if (a.value[0] < b.value[0]) return r;
                    return 0;
                });
                notSearchedArray.sort((a, b) => {
                    if (a.value[0] > b.value[0]) return r * -1;
                    if (a.value[0] < b.value[0]) return r;
                    return 0;
                });
            }
            if (inventorySetting === "rarity") {
                searchArray.sort((a, b) => {
                    return r * (rarityOrder.indexOf(a.value[1]) - rarityOrder.indexOf(b.value[1]));
                });
                notSearchedArray.sort((a, b) => {
                    return r * (rarityOrder.indexOf(a.value[1]) - rarityOrder.indexOf(b.value[1]));
                });
            }
            if (inventorySetting === "random") {
                for (let i = searchArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [searchArray[i], searchArray[j]] = [searchArray[j], searchArray[i]];
                }
                for (let i = notSearchedArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [notSearchedArray[i], notSearchedArray[j]] = [notSearchedArray[j], notSearchedArray[i]];
                }
            }
            searchArray.push(...notSearchedArray);
            array = searchArray;
        } else {
            if (inventorySetting === "alphabet") {
                array.sort((a, b) => {
                    return r * a.key.toLowerCase().localeCompare(b.key.toLowerCase());
                });
            }
            if (inventorySetting === "amount") {
                array = array.sort((a, b) => {
                    if (a.value[0] > b.value[0]) return r * -1;
                    if (a.value[0] < b.value[0]) return r;
                    return 0;
                });
            }
            if (inventorySetting === "rarity") {
                array = array.sort((a, b) => {
                    return r * (rarityOrder.indexOf(a.value[1]) - rarityOrder.indexOf(b.value[1]));
                });
            }
            if (inventorySetting === "random") {
                for (let i = searchArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [searchArray[i], searchArray[j]] = [searchArray[j], searchArray[i]];
                }
                for (let i = notSearchedArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [notSearchedArray[i], notSearchedArray[j]] = [notSearchedArray[j], notSearchedArray[i]];
                }
            }
        }
        return array;
    }

    function generateTrades(num) {
        let outputTrades = []
        for (i = 0; i < num; i++) {
            quantity = 0
            squan = 0
            while (quantity == 0 || squan == 0) {
                firstItem = getRandomItemFromMap(values)[0];
                quantity = Math.ceil(Math.random() * 10);
                secondItem = getRandomItemFromMap(values)[0];
                while (secondItem === firstItem) {
                    secondItem = getRandomItemFromMap(values)[0];
                }
                fval = values.get(firstItem)
                sval = values.get(secondItem)
                squan = Math.round(fval * (1 + Math.random()/3) * quantity / sval)
            }
            let newTrade = [[firstItem,quantity],[secondItem,quantity],Date.now() + 1000 * (240 * Math.random())]
            outputTrades.push(newTrade)
        }
        return outputTrades
    }

    trades = generateTrades(10)

    function convertTime(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return (
            seconds == 60 ?
            (minutes+1) + ":00" :
            minutes + ":" + (seconds < 10 ? "0" : "") + seconds
        );
    }

    function loadTrading() {
        for (let n in trades) {
            let currentTrade = trades[n]
            let tradeElement = document.createElement("button")
            let tradeText = document.createElement("div")
            let tradeTime = document.createElement("div")
            tradeTime.classList.add("timer")
            tradeElement.appendChild(tradeText)
            tradeElement.appendChild(tradeTime)
            tradeElement.classList.add("trade")
            tradeTime.setAttribute("timeout",currentTrade[2])
            tradeText.innerHTML = currentTrade[0][0].replace(/_/g, " ") + " x" + currentTrade[0][1] + "  for " + currentTrade[1][0].replace(/_/g, " ") + " x" + currentTrade[1][1]
            tradeTime.innerHTML = convertTime(currentTrade[2] - Date.now())
            document.getElementById("menu").appendChild(tradeElement)
        }
    }

    document.getElementById("hideMenu").addEventListener("click", () => {
        menuclosed = !menuclosed;
        if (menuclosed) {
            move(document.getElementById("menuUI"), 0, -1000, 50, 0);
            let newElement = document.createElement("button");
            newElement.id = "hideMenu";
            newElement.classList.add("minorMenuButtons");
            newElement.style.width =  "6vmin";
            newElement.style.height = "9.408%";
            document.getElementById("body").appendChild(newElement);
        }
    });
    document.querySelectorAll(".majorMenuButtons").forEach((e) => {
        e.addEventListener("click", () => {
            if (menu !== null) document.getElementById(menu + "Open").style.right = "-2.5vmin";
            if (menu !== e.id.slice(0, e.id.length - 4)) {
                menu = e.id.slice(0, e.id.length - 4);
                e.style.right = "0%";
                document.getElementById("menu").innerHTML = "";
                document.getElementById("menu").classList.replace(document.getElementById("menu").classList.item(0), menu);
                if (menu == "inventory") {
                    document.getElementById("menu").innerHTML = "<div id='inventorySearch'><input id='searchBar' autocomplete='off'></input><button id='filter'>Sort: Alphabetically</button><button id='reverse'>Sort: Ascending</button></div>";
                    document.getElementById("filter").addEventListener("click", () => {
                        switch (inventorySetting) {
                            case "alphabet":
                                inventorySetting = "amount";
                                break;
                            case "amount":
                                inventorySetting = "rarity";
                                break;
                            case "rarity":
                                inventorySetting = "random";
                                break;
                            case "random":
                                inventorySetting = "alphabet";
                                break;
                            default:
                                break;
                        }
                        document.getElementById("filter").textContent = "Sort: " + inventorySetting.charAt(0).toUpperCase() + inventorySetting.slice(1);
                        document.getElementById("inventoryContainer").innerHTML = "";
                        let array = sortInventory(document.getElementById("searchBar").value.length >= 1);
                        array.forEach((e) => {
                            if (e.key.toLowerCase().indexOf(document.getElementById("searchBar").value.toLowerCase()) !== -1 && e.value[0] > 0) {
                                let newElement = document.createElement("div");
                                newElement.classList.add("inventoryItem");
                                newElement.style.backgroundColor = `var(--${e.value[1].toLowerCase()})`;
                                container.appendChild(newElement);
                                newElement.innerHTML = `<div>${e.key} x${e.value[0]}</div><img src="/assets/img/${e.key}.png" style="width: 75%;">`;
                            }
                        });
                    });
                    document.getElementById("reverse").addEventListener("click", () => {
                        inventoryReversed = !inventoryReversed;
                        document.getElementById("reverse").textContent = inventoryReversed ? "Sort: Descending" : "Sort: Ascending";
                        document.getElementById("inventoryContainer").innerHTML = "";
                        let array = sortInventory(document.getElementById("searchBar").value.length >= 1);
                        array.forEach((e) => {
                            if (e.key.toLowerCase().indexOf(document.getElementById("searchBar").value.toLowerCase()) !== -1 && e.value[0] > 0) {
                                let newElement = document.createElement("div");
                                newElement.classList.add("inventoryItem");
                                newElement.style.backgroundColor = `var(--${e.value[1].toLowerCase()})`;
                                container.appendChild(newElement);
                                newElement.innerHTML = `<div>${e.key} x${e.value[0]}</div><img src="/assets/img/${e.key}.png" style="width: 75%;">`;
                            }
                        });
                    });
                    document.getElementById("searchBar").addEventListener("input", () => {
                        document.getElementById("inventoryContainer").innerHTML = "";
                        let array = sortInventory(document.getElementById("searchBar").value.length >= 1);
                        array.forEach((e) => {
                            if (e.key.toLowerCase().indexOf(document.getElementById("searchBar").value.toLowerCase()) !== -1 && e.value[0] > 0) {
                                let newElement = document.createElement("div");
                                newElement.classList.add("inventoryItem");
                                newElement.style.backgroundColor = `var(--${e.value[1].toLowerCase()})`;
                                container.appendChild(newElement);
                                newElement.innerHTML = `<div>${e.key} x${e.value[0]}</div><img src="/assets/img/${e.key}.png" style="width: 75%;">`;
                            }
                        });
                    });
                    let container = document.createElement("div");
                    container.id = "inventoryContainer";
                    document.getElementById("menu").appendChild(container);
                    let array = sortInventory();
                    array.forEach((e) => {
                        if (e.value[0] > 0) {
                            let newElement = document.createElement("div");
                            newElement.classList.add("inventoryItem");
                            newElement.style.backgroundColor = `var(--${e.value[1].toLowerCase()})`;
                            container.appendChild(newElement);
                            newElement.innerHTML = `<div>${e.key} x${e.value[0]}</div><img src="/assets/img/${e.key}.png" style="width: 85%; height: 75%">`;
                        }
                    });
                }
                if (menu == "shop") {
                    loadTrading()
                }
            }
        });
    });
    setInterval(function() { // updates shop timer
        if (menu == "shop") {
            let elements = document.getElementById("menu").querySelectorAll('*');
            elements.forEach(element => {
                let cele = element.querySelectorAll(".timer")
                cele.forEach(e2 => {
                    e2.innerHTML = (convertTime(e2.getAttribute("timeout") - Date.now()))
                    e2.style.color = "rgb("+ 10000000 / (e2.getAttribute("timeout") - Date.now()) +",0,0)"
                })
            });
        }
    }, 500);
    let currentFish = "none";
    function spawnFish(fishName) {
        firstHit = false;
        minigameOpen = true;
        document.getElementById("cast").style.display = "none";
        document.getElementById("innerProgressBar").style.backgroundColor = "rgb(255, 255, 255)";
        playing = true;
        currentFish = fishName;
        progress = 0;
        let newStatTable = fishStats[fishName].map((e, i) => e * rodStats[currentRod][i]);
        cooldown = newStatTable[4];
        console.log(cooldown);
        document.getElementById("minigameUI").style.display = "flex";
        document.getElementById("comboText").style.display = "flex";
        startMinigame(...newStatTable);
    }
    function catchFish(amount) {
        playing = false;
        document.getElementById("innerProgressBar").style.backgroundColor = "rgb(255,230,0)";
        fall(document.getElementById("minigameUI"), 30, 100, 500, 0);
        rotate(document.getElementById("minigameUI"), 0, 90, 500, 0);
        setTimeout(() => {
            document.getElementById("minigameUI").style.display = "none";
            document.getElementById("comboText").style.display = "none";
            document.getElementById("minigameUI").style.top = "30%";
            document.getElementById("minigameUI").style.rotate = "0deg";
            document.getElementById("cast").style.display = "flex";
            minigameOpen = false;
        }, 1500);
        inventory.set(currentFish, [inventory.get(currentFish)[0] + amount, inventory.get(currentFish)[1]]);
        if (menu == "inventory") {
            document.getElementById("inventoryContainer").innerHTML = "";
            let array = sortInventory(document.getElementById("searchBar").value.length >= 1);
            array.forEach((e) => {
                if (e.key.toLowerCase().indexOf(document.getElementById("searchBar").value.toLowerCase()) !== -1) {
                    if (e.value[0] > 0) {
                        let newElement = document.createElement("div");
                        newElement.classList.add("inventoryItem");
                        newElement.style.backgroundColor = `var(--${e.value[1].toLowerCase()})`;
                        document.getElementById("inventoryContainer").appendChild(newElement);
                        newElement.innerHTML = `<div>${e.key} x${e.value[0]}</div><img src="/assets/img/${e.key}.png" style="width: 85%; height: 75%">`;
                    }
                }
            });
        }
    }

    document.getElementById("cast").addEventListener("click", () => {
        if (!minigameOpen) {
            spawnFish(fish[Math.floor(Math.random() * fish.length)]);
        }
    });
});
