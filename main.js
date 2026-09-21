require('dotenv').config();
const { Bot } = require('grammy');
const { tampilkanMenuUtama, bersihkanRiwayat, sesi } = require('./handlers/start');
const { tampilkanTentang } = require('./handlers/about');
const { prosesDaftar } = require('./handlers/auth');
const { tampilkanPlayground, prosesKodePython } = require('./handlers/playground');
const { prosesPesanCerdas } = require('./handlers/pintar');
const {
  penggunaMasukGrup,
  penggunaKeluarGrup,
  hitungAktivitas
} = require('./handlers/group');

const BOT_TOKEN = process.env.BOT_TOKEN;
const API_URL = process.env.API_URL;

const bot = new Bot(BOT_TOKEN);

bot.use(hitungAktivitas);

bot.command('start', async (ctx) => {
  await tampilkanMenuUtama(ctx, ctx.from.id);
});

bot.on(':new_chat_members', penggunaMasukGrup);
bot.on(':left_chat_member', penggunaKeluarGrup);

bot.callbackQuery('buat_akun', async (ctx) => {
  await ctx.answerCallbackQuery();
  const id = ctx.from.id;
  sesi[id] = {
    daftarPesan: [...(sesi[id]?.daftarPesan || [])],
    langkah: 'minta_nama'
  };
  const pesan = await ctx.reply('Silakan masukkan Nama Lengkap Anda:');
  sesi[id].daftarPesan.push(pesan.message_id);
});

bot.callbackQuery('tentang', tampilkanTentang);
bot.callbackQuery('playground', tampilkanPlayground);

bot.callbackQuery('kembali_menu', async (ctx) => {
  await ctx.answerCallbackQuery();
  const id = ctx.from.id;
  await bersihkanRiwayat(ctx, sesi[id]?.daftarPesan || []);
  await tampilkanMenuUtama(ctx, id);
});

bot.on('message', async (ctx) => {
  const id = ctx.from.id;
  const s = sesi[id];
  const teks = ctx.message.text;

  if (ctx.chat.type !== 'private') return;

  if (s) {
    if (s.langkah === 'minta_nama') {
      await prosesDaftar(ctx, id, s);
      return;
    }
    if (s.langkah === 'tunggu_kode_python') {
      await prosesKodePython(ctx, id, s);
      return;
    }
  }

  await prosesPesanCerdas(ctx, teks);
});

bot.catch = (err) => {
  console.error('Error:', err.message);
};

async function main() {
  if (!API_URL) {
    console.error('ERROR: API_URL belum diatur di .env');
    process.exit(1);
  }
  console.log('Bot berjalan...');
  await bot.start();
}

main().catch(err => console.error('Error:', err));