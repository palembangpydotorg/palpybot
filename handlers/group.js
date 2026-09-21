require('dotenv').config();
const { cekTerdaftar, tambahPoin } = require('../services/api');

const GROUP_ID = process.env.GROUP_CHAT_ID;

// === Saat ada pengguna baru masuk grup ===
async function penggunaMasukGrup(ctx) {
  const anggotaBaru = ctx.message.new_chat_members;

  for (const user of anggotaBaru) {
    // Abaikan kalau yang masuk adalah bot sendiri
    if (user.is_bot) continue;

    const userId = String(user.id);
    const nama = user.first_name || 'Teman';

    // 1. Cek sudah daftar belum
    const dataAnggota = await cekTerdaftar(userId);

    if (!dataAnggota) {
      // ❌ Belum daftar → keluarkan & beri tahu
      await ctx.reply(
        `👋 Halo ${nama}!\n\n` +
        `Maaf, untuk bergabung di grup PalembangPy silakan daftar dulu.\n` +
        `Kirim pesan ke saya secara pribadi /start untuk mendaftar.\n\n` +
        `Setelah berhasil daftar, saya akan undang kamu masuk ke grup. ✅`
      );
      await ctx.api.banChatMember(ctx.chat.id, userId);
      await ctx.api.unbanChatMember(ctx.chat.id, userId); // Buka blokir agar bisa diundang nanti
      continue;
    }

    // ✅ Sudah daftar → sambut & beri poin
    await ctx.reply(
      `🎉 Selamat datang, ${nama}!\n\n` +
      `Senang kamu bergabung di grup PalembangPy 🐍\n` +
      `Kode Member: \`${dataAnggota.member_code || '-'}\`\n` +
      `Semoga aktif berbagi & belajar bersama ya! 💪`,
      { parse_mode: 'Markdown' }
    );

    // Tambah poin masuk
    await tambahPoin(userId, 5);
  }
}

// === Saat pengguna keluar grup ===
async function penggunaKeluarGrup(ctx) {
  const user = ctx.message.left_chat_member;
  if (user.is_bot) return;

  const nama = user.first_name || 'Teman';
  await ctx.reply(
    `👋 Sampai jumpa, ${nama}...\n` +
    `Terima kasih sudah pernah bergabung di PalembangPy 🐍\n` +
    `Kapan-kapan kembali lagi ya!`
  );
}

// === Cek poin setiap pesan dari anggota aktif ===
async function hitungAktivitas(ctx, next) {
  // Abaikan kalau bukan di grup resmi
  if (String(ctx.chat.id) !== GROUP_ID) return await next();

  const userId = String(ctx.from.id);
  if (ctx.from.is_bot) return await next();

  // Cek sudah terdaftar & beri poin aktivitas
  const dataAnggota = await cekTerdaftar(userId);
  if (dataAnggota) {
    await tambahPoin(userId, 1);
  }

  await next();
}

// === Bot undang pengguna yang sudah daftar ===
async function undangKeGrup(ctx, userId) {
  try {
    await ctx.api.unbanChatMember(GROUP_ID, userId);
    await ctx.api.exportChatInviteLink(GROUP_ID).then(async (link) => {
      await ctx.reply(
        `✅ Akun sudah terdaftar!\n\n` +
        `Silakan masuk ke grup lewat tautan ini:\n${link.invite_link}\n\n` +
        `Selamat bergabung! 🐍`
      );
    });
    return true;
  } catch (e) {
    console.log('Gagal undang:', e.message);
    await ctx.reply('✅ Sudah terdaftar! Silakan masuk ke grup sekarang.');
    return false;
  }
}

module.exports = {
  penggunaMasukGrup,
  penggunaKeluarGrup,
  hitungAktivitas,
  undangKeGrup
};