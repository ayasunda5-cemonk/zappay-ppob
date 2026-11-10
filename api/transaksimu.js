export default async function handler(req, res) {
    // Pastikan request menggunakan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { target, produk, refId } = req.body;

    // Validasi input sederhana
    if (!target || !produk) {
        return res.status(400).json({ success: false, message: 'Nomor tujuan dan produk wajib diisi!' });
    }

    // Ambil Secret Key dari Environment Variables Vercel (Aman!)
    const API_USER = process.env.H2H_USERNAME;
    const API_KEY = process.env.H2H_API_KEY;
    const SUPPLIER_URL = process.env.H2H_ENDPOINT_URL; // Contoh: https://api.supplierppob.com/v1/transaction

    try {
        // Contoh payload request ke Supplier H2H (Sesuaikan dengan dokumentasi supplier Anda)
        const payload = {
            username: API_USER,
            sign: generateSign(API_USER, API_KEY, refId), // Fungsi signature jika diperlukan supplier
            buyer_sku_code: produk,
            customer_no: target,
            ref_id: refId || `ZAP-${Date.now()}`
        };

        // Kirim HTTP Request ke Server Supplier H2H
        const apiResponse = await fetch(SUPPLIER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await apiResponse.json();

        // Kirim hasil respons dari supplier kembali ke Frontend ZapPay
        if (result.success || result.status === 'sukses' || result.data?.status === 0) {
            return res.status(200).json({ 
                success: true, 
                message: 'Transaksi berhasil dikirim ke server!', 
                data: result 
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                message: result.message || 'Transaksi ditolak oleh server pusat.' 
            });
        }

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan koneksi ke server H2H.', 
            error: error.message 
        });
    }
}

// Fungsi opsional untuk membuat signature/MD5 hash jika diminta supplier H2H
function generateSign(username, apiKey, refId) {
    const crypto = require('crypto');
    // Contoh umum formula sign: md5(username + apiKey + refId)
    return crypto.createHash('md5').update(username + apiKey + refId).digest('hex');
}
