// Data produk simulasi berdasarkan kategori
const productsData = {
    pulsa: [
        { name: "Pulsa Telkomsel 10.000", price: 11500 },
        { name: "Pulsa Telkomsel 20.000", price: 21500 },
        { name: "Pulsa Telkomsel 50.000", price: 52000 }
    ],
    data: [
        { name: "Paket Data 3GB (3 Hari)", price: 15000 },
        { name: "Paket Data 10GB (30 Hari)", price: 45000 }
    ],
    pln: [
        { name: "Token Listrik PLN 20.000", price: 21500 },
        { name: "Token Listrik PLN 50.000", price: 51500 }
    ],
    wallet: [
        { name: "Top Up DANA 20.000", price: 21000 },
        { name: "Top Up OVO 50.000", price: 51000 }
    ]
};

let currentCategory = 'pulsa';

function selectCategory(category) {
    currentCategory = category;
    
    // Ubah style tombol aktif
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-50', 'border-indigo-200', 'text-indigo-700');
        btn.classList.add('bg-white', 'border-gray-200', 'text-gray-600');
    });
    
    // Temukan tombol yang diklik dan aktifkan style-nya
    event.target.classList.remove('bg-white', 'border-gray-200', 'text-gray-600');
    event.target.classList.add('bg-indigo-50', 'border-indigo-200', 'text-indigo-700');

    // Ubah Judul & Label target
    const titles = { pulsa: 'Beli Pulsa Reguler', data: 'Beli Paket Data Internet', pln: 'Beli Token Listrik PLN', wallet: 'Top Up Saldo E-Wallet' };
    const labels = { pulsa: 'Nomor HP Tujuan', data: 'Nomor HP Tujuan', pln: 'Nomor Meter / ID Pelanggan', wallet: 'Nomor Akun / HP E-Wallet' };
    
    document.getElementById('form-title').innerText = titles[category];
    document.getElementById('target-label').innerText = labels[category];

    // Update pilihan produk di dropdown
    updateProductDropdown(category);
}

async function handleTransaction(event) {
    event.preventDefault();
    const target = document.getElementById('target-input').value;
    const select = document.getElementById('product-select');
    const productCode = select.value; // Nilai kode produk dari supplier (misal: "T10", "S50")
    const productName = select.options[select.selectedIndex].text;

    if(!confirm(`Konfirmasi Transaksi:\n${productName}\nTujuan: ${target}\n\nLanjutkan pembayaran?`)) {
        return;
    }

    const logContainer = document.getElementById('log-container');
    logContainer.innerHTML = `<div class="p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 font-medium">⏳ Menghubungkan ke server ZapPay...</div>`;

    try {
        // Request ke Vercel Serverless Function Anda sendiri
        const response = await fetch('/api/transaksimu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: target,
                produk: productCode,
                refId: 'ZAP-' + Math.floor(Math.random() * 1000000)
            })
        });

        const result = await response.json();

        if (result.success) {
            logContainer.innerHTML = `
                <div class="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium">
                    ✅ Sukses! Transaksi ${productName} sedang diproses operator.
                </div>
            `;
            document.getElementById('ppob-form').reset();
        } else {
            logContainer.innerHTML = `
                <div class="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium">
                    ❌ Gagal: ${result.message}
                </div>
            `;
        }
    } catch (err) {
        logContainer.innerHTML = `
            <div class="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium">
                ❌ Kesalahan jaringan saat menghubungi server.
            </div>
        `;
    }
}
