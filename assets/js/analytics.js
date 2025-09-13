/**
 * ETS2 Flare Tools - Analytics & Visitor Tracking
 * Handles visitor counting and GitHub statistics
 */

const analytics = {
    // Initialize analytics when page loads
    init() {
        this.createStatsDisplay();
        this.loadStats();
        this.trackVisitor();
    },

    // Create stats display element
    createStatsDisplay() {
        const container = document.querySelector('.header-content');
        if (!container) return;

        const statsHtml = `
            <div class="stats-container" style="
                display: flex;
                align-items: center;
                gap: 20px;
                margin-top: 10px;
                font-size: 14px;
                opacity: 0.8;
            ">
                <div class="stat-item" style="display: flex; align-items: center; gap: 5px;">
<<<<<<< HEAD
=======
                    <span>👥</span>
                    <span>Active User: <strong id="active-visitors">Loading...</strong></span>
                </div>
                <div class="stat-item" style="display: flex; align-items: center; gap: 5px;">
>>>>>>> 882e45e (Deploy: update site files and translated README)
                    <span>⭐</span>
                    <span>Stars: <strong id="github-stars">-</strong></span>
                </div>
                <div class="stat-item" style="display: flex; align-items: center; gap: 5px;">
                    <span>🔗</span>
                    <span>Forks: <strong id="github-forks">-</strong></span>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', statsHtml);
    },

    // Load all statistics
    loadStats() {
        this.loadGitHubStats();
    },

    // Load GitHub repository statistics
    loadGitHubStats() {
        fetch('https://api.github.com/repos/RAHMANWAHYUAJI/ets2-flare-tools')
            .then(response => response.json())
            .then(data => {
                this.updateGitHubStats(data.stargazers_count || 0, data.forks_count || 0);
            })
            .catch(() => {
                this.updateGitHubStats(0, 0);
            });
    },

    // Update active visitors display
    updateActiveVisitors(count) {
        const element = document.getElementById('active-visitors');
        if (element) {
            element.textContent = this.formatNumber(count);
        }
    },

    // Register this visitor as active
    registerActiveVisitor() {
        const storageKey = 'ets2-active-visitors';
        const sessionId = this.getSessionId();
        const now = Date.now();
        
        // Get current active visitors list
        let activeVisitors = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        // Clean up old visitors (older than 5 minutes)
        const fiveMinutesAgo = now - (5 * 60 * 1000);
        Object.keys(activeVisitors).forEach(id => {
            if (activeVisitors[id] < fiveMinutesAgo) {
                delete activeVisitors[id];
            }
        });
        
        // Register current visitor
        activeVisitors[sessionId] = now;
        
        // Save back to localStorage
        localStorage.setItem(storageKey, JSON.stringify(activeVisitors));
    },

    // Get count of active visitors
    getActiveVisitorsCount() {
        const storageKey = 'ets2-active-visitors';
        const activeVisitors = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const now = Date.now();
        const fiveMinutesAgo = now - (5 * 60 * 1000);
        
        // Count visitors active in last 5 minutes
        let count = 0;
        Object.values(activeVisitors).forEach(timestamp => {
            if (timestamp > fiveMinutesAgo) {
                count++;
            }
        });
        
        return Math.max(count, 1); // Always show at least 1 (current user)
    },

    // Get or create session ID
    getSessionId() {
        const sessionKey = 'ets2-session-id';
        let sessionId = sessionStorage.getItem(sessionKey);
        
        if (!sessionId) {
            sessionId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem(sessionKey, sessionId);
        }
        
        return sessionId;
    },

    // Update GitHub stats display
    updateGitHubStats(stars, forks) {
        const starsElement = document.getElementById('github-stars');
        const forksElement = document.getElementById('github-forks');
        
        if (starsElement) starsElement.textContent = this.formatNumber(stars);
        if (forksElement) forksElement.textContent = this.formatNumber(forks);
    },

    // Fallback local storage counter (not used for active visitors)
    useLocalStorageCounter() {
        // Not applicable for active visitors
        this.updateActiveVisitors(1);
    },

    // Track visitor (register as active)
    trackVisitor() {
        // Register as active visitor
        this.registerActiveVisitor();
    },

    // Format numbers with commas
    formatNumber(num) {
        return parseInt(num).toLocaleString();
    },

    // Track specific events (for future use)
    trackEvent(eventName, eventData = {}) {
        // Store events in localStorage for now
        const storageKey = 'ets2-flare-tools-events';
        const events = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        events.push({
            event: eventName,
        const storageKey = 'ets2-flare-tools-events';
