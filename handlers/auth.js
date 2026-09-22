const { InlineKeyboard } = require('grammy');
const { registerUser } = require('../services/api');
const { clearHistory, sesi } = require('./start');

async function fetchAvatar(ctx, userId) {
  try {
    const photos = await ctx.api.getUserProfilePhotos(userId, { limit: 1 });
    if (photos.total_count > 0) {
      const fileId = photos.photos[0][0].file_id;
      const file = await ctx.api.getFile(fileId);
      const avatarUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
      return { fileId, avatarUrl };
    }
  } catch {
    console.log('Tidak dapat mengambil foto profil');
  }
  return { fileId: null, avatarUrl: null };
}

function capitalizeFirstLetter(text) {
  return text.replace(/\b\w/g, c => c.toUpperCase());
}

async function processRegistration(ctx, id, userSession) {
  const name = ctx.message.text.trim();
  const username = ctx.from.username || 'Tidak ada';
  const telegramId = String(ctx.from.id);

  userSession.messageList.push(ctx.message.message_id);

  const waitMsg = await ctx.reply('⏳ Sedang memproses pendaftaran...');
  userSession.messageList.push(waitMsg.message_id);

  const { avatarUrl } = await fetchAvatar(ctx, id);

  const data = {
    name: name,
    username: username,
    telegram_id: telegramId,
    avatar_url: avatarUrl
  };

  console.log('Mengirim data ke API:', data);
  const apiRes = await registerUser(data);
  console.log('Respon API:', apiRes);

  await clearHistory(ctx, userSession.messageList);

  if (!apiRes || !apiRes.id) {
    await ctx.reply('❌ Pendaftaran gagal. Silakan coba lagi nanti.');
    delete sesi[id];
    return;
  }

  const backKeyboard = new InlineKeyboard()
    .text('Kembali ke Menu', 'kembali_menu');

  const infoText =
    '*Pendaftaran Berhasil!*\n\n' +
    'Berikut informasi akun Anda:\n\n' +
    (apiRes.member_code ? `Kode Member: \`${apiRes.member_code}\`\n` : '') +
    `Nama: ${capitalizeFirstLetter(apiRes.name || name)}\n` +
    `Username: @${apiRes.username || username}\n` +
    `Telegram ID: \`${apiRes.telegram_id || telegramId}\`\n` +
    (apiRes.generated_password ? `Password: \`${apiRes.generated_password}\`\n` : '') +
    '\nSilakan simpan informasi ini dengan baik.';

  await ctx.reply(infoText, {
    reply_markup: backKeyboard,
    parse_mode: 'Markdown'
  });

  delete sesi[id];
}

module.exports = { processRegistration };
