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
                    <span>👥</span>
                    <span>Visitors: <strong id="visitor-count">Loading...</strong></span>
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
        this.loadVisitorCount();
        this.loadGitHubStats();
    },

    // Load visitor count from multiple sources
    loadVisitorCount() {
        // Method 1: hits.sh counter (reliable and simple)
        fetch('https://hits.sh/rahmanwahyuaji.github.io/ets2-flare-tools.json')
            .then(response => response.json())
            .then(data => {
                this.updateVisitorCount(data.count);
            })
            .catch(() => {
                // Method 2: GitHub API traffic views (requires auth for private repos)
                fetch('https://api.github.com/repos/RAHMANWAHYUAJI/ets2-flare-tools/traffic/views')
                    .then(response => response.json())
                    .then(data => {
                        if (data.count) {
                            this.updateVisitorCount(data.count);
                        } else {
                            this.useLocalStorageCounter();
                        }
                    })
                    .catch(() => this.useLocalStorageCounter());
            });
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

    // Update visitor count display
    updateVisitorCount(count) {
        const element = document.getElementById('visitor-count');
        if (element) {
            element.textContent = this.formatNumber(count);
        }
    },

    // Update GitHub stats display
    updateGitHubStats(stars, forks) {
        const starsElement = document.getElementById('github-stars');
        const forksElement = document.getElementById('github-forks');
        
        if (starsElement) starsElement.textContent = this.formatNumber(stars);
        if (forksElement) forksElement.textContent = this.formatNumber(forks);
    },

    // Fallback local storage counter
    useLocalStorageCounter() {
        const storageKey = 'ets2-flare-tools-visits';
        let visits = localStorage.getItem(storageKey) || 0;
        visits = parseInt(visits) + 1;
        localStorage.setItem(storageKey, visits);
        this.updateVisitorCount(visits);
    },

    // Track visitor (increment counter)
    trackVisitor() {
        // Simple tracking - hits.sh automatically increments
        fetch('https://hits.sh/rahmanwahyuaji.github.io/ets2-flare-tools', {
            method: 'GET',
            mode: 'no-cors'
        }).catch(() => {
            // Silent fail if service unavailable
        });

        // Also track page view in localStorage for backup
        const storageKey = 'ets2-flare-tools-page-views';
        let pageViews = localStorage.getItem(storageKey) || 0;
        pageViews = parseInt(pageViews) + 1;
        localStorage.setItem(storageKey, pageViews);
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
