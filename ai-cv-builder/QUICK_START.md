# 🚀 Quick Start Guide - ADIM 5

## Firebase Kurulumu (5 Dakika)

### 1. Firebase Console'da Proje Oluştur
```
https://console.firebase.google.com/
→ Add project
→ Proje adı: "ai-cv-builder"
→ Create project
```

### 2. Authentication'ı Aktifleştir
```
Authentication → Get started
→ Sign-in method
→ Email/Password → Enable ✅
→ Google → Enable ✅
```

### 3. Firestore Database Oluştur
```
Firestore Database → Create database
→ Production mode
→ Location: europe-west1
→ Create
```

### 4. Web App Config Al
```
Project Settings → Your apps
→ </> Web app ekle
→ Nickname: "ai-cv-builder-web"
→ Register app
→ Config'i kopyala
```

### 5. .env Dosyasını Doldur
```bash
cd /workspace/ai-cv-builder
nano .env  # veya editor'ünle aç
```

Şu satırları Firebase Console'dan aldığın bilgilerle doldur:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ai-cv-builder.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-cv-builder
VITE_FIREBASE_STORAGE_BUCKET=ai-cv-builder.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 6. Uygulamayı Başlat
```bash
npm run dev
```

### 7. Test Et
```
http://localhost:5173/register
→ Yeni hesap oluştur
→ Email verification emaili kontrol et
→ /login ile giriş yap
→ /dashboard görünmeli ✅
```

## Sorun mu var?

### Firebase config hatası
```bash
# .env dosyasının tüm Firebase değerlerini doldurduğundan emin ol
cat .env | grep VITE_FIREBASE
```

### Build hatası
```bash
npm install --legacy-peer-deps
npm run build
```

### Type hatası
```bash
npm run type-check
```

## Dosya Konumları

- **Firebase Config**: `src/config/firebase.ts`
- **Auth Service**: `src/services/auth.service.ts`
- **Auth Hook**: `src/hooks/useAuth.ts`
- **Login Page**: `src/pages/Login.tsx`
- **Register Page**: `src/pages/Register.tsx`
- **Protected Route**: `src/components/auth/ProtectedRoute.tsx`

## Sonraki Adım

ADIM 5 tamamlandı! Artık ADIM 6'ya geçebilirsin.

Detaylı bilgi için:
- `ADIM-5-TAMAMLANDI.md` - Tam özet
- `FIREBASE_SETUP_GUIDE.md` - Detaylı Firebase rehberi
