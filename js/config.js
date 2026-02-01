/**
 * LVS Portal - Environment Configuration
 *
 * This file configures API endpoints based on the current environment.
 * For production, update the PRODUCTION settings with your actual domain.
 */

const LVS_CONFIG = (function() {
    const hostname = window.location.hostname;

    // Environment detection
    const ENVIRONMENTS = {
        // Local development
        localhost: {
            name: 'development',
            apiBase: 'http://localhost:8080',
            portalBase: 'http://localhost:8000'
        },
        '127.0.0.1': {
            name: 'development',
            apiBase: 'http://127.0.0.1:8080',
            portalBase: 'http://127.0.0.1:8000'
        },
        // Local domain (requires /etc/hosts entry)
        'lvs.local': {
            name: 'local',
            apiBase: 'http://api.lvs.local:8080',
            portalBase: 'http://lvs.local:8000'
        },
        // Production - UPDATE THESE FOR YOUR DOMAIN
        'portal.lolavisionsystems.com': {
            name: 'production',
            apiBase: 'https://api.lolavisionsystems.com',
            portalBase: 'https://portal.lolavisionsystems.com'
        },
        'lvs.app': {
            name: 'production',
            apiBase: 'https://api.lvs.app',
            portalBase: 'https://lvs.app'
        },
        // Cloud Run (temporary until custom domain is set up)
        'lvs-portal-657638018776.us-central1.run.app': {
            name: 'production',
            apiBase: 'https://lvs-api-657638018776.us-central1.run.app',
            portalBase: 'https://lvs-portal-657638018776.us-central1.run.app'
        },
        // GitHub Pages
        'mbanotnba.github.io': {
            name: 'production',
            apiBase: 'https://lvs-api-657638018776.us-central1.run.app',
            portalBase: 'https://mbanotnba.github.io/lvs-investor-portal'
        }
    };

    // Get current environment config
    const env = ENVIRONMENTS[hostname] || ENVIRONMENTS['localhost'];

    return {
        ENV: env.name,
        API_BASE_URL: env.apiBase,
        PORTAL_BASE_URL: env.portalBase,

        // Session settings
        SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes

        // Portal routes
        ROUTES: {
            login: 'login.html',
            founder: 'founder-portal.html',
            investor: 'dashboard.html',
            customer: '{company}-portal.html',
            partner: 'partner-portal.html?partner={company}'
        },

        // Get portal URL for a given type and company
        getPortalUrl: function(portalType, company) {
            let route = this.ROUTES[portalType] || this.ROUTES.investor;
            if (company) {
                route = route.replace('{company}', company);
            }
            return route;
        },

        // Check if running in production
        isProduction: function() {
            return this.ENV === 'production';
        },

        // Log config (dev only)
        debug: function() {
            if (this.ENV !== 'production') {
                console.log('LVS Config:', {
                    env: this.ENV,
                    api: this.API_BASE_URL,
                    portal: this.PORTAL_BASE_URL
                });
            }
        },

        // Get user greeting info
        getUserGreeting: function() {
            const firstName = sessionStorage.getItem('lvs_first_name') || 'User';
            const fullName = sessionStorage.getItem('lvs_user_name') || 'User';
            const company = sessionStorage.getItem('lvs_company') || '';
            const role = sessionStorage.getItem('lvs_role') || '';

            // Get initials for avatar
            const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

            // Get display name format: FirstName (Company)
            let displayCompany = 'LVS';
            if (role === 'founder' || company === 'lvs') {
                displayCompany = 'LVS';
            } else if (company) {
                displayCompany = company.toUpperCase();
            } else if (role) {
                displayCompany = role.charAt(0).toUpperCase() + role.slice(1);
            }

            return {
                firstName: firstName,
                fullName: fullName,
                initials: initials,
                displayName: `${firstName} (${displayCompany})`,
                greeting: `Hi, ${firstName}!`
            };
        }
    };
})();

// Auto-log in development
if (typeof window !== 'undefined') {
    LVS_CONFIG.debug();
}
