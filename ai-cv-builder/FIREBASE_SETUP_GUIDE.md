# 🔥 Firebase Console Kurulum Rehberi

## ADIM 1: Firebase Projesi Oluştur

1. **Firebase Console'a Git**
   - https://console.firebase.google.com/ adresine git
   - Google hesabınla giriş yap

2. **Yeni Proje Oluştur**
   - "Add project" veya "Create a project" butonuna tıkla
   - Proje adı: `ai-cv-builder` (veya istediğin başka bir isim)
   - "Continue" tıkla

3. **Google Analytics (Opsiyonel)**
   - Google Analytics'i aktif et istersen (önerilir)
   - Analytics location: Europe
   - "Create project" tıkla
   - Proje oluşturulmasını bekle (~30 saniye)

## ADIM 2: Authentication Kurulumu

1. **Authentication'ı Başlat**
   - Sol menüden "Authentication" seç
   - "Get started" butonuna tıkla

2. **Email/Password Provider'ı Aktifleştir**
   - "Sign-in method" tab'ına git
   - "Email/Password" satırına tıkla
   - "Enable" toggle'ı aç
   - "Email link (passwordless sign-in)" kapalı kalabilir
   - "Save" tıkla ✅

3. **Google Provider'ı Aktifleştir**
   - "Google" satırına tıkla
   - "Enable" toggle'ı aç
   - Project support email seç (kendi emailin)
   - "Save" tıkla ✅

4. **Authorized Domains**
   - "Settings" tab'ına git
   - Authorized domains'de `localhost` olduğunu kontrol et
   - Production'da domain'ini ekle

## ADIM 3: Firestore Database Kurulumu

1. **Firestore'u Başlat**
   - Sol menüden "Firestore Database" seç
   - "Create database" butonuna tıkla

2. **Database Ayarları**
   - Location: `europe-west1` (Frankfurt) seç
   - "Next" tıkla

3. **Security Rules**
   - **Production mode** seç (önerilen)
   - "Create" tıkla
   - Database oluşturulmasını bekle

4. **Security Rules'ı Güncelle**
   - "Rules" tab'ına git
   - Şu kuralları yapıştır:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - sadece kendi dokümanını okuyabilir/yazabilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // CVs collection (gelecek için hazır)
    match /cvs/{cvId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

   - "Publish" tıkla ✅

## ADIM 4: Web App Config Alma

1. **Project Settings'e Git**
   - Sol üstte ⚙️ (Settings) ikonuna tıkla
   - "Project settings" seç

2. **Web App Ekle**
   - "General" tab'ında, "Your apps" bölümüne in
   - Web app ikonu **`</>`** tıkla
   - App nickname: `ai-cv-builder-web`
   - "Firebase Hosting" checkbox'ını işaretleme (şimdilik)
   - "Register app" tıkla

3. **Firebase Config'i Kopyala**
   - Ekranda görünen config nesnesini kopyala:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "ai-cv-builder.firebaseapp.com",
  projectId: "ai-cv-builder",
  storageBucket: "ai-cv-builder.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

4. **Config'i .env Dosyasına Yapıştır**
   - `/workspace/ai-cv-builder/.env` dosyasını aç
   - Firebase değerlerini doldur:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ai-cv-builder.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-cv-builder
VITE_FIREBASE_STORAGE_BUCKET=ai-cv-builder.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

   - Dosyayı kaydet ✅

## ADIM 5: Storage Kurulumu (Opsiyonel - Gelecek için)

1. **Storage'ı Başlat**
   - Sol menüden "Storage" seç
   - "Get started" tıkla
   - "Start in production mode" seç
   - "Next" tıkla
   - Location: `europe-west1` seç
   - "Done" tıkla

2. **Security Rules** (gelecek için hazır):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## ADIM 6: Uygulamayı Test Et

1. **Dev Server'ı Başlat**
```bash
cd /workspace/ai-cv-builder
npm run dev
```

2. **Tarayıcıda Aç**
   - http://localhost:5173/register
   - Yeni hesap oluştur
   - Email verification emaili kontrol et

3. **Firebase Console'da Kontrol Et**
   - Authentication > Users: Yeni kullanıcı görünmeli
   - Firestore > users > [userId]: User dokümanı görünmeli

## SORUN GİDERME

### "Missing Firebase configuration" Hatası
**Çözüm:** `.env` dosyasındaki tüm `VITE_FIREBASE_*` değişkenlerinin dolu olduğundan emin ol.

### Google Login Çalışmıyor
**Çözüm:** 
1. Firebase Console > Authentication > Sign-in method > Google'ı enable et
2. Support email seç
3. Authorized domains'e localhost var mı kontrol et

### Email Gelmiyor
**Çözüm:**
1. Spam klasörünü kontrol et
2. Firebase Console > Authentication > Templates: Email templates'i kontrol et
3. Sender email adresini doğrula

### Firestore Permission Denied
**Çözüm:**
1. Rules tab'ında güvenlik kurallarını kontrol et
2. Authentication ile giriş yaptığından emin ol
3. User ID'nin doğru olduğunu kontrol et

## GÜVENLİK NOTLARI

⚠️ **ÖNEMLİ:**
- `.env` dosyasını asla Git'e commit etme!
- Production'da API key restrictions ekle
- Email verification'ı zorunlu hale getir
- Rate limiting ekle
- Firestore security rules'ı dikkatlice ayarla

## TAMAMLANDI! ✅

Artık uygulamanda:
- ✅ Kullanıcı kaydı
- ✅ Email/Password girişi  
- ✅ Google OAuth girişi
- ✅ Password reset
- ✅ Email verification
- ✅ Protected routes
- ✅ User data storage

çalışıyor olmalı!

**İyi kodlamalar! 🚀**
