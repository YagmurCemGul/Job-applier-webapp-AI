# ADIM 22 - Firestore Cloud CV Storage Test Rehberi

## 🧪 Test Hazırlığı

### 1. Firebase Yapılandırması

**Firebase Console Adımları:**

1. [Firebase Console](https://console.firebase.google.com) açın
2. Projenizi seçin
3. **Firestore Database** bölümüne gidin
4. **Rules** sekmesine tıklayın
5. Aşağıdaki kuralları ekleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // CVs collection
    match /cvs/{cvId} {
      // Users can only read/write their own CVs
      allow read, write: if request.auth != null && 
                          request.auth.uid == resource.data.userId;
      
      // Allow create if authenticated
      allow create: if request.auth != null && 
                     request.auth.uid == request.resource.data.userId;
    }
  }
}
```

6. **Publish** butonuna tıklayın

### 2. Proje Başlatma

```bash
cd ai-cv-builder
npm install --legacy-peer-deps
npm run dev
```

## 📋 Test Senaryoları

### TEST 1: İlk Kez Giriş (Local Data → Cloud)

**Amaç:** Local'de CV'ler varken ilk kez cloud sync

**Adımlar:**
1. Browser'da yeni bir incognito/private window açın
2. `http://localhost:5173` adresine gidin
3. Yeni bir kullanıcı oluşturun (Register)
4. Dashboard'a gidin
5. 2-3 adet CV oluşturun
6. Logout yapın
7. Normal browser'da aynı kullanıcı ile login yapın

**Beklenen Sonuç:**
- ✅ InitialSyncDialog açılmalı
- ✅ "Local Device: 2-3 CVs" gösterilmeli
- ✅ "Cloud: 0 CVs" gösterilmeli
- ✅ "Use Local Data" seçildiğinde CV'ler cloud'a upload edilmeli
- ✅ Sync status "Synced" olmalı

**Doğrulama:**
- Firebase Console → Firestore → cvs collection → 2-3 document olmalı
- Her document'te userId, cvData, timestamps olmalı

---

### TEST 2: Cloud Data → Local

**Amaç:** Farklı cihazda login yapınca cloud'dan CV'leri yükle

**Adımlar:**
1. Browser'ın Application/Storage → IndexedDB → cv-data-storage'ı temizleyin
2. Sayfayı yenileyin
3. Aynı kullanıcı ile login yapın

**Beklenen Sonuç:**
- ✅ CV'ler otomatik olarak cloud'dan yüklenmeli
- ✅ Dashboard'da tüm CV'ler görünmeli
- ✅ Sync status "Synced" olmalı

**Doğrulama:**
- Dashboard'da CV listesi cloud ile aynı olmalı
- Her CV'nin içeriği doğru olmalı

---

### TEST 3: Manual Sync

**Amaç:** Manuel senkronizasyon butonunu test et

**Adımlar:**
1. Dashboard'da bir CV düzenleyin
2. Header'daki sync status'e tıklayın
3. Refresh butonu (🔄) tıklayın

**Beklenen Sonuç:**
- ✅ Status "Syncing..." olmalı (mavi)
- ✅ 1-2 saniye sonra "Synced" olmalı (yeşil)
- ✅ Tooltip'te "Last synced X seconds ago" gösterilmeli

**Doğrulama:**
- Firebase Console'da document'in lastModified timestamp'i güncel olmalı

---

### TEST 4: Otomatik Sync (Save)

**Amaç:** CV kaydedildiğinde otomatik sync

**Adımlar:**
1. CV Builder'a gidin
2. Yeni bir CV oluşturun
3. Personal Info, Experience vb. ekleyin
4. "Save CV" butonuna tıklayın
5. Header'daki sync status'ü gözlemleyin

**Beklenen Sonuç:**
- ✅ CV kaydedilir kaydedilmez sync başlamalı
- ✅ Status "Syncing..." → "Synced" olmalı
- ✅ Firebase Console'da yeni document oluşmalı

**Doğrulama:**
- Firestore'da yeni CV document'i olmalı
- Document içinde tüm data (personalInfo, experience, education) olmalı

---

### TEST 5: Otomatik Sync (Delete)

**Amaç:** CV silindiğinde cloud'dan da silinmesi

**Adımlar:**
1. Dashboard'da bir CV seçin
2. "Delete" butonuna tıklayın
3. Confirm yapın
4. Sync status'ü gözlemleyin

**Beklenen Sonuç:**
- ✅ CV local'den silinmeli
- ✅ Sync başlamalı
- ✅ Firebase Console'da document silinmiş olmalı

**Doğrulama:**
- Firestore'da CV document'i olmamalı
- Dashboard'da CV görünmemeli

---

### TEST 6: Merge Senaryosu

**Amaç:** Local ve cloud'da farklı CV'ler varsa merge

**Hazırlık:**
1. Browser 1'de login ol, CV-A oluştur
2. Browser 2'de login ol, CV-B oluştur
3. Her ikisinde de IndexedDB'de farklı CV'ler olmalı

**Adımlar:**
1. Browser 1'de logout yap
2. Browser 1'de tekrar login yap
3. InitialSyncDialog'u gözle

**Beklenen Sonuç:**
- ✅ Dialog açılmalı
- ✅ "Local: 1 CV" (CV-A)
- ✅ "Cloud: 1 CV" (CV-B)
- ✅ "Merge Both" seçildiğinde:
  - Her iki CV de olmalı
  - Duplicate yoksa 2 CV olmalı

**Doğrulama:**
- Dashboard'da 2 CV olmalı
- Firebase Console'da 2 document olmalı

---

### TEST 7: Aynı CV'nin Farklı Versiyonları

**Amaç:** Conflict resolution - newer wins

**Hazırlık:**
1. CV-A'yı oluştur (saat 10:00)
2. Cloud'a sync et
3. Offline ol
4. CV-A'yı düzenle (saat 10:05)
5. Online ol

**Adımlar:**
1. Sync butonuna bas
2. lastModified timestamp'lerini karşılaştır

**Beklenen Sonuç:**
- ✅ Local CV daha yeni ise local kazanmalı
- ✅ Cloud CV daha yeni ise cloud kazanmalı
- ✅ Sync tamamlanmalı

**Doğrulama:**
- En son düzenlenen versiyon hem local'de hem cloud'da olmalı

---

### TEST 8: Error Handling

**Amaç:** Network hatası durumunda error gösterimi

**Adımlar:**
1. Browser DevTools → Network tab → Offline yap
2. CV oluştur ve kaydet
3. Sync status'ü gözle

**Beklenen Sonuç:**
- ✅ Sync başlayacak ama başarısız olacak
- ✅ Status "Sync Error" (kırmızı) olmalı
- ✅ Tooltip'te error mesajı gösterilmeli

**Adımlar (devam):**
4. Network → Online yap
5. Sync butonuna tekrar bas

**Beklenen Sonuç:**
- ✅ Bu sefer başarılı olmalı
- ✅ Status "Synced" (yeşil) olmalı

---

### TEST 9: Çoklu CV Batch Sync

**Amaç:** Birden fazla CV'nin toplu senkronizasyonu

**Adımlar:**
1. Offline ol
2. 5 adet CV oluştur
3. Online ol
4. Sync butonuna bas

**Beklenen Sonuç:**
- ✅ Tüm CV'ler batch olarak sync edilmeli
- ✅ Firebase'de 5 document oluşmalı
- ✅ Sync süresi makul olmalı (< 3 saniye)

**Doğrulama:**
- Firestore'da 5 document olmalı
- Hepsi aynı userId'ye sahip olmalı

---

### TEST 10: Security Rules Testi

**Amaç:** Başka kullanıcının CV'sini okuyamama

**Adımlar:**
1. User-A ile login ol, CV oluştur
2. Firebase Console'dan CV document ID'sini al
3. User-B ile login ol
4. Browser Console'da:

```javascript
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase.config'

const cvRef = doc(db, 'cvs', 'USER_A_CV_ID')
const cvDoc = await getDoc(cvRef)
console.log(cvDoc.exists()) // false olmalı
```

**Beklenen Sonuç:**
- ✅ User-B, User-A'nın CV'sini okuyamamalı
- ✅ Permission denied hatası almalı

---

### TEST 11: Multi-Device Real-time

**Amaç:** Bir cihazda yapılan değişiklik diğerinde görünmesi

**Adımlar:**
1. Browser 1'de login ol
2. Browser 2'de aynı kullanıcı ile login ol
3. Browser 1'de CV oluştur
4. Browser 2'de manual sync yap (refresh button)

**Beklenen Sonuç:**
- ✅ Browser 2'de yeni CV görünmeli

---

### TEST 12: Large CV Data

**Amaç:** Büyük CV verilerinin sync performansı

**Adımlar:**
1. Çok detaylı bir CV oluştur:
   - 10+ experience
   - 5+ education
   - 20+ skills
   - 5+ projects
   - Uzun description'lar
2. Save ve sync et
3. Sync süresini ölç

**Beklenen Sonuç:**
- ✅ Sync başarılı olmalı
- ✅ Süre makul olmalı (< 5 saniye)
- ✅ Tüm data kaydedilmiş olmalı

**Doğrulama:**
- Firestore'da document size kontrol et (max 1MB)
- Tüm nested data (experience, education) doğru kayıtlı olmalı

---

## 🔍 Console Kontrolleri

### Firestore Document Structure Kontrolü

```javascript
// Expected structure
{
  id: "uuid",
  userId: "firebase-user-id",
  name: "My CV",
  description: "Description text",
  templateId: "template-modern",
  isPrimary: false,
  version: 1,
  tags: ["tag1", "tag2"],
  atsScore: 85,
  createdAt: Timestamp,
  lastModified: Timestamp,
  cvData: {
    id: "uuid",
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+1234567890",
      location: {...}
    },
    experience: [...],
    education: [...],
    skills: [...],
    projects: [...],
    createdAt: Timestamp,
    updatedAt: Timestamp
  }
}
```

### Browser Console Debug

```javascript
// Check store state
import { useCVDataStore } from '@/stores/cvData.store'

const store = useCVDataStore.getState()
console.log('Syncing:', store.isSyncing)
console.log('Last Sync:', store.lastSyncTime)
console.log('Sync Error:', store.syncError)
console.log('Saved CVs:', store.savedCVs)

// Manual sync test
await store.syncToCloud()
console.log('Sync completed')

// Load from cloud test
await store.loadFromCloud()
console.log('Load completed')
```

## ✅ Test Checklist

### Functionality
- [ ] Initial sync dialog görünüyor
- [ ] Use Local Data çalışıyor
- [ ] Use Cloud Data çalışıyor
- [ ] Merge Both çalışıyor
- [ ] Manual sync butonu çalışıyor
- [ ] Auto-sync (save) çalışıyor
- [ ] Auto-sync (delete) çalışıyor
- [ ] Sync status doğru gösteriliyor
- [ ] Last sync time doğru gösteriliyor
- [ ] Error handling çalışıyor

### UI/UX
- [ ] Sync status icon'ları doğru
- [ ] Tooltip'ler çalışıyor
- [ ] Loading states gösteriliyor
- [ ] Error messages gösteriliyor
- [ ] Responsive tasarım çalışıyor

### Data Integrity
- [ ] CV data tam kaydediliyor
- [ ] Timestamps doğru dönüşüyor
- [ ] User ID doğru atanıyor
- [ ] Merge stratejisi doğru çalışıyor
- [ ] Duplicate prevention çalışıyor

### Security
- [ ] Sadece authenticated users sync yapabiliyor
- [ ] Users sadece kendi CV'lerini görebiliyor
- [ ] Security rules çalışıyor
- [ ] Permission errors handle ediliyor

### Performance
- [ ] Sync süreleri makul
- [ ] Batch operations çalışıyor
- [ ] Network errors gracefully handle ediliyor
- [ ] UI freeze olmuyor

## 🐛 Bilinen Sorunlar ve Çözümler

### Sorun: "Permission denied" hatası
**Çözüm:** Firestore security rules'ın doğru ayarlandığından emin olun

### Sorun: Sync infinite loop
**Çözüm:** Auto-sync fonksiyonunda debouncing eksik, manual sync kullanın

### Sorun: Date serialization hatası
**Çözüm:** Date objelerinin Timestamp'e doğru dönüştüğünden emin olun

### Sorun: Network error sonrası sync çalışmıyor
**Çözüm:** Page refresh yapın veya manual sync tekrar deneyin

## 📊 Test Sonuç Raporu Template

```markdown
## Test Sonuçları

**Test Tarihi:** [TARİH]
**Tester:** [İSİM]

### TEST 1: İlk Kez Giriş
- Status: ✅ PASS / ❌ FAIL
- Notes: [Notlar]

### TEST 2: Cloud Data → Local
- Status: ✅ PASS / ❌ FAIL
- Notes: [Notlar]

[... diğer testler ...]

### Genel Notlar
[Genel gözlemler ve öneriler]

### Bulunan Buglar
1. [Bug açıklaması]
2. [Bug açıklaması]
```

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Tarih:** 7 Ekim 2025
