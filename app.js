document.addEventListener('DOMContentLoaded', () => {
    // --- NEW GAME STATE ---
    let gameState = {
        money: 100,
        lifetimeRevenue: 0,
        prestigePoints: 0,
        customers: [{ id: 1, satisfaction: 1.0 }, { id: 2, satisfaction: 1.0 }],
        upgrades: {
            gpus: 0,
            edgeServers: 0,
            accuracy: 0,
            contextLength: 0,
            streamingApi: 0,
            marketing: 0,
        },
        eventLog: ['Welcome to AI Tycoon! You have your first 2 clients.'],
        activeTab: 'dashboard',
    };

    // --- NEW GAME CONFIGURATION ---
    const PRESTIGE_REQUIREMENT = 1_000_000_000;
    const TOKENS_PER_REQUEST_BASE = 500;
    const PRICE_PER_TOKEN = 0.00002; // $0.01 per 500 tokens
    const TICK_RATE = 1000; // ms

    const upgradesData = {
        // Equipment Tab
        gpus: { name: 'GPUs', tab: 'equipment', baseCost: 100, costMultiplier: 1.2, description: 'Increases max requests handled per second by 10.' },
        edgeServers: { name: 'Edge Servers', tab: 'equipment', baseCost: 200, costMultiplier: 1.2, description: 'Increases server uptime by 1%.' },
        // Training Tab
        accuracy: { name: 'Accuracy', tab: 'training', baseCost: 150, costMultiplier: 1.15, description: 'Increases base customer satisfaction.' },
        contextLength: { name: 'Context Length', tab: 'training', baseCost: 300, costMultiplier: 1.15, description: 'Increases tokens per request, boosting revenue.' },
        streamingApi: { name: 'Streaming API', tab: 'training', baseCost: 250, costMultiplier: 1.2, description: 'Slightly increases satisfaction for all customers.' },
        marketing: { name: 'Marketing Campaign', tab: 'training', baseCost: 400, costMultiplier: 1.3, description: 'Increases the chance of acquiring new customers.' },
    };

    // --- SIMULATION CORE ---
    const logEvent = (message) => {
        gameState.eventLog.unshift(`[Tick ${Math.round(performance.now()/1000)}] ${message}`);
        if (gameState.eventLog.length > 20) {
            gameState.eventLog.pop();
        }
    };

    const gameLoop = () => {
        // 1. Calculate current stats from upgrades
        const maxRequests = 10 + (gameState.upgrades.gpus * 10);
        const uptimeChance = 0.95 + (gameState.upgrades.edgeServers * 0.01);
        const newCustomerChance = 0.01 + (gameState.upgrades.marketing * 0.005);
        const tokensPerRequest = TOKENS_PER_REQUEST_BASE + (gameState.upgrades.contextLength * 100);

        // 2. Server Uptime Check
        if (Math.random() > uptimeChance) {
            logEvent("⚠️ Server Down! No requests processed.");
            gameState.customers.forEach(c => c.satisfaction = Math.max(0.1, c.satisfaction - 0.01));
            updateUI();
            return;
        }

        // 3. Simulate Customer Requests
        let requests = [];
        gameState.customers.forEach(customer => {
            const requestChance = 0.1 + customer.satisfaction * 0.2; // Chance per tick
            if (Math.random() < requestChance) {
                requests.push({ customerId: customer.id });
            }
        });

        if (requests.length > 0) {
            logEvent(`Incoming ${requests.length} requests...`);
        }

        // 4. Process Requests
        const processedRequests = requests.slice(0, maxRequests);
        const droppedRequests = requests.slice(maxRequests);

        if (droppedRequests.length > 0) {
            logEvent(`🚨 Dropped ${droppedRequests.length} requests! (Capacity: ${maxRequests})`);
            droppedRequests.forEach(req => {
                const customer = gameState.customers.find(c => c.id === req.customerId);
                if (customer) customer.satisfaction = Math.max(0.1, customer.satisfaction - 0.05);
            });
        }

        const revenueThisTick = processedRequests.length * tokensPerRequest * PRICE_PER_TOKEN;
        gameState.money += revenueThisTick;
        gameState.lifetimeRevenue += revenueThisTick;

        // 5. Simulate New Customer Acquisition
        if (Math.random() < newCustomerChance) {
            const newId = gameState.customers.length + 1;
            gameState.customers.push({ id: newId, satisfaction: 1.0 });
            logEvent(`🎉 New Customer Acquired! (ID: ${newId})`);
        }

        // 6. Update UI
        updateUI();
    };

    // --- HELPERS ---
    const getUpgradeCost = (id) => {
        const upgrade = upgradesData[id];
        const level = gameState.upgrades[id];
        return upgrade.baseCost * Math.pow(upgrade.costMultiplier, level);
    };

    // --- UI & TABS ---
    const renderUpgrades = () => {
        const equipmentContainer = document.getElementById('equipment-upgrades');
        const trainingContainer = document.getElementById('training-upgrades');
        if (!equipmentContainer || !trainingContainer) return;
        equipmentContainer.innerHTML = '';
        trainingContainer.innerHTML = '';

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
                <button id="buy-${id}">Cost: ${cost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</button>
            `;

            if (upgrade.tab === 'equipment') {
                equipmentContainer.appendChild(item);
            } else {
                trainingContainer.appendChild(item);
            }
            document.getElementById(`buy-${id}`).addEventListener('click', () => buyUpgrade(id));
        }
    };

    const updateUI = () => {
        // Update dashboard stats
        document.getElementById('current-money').textContent = gameState.money.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        document.getElementById('customers').textContent = gameState.customers.length;
        document.getElementById('max-requests').textContent = 10 + (gameState.upgrades.gpus * 10);
        document.getElementById('uptime').textContent = (0.95 + (gameState.upgrades.edgeServers * 0.01)) * 100;
        document.getElementById('lifetime-revenue').textContent = gameState.lifetimeRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        document.getElementById('prestige-points').textContent = gameState.prestigePoints;

        // Update event log
        const logContainer = document.getElementById('event-log-list');
        if (logContainer) {
            logContainer.innerHTML = gameState.eventLog.map(msg => `<li>${msg}</li>`).join('');
        }

        renderUpgrades();
    };

    const switchTab = (tabId) => {
        gameState.activeTab = tabId;
        document.querySelectorAll('.tab-link').forEach(link => link.classList.toggle('active', link.dataset.tab === tabId));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.toggle('active', content.id === tabId));
    };

    const buyUpgrade = (id) => {
        const cost = getUpgradeCost(id);
        if (gameState.money >= cost) {
            gameState.money -= cost;
            gameState.upgrades[id]++;
            logEvent(`Upgraded ${upgradesData[id].name} to Level ${gameState.upgrades[id]}.`);
            updateUI();
        } else {
            logEvent(`Not enough money to upgrade ${upgradesData[id].name}.`);
        }
    };

    // --- INITIALIZATION ---
    const init = () => {
        document.querySelectorAll('.tab-link').forEach(link => {
            link.addEventListener('click', () => switchTab(link.dataset.tab));
        });

        setInterval(gameLoop, TICK_RATE);
        updateUI();
        switchTab('dashboard');
    };

    init();
});
