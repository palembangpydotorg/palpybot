const { InlineKeyboard } = require('grammy');

const sesi = {};

async function clearHistory(ctx, messageIdList) {
  for (const msgId of messageIdList) {
    try {
      await ctx.api.deleteMessage(ctx.chat.id, msgId);
    } catch (e) {
      console.log('Gagal hapus pesan:', e.message);
    }
  }
}

async function showMainMenu(ctx, userId) {
  const keyboard = new InlineKeyboard()
    .text('Buat Akun', 'buat_akun')
    .text('Tentang', 'tentang')
    .row()
    .url('Ikuti Kami', 'https://instagram.com/palembangpy')
    .url('Beri Dukungan', 'https://sociabuzz.com/palembangpy/tribe')
    .row()
    .text('Playground', 'playground');
    
  const message = await ctx.reply(
    'Selamat Datang di PalembangPy!\n' +
    'Komunitas Pengembang Python Kota Palembang\n' +
    'Belajar, Berbagi, dan Berkembang Bersama.\n' +
    'Silakan pilih menu di bawah',
    { reply_markup: keyboard }
  );

  sesi[userId] = { messageList: [message.message_id] };
}

module.exports = {
  sesi,
  clearHistory,
  showMainMenu
};
