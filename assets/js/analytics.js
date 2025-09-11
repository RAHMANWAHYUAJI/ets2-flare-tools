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
                font-size: 12px;
                opacity: 0.8;
            ">
                <div class="stat-item" style="display: flex; align-items: center; gap: 5px;">
                    <span>�</span>
                    <span>Active: <strong id="active-visitors">Loading...</strong></span>
                </div>
                <div class="stat-item" style="display: flex; align-items: center; gap: 5px;">
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
        this.loadActiveVisitors();
        this.loadGitHubStats();
        
        // Update active visitors every 1 second for real-time updates
        setInterval(() => this.loadActiveVisitors(), 1000);
    },

    // Load active visitors count
    loadActiveVisitors() {
        // Register this visitor as active
        this.registerActiveVisitor();
        
        // Get count of active visitors (last 5 minutes)
        const activeCount = this.getActiveVisitorsCount();
        this.updateActiveVisitors(activeCount);
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
            data: eventData,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });

        // Keep only last 100 events
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }

        localStorage.setItem(storageKey, JSON.stringify(events));
    },

    // Get analytics data (for debugging)
    getAnalyticsData() {
        return {
            visits: localStorage.getItem('ets2-flare-tools-visits'),
            pageViews: localStorage.getItem('ets2-flare-tools-page-views'),
            events: JSON.parse(localStorage.getItem('ets2-flare-tools-events') || '[]')
        };
    },

    // Show donation info using the existing UI system
    showDanaInfo() {
        if (typeof ui !== 'undefined' && ui.showAlert) {
            ui.showAlert(
                '💰 Donasi via Dana\n\nNomor: 085155102275\na.n: Rahman Wahyu Aji\n\nTerima kasih atas dukungan Anda! 🙏',
                'info',
                'Donation Info'
            );
        } else {
            // Fallback alert if ui.js not available
            alert('💰 Donasi via Dana\n\nNomor: 085155102275\na.n: Rahman Wahyu Aji\n\nTerima kasih atas dukungan Anda! 🙏');
        }
    }
};

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => analytics.init());
} else {
    analytics.init();
}

// Export for global access
window.analytics = analytics;
