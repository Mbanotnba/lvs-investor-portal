/**
 * LVS Portal Security Module
 * Handles session management, timeout, and authentication checks
 *
 * Usage: Include this script in the <head> of all authenticated pages
 * <script src="js/security.js"></script>
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        SESSION_TIMEOUT: 30 * 60 * 1000,  // 30 minutes
        VALIDATION_CACHE_TTL: 60 * 1000,  // 1 minute - short window to limit revocation gap
        LOGIN_PAGE: 'login.html',
        TIMESTAMP_KEY: 'lvs_session_timestamp',
        VALIDATION_KEY: 'lvs_validation_timestamp',
        AUTH_KEYS: [
            'lvs_auth',
            'lvs_token',
            'lvs_role',
            'lvs_founder_auth',
            'lvs_investor_auth',
            'lvs_can_view_customers',
            'lvs_customer',
            'lvs_partner',
            'lvs_partner_tier',
            'lvs_team_mode',
            'lvs_presentation_access',
            'lvs_session_timestamp',
            'lvs_validation_timestamp',
            'lvs_nda_status',
            'lvs_nda_allowed',
            'lvs_email',
            'lvs_user_id',
            'lvs_user_name'
        ],
        // Single source of truth for portal URLs
        VALID_PORTALS: {
            founder: 'founder-portal.html',
            investor: 'dashboard.html',
            customer: {
                koniku: 'koniku-portal.html',
                terrahaptix: 'terrahaptix-portal.html',
                glid: 'glid-portal.html',
                mach: 'mach-portal.html',
                anduril: 'customer-portal-mockup.html',
                revenant: 'dashboard.html',
                seasats: 'dashboard.html'
            },
            partner: {
                amd: 'partner-portal.html?partner=amd'
            },
            nda_pending: 'nda-pending.html'
        }
    };

    /**
     * Check if current session is valid (client-side only)
     */
    function isSessionValid() {
        const auth = sessionStorage.getItem('lvs_auth');
        const token = sessionStorage.getItem('lvs_token');
        const timestamp = sessionStorage.getItem(CONFIG.TIMESTAMP_KEY);

        if (auth !== 'true' || !token) {
            return false;
        }

        if (!timestamp) {
            sessionStorage.setItem(CONFIG.TIMESTAMP_KEY, Date.now().toString());
            return true;
        }

        const elapsed = Date.now() - parseInt(timestamp, 10);
        return elapsed <= CONFIG.SESSION_TIMEOUT;
    }

    /**
     * Check if we have a recent server validation (within cache TTL)
     */
    function hasRecentValidation() {
        const validationTime = sessionStorage.getItem(CONFIG.VALIDATION_KEY);
        if (!validationTime) return false;

        const elapsed = Date.now() - parseInt(validationTime, 10);
        return elapsed <= CONFIG.VALIDATION_CACHE_TTL;
    }

    /**
     * Refresh session timestamp
     */
    function refreshSession() {
        if (sessionStorage.getItem('lvs_auth') === 'true') {
            sessionStorage.setItem(CONFIG.TIMESTAMP_KEY, Date.now().toString());
        }
    }

    /**
     * Clear all session data and redirect to login
     */
    function logout(reason) {
        CONFIG.AUTH_KEYS.forEach(function(key) {
            sessionStorage.removeItem(key);
        });

        const redirect = reason === 'expired'
            ? CONFIG.LOGIN_PAGE + '?session=expired'
            : CONFIG.LOGIN_PAGE;

        window.location.href = redirect;
    }

    /**
     * Initialize session on login
     */
    function initSession() {
        sessionStorage.setItem(CONFIG.TIMESTAMP_KEY, Date.now().toString());
    }

    /**
     * Quick client-side auth check - redirects if no session
     * Does NOT destroy DOM - just redirects
     */
    function requireAuth() {
        if (!isSessionValid()) {
            const wasLoggedIn = sessionStorage.getItem('lvs_auth') === 'true';
            logout(wasLoggedIn ? 'expired' : 'unauthorized');
            return false;
        }
        refreshSession();
        return true;
    }

    /**
     * Setup activity listeners to refresh session
     */
    function setupActivityTracking() {
        const events = ['click', 'keypress', 'scroll', 'mousemove'];
        let lastRefresh = Date.now();

        function handleActivity() {
            if (Date.now() - lastRefresh > 60000) {
                refreshSession();
                lastRefresh = Date.now();
            }
        }

        events.forEach(function(event) {
            document.addEventListener(event, handleActivity, { passive: true });
        });
    }

    /**
     * Setup periodic session check
     */
    function setupSessionCheck() {
        setInterval(function() {
            if (!isSessionValid()) {
                logout('expired');
            }
        }, 60000);
    }

    /**
     * Get API base URL
     */
    function getApiBaseUrl() {
        return (typeof LVS_CONFIG !== 'undefined' && LVS_CONFIG.API_BASE_URL)
            ? LVS_CONFIG.API_BASE_URL
            : 'http://localhost:8080';
    }

    /**
     * Validate session with server API
     * Uses caching to avoid repeated calls within TTL
     *
     * @param {string} requiredPortalType - Optional portal type to require
     * @param {Object} options - { force: boolean, silent: boolean }
     * @returns {Promise<Object|null>} User data if valid, null if invalid
     */
    async function validateSession(requiredPortalType, options) {
        options = options || {};
        const token = sessionStorage.getItem('lvs_token');

        // No token = not authenticated
        if (!token) {
            if (!options.silent) logout('unauthorized');
            return null;
        }

        // Use cached validation if recent (unless forced)
        if (!options.force && hasRecentValidation()) {
            // Trust cached validation - return minimal data from storage
            const cachedRole = sessionStorage.getItem('lvs_role');
            if (requiredPortalType && cachedRole !== requiredPortalType) {
                if (!options.silent) logout('unauthorized');
                return null;
            }
            return {
                user: { portal_type: cachedRole },
                nda: { allowed: sessionStorage.getItem('lvs_nda_allowed') === 'true' },
                cached: true
            };
        }

        try {
            const response = await fetch(getApiBaseUrl() + '/auth/validate-token', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (!options.silent) logout('expired');
                return null;
            }

            const data = await response.json();

            // Cache validation timestamp
            sessionStorage.setItem(CONFIG.VALIDATION_KEY, Date.now().toString());

            // Update session storage with server-confirmed data
            sessionStorage.setItem('lvs_role', data.user.portal_type);
            if (data.nda) {
                sessionStorage.setItem('lvs_nda_allowed', data.nda.allowed ? 'true' : 'false');
            }

            // Check portal type requirement
            if (requiredPortalType && data.user.portal_type !== requiredPortalType) {
                if (!options.silent) logout('unauthorized');
                return null;
            }

            // Check NDA for customer/partner
            if ((requiredPortalType === 'customer' || requiredPortalType === 'partner') &&
                (!data.nda || !data.nda.allowed)) {
                window.location.href = CONFIG.VALID_PORTALS.nda_pending;
                return null;
            }

            refreshSession();
            return data;

        } catch (error) {
            console.error('Session validation error:', error);
            // Network error - don't log out, could be temporary
            // Return null but let page decide what to do
            return null;
        }
    }

    /**
     * Initialize a protected page with proper validation
     * Shows content immediately, validates in background
     *
     * @param {string} requiredPortalType - Required portal type (e.g., 'founder')
     * @param {Function} onValidated - Callback when validation completes
     * @param {Object} options - { force: boolean } - force skips cache
     */
    function initProtectedPage(requiredPortalType, onValidated, options) {
        options = options || {};

        // Quick client check first - redirect immediately if obviously invalid
        if (!isSessionValid()) {
            logout('unauthorized');
            return;
        }

        // Page content is visible - validate in background
        validateSession(requiredPortalType, { force: !!options.force }).then(function(data) {
            if (data && onValidated) {
                onValidated(data);
            }
            // If null, validateSession already handled redirect
        });
    }

    /**
     * Get safe portal URL from whitelist
     */
    function getPortalUrl(portalType, company, ndaAllowed) {
        if (!ndaAllowed && (portalType === 'customer' || portalType === 'partner')) {
            return CONFIG.VALID_PORTALS.nda_pending;
        }

        if (portalType === 'customer' && company) {
            return CONFIG.VALID_PORTALS.customer[company] || 'dashboard.html';
        }

        if (portalType === 'partner' && company) {
            return CONFIG.VALID_PORTALS.partner[company] || 'dashboard.html';
        }

        return CONFIG.VALID_PORTALS[portalType] || 'dashboard.html';
    }

    // Expose public API
    window.LVSSecurity = {
        requireAuth: requireAuth,
        logout: logout,
        initSession: initSession,
        refreshSession: refreshSession,
        isSessionValid: isSessionValid,
        hasRecentValidation: hasRecentValidation,
        setupActivityTracking: setupActivityTracking,
        setupSessionCheck: setupSessionCheck,
        validateSession: validateSession,
        initProtectedPage: initProtectedPage,
        getPortalUrl: getPortalUrl,
        CONFIG: CONFIG
    };

    // Auto-init: Quick client check only, NO DOM destruction
    if (!window.location.pathname.includes('login') &&
        !window.location.pathname.includes('index.html') &&
        !window.location.pathname.endsWith('/')) {
        requireAuth();  // Redirects if invalid, otherwise does nothing destructive
    }

})();
