/**
 * LVS Portal - Comments/Chat Component
 * Slack-like comments feature for customer accounts
 */

const LVSComments = (function() {
    let currentAccountId = null;
    let currentUser = null;
    let pollInterval = null;

    // Initialize the comments component
    async function init(accountId, containerSelector) {
        currentAccountId = accountId;

        // Get current user info
        await loadCurrentUser();

        // Create the chat UI
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error('Comments container not found:', containerSelector);
            return;
        }

        container.innerHTML = createChatHTML();

        // Load existing comments
        await loadComments();

        // Set up event listeners
        setupEventListeners(container);

        // Start polling for new comments (every 30 seconds)
        startPolling();
    }

    async function loadCurrentUser() {
        const token = sessionStorage.getItem('lvs_token');
        if (!token) return;

        try {
            const response = await fetch(`${LVS_CONFIG.API_BASE_URL}/comments/me/display-name`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                currentUser = await response.json();
            }
        } catch (error) {
            console.error('Failed to load user info:', error);
        }
    }

    function createChatHTML() {
        const greeting = currentUser ? `Hi, ${currentUser.first_name}!` : 'Hi there!';

        return `
            <div class="lvs-chat">
                <div class="lvs-chat-header">
                    <div class="lvs-chat-title">
                        <span class="lvs-chat-icon">💬</span>
                        Notes & Comments
                    </div>
                    <div class="lvs-chat-greeting">${greeting}</div>
                </div>
                <div class="lvs-chat-messages" id="lvsCommentsList">
                    <div class="lvs-chat-loading">Loading comments...</div>
                </div>
                <div class="lvs-chat-input-area">
                    <input type="text"
                           id="lvsCommentInput"
                           class="lvs-chat-input"
                           placeholder="Add a note or comment..."
                           maxlength="2000">
                    <button id="lvsCommentSubmit" class="lvs-chat-submit">
                        <span>↑</span>
                    </button>
                </div>
            </div>
        `;
    }

    async function loadComments() {
        const token = sessionStorage.getItem('lvs_token');
        if (!token || !currentAccountId) return;

        try {
            const response = await fetch(`${LVS_CONFIG.API_BASE_URL}/comments/${currentAccountId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to load comments');

            const data = await response.json();
            renderComments(data.comments);

        } catch (error) {
            console.error('Error loading comments:', error);
            document.getElementById('lvsCommentsList').innerHTML = `
                <div class="lvs-chat-empty">Unable to load comments</div>
            `;
        }
    }

    function renderComments(comments) {
        const container = document.getElementById('lvsCommentsList');

        if (!comments || comments.length === 0) {
            container.innerHTML = `
                <div class="lvs-chat-empty">
                    <div class="lvs-chat-empty-icon">📝</div>
                    <div>No comments yet</div>
                    <div class="lvs-chat-empty-hint">Be the first to add a note!</div>
                </div>
            `;
            return;
        }

        container.innerHTML = comments.map(comment => createCommentHTML(comment)).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    function createCommentHTML(comment) {
        const date = new Date(comment.created_at);
        const timeStr = formatTime(date);
        const isOwn = comment.is_own;

        return `
            <div class="lvs-chat-message ${isOwn ? 'own' : ''}" data-comment-id="${comment.id}">
                <div class="lvs-chat-message-header">
                    <span class="lvs-chat-author">${escapeHTML(comment.display_name)}</span>
                    <span class="lvs-chat-time">${timeStr}</span>
                    ${isOwn ? '<button class="lvs-chat-delete" onclick="LVSComments.deleteComment(' + comment.id + ')" title="Delete">×</button>' : ''}
                </div>
                <div class="lvs-chat-message-body">${escapeHTML(comment.message)}</div>
            </div>
        `;
    }

    function formatTime(date) {
        const now = new Date();
        const diff = now - date;

        // Less than a minute
        if (diff < 60000) return 'Just now';

        // Less than an hour
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return `${mins}m ago`;
        }

        // Less than a day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        }

        // Same year
        if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        // Different year
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function setupEventListeners(container) {
        const input = document.getElementById('lvsCommentInput');
        const submit = document.getElementById('lvsCommentSubmit');

        // Submit on button click
        submit.addEventListener('click', () => postComment());

        // Submit on Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                postComment();
            }
        });
    }

    async function postComment() {
        const input = document.getElementById('lvsCommentInput');
        const message = input.value.trim();

        if (!message) return;

        const token = sessionStorage.getItem('lvs_token');
        if (!token) {
            alert('Session expired. Please login again.');
            return;
        }

        // Disable input while posting
        input.disabled = true;

        try {
            const response = await fetch(`${LVS_CONFIG.API_BASE_URL}/comments/${currentAccountId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to post comment');
            }

            const newComment = await response.json();

            // Add to list
            const container = document.getElementById('lvsCommentsList');
            const emptyMsg = container.querySelector('.lvs-chat-empty');
            if (emptyMsg) container.innerHTML = '';

            container.insertAdjacentHTML('beforeend', createCommentHTML(newComment));
            container.scrollTop = container.scrollHeight;

            // Clear input
            input.value = '';

        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            input.disabled = false;
            input.focus();
        }
    }

    async function deleteComment(commentId) {
        if (!confirm('Delete this comment?')) return;

        const token = sessionStorage.getItem('lvs_token');
        if (!token) return;

        try {
            const response = await fetch(`${LVS_CONFIG.API_BASE_URL}/comments/${currentAccountId}/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to delete comment');
            }

            // Remove from UI
            const commentEl = document.querySelector(`[data-comment-id="${commentId}"]`);
            if (commentEl) {
                commentEl.style.opacity = '0';
                setTimeout(() => commentEl.remove(), 200);
            }

        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    function startPolling() {
        // Poll every 30 seconds for new comments
        pollInterval = setInterval(() => {
            loadComments();
        }, 30000);
    }

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    // Public API
    return {
        init: init,
        loadComments: loadComments,
        deleteComment: deleteComment,
        stopPolling: stopPolling
    };
})();

// CSS styles for the chat component
const lvsCommentsStyles = document.createElement('style');
lvsCommentsStyles.textContent = `
    .lvs-chat {
        background: #12121a;
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        height: 400px;
        overflow: hidden;
    }

    .lvs-chat-header {
        padding: 16px 20px;
        background: #1a1a24;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .lvs-chat-title {
        font-weight: 600;
        font-size: 14px;
        color: #f5f5f7;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .lvs-chat-icon {
        font-size: 16px;
    }

    .lvs-chat-greeting {
        font-size: 13px;
        color: #7c4dff;
    }

    .lvs-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .lvs-chat-loading,
    .lvs-chat-empty {
        text-align: center;
        color: #6b7280;
        font-size: 13px;
        padding: 40px 20px;
    }

    .lvs-chat-empty-icon {
        font-size: 32px;
        margin-bottom: 8px;
    }

    .lvs-chat-empty-hint {
        font-size: 12px;
        color: #4b5563;
        margin-top: 4px;
    }

    .lvs-chat-message {
        background: rgba(255,255,255,0.03);
        border-radius: 8px;
        padding: 10px 14px;
        max-width: 85%;
        animation: fadeIn 0.2s ease;
    }

    .lvs-chat-message.own {
        background: rgba(124, 77, 255, 0.15);
        margin-left: auto;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .lvs-chat-message-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
    }

    .lvs-chat-author {
        font-weight: 600;
        font-size: 12px;
        color: #7c4dff;
    }

    .lvs-chat-message.own .lvs-chat-author {
        color: #a78bfa;
    }

    .lvs-chat-time {
        font-size: 11px;
        color: #4b5563;
    }

    .lvs-chat-delete {
        margin-left: auto;
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        font-size: 16px;
        padding: 0 4px;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .lvs-chat-message:hover .lvs-chat-delete {
        opacity: 1;
    }

    .lvs-chat-delete:hover {
        color: #ef4444;
    }

    .lvs-chat-message-body {
        font-size: 13px;
        color: #e5e7eb;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
    }

    .lvs-chat-input-area {
        padding: 12px 16px;
        background: #1a1a24;
        border-top: 1px solid rgba(255,255,255,0.06);
        display: flex;
        gap: 8px;
    }

    .lvs-chat-input {
        flex: 1;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 13px;
        color: #f5f5f7;
        outline: none;
        transition: border-color 0.2s;
    }

    .lvs-chat-input:focus {
        border-color: #7c4dff;
    }

    .lvs-chat-input::placeholder {
        color: #6b7280;
    }

    .lvs-chat-submit {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .lvs-chat-submit:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(124, 77, 255, 0.4);
    }

    .lvs-chat-submit:active {
        transform: scale(0.95);
    }
`;
document.head.appendChild(lvsCommentsStyles);
