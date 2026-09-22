const DAFTAR_TOPIK = [
  {
    id: 'salam',
    kunci: ['halo', 'hai', 'pagi', 'siang', 'sore', 'malam', 'selamat', 'assalamualaikum'],
    respon: [
      'Halo! Senang sekali menyapa kamu. Ada yang bisa saya bantu?',
      'Hai! Selamat datang di PalembangPy. Mari belajar Python bersama!',
      'Assalamualaikum! Semoga harimu menyenangkan. Ada pertanyaan seputar Python?'
    ]
  },
  {
    id: 'python_dasar',
    kunci: ['apa itu python', 'python itu apa', 'jelaskan python', 'pengertian python', 'sejarah python'],
    respon: [
      'Python adalah bahasa pemrograman yang dirancang agar mudah dibaca & dipahami, dikembangkan oleh Guido van Rossum dan dirilis tahun 1991.\n\n- Sintaks mirip bahasa Inggris\n- Bisa dipakai untuk: web, data, AI, otomasi, dll\n- Komunitas besar & ramah\n\nMau coba langsung? Tekan Playground di menu utama!'
    ]
  },
  {
    id: 'belajar_mulai',
    kunci: ['mulai belajar', 'cara belajar', 'dari mana mulai', 'bagaimana mulai', 'belajar python pemula'],
    respon: [
      'Panduan Mulai Belajar Python\n\n1. Pelajari dasar dulu: variabel, tipe data, percabangan, perulangan\n2. Latihan langsung — pakai Playground di sini!\n3. Buat proyek kecil: kalkulator, daftar tugas, dll\n4. Bergabung dengan komunitas → tanya & berbagi\n\nSaran: Mulai dari menulis print("Halo Dunia!") dulu.'
    ]
  },
  {
    id: 'bantuan',
    kunci: ['bantuan', 'tolong', 'bantu', 'bagaimana', 'caranya', 'bisa bantu'],
    respon: [
      'Bantuan\n\nBerikut hal yang bisa saya lakukan:\n\n/start — Kembali ke menu utama\nPlayground — Jalankan kode Python langsung\nBuat Akun — Daftar sebagai anggota komunitas\nTentang — Info tentang PalembangPy\n\nAda pertanyaan spesifik? Langsung tanya saja ya!'
    ]
  },
  {
    id: 'lanjutan',
    kunci: ['lanjut', 'selanjutnya', 'terus', 'bagian berikutnya', 'apa lagi'],
    respon: [
      'Siap! Kita lanjut. Topik apa yang ingin kamu ketahui lebih dalam?',
      'Baik, kita lanjut. Ada hal lain seputar topik ini yang ingin dibahas?',
      'Tentu! Apa yang ingin kamu pelajari selanjutnya?'
    ]
  },
  {
    id: 'terima_kasih',
    kunci: ['makasih', 'terima kasih', 'terimakasih', 'mantap', 'bagus', 'keren'],
    respon: [
      'Sama-sama! Senang bisa membantu.',
      'Terima kasih kembali! Semangat terus belajarnya.',
      'Senang bisa bantu! Kalau ada yang ditanya lagi, jangan ragu tanya ya!'
    ]
  },
  {
    id: 'anggota',
    kunci: ['anggota', 'daftar', 'akun', 'gabung', 'cara gabung', 'member'],
    respon: [
      'Keanggotaan PalembangPy\n\nTekan tombol Buat Akun di menu utama untuk mendaftar.\nNanti kamu akan dapat:\n- Kode anggota unik\n- Akses fitur komunitas\n- Informasi kegiatan & berbagi proyek\n\nSudah siap? Kembali ke menu utama tekan /start'
    ]
  },
  {
    id: 'komunitas',
    kunci: ['palembangpy', 'komunitas', 'grup', 'acara', 'kegiatan', 'bertemu'],
    respon: [
      'PalembangPy — Komunitas Python Palembang\n\nKami berkumpul untuk belajar, berbagi proyek, dan tumbuh bersama.\n\n📍 Berbasis di Palembang, Sumatera Selatan\n📅 Rutin mengadakan pertemuan & belajar bareng\n📷 Ikuti kami: @palembangpy\n💜 Dukung kami: sociabuzz.com/palembangpy/tribe\n\nSemakin banyak, semakin seru! Yuk bergabung!'
    ]
  }
];

const konteksPengguna = new Map();

function deteksiTopik(pesan, topikTerakhir = null) {
  const teks = pesan.toLowerCase().trim();
  let skorTertinggi = 0;
  let topikTerpilih = null;

  for (const topik of DAFTAR_TOPIK) {
    let skor = 0;
    for (const kunci of topik.kunci) {
      if (teks.includes(kunci)) {
        skor += kunci.length;
      }
    }
    if (skor > skorTertinggi) {
      skorTertinggi = skor;
      topikTerpilih = topik;
    }
  }

  if (!topikTerpilih && topikTerakhir && teks.length > 0) {
    if (teks.endsWith('?') || teks.includes('itu') || teks.includes('juga')) {
      return topikTerakhir;
    }
  }

  if (skorTertinggi >= 3) return topikTerpilih;
  return null;
}

function ambilResponAcak(topik) {
  const daftar = topik.respon;
  return daftar[Math.floor(Math.random() * daftar.length)];
}

function responUmum(pesan) {
  const teks = pesan.toLowerCase().trim();

  if (teks.endsWith('?')) {
    return 'Hmm, pertanyaan bagus! Saya masih belajar nih. Coba tanya soal:\n- Python\n- Cara belajar\n- Keanggotaan\n- Bantuan\n\nAtau main langsung di Playground.';
  }

  return 'Siap! Ada yang lain yang ingin ditanyakan atau dibahas?\nKalau mau coba kode, tekan Playground di menu ya!';
}

async function prosesPesanCerdas(ctx, pesanPengguna) {
  const id = String(ctx.from.id);
  const topikTerakhir = konteksPengguna.get(id) || null;
  
  const topik = deteksiTopik(pesanPengguna, topikTerakhir);

  if (topik) {
    konteksPengguna.set(id, topik);
    const teks = ambilResponAcak(topik);
    await ctx.reply(teks, { parse_mode: 'Markdown' });
    return true;
  }

  konteksPengguna.delete(id);
  await ctx.reply(responUmum(pesanPengguna), { parse_mode: 'Markdown' });
  return false;
}

module.exports = {
  prosesPesanCerdas,
  deteksiTopik,
  DAFTAR_TOPIK
};
