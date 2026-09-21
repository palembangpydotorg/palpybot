const { InlineKeyboard } = require('grammy');
const { daftarPengguna } = require('../services/api');
const { bersihkanRiwayat, sesi } = require('./start');

async function ambilAvatar(ctx, userId) {
  try {
    const foto = await ctx.api.getUserProfilePhotos(userId, { limit: 1 });
    if (foto.total_count > 0) {
      const fileId = foto.photos[0][0].file_id;
      
      const file = await ctx.api.getFile(fileId);
      const avatarUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
      
      return { fileId, avatarUrl };
    }
  } catch {
    console.log('Tidak dapat mengambil foto profil');
  }
  return { fileId: null, avatarUrl: null };
}

async function prosesDaftar(ctx, id, sesiPengguna) {
  const nama = ctx.message.text.trim();
  const username = ctx.from.username || 'Tidak ada';
  const telegramId = String(ctx.from.id);

  sesiPengguna.daftarPesan.push(ctx.message.message_id);

  const { fileId: fotoFileId, avatarUrl } = await ambilAvatar(ctx, id);

  const data = {
    name: nama.toLowerCase(),
    username: username.toLowerCase(),
    telegram_id: telegramId,
    avatar_url: avatarUrl
  };

  console.log('Mengirim data ke API:', data);
  const resApi = await daftarPengguna(data);
  console.log('Respon API:', resApi);

  await bersihkanRiwayat(ctx, sesiPengguna.daftarPesan);

  const kembaliKb = new InlineKeyboard()
    .text('Kembali ke Menu', 'kembali_menu');

  const teksInfo =
    '*Pendaftaran Berhasil!*\n\n' +
    'Berikut informasi akun Anda:\n\n' +
    (resApi.member_code ? `Kode Member: \`${resApi.member_code}\`\n` : '') +
    `Nama: ${resApi.name.toTitleCase()}\n` +
    `Username: @${resApi.username}\n` +
    `Telegram ID: \`${resApi.telegram_id}\`\n` +
    (resApi.generated_password ? `Password: \`${resApi.generated_password}\`\n` : '') +
    '\n⚠️ *Silakan simpan informasi ini dengan baik.*';

  if (fotoFileId) {
    await ctx.replyWithPhoto(fotoFileId, {
      caption: teksInfo,
      reply_markup: kembaliKb,
      parse_mode: 'Markdown'
    });
  } else {
    await ctx.reply(teksInfo, {
      reply_markup: kembaliKb,
      parse_mode: 'Markdown'
    });
  }

  delete sesi[id];
}

module.exports = { prosesDaftar };