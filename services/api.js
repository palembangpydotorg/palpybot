require('dotenv').config();
const API_URL = process.env.API_URL;

// Peta: telegram_id → user_id (UUID)
const petaPengguna = new Map();

async function daftarPengguna(data) {
  try {
    const res = await fetch(`${API_URL}/v1/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        username: data.username,
        telegram_id: data.telegram_id,
        avatar_url: data.avatar_url
      })
    });
    const hasil = await res.json();
    
    if (hasil.telegram_id && hasil.id) {
      petaPengguna.set(String(hasil.telegram_id), hasil.id);
    }
    return hasil;
  } catch (e) {
    return { sukses: false, pesan: 'Gagal terhubung ke server' };
  }
}

// GET /v1/users/telegram/{telegram_id}
async function cekTerdaftar(telegramId) {
  try {
    const id = String(telegramId);
    const res = await fetch(`${API_URL}/v1/users/telegram/${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.id) {
        petaPengguna.set(id, data.id);
      }
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

// PATCH /v1/users/{user_id} — field: points
async function tambahPoin(telegramId, poinTambah = 1) {
  try {
    const id = String(telegramId);
    let userId = petaPengguna.get(id);
    
    if (!userId) {
      const data = await cekTerdaftar(id);
      if (!data || !data.id) return null;
      userId = data.id;
    }

    const res = await fetch(`${API_URL}/v1/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        points: poinTambah  // ✅ Field persis sesuai struktur
      })
    });
    return await res.json();
  } catch (e) {
    console.log('Gagal menambah poin:', e.message);
    return null;
  }
}

module.exports = {
  daftarPengguna,
  cekTerdaftar,
  tambahPoin
};