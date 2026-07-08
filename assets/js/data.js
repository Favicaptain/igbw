import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Generic Fetch & Render Function
 * @param {string} colName - Collection name
 * @param {string} containerId - Element ID to inject HTML
 * @param {function} renderFn - Function that returns HTML string for one item
 * @param {object} options - query options (limit, order)
 */
const fetchData = (colName, containerId, renderFn, options = {}) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Show Loading
    container.innerHTML = '<div class="loading-spinner"></div>';

    let q = collection(db, colName);
    
    // Default sorting by date descending
    const orderField = options.orderBy || 'date';
    const direction = options.direction || 'desc';
    
    if (options.limit) {
        q = query(q, orderBy(orderField, direction), limit(options.limit));
    } else {
        q = query(q, orderBy(orderField, direction));
    }

    // Use onSnapshot for real-time updates
    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            container.innerHTML = `<p class="empty-state">No ${colName} items found at this time.</p>`;
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            html += renderFn({ id: doc.id, ...doc.data() });
        });
        container.innerHTML = html;
    }, (error) => {
        console.error(`Error fetching ${colName}:`, error);
        container.innerHTML = `
            <div class="error-state">
                <p>Unable to load ${colName}. Please check your connection.</p>
                <button class="btn btn-outline" onclick="location.reload()">Retry</button>
            </div>
        `;
    });
};

// Render Functions
const newsRenderer = (item) => `
    <article class="card news-card">
        ${item.imageBase64 ? `<img src="${item.imageBase64}" alt="${item.title}" class="news-img">` : ''}
        <div class="card-body">
            <span class="date-tag">${new Date(item.date).toLocaleDateString()}</span>
            <h3 class="serif">${item.title}</h3>
            <p>${item.summary}</p>
        </div>
    </article>
`;

const eventRenderer = (item) => `
    <div class="card event-card">
        <div class="card-body">
            <div style="display: flex; gap: 1rem; align-items: center;">
                <div class="date-badge">
                    <span class="day">${new Date(item.date).getDate()}</span>
                    <span class="month">${new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div>
                    <h3 class="serif">${item.title}</h3>
                    <p><strong>${item.time}</strong> | ${item.location}</p>
                </div>
            </div>
            <p style="margin-top: 1rem;">${item.description}</p>
        </div>
    </div>
`;

const sermonRenderer = (item) => `
    <div class="card sermon-card">
        <div class="card-body">
            <h3 class="serif">${item.title}</h3>
            <p><em>${item.preacher}</em> &bull; ${new Date(item.date).toLocaleDateString()}</p>
            <a href="${item.linkUrl}" target="_blank" class="btn btn-outline" style="margin-top: 1rem; padding: 0.5rem 1rem;">Watch/Listen</a>
        </div>
    </div>
`;

const galleryRenderer = (item) => `
    <div class="gallery-item">
        <img src="${item.imageBase64}" alt="${item.caption || 'Gallery Image'}" loading="lazy">
        ${item.caption ? `<div class="caption">${item.caption}</div>` : ''}
    </div>
`;

// Export Specific Page Loaders
export const loadLatestNews = () => fetchData('news', 'latest-news-container', newsRenderer, { limit: 3 });
export const loadAllNews = () => fetchData('news', 'news-grid', newsRenderer);
export const loadAllEvents = () => fetchData('events', 'events-grid', eventRenderer, { orderBy: 'date', direction: 'asc' });
export const loadAllSermons = () => fetchData('sermons', 'sermons-grid', sermonRenderer);
export const loadAllGallery = () => fetchData('gallery', 'gallery-grid', galleryRenderer);

// Global styles for these components
const injectDataStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .date-tag { font-size: 0.8rem; color: var(--secondary-color); font-weight: 600; text-transform: uppercase; }
        .news-img { width: 100%; height: 200px; object-fit: cover; }
        .date-badge { 
            background: var(--primary-color); 
            color: var(--white); 
            padding: 0.5rem; 
            border-radius: var(--border-radius); 
            text-align: center;
            min-width: 60px;
        }
        .date-badge .day { display: block; font-size: 1.5rem; font-weight: 700; line-height: 1; }
        .date-badge .month { font-size: 0.8rem; text-transform: uppercase; }
        .gallery-item { position: relative; overflow: hidden; border-radius: var(--border-radius); }
        .gallery-item img { transition: var(--transition); width: 100%; height: 250px; object-fit: cover; }
        .gallery-item:hover img { transform: scale(1.05); }
        .gallery-item .caption {
            position: absolute; bottom: 0; left: 0; right: 0;
            background: rgba(0,0,0,0.7); color: white; padding: 0.5rem;
            font-size: 0.9rem; transform: translateY(100%); transition: var(--transition);
        }
        .gallery-item:hover .caption { transform: translateY(0); }
        .empty-state, .error-state { text-align: center; grid-column: 1 / -1; padding: var(--spacing-md); color: var(--text-secondary); }
    `;
    document.head.appendChild(style);
};
injectDataStyles();
