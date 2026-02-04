/**
 * LVS Portal Account Settings Module
 * Provides password change functionality for all portal users
 *
 * Usage: Include this script after security.js in any portal page
 * <script src="js/account-settings.js"></script>
 *
 * Then call LVSAccountSettings.init() in DOMContentLoaded
 */

(function() {
    'use strict';

    const API_BASE_URL = (typeof LVS_CONFIG !== 'undefined' && LVS_CONFIG.API_BASE_URL)
        ? LVS_CONFIG.API_BASE_URL
        : 'http://localhost:8080';

    // Modal HTML template
    const MODAL_HTML = `
        <div id="accountSettingsModal" class="settings-modal">
            <div class="settings-modal-backdrop"></div>
            <div class="settings-modal-content">
                <div class="settings-modal-header">
                    <h3>Account Settings</h3>
                    <button class="settings-modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="settings-modal-body">
                    <!-- User Info -->
                    <div class="settings-user-info">
                        <div class="settings-avatar" id="settingsAvatar">--</div>
                        <div class="settings-user-details">
                            <div class="settings-user-name" id="settingsUserName">User</div>
                            <div class="settings-user-email" id="settingsUserEmail">user@example.com</div>
                        </div>
                    </div>

                    <!-- Password Change Section -->
                    <div class="settings-section">
                        <h4>Change Password</h4>
                        <form id="changePasswordForm">
                            <div class="settings-form-group">
                                <label for="currentPassword">Current Password</label>
                                <input type="password" id="currentPassword" placeholder="Enter current password" required>
                            </div>
                            <div class="settings-form-group">
                                <label for="newPassword">New Password</label>
                                <input type="password" id="newPassword" placeholder="Enter new password" required>
                                <div class="settings-password-strength" id="settingsPasswordStrength">
                                    <div class="strength-bar"><div class="strength-fill" id="settingsStrengthFill"></div></div>
                                    <span class="strength-text" id="settingsStrengthText"></span>
                                </div>
                            </div>
                            <div class="settings-form-group">
                                <label for="confirmNewPassword">Confirm New Password</label>
                                <input type="password" id="confirmNewPassword" placeholder="Confirm new password" required>
                            </div>
                            <div class="settings-requirements">
                                <p>Password must contain:</p>
                                <ul>
                                    <li id="settingsReqLength"><span class="check">-</span> At least 8 characters</li>
                                    <li id="settingsReqUpper"><span class="check">-</span> One uppercase letter</li>
                                    <li id="settingsReqLower"><span class="check">-</span> One lowercase letter</li>
                                    <li id="settingsReqNumber"><span class="check">-</span> One number</li>
                                </ul>
                            </div>
                            <div class="settings-message settings-error" id="settingsError"></div>
                            <div class="settings-message settings-success" id="settingsSuccess"></div>
                            <button type="submit" class="settings-btn-primary" id="changePasswordBtn">
                                <span id="changePasswordBtnText">Update Password</span>
                                <div class="settings-spinner" id="changePasswordSpinner"></div>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Styles for the modal
    const MODAL_STYLES = `
        <style id="accountSettingsStyles">
            /* Settings Modal Overlay */
            .settings-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                align-items: center;
                justify-content: center;
            }
            .settings-modal.active {
                display: flex;
            }
            .settings-modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
            }
            .settings-modal-content {
                position: relative;
                background: #12121a;
                border-radius: 16px;
                width: 90%;
                max-width: 480px;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            .settings-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            }
            .settings-modal-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 700;
                color: #f5f5f7;
            }
            .settings-modal-close {
                background: none;
                border: none;
                color: #6b7280;
                font-size: 28px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                transition: color 0.2s;
            }
            .settings-modal-close:hover {
                color: #f5f5f7;
            }
            .settings-modal-body {
                padding: 24px;
            }

            /* User Info */
            .settings-user-info {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                margin-bottom: 24px;
            }
            .settings-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: linear-gradient(135deg, #7c4dff, #651fff);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 16px;
                color: white;
            }
            .settings-user-details {
                flex: 1;
            }
            .settings-user-name {
                font-weight: 600;
                color: #f5f5f7;
                font-size: 15px;
            }
            .settings-user-email {
                color: #6b7280;
                font-size: 13px;
                margin-top: 2px;
            }

            /* Sections */
            .settings-section h4 {
                font-size: 14px;
                font-weight: 600;
                color: #f5f5f7;
                margin: 0 0 16px 0;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            }

            /* Form */
            .settings-form-group {
                margin-bottom: 16px;
            }
            .settings-form-group label {
                display: block;
                font-size: 12px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
            }
            .settings-form-group input {
                width: 100%;
                padding: 12px 14px;
                font-size: 14px;
                background: #1a1a24;
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #f5f5f7;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .settings-form-group input:focus {
                outline: none;
                border-color: #7c4dff;
                box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.1);
            }
            .settings-form-group input::placeholder {
                color: #4b5563;
            }

            /* Password Strength */
            .settings-password-strength {
                margin-top: 8px;
                display: none;
            }
            .settings-password-strength.visible {
                display: block;
            }
            .settings-password-strength .strength-bar {
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
                margin-bottom: 4px;
                overflow: hidden;
            }
            .settings-password-strength .strength-fill {
                height: 100%;
                width: 0%;
                transition: all 0.3s;
                border-radius: 2px;
            }
            .settings-password-strength .strength-fill.weak { width: 25%; background: #ef4444; }
            .settings-password-strength .strength-fill.fair { width: 50%; background: #f59e0b; }
            .settings-password-strength .strength-fill.good { width: 75%; background: #10b981; }
            .settings-password-strength .strength-fill.strong { width: 100%; background: #7c4dff; }
            .settings-password-strength .strength-text {
                font-size: 11px;
                color: #6b7280;
            }
            .settings-password-strength .strength-text.weak { color: #ef4444; }
            .settings-password-strength .strength-text.fair { color: #f59e0b; }
            .settings-password-strength .strength-text.good { color: #10b981; }
            .settings-password-strength .strength-text.strong { color: #7c4dff; }

            /* Requirements */
            .settings-requirements {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 16px;
            }
            .settings-requirements p {
                font-size: 11px;
                color: #6b7280;
                margin: 0 0 8px 0;
            }
            .settings-requirements ul {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            .settings-requirements li {
                font-size: 11px;
                color: #6b7280;
                padding: 2px 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .settings-requirements li.met {
                color: #10b981;
            }
            .settings-requirements li .check {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
            }
            .settings-requirements li.met .check {
                background: #10b981;
                color: white;
            }

            /* Messages */
            .settings-message {
                display: none;
                padding: 10px 12px;
                border-radius: 8px;
                font-size: 13px;
                margin-bottom: 16px;
            }
            .settings-message.visible {
                display: block;
            }
            .settings-error {
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
            }
            .settings-success {
                background: rgba(16, 185, 129, 0.1);
                color: #10b981;
            }

            /* Button */
            .settings-btn-primary {
                width: 100%;
                padding: 12px;
                font-size: 14px;
                font-weight: 600;
                color: white;
                background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            .settings-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(124, 77, 255, 0.4);
            }
            .settings-btn-primary:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            .settings-spinner {
                display: none;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: settings-spin 0.8s linear infinite;
            }
            .settings-btn-primary.loading .settings-spinner {
                display: block;
            }
            .settings-btn-primary.loading #changePasswordBtnText {
                display: none;
            }
            @keyframes settings-spin {
                to { transform: rotate(360deg); }
            }

            /* Nav Settings Button */
            .nav-settings-btn {
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            .nav-settings-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #f5f5f7;
            }

            /* Mobile */
            @media (max-width: 480px) {
                .settings-modal-content {
                    width: 95%;
                    margin: 16px;
                }
                .settings-modal-body {
                    padding: 16px;
                }
            }
        </style>
    `;

    /**
     * Initialize the account settings module
     */
    function init() {
        // Inject styles
        if (!document.getElementById('accountSettingsStyles')) {
            document.head.insertAdjacentHTML('beforeend', MODAL_STYLES);
        }

        // Inject modal
        if (!document.getElementById('accountSettingsModal')) {
            document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
        }

        // Add settings button to nav
        addSettingsButton();

        // Setup event listeners
        setupEventListeners();

        // Populate user info
        populateUserInfo();
    }

    /**
     * Add settings button to navigation
     */
    function addSettingsButton() {
        const navUser = document.querySelector('.nav-user');
        if (!navUser) return;

        // Check if button already exists
        if (document.getElementById('navSettingsBtn')) return;

        // Find the avatar element to insert before it
        const avatar = document.getElementById('navAvatar');
        if (!avatar) return;

        // Create settings button
        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'navSettingsBtn';
        settingsBtn.className = 'nav-settings-btn';
        settingsBtn.title = 'Account Settings';
        settingsBtn.innerHTML = '&#9881;'; // Gear icon
        settingsBtn.onclick = openModal;

        // Insert before avatar
        avatar.parentNode.insertBefore(settingsBtn, avatar);
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        const modal = document.getElementById('accountSettingsModal');
        const backdrop = modal.querySelector('.settings-modal-backdrop');
        const closeBtn = modal.querySelector('.settings-modal-close');
        const form = document.getElementById('changePasswordForm');
        const newPasswordInput = document.getElementById('newPassword');

        // Close modal
        backdrop.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Form submission
        form.addEventListener('submit', handlePasswordChange);

        // Password strength check
        newPasswordInput.addEventListener('input', checkPasswordStrength);

        // Clear messages on input
        modal.querySelectorAll('input').forEach(function(input) {
            input.addEventListener('input', clearMessages);
        });
    }

    /**
     * Populate user info in modal
     */
    function populateUserInfo() {
        const name = sessionStorage.getItem('lvs_user_name') || 'User';
        const email = sessionStorage.getItem('lvs_email') || '';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        document.getElementById('settingsAvatar').textContent = initials;
        document.getElementById('settingsUserName').textContent = name;
        document.getElementById('settingsUserEmail').textContent = email;
    }

    /**
     * Open the settings modal
     */
    function openModal() {
        const modal = document.getElementById('accountSettingsModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        populateUserInfo();
        clearForm();
    }

    /**
     * Close the settings modal
     */
    function closeModal() {
        const modal = document.getElementById('accountSettingsModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        clearForm();
    }

    /**
     * Clear form and messages
     */
    function clearForm() {
        document.getElementById('changePasswordForm').reset();
        document.getElementById('settingsPasswordStrength').classList.remove('visible');
        clearMessages();
        resetRequirements();
    }

    /**
     * Clear error/success messages
     */
    function clearMessages() {
        document.getElementById('settingsError').classList.remove('visible');
        document.getElementById('settingsSuccess').classList.remove('visible');
    }

    /**
     * Show error message
     */
    function showError(message) {
        const el = document.getElementById('settingsError');
        el.textContent = message;
        el.classList.add('visible');
        document.getElementById('settingsSuccess').classList.remove('visible');
    }

    /**
     * Show success message
     */
    function showSuccess(message) {
        const el = document.getElementById('settingsSuccess');
        el.textContent = message;
        el.classList.add('visible');
        document.getElementById('settingsError').classList.remove('visible');
    }

    /**
     * Check password strength
     */
    function checkPasswordStrength() {
        const password = document.getElementById('newPassword').value;
        const strengthDiv = document.getElementById('settingsPasswordStrength');
        const strengthFill = document.getElementById('settingsStrengthFill');
        const strengthText = document.getElementById('settingsStrengthText');

        // Update requirements
        const hasLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        updateRequirement('settingsReqLength', hasLength);
        updateRequirement('settingsReqUpper', hasUpper);
        updateRequirement('settingsReqLower', hasLower);
        updateRequirement('settingsReqNumber', hasNumber);

        // Calculate strength
        let strength = 0;
        if (hasLength) strength++;
        if (hasUpper) strength++;
        if (hasLower) strength++;
        if (hasNumber) strength++;

        // Show strength indicator
        if (password.length > 0) {
            strengthDiv.classList.add('visible');
            const levels = ['weak', 'weak', 'fair', 'good', 'strong'];
            const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

            strengthFill.className = 'strength-fill ' + levels[strength];
            strengthText.className = 'strength-text ' + levels[strength];
            strengthText.textContent = labels[strength];
        } else {
            strengthDiv.classList.remove('visible');
        }
    }

    /**
     * Update requirement indicator
     */
    function updateRequirement(id, met) {
        const el = document.getElementById(id);
        if (!el) return;

        if (met) {
            el.classList.add('met');
            el.querySelector('.check').textContent = '\u2713';
        } else {
            el.classList.remove('met');
            el.querySelector('.check').textContent = '-';
        }
    }

    /**
     * Reset all requirements
     */
    function resetRequirements() {
        ['settingsReqLength', 'settingsReqUpper', 'settingsReqLower', 'settingsReqNumber'].forEach(function(id) {
            updateRequirement(id, false);
        });
    }

    /**
     * Handle password change form submission
     */
    async function handlePasswordChange(e) {
        e.preventDefault();
        clearMessages();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;
        const btn = document.getElementById('changePasswordBtn');

        // Validate
        if (!currentPassword) {
            showError('Please enter your current password.');
            return;
        }

        if (newPassword.length < 8) {
            showError('New password must be at least 8 characters.');
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            showError('New password must contain at least one uppercase letter.');
            return;
        }
        if (!/[a-z]/.test(newPassword)) {
            showError('New password must contain at least one lowercase letter.');
            return;
        }
        if (!/\d/.test(newPassword)) {
            showError('New password must contain at least one number.');
            return;
        }
        if (newPassword !== confirmPassword) {
            showError('New passwords do not match.');
            return;
        }
        if (currentPassword === newPassword) {
            showError('New password must be different from current password.');
            return;
        }

        // Submit
        btn.classList.add('loading');
        btn.disabled = true;

        try {
            const token = sessionStorage.getItem('lvs_token');
            const response = await fetch(API_BASE_URL + '/auth/change-password', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to change password');
            }

            showSuccess('Password changed successfully!');

            // Clear form after success
            setTimeout(function() {
                document.getElementById('changePasswordForm').reset();
                document.getElementById('settingsPasswordStrength').classList.remove('visible');
                resetRequirements();
            }, 2000);

        } catch (error) {
            showError(error.message);
        } finally {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    // Expose public API
    window.LVSAccountSettings = {
        init: init,
        open: openModal,
        close: closeModal
    };

})();
