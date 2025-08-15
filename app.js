document.addEventListener('DOMContentLoaded', () => {
    // --- GAME STATE ---
    let gameState = {
        money: 100,
        lifetimeRevenue: 0,
        prestigePoints: 0,
        upgrades: {
            gpus: 0,
            edgeServers: 0,
            accuracy: 0,
            contextLength: 0,
            streamingApi: 0,
            marketing: 0,
        },
    };

    // --- GAME CONFIGURATION ---
    const PRESTIGE_REQUIREMENT = 1_000_000_000;
    const PRICE_PER_REQUEST = 0.01;
    const TICK_RATE = 1000; // ms

    const upgradesData = {
        gpus: { name: 'GPUs', baseCost: 100, costMultiplier: 1.15, effect: 0.10, description: '+10% Requests/sec' },
        edgeServers: { name: 'Edge Servers', baseCost: 200, costMultiplier: 1.15, effect: 0.05, description: '+5% Uptime' },
        accuracy: { name: 'Accuracy', baseCost: 150, costMultiplier: 1.15, effect: 0.05, description: '+5% Customer Satisfaction' },
        contextLength: { name: 'Context Length', baseCost: 300, costMultiplier: 1.15, effect: 0.05, description: '+5% Requests/sec' },
        streamingApi: { name: 'Streaming API', baseCost: 250, costMultiplier: 1.15, effect: 0.05, description: '+5% Requests/sec' },
        marketing: { name: 'Marketing Campaign', baseCost: 400, costMultiplier: 1.15, effect: 0.10, description: '+10% Customer Acquisition' },
    };

    // --- CORE LOGIC FUNCTIONS ---
    const getPrestigeBonus = (type) => {
        if (type === 'revenue') return 1 + (gameState.prestigePoints * 0.02);
        if (type === 'cost') return 1 - (gameState.prestigePoints * 0.02);
        return 1;
    };

    const getUpgradeCost = (id) => {
        const upgrade = upgradesData[id];
        const level = gameState.upgrades[id];
        return upgrade.baseCost * Math.pow(upgrade.costMultiplier, level) * getPrestigeBonus('cost');
    };

    const calculateStats = () => {
        const uptimeBonus = gameState.upgrades.edgeServers * upgradesData.edgeServers.effect;
        const uptime = Math.min(0.95 + uptimeBonus, 1.0);
        const customerAcquisitionBonus = gameState.upgrades.marketing * upgradesData.marketing.effect;
        const customers = 100 * (1 + customerAcquisitionBonus);
        const satisfaction = 1 + (gameState.upgrades.accuracy * upgradesData.accuracy.effect);
        const requestBonus = 1 + (gameState.upgrades.gpus * upgradesData.gpus.effect) + (gameState.upgrades.contextLength * upgradesData.contextLength.effect) + (gameState.upgrades.streamingApi * upgradesData.streamingApi.effect);
        const requestsPerSec = customers * 1 * satisfaction * requestBonus;
        const revenuePerSec = requestsPerSec * PRICE_PER_REQUEST * uptime * getPrestigeBonus('revenue');
        return { uptime, customers, satisfaction, requestsPerSec, revenuePerSec };
    };

    // --- UI UPDATE FUNCTIONS ---
    const updateUI = () => {
        const stats = calculateStats();
        document.getElementById('revenue-per-sec').textContent = stats.revenuePerSec.toFixed(2);
        document.getElementById('requests-per-sec').textContent = stats.requestsPerSec.toFixed(2);
        document.getElementById('uptime').textContent = (stats.uptime * 100).toFixed(2);
        document.getElementById('lifetime-revenue').textContent = gameState.lifetimeRevenue.toFixed(2);
        document.getElementById('prestige-points').textContent = gameState.prestigePoints;
        document.getElementById('current-money').textContent = gameState.money.toFixed(2);
        document.getElementById('prestige-button').disabled = gameState.lifetimeRevenue < PRESTIGE_REQUIREMENT;
    };

    const renderUpgrades = () => {
        const upgradeList = document.getElementById('upgrade-list');
        upgradeList.innerHTML = '';
        for (const id in upgradesData) {
            const upgrade = upgradesData[id];
            const cost = getUpgradeCost(id);
            const level = gameState.upgrades[id];
            const item = document.createElement('div');
            item.className = 'upgrade-item';
            item.innerHTML = `
                <div>
                    <strong>${upgrade.name} (Lvl ${level})</strong>
                    <p>${upgrade.description}</p>
                </div>
                <button id="buy-${id}" ${gameState.money < cost ? 'disabled' : ''}>Cost: $${cost.toFixed(2)}</button>
            `;
            upgradeList.appendChild(item);
            document.getElementById(`buy-${id}`).addEventListener('click', () => buyUpgrade(id));
        }
    };

    // --- SAVE/LOAD FUNCTIONS ---
    const SAVE_KEY = 'aiTycoonSave';
    const saveGame = () => {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
        } catch (error) {
            console.error('Could not save game state:', error);
        }
    };

    const loadGame = () => {
        try {
            const savedState = localStorage.getItem(SAVE_KEY);
            if (savedState) gameState = { ...gameState, ...JSON.parse(savedState) };
        } catch (error) {
            console.error('Could not load game state:', error);
        }
    };

    // --- GAME ACTIONS ---
    const buyUpgrade = (id) => {
        const cost = getUpgradeCost(id);
        if (gameState.money >= cost) {
            gameState.money -= cost;
            gameState.upgrades[id]++;
            updateGame();
        }
    };

    const prestige = () => {
        if (gameState.lifetimeRevenue >= PRESTIGE_REQUIREMENT) {
            const newPP = Math.floor(gameState.lifetimeRevenue / PRESTIGE_REQUIREMENT);
            gameState.prestigePoints += newPP;
            gameState.money = 100;
            gameState.lifetimeRevenue = 0;
            for (const id in gameState.upgrades) gameState.upgrades[id] = 0;
            updateGame();
            alert(`You have prestiged! You earned ${newPP} Prestige Points.`);
        }
    };

    // --- GAME LOOP & INITIALIZATION ---
    const updateGame = () => {
        updateUI();
        renderUpgrades();
    };

    const gameLoop = () => {
        const { revenuePerSec } = calculateStats();
        gameState.money += revenuePerSec;
        gameState.lifetimeRevenue += revenuePerSec;
        updateUI();
    };

    const init = () => {
        loadGame();
        document.getElementById('prestige-button').addEventListener('click', prestige);
        setInterval(gameLoop, TICK_RATE);
        setInterval(saveGame, 5000);
        updateGame();
    };

    init();
});
