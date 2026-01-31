/**
 * LVS Silicon IP Partner Portal - Partner Data Configuration
 *
 * This file contains configuration data for all silicon IP partners.
 * Add new partners by adding entries to the PARTNERS object.
 */

const PARTNERS = {
    amd: {
        id: "amd",
        name: "AMD",
        type: "silicon",           // silicon | system | software
        tier: "strategic",         // strategic | premier | standard

        branding: {
            color: "#ed1c24",
            logo: null,            // Use text fallback if no logo
            logoText: "AMD"
        },

        partnership: {
            since: "December 2024",
            status: "active",
            focus: "UCIe Chiplet Integration & Bare Die Supply Exploration",
            products: ["LVS-250"],
            summary: "Strategic partnership exploring UCIe 2.0 chiplet integration between LVS neural compute engines and AMD's embedded and data center platforms for edge AI processing."
        },

        integration: {
            interface: "UCIe 2.0",
            currentPhase: 4,       // Index of current stage
            stages: [
                {
                    id: 1,
                    name: "Partnership Agreement",
                    status: "complete",
                    date: "Dec 2024",
                    description: "Initial partnership terms and exploration scope defined",
                    artifacts: ["Partnership MOU"]
                },
                {
                    id: 2,
                    name: "NDA & Technical Review",
                    status: "complete",
                    date: "Jan 2026",
                    description: "Mutual NDA executed, initial technical documentation shared",
                    artifacts: ["Mutual NDA", "Technical Overview"]
                },
                {
                    id: 3,
                    name: "Interface Spec Alignment",
                    status: "complete",
                    date: "Jan 2026",
                    description: "UCIe 2.0 interface specifications reviewed and aligned",
                    artifacts: ["UCIe Spec Review", "Interface Agreement"]
                },
                {
                    id: 4,
                    name: "Electrical Validation",
                    status: "in-progress",
                    date: "Q1 2026",
                    description: "Electrical compatibility testing and signal integrity validation",
                    artifacts: ["Test Plan", "Preliminary Results"]
                },
                {
                    id: 5,
                    name: "Silicon Integration",
                    status: "upcoming",
                    date: "Q3 2026",
                    description: "Physical integration of LVS-250 with AMD reference platform",
                    artifacts: ["Integration Guide", "Reference Design"]
                },
                {
                    id: 6,
                    name: "Production Qualification",
                    status: "upcoming",
                    date: "Q4 2026",
                    description: "Production readiness validation and certification",
                    artifacts: ["Qualification Report", "Production Spec"]
                }
            ],

            specs: {
                interface: "UCIe 2.0 (Universal Chiplet Interconnect Express)",
                topology: "Point-to-point chiplet interconnect",
                dataRate: "32 GT/s per lane",
                lanes: "16 lanes (configurable)",
                protocol: "PCIe 6.0 / CXL 3.0 compatible",
                power: "< 0.5 pJ/bit"
            }
        },

        milestones: [
            {
                title: "Partnership Initiated",
                date: "December 2024",
                status: "complete",
                description: "Initial discussions and partnership framework established"
            },
            {
                title: "NDA Executed",
                date: "January 15, 2026",
                status: "complete",
                description: "Mutual NDA signed, enabling technical information exchange"
            },
            {
                title: "Technical Evaluation",
                date: "Q1 2026",
                status: "in-progress",
                description: "Electrical validation and interface testing underway"
            },
            {
                title: "LVS-250 Silicon Available",
                date: "Q3 2026",
                status: "upcoming",
                description: "Production silicon ready for integration testing"
            },
            {
                title: "Joint Reference Design",
                date: "Q4 2026",
                status: "upcoming",
                description: "Complete reference design for AMD platform integration"
            }
        ],

        contacts: {
            primary: {
                name: "Tayo Adesanya",
                role: "CEO",
                email: "tayo@lolavisionsystems.com",
                phone: "+1 (310) 880-8174"
            },
            engineering: {
                name: "Engineering Team",
                email: "engineering@lolavisionsystems.com"
            },
            support: {
                name: "Partner Support",
                email: "partners@lolavisionsystems.com"
            }
        },

        documentation: [
            {
                name: "LVS-250 Product Brief",
                type: "PDF",
                category: "overview",
                description: "High-level product overview and key specifications",
                date: "Jan 2026"
            },
            {
                name: "LVS-250 Chiplet Datasheet",
                type: "PDF",
                category: "specifications",
                description: "Complete electrical and mechanical specifications",
                date: "Jan 2026"
            },
            {
                name: "UCIe 2.0 Integration Guide",
                type: "PDF",
                category: "integration",
                description: "Step-by-step UCIe interface integration guide",
                date: "Jan 2026"
            },
            {
                name: "Power & Thermal Design Guide",
                type: "PDF",
                category: "integration",
                description: "Power delivery and thermal management guidelines",
                date: "Jan 2026"
            },
            {
                name: "SDK Documentation",
                type: "HTML",
                category: "software",
                description: "Software development kit API reference",
                date: "Jan 2026"
            },
            {
                name: "Reference Design Files",
                type: "ZIP",
                category: "design",
                description: "Schematic and layout reference files",
                status: "coming-soon",
                date: "Q2 2026"
            }
        ],

        downloads: [
            {
                name: "LVS-250 Chiplet Datasheet",
                type: "PDF",
                size: "2.4 MB",
                version: "1.0",
                status: "available",
                date: "Jan 2026"
            },
            {
                name: "UCIe 2.0 Integration Guide",
                type: "PDF",
                size: "5.1 MB",
                version: "1.0",
                status: "available",
                date: "Jan 2026"
            },
            {
                name: "Power Analysis Report",
                type: "PDF",
                size: "1.8 MB",
                version: "1.0",
                status: "available",
                date: "Jan 2026"
            },
            {
                name: "RTL Integration Package",
                type: "ZIP",
                size: "~50 MB",
                version: "TBD",
                status: "coming-soon",
                date: "Q2 2026"
            },
            {
                name: "GDS Reference Files",
                type: "ZIP",
                size: "~200 MB",
                version: "TBD",
                status: "coming-soon",
                date: "Q3 2026"
            },
            {
                name: "Verification Test Suite",
                type: "ZIP",
                size: "~30 MB",
                version: "TBD",
                status: "coming-soon",
                date: "Q3 2026"
            }
        ]
    }

    // Add future partners here:
    // intel: { ... },
    // qualcomm: { ... },
};

/**
 * Get partner configuration by ID
 * @param {string} partnerId - Partner identifier (e.g., 'amd')
 * @returns {Object|null} Partner configuration or null if not found
 */
function getPartner(partnerId) {
    return PARTNERS[partnerId] || null;
}

/**
 * Get partner ID from URL query parameters
 * @returns {string|null} Partner ID or null if not specified
 */
function getPartnerFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('partner');
}

/**
 * Get partner ID from session storage
 * @returns {string|null} Partner ID or null if not stored
 */
function getPartnerFromSession() {
    return sessionStorage.getItem('lvs_partner');
}

/**
 * Get current partner configuration (from URL or session)
 * @returns {Object|null} Partner configuration or null
 */
function getCurrentPartner() {
    const partnerId = getPartnerFromUrl() || getPartnerFromSession();
    return partnerId ? getPartner(partnerId) : null;
}

/**
 * Get list of all available partners
 * @returns {Array} Array of partner objects with id and name
 */
function getPartnerList() {
    return Object.keys(PARTNERS).map(id => ({
        id: id,
        name: PARTNERS[id].name,
        tier: PARTNERS[id].tier
    }));
}

/**
 * Calculate integration progress percentage
 * @param {Object} partner - Partner configuration
 * @returns {number} Progress percentage (0-100)
 */
function getIntegrationProgress(partner) {
    if (!partner || !partner.integration || !partner.integration.stages) {
        return 0;
    }
    const stages = partner.integration.stages;
    const completed = stages.filter(s => s.status === 'complete').length;
    const inProgress = stages.filter(s => s.status === 'in-progress').length;
    return Math.round(((completed + (inProgress * 0.5)) / stages.length) * 100);
}

/**
 * Get current integration stage
 * @param {Object} partner - Partner configuration
 * @returns {Object|null} Current stage object or null
 */
function getCurrentStage(partner) {
    if (!partner || !partner.integration || !partner.integration.stages) {
        return null;
    }
    return partner.integration.stages.find(s => s.status === 'in-progress') || null;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PARTNERS,
        getPartner,
        getPartnerFromUrl,
        getPartnerFromSession,
        getCurrentPartner,
        getPartnerList,
        getIntegrationProgress,
        getCurrentStage
    };
}
