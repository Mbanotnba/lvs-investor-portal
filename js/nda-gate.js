/**
 * LVS NDA Gate Module
 * ====================
 * Handles NDA status checking and tab gating for customer portals.
 * Shows overlay on restricted tabs when NDA is not approved.
 *
 * Usage:
 *   1. Include this script in customer portal HTML
 *   2. Call LVSNDAGate.init() after DOM loaded
 *
 * Last Updated: February 2026
 * Version: 1.0
 */

const LVSNDAGate = {
    // Tabs that require NDA approval
    restrictedTabs: ['product', 'specs', 'software-platform', 'devkit', 'demos', 'testimonials'],

    // NDA document base path
    ndaBasePath: 'assets/documents/ndas/',

    /**
     * Initialize NDA gating
     * @param {string} company - Company identifier (e.g., 'glid', 'koniku')
     */
    init(company) {
        this.company = company;
        this.ndaStatus = sessionStorage.getItem('lvs_nda_status') || 'pending';
        this.userRole = sessionStorage.getItem('lvs_role') || '';

        // Founders bypass NDA gating (they need to see everything)
        if (this.userRole === 'founder') {
            console.log('NDA Gate: Founder access - bypassing restrictions');
            return;
        }

        // Check NDA status and apply gating if needed
        if (this.ndaStatus !== 'approved') {
            this.applyGating();
        }

        // Update Documents tab with NDA link if approved
        if (this.ndaStatus === 'approved') {
            this.addNDAToDocuments();
        }
    },

    /**
     * Apply overlay to restricted tabs
     */
    applyGating() {
        console.log('NDA Gate: Applying restrictions (status: ' + this.ndaStatus + ')');

        // Create overlay element
        const overlay = document.createElement('div');
        overlay.className = 'nda-gate-overlay';
        overlay.innerHTML = `
            <div class="nda-gate-content">
                <div class="nda-gate-icon">&#128274;</div>
                <h3>NDA Required</h3>
                <p>This content requires an executed Non-Disclosure Agreement.</p>
                <p>Please contact LVS to complete your agreement.</p>
                <div class="nda-gate-contact">
                    <a href="mailto:tayo@lolavisionsystems.com" class="nda-gate-btn">
                        <span>&#128231;</span> tayo@lolavisionsystems.com
                    </a>
                    <a href="https://wa.me/16304792126" target="_blank" class="nda-gate-btn secondary">
                        <span>&#128172;</span> WhatsApp
                    </a>
                </div>
            </div>
        `;

        // Apply overlay to each restricted tab content
        this.restrictedTabs.forEach(tabId => {
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.style.position = 'relative';
                tabContent.appendChild(overlay.cloneNode(true));
            }
        });

        // Add click handler to show message when clicking restricted tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (this.restrictedTabs.includes(btn.dataset.tab)) {
                btn.addEventListener('click', () => {
                    // Tab content will show with overlay
                });
            }
        });
    },

    /**
     * Add NDA document link to Documents tab
     */
    addNDAToDocuments() {
        const ndaPath = this.ndaBasePath + this.company + '-nda.pdf';

        // Find the Legal Documents section in the documents tab
        const documentsTab = document.getElementById('documents');
        if (!documentsTab) return;

        // Look for existing Legal Documents panel or create insertion point
        const legalSection = documentsTab.querySelector('.panel');
        if (!legalSection) return;

        // Check if NDA entry already exists
        if (documentsTab.querySelector('.nda-document-entry')) return;

        // Create NDA document entry
        const ndaEntry = document.createElement('div');
        ndaEntry.className = 'document nda-document-entry';
        ndaEntry.innerHTML = `
            <div class="doc-icon" style="color: #10b981;">&#128196;</div>
            <div class="doc-info">
                <div class="doc-name">Mutual NDA - Executed</div>
                <div class="doc-meta">Legal &bull; Fully Executed</div>
            </div>
            <a href="${ndaPath}" target="_blank" class="doc-download" style="text-decoration: none;">&#8594;</a>
        `;

        // Insert at the beginning of the first panel's document list
        const firstDocument = legalSection.querySelector('.document');
        if (firstDocument) {
            firstDocument.parentNode.insertBefore(ndaEntry, firstDocument);
        }
    },

    /**
     * Get NDA file path for a company
     * @param {string} company - Company identifier
     * @returns {string} Path to NDA file
     */
    getNDAPath(company) {
        return this.ndaBasePath + company + '-nda.pdf';
    },

    /**
     * Check if NDA file exists (for founder portal)
     * @param {string} company - Company identifier
     * @returns {Promise<boolean>}
     */
    async checkNDAExists(company) {
        try {
            const response = await fetch(this.getNDAPath(company), { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LVSNDAGate;
}
