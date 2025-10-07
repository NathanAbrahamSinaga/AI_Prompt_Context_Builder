let fileSystem = JSON.parse(localStorage.getItem('aiContextBuilderFS')) || [];
let activeItemId = null;
let nextId = 1;
let contextTargetId = null;
let autoSaveTimer = null;
let modalConfirmResolver = null;
let draggedItemId = null;

const HELP_CONTENT_HTML = `
    <p>Selamat datang di AI Prompt Context Builder! Aplikasi ini membantu Anda menyusun dan mengekspor struktur proyek beserta isinya ke dalam satu format teks.</p>
    <h4>Dasar-dasar</h4>
    <ul>
        <li><b>Tambah File/Folder:</b> Gunakan tombol 📄 atau 📁 di bagian atas.</li>
        <li><b>Ubah Nama:</b> Klik kanan pada item dan pilih 'Ubah Nama', atau tekan <kbd>F2</kbd>.</li>
        <li><b>Hapus:</b> Klik kanan dan pilih 'Hapus', tekan tombol <kbd>Delete</kbd>, atau klik ikon &times; yang muncul saat hover.</li>
        <li><b>Navigasi:</b> Gunakan tombol panah <kbd>↑</kbd> dan <kbd>↓</kbd> untuk berpindah antar item.</li>
        <li><b>Buka/Tutup Folder:</b> Gunakan panah <kbd>→</kbd> untuk membuka dan <kbd>←</kbd> untuk menutup folder.</li>
    </ul>
    <h4>Penyimpanan & Data</h4>
    <ul>
        <li><b>Penyimpanan Otomatis:</b> Perubahan pada editor teks akan disimpan ke memori setelah Anda berhenti mengetik.</li>
        <li><b>Simpan Proyek:</b> Tombol <b>Save</b> akan menyimpan seluruh struktur proyek ke <i>Local Storage</i> browser Anda.</li>
        <li><b>Ekspor:</b> Tombol 📋 akan <b>menyimpan proyek terlebih dahulu</b>, lalu menyalin seluruh struktur dan konten file ke clipboard Anda.</li>
    </ul>
    <h4>Fitur Lanjutan</h4>
    <ul>
        <li><b>Impor:</b> Tombol 📥 akan memuat proyek dari teks. Setelah impor berhasil, proyek otomatis disimpan, di-rebuild, dan halaman di-refresh.</li>
        <li><b>Rebuild ID (🛠️):</b> Gunakan tombol ini jika Anda mengalami masalah aneh seperti tidak bisa menghapus atau memindahkan file.</li>
        <li><b>Reset (🗑️):</b> Menghapus seluruh proyek dari <i>Local Storage</i> secara permanen.</li>
    </ul>
    <h4>Shortcut Keyboard</h4>
    <ul>
        <li><kbd>Ctrl</kbd> + <kbd>S</kbd>: Simpan Proyek</li>
        <li><kbd>F2</kbd>: Ubah Nama</li>
        <li><kbd>Delete</kbd>: Hapus Item</li>
        <li><kbd>Enter</kbd>: Konfirmasi pada dialog pop-up.</li>
    </ul>
`;

const languageMap = {
    js: 'javascript', jsx: 'jsx',
    css: 'css', html: 'markup', xml: 'markup',
    py: 'python', md: 'markdown', json: 'json',
    vue: 'markup',
    gd: 'gdscript',
};