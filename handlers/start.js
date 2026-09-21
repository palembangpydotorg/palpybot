const { InlineKeyboard, InputFile } = require('grammy');
const fs = require('fs');
const path = require('path');

const sesi = {};
module.exports = {
  sesi,
  bersihkanRiwayat,
  tampilkanMenuUtama
};

async function bersihkanRiwayat(ctx, daftarPesanId) {
  for (const id of daftarPesanId) {
    try {
      await ctx.api.deleteMessage(ctx.chat.id, id);
    } catch (e) {
      console.log('Gagal hapus pesan:', e.message);
    }
  }
}

async function tampilkanMenuUtama(ctx, idPengguna) {
  const photoPath = path.join(__dirname, '..', 'palembangpy.jpg');
  
  if (!fs.existsSync(photoPath)) {
    await ctx.reply('File gambar tidak ditemukan di folder utama.');
    return;
  }

  const keyboard = new InlineKeyboard()
    .text('Buat Akun', 'buat_akun')
    .text('Tentang', 'tentang')
    .row()
    .url('Ikuti Kami', 'https://instagram.com/palembangpy')
    .url('💜 Beri Dukungan', 'https://sociabuzz.com/palembangpy/tribe')
    .row()
    .text('🐍 Playground', 'playground');
    
  const pesan = await ctx.replyWithPhoto(new InputFile(photoPath), {
    caption: 'Selamat Datang di PalembangPy!\n' +
      'Komunitas Pengembang Python Kota Palembang\n' +
      'Belajar, Berbagi, dan Berkembang Bersama.\n' +
      'Silakan pilih menu di bawah',
    reply_markup: keyboard
  });

  sesi[idPengguna] = { daftarPesan: [pesan.message_id] };
}