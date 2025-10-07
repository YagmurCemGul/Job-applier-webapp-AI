# ADIM 22 - Quick Start Guide 🚀

## ⚡ Hızlı Başlangıç (5 Dakika)

### 1. Firebase Firestore Aktifleştirme

```bash
# Firebase Console'a git
https://console.firebase.google.com

# Projenizi seçin
# Firestore Database → Create Database
# Test mode veya Production mode seçin
# Location seçin (örn: europe-west)
```

### 2. Security Rules Ekleme

Firebase Console → Firestore → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cvs/{cvId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                     request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Publish butonuna tıklayın.

### 3. Projeyi Başlatma

```bash
cd ai-cv-builder
npm install --legacy-peer-deps
npm run dev
```

### 4. Test

1. `http://localhost:5173` açın
2. Register ile yeni kullanıcı oluşturun
3. Dashboard'da yeni CV oluşturun
4. Header'da sync status'ü gözleyin (🔄 → ✅)

## 🎯 Temel Kullanım

### Sync Status İkonları

- 🔄 **Syncing...** - Senkronizasyon yapılıyor (mavi)
- ✅ **Synced** - Başarıyla senkronize edildi (yeşil)
- ❌ **Sync Error** - Hata oluştu (kırmızı)
- ⚠️ **Not Synced** - Henüz senkronize edilmedi (gri)

### Manuel Sync

Header'da sync status yanındaki **refresh butonu (🔄)** tıklayın.

### Initial Sync Dialog

İlk kez login yapıldığında ve hem local hem cloud'da veri varsa:

1. **Use Cloud Data** - Cloud'daki veriyi kullan
2. **Use Local Data** - Local veriyi cloud'a yükle
3. **Merge Both** - İkisini birleştir (önerilen)

## 🔥 Firebase Console Erişim

```
https://console.firebase.google.com
→ [Your Project]
→ Firestore Database
→ cvs collection
```

Her CV document'te:
- `id` - CV ID
- `userId` - User ID
- `name` - CV adı
- `cvData` - Tüm CV içeriği
- `lastModified` - Son güncelleme zamanı

## 📱 Multi-Device Kullanım

### Cihaz 1'de CV Oluşturma
1. Login ol
2. CV oluştur
3. Otomatik sync edilir

### Cihaz 2'de Erişim
1. Aynı hesap ile login ol
2. CV'ler otomatik yüklenir
3. İstersen manual sync yap

## 🐛 Hata Giderme

### Sync çalışmıyor
- ✅ Firebase config doğru mu? (`src/lib/firebase.config.ts`)
- ✅ Security rules eklendi mi?
- ✅ User login olmuş mu?
- ✅ Network bağlantısı var mı?

### "Permission denied" hatası
- ✅ Security rules doğru mu?
- ✅ `userId` doğru atanıyor mu?
- ✅ User authenticated mı?

### Sync sonsuz döngüye giriyor
- ✅ Auto-sync disable et: `disableAutoSync()`
- ✅ Manual sync kullan
- ✅ Page refresh yap

## 📝 Kod Örnekleri

### Store'dan Sync İşlemleri

```typescript
import { useCVDataStore } from '@/stores/cvData.store'

// Component içinde
const { syncToCloud, loadFromCloud, isSyncing, lastSyncTime } = useCVDataStore()

// Manuel sync
const handleSync = async () => {
  try {
    await syncToCloud()
    console.log('Sync successful!')
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

// Cloud'dan yükle
const handleLoad = async () => {
  try {
    await loadFromCloud()
    console.log('Load successful!')
  } catch (error) {
    console.error('Load failed:', error)
  }
}
```

### Firestore Service Kullanımı

```typescript
import { firestoreService } from '@/services/firestore.service'

// Kullanıcının tüm CV'lerini getir
const cvs = await firestoreService.getUserCVs(userId)

// Tek bir CV getir
const cv = await firestoreService.getCVById(cvId)

// CV kaydet
await firestoreService.saveCV(userId, cvData)

// CV sil
await firestoreService.deleteCV(cvId)

// Batch sync
await firestoreService.syncCVs(userId, [cv1, cv2, cv3])

// Cloud'da CV var mı?
const hasData = await firestoreService.hasCloudCVs(userId)
```

## 🎨 UI Componentleri

### SyncStatus Component

```tsx
import { SyncStatus } from '@/components/sync/SyncStatus'

// Header veya istediğin yere ekle
<SyncStatus />
```

### InitialSyncDialog Component

```tsx
import { InitialSyncDialog } from '@/components/sync/InitialSyncDialog'

// Layout'a ekle (otomatik çalışır)
<InitialSyncDialog />
```

## 🔐 Security Checklist

- [x] Firestore security rules aktif
- [x] User authentication zorunlu
- [x] userId validation yapılıyor
- [x] CRUD permissions kontrol ediliyor
- [x] Cross-user access engellenmiş

## ⚙️ Yapılandırma

### firebase.config.ts

```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
```

## 📊 Monitoring

### Browser DevTools

```javascript
// Store state'i kontrol et
useCVDataStore.getState()

// Sync log'ları
console.log('Syncing:', store.isSyncing)
console.log('Last Sync:', store.lastSyncTime)
console.log('Error:', store.syncError)
```

### Firebase Console

- **Firestore → cvs** - Tüm CV documents
- **Authentication → Users** - User listesi
- **Usage** - Quota kullanımı

## 🚦 Status Göstergeleri

| Icon | Durum | Açıklama |
|------|-------|----------|
| 🔄 | Syncing | Aktif senkronizasyon |
| ✅ | Synced | Başarılı sync |
| ❌ | Error | Hata var |
| ⚠️ | Not Synced | Sync yapılmamış |

## 🎯 Best Practices

1. **Her zaman merge kullanın** - Veri kaybını önler
2. **Manuel sync'i tercih edin** - Auto-sync sorun çıkarabilir
3. **Offline çalışmayı göz önünde bulundurun** - localStorage fallback var
4. **Error handling ekleyin** - Network sorunları olabilir
5. **Security rules test edin** - Üretim öncesi mutlaka

## 🎉 Başarı Kontrolü

Aşağıdakileri yapabiliyorsanız başarılısınız:

- [x] CV oluşturdum ve cloud'a sync edildi
- [x] Farklı cihazda login yapınca CV'ler geldi
- [x] Manuel sync butonu çalışıyor
- [x] Sync status doğru gösteriliyor
- [x] InitialSyncDialog çalışıyor
- [x] CV silince cloud'dan da siliniyor

## 📚 Dokümantasyon

- **ADIM-22-TAMAMLANDI.md** - Detaylı implementasyon
- **ADIM-22-TEST-GUIDE.md** - Test senaryoları
- **ADIM-22-QUICK-START.md** - Bu dosya

## 💡 İpuçları

### Performans
- Büyük CV'ler için batch sync kullanın
- Debouncing ekleyin (her tuşa sync yapmayın)
- Offline modu kullanın

### Güvenlik
- API keys'i .env'de tutun
- Security rules'ı production'da sıkılaştırın
- User permissions'ı düzenli kontrol edin

### Debugging
- Browser console'u açık tutun
- Firebase Console'da real-time değişiklikleri izleyin
- Network tab'ı kontrol edin

## 🔗 Faydalı Linkler

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [date-fns Documentation](https://date-fns.org/)

---

**Kolay gelsin! 🚀**

Sorun olursa:
1. Console log'larını kontrol edin
2. Firebase Console'u kontrol edin
3. Security rules'ı gözden geçirin
4. Network bağlantısını kontrol edin
