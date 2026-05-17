const express = require('express');
const cors = require('cors');
const downloader = require('primesave-dl');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/download', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: 'URL tələb olunur' });
    }

    try {
        const result = await downloader(url);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json({ 
                success: false, 
                error: result.error || 'Media məlumatlarını əldə etmək mümkün olmadı' 
            });
        }
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server xətası baş verdi. Zəhmət olmasa URL-i yoxlayın.' 
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server http://localhost:${PORT} ünvanında işləyir`);
    });
}

module.exports = app;
