document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const downloadBtn = document.getElementById('download-btn');
    const platformIcon = document.getElementById('platform-icon');
    const resultSection = document.getElementById('result-section');
    const mediaThumbnail = document.getElementById('media-thumbnail');
    const mediaTitle = document.getElementById('media-title');
    const mediaPlatform = document.getElementById('media-platform');
    const qualitySelect = document.getElementById('quality-select');
    const finalDownloadBtn = document.getElementById('final-download-btn');
    const historyList = document.getElementById('history-list');

    let currentMediaData = null;

    // Platformları tanımaq üçün regex
    const platforms = [
        { name: 'TikTok', icon: 'fab fa-tiktok', regex: /tiktok\.com/ },
        { name: 'Instagram', icon: 'fab fa-instagram', regex: /instagram\.com/ },
        { name: 'YouTube', icon: 'fab fa-youtube', regex: /youtube\.com|youtu\.be/ },
        { name: 'Facebook', icon: 'fab fa-facebook', regex: /facebook\.com|fb\.watch/ },
        { name: 'Twitter', icon: 'fab fa-twitter', regex: /twitter\.com|x\.com/ },
        { name: 'Pinterest', icon: 'fab fa-pinterest', regex: /pinterest\.com/ },
        { name: 'Reddit', icon: 'fab fa-reddit', regex: /reddit\.com/ },
        { name: 'LinkedIn', icon: 'fab fa-linkedin', regex: /linkedin\.com/ },
        { name: 'Threads', icon: 'fas fa-at', regex: /threads\.net/ }
    ];

    // URL daxil edildikdə ikonu dəyiş
    urlInput.addEventListener('input', () => {
        const url = urlInput.value.trim();
        let found = false;

        if (url === '') {
            platformIcon.innerHTML = '<i class="fas fa-link"></i>';
            platformIcon.style.color = 'var(--text-muted)';
            return;
        }

        for (const p of platforms) {
            if (p.regex.test(url)) {
                platformIcon.innerHTML = `<i class="${p.icon}"></i>`;
                platformIcon.style.color = 'var(--primary)';
                found = true;
                break;
            }
        }

        if (!found) {
            platformIcon.innerHTML = '<i class="fas fa-globe"></i>';
            platformIcon.style.color = 'var(--text-muted)';
        }
    });

    // Yükləmə düyməsi
    downloadBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) return alert('Zəhmət olmasa bir link daxil edin!');

        // Loading state
        downloadBtn.classList.add('loading');
        downloadBtn.disabled = true;
        resultSection.classList.add('hidden');

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (data.success) {
                showResult(data);
                addToHistory(data);
            } else {
                alert('Xəta: ' + (data.error || 'Media tapılmadı'));
            }
        } catch (error) {
            console.error(error);
            alert('Serverlə əlaqə kəsildi!');
        } finally {
            downloadBtn.classList.remove('loading');
            downloadBtn.disabled = false;
        }
    });

    function showResult(data) {
        currentMediaData = data;
        mediaThumbnail.src = data.thumbnail || 'https://via.placeholder.com/180x120?text=No+Thumbnail';
        mediaTitle.textContent = data.title || 'Başlıqsız Media';
        
        const pInfo = platforms.find(p => p.name.toLowerCase() === data.platform.toLowerCase()) || { icon: 'fas fa-video', name: data.platform };
        mediaPlatform.innerHTML = `<i class="${pInfo.icon}"></i> ${pInfo.name}`;

        // Keyfiyyət seçimləri
        qualitySelect.innerHTML = '';
        data.options.forEach((opt, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${opt.type} - ${opt.quality}`;
            qualitySelect.appendChild(option);
        });

        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    finalDownloadBtn.addEventListener('click', () => {
        if (!currentMediaData) return;
        const selectedIndex = qualitySelect.value;
        const downloadUrl = currentMediaData.options[selectedIndex].url;
        window.open(downloadUrl, '_blank');
    });

    // Tarixçə funksiyaları
    function addToHistory(data) {
        let history = JSON.parse(localStorage.getItem('download_history') || '[]');
        
        // Eyni link varsa sil (təkrarlanmasın)
        history = history.filter(item => item.title !== data.title);
        
        // Yeni elementi əvvələ əlavə et
        history.unshift({
            title: data.title,
            platform: data.platform,
            thumbnail: data.thumbnail,
            timestamp: new Date().getTime()
        });

        // Maksimum 5 element saxla
        if (history.length > 5) history.pop();

        localStorage.setItem('download_history', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('download_history') || '[]');
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center;">Hələ ki, yükləmə yoxdur.</p>';
            return;
        }

        history.forEach(item => {
            const pInfo = platforms.find(p => p.name.toLowerCase() === item.platform.toLowerCase()) || { icon: 'fas fa-video' };
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <img src="${item.thumbnail || 'https://via.placeholder.com/80x50'}" class="history-thumb">
                <div class="history-details">
                    <h4>${item.title || 'Başlıqsız'}</h4>
                    <span><i class="${pInfo.icon}"></i> ${item.platform}</span>
                </div>
            `;
            historyList.appendChild(div);
        });
    }

    // İlkin yükləmədə tarixçəni göstər
    renderHistory();
});
