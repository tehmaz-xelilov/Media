const downloader = require('primesave-dl');

module.exports = async (req, res) => {
    // CORS ayarları
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: 'URL tələb olunur' });
    }

    try {
        const result = await downloader(url);
        
        if (result.success) {
            res.status(200).json(result);
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
};
