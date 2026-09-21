const { InlineKeyboard } = require('grammy');
const { sesi } = require('./start');

let pyodide = null;

async function muatPyodide() {
  if (!pyodide) {
    const { loadPyodide } = await import('pyodide');
    pyodide = await loadPyodide();
    console.log('✅ Pyodide Ready');
  }
  return pyodide;
}

muatPyodide();

async function jalankanKode(kodeMentah) {
  let kode = kodeMentah.trim();
  
  const cocok = kode.match(/```(?:python)?\n?([\s\S]*?)\n?```/);
  if (cocok) kode = cocok[1].trim();

  if (!kode) return { sukses: false, hasil: '❌ Kode tidak ditemukan' };

  const pd = await muatPyodide();

  try {
    const kodeLengkap = `
import sys
from io import StringIO
_out = StringIO()
sys.stdout = _out
sys.stderr = _out

${kode}

sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
_out.getvalue()
    `.trim();

    const hasil = await pd.runPythonAsync(kodeLengkap);
    const keluar = (hasil || '').trim();
    
    return { 
      sukses: true, 
      hasil: keluar || '(selesai, tidak ada output)' 
    };
  } catch (err) {
    return { sukses: false, hasil: `Error:\n${err.message}` };
  }
}

async function tampilkanPlayground(ctx) {
  await ctx.answerCallbackQuery();
  const id = ctx.from.id;

  const kembaliKb = new InlineKeyboard()
    .text('Kembali ke Menu', 'kembali_menu');

  const pesan = await ctx.reply(
    '🐍 *Playground Python*\n\n' +
    'Ketik kode Python di bawah ini:\n' +
    'Contoh: `print("Halo PalembangPy!")`',
    { parse_mode: 'Markdown' }
  );

  sesi[id] = {
    daftarPesan: [pesan.message_id],
    langkah: 'tunggu_kode_python'
  };
}

async function prosesKodePython(ctx, id, sesiPengguna) {
  const kodeMentah = ctx.message.text;
  sesiPengguna.daftarPesan.push(ctx.message.message_id);

  const hasil = await jalankanKode(kodeMentah);

  const tombol = new InlineKeyboard()
    .text('Coba Lagi', 'playground')
    .text('Kembali ke Menu', 'kembali_menu');

  const teks =
    '🐍 *Hasil*\n' +
    '```python\n' + hasil.hasil + '\n```';

  await ctx.reply(teks, {
    reply_markup: tombol,
    parse_mode: 'Markdown'
  });

  delete sesi[id];
}

module.exports = {
  tampilkanPlayground,
  prosesKodePython
};