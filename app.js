const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user'));

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(pageId + '-page').style.display = 'flex';
    if (pageId === 'feed') fetchPosts();
}

function updateNav() {
    if (token) {
        document.getElementById('nav-auth').style.display = 'none';
        document.getElementById('nav-user').style.display = 'block';
        document.getElementById('nav-username').innerText = currentUser.username;
    } else {
        document.getElementById('nav-auth').style.display = 'block';
        document.getElementById('nav-user').style.display = 'none';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function register(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const bio = document.getElementById('reg-bio').value;
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, bio })
    });
    if (res.ok) {
        alert('Registered! Please login.');
        showPage('login');
    } else {
        const data = await res.json();
        alert(data.error || 'Error registering');
    }
}

async function login(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
        token = data.token;
        currentUser = { id: data.userId, username: data.username };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateNav();
        showPage('feed');
    } else {
        alert(data.error);
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNav();
    showPage('login');
}

async function fetchPosts() {
    const res = await fetch(`${API_URL}/posts`);
    const posts = await res.json();
    const container = document.getElementById('posts-container');
    container.innerHTML = `
        <div class="search-container">
            <input type="text" placeholder="Search users..." oninput="searchUsers(this.value)">
            <div id="search-results"></div>
        </div>
        ` + posts.map(post => `
        <div class="post">
            <div class="post-header">
                <div class="user-info">
                    <span class="username" onclick="showProfile(${post.UserId})">${post.User.username}</span>
                    <span class="timestamp">• ${formatDate(post.createdAt)}</span>
                </div>
                ${currentUser && currentUser.id === post.UserId ? `<button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>` : ''}
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <div class="action-item" onclick="likePost(${post.id})">
                    <span>❤</span>
                    <span>${post.Likes.length} Likes</span>
                </div>
                <div class="action-item">
                    <span>💬</span>
                    <span>${post.Comments.length} Comments</span>
                </div>
            </div>
            <div class="comment-box">
                <div class="comments">${post.Comments.map(c => `
                    <div class="comment">
                        <strong>${c.User.username}</strong> ${c.content}
                    </div>`).join('')}
                </div>
                <input type="text" style="width:100%; border:none; background:transparent; padding:0.5rem;" placeholder="Write a comment..." onkeypress="if(event.key === 'Enter') addComment(event, ${post.id})">
            </div>
        </div>
    `).join('');
}

async function searchUsers(query) {
    if (!query) {
        document.getElementById('search-results').innerHTML = '';
        return;
    }
    const res = await fetch(`${API_URL}/search?q=${query}`);
    const users = await res.json();
    const container = document.getElementById('search-results');
    container.innerHTML = users.map(u => `
        <div style="padding: 0.5rem; border-bottom: 1px solid #eee; cursor: pointer;" onclick="showProfile(${u.id})">
            <strong>${u.username}</strong>
        </div>
    `).join('');
}

async function createPost() {
    const content = document.getElementById('post-content').value;
    if (!content) return;
    await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ content })
    });
    document.getElementById('post-content').value = '';
    fetchPosts();
}

async function deletePost(postId) {
    if (!confirm('Delete this post?')) return;
    await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });
    fetchPosts();
}

async function likePost(postId) {
    if (!token) return alert('Please login');
    await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': token }
    });
    fetchPosts();
}

async function addComment(e, postId) {
    if (!token) return alert('Please login');
    const content = e.target.value;
    if (!content) return;
    await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ content })
    });
    e.target.value = '';
    fetchPosts();
}

async function showProfile(userId) {
    const res = await fetch(`${API_URL}/users/${userId}`);
    const user = await res.json();
    const container = document.getElementById('profile-info');
    
    const isOwnProfile = currentUser && currentUser.id === user.id;

    container.innerHTML = `
        <div id="profile-header">
            <h2>${user.username}</h2>
            <p id="profile-bio-text">${user.bio || 'No bio'}</p>
            ${isOwnProfile ? `<button class="secondary" onclick="toggleEditBio()">Edit Bio</button>
                <div id="edit-bio-box" style="display:none; margin-top:1rem;">
                    <textarea id="new-bio">${user.bio || ''}</textarea><br>
                    <button onclick="updateBio()">Save</button>
                </div>` : ''}
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-val">${user.Followers.length}</span>
                    <span class="stat-label">Followers</span>
                </div>
                <div class="stat-item">
                    <span class="stat-val">${user.Following.length}</span>
                    <span class="stat-label">Following</span>
                </div>
                <div class="stat-item">
                    <span class="stat-val">${user.Posts.length}</span>
                    <span class="stat-label">Posts</span>
                </div>
            </div>
            ${currentUser && !isOwnProfile ? `<button onclick="followUser(${user.id})">Follow/Unfollow</button>` : ''}
        </div>
    `;
    
    const postsContainer = document.getElementById('profile-posts');
    postsContainer.innerHTML = user.Posts.map(p => `
        <div class="post">
            <div class="timestamp">${formatDate(p.createdAt)}</div>
            <div class="post-content">${p.content}</div>
        </div>
    `).join('');
    showPage('profile');
}

function toggleEditBio() {
    const box = document.getElementById('edit-bio-box');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

async function updateBio() {
    const bio = document.getElementById('new-bio').value;
    await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ bio })
    });
    alert('Bio updated!');
    location.reload(); // Simple refresh to update
}

async function followUser(userId) {
    if (!token) return alert('Please login');
    await fetch(`${API_URL}/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': token }
    });
    showProfile(userId);
}

// Init
updateNav();
if (token) showPage('feed');
else showPage('login');
