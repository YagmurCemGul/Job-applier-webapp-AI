# 🧪 ADIM 24 - TEST GUIDE

## Advanced Export & Sharing Test Rehberi

Bu rehber, ADIM 24'te eklenen Advanced Export ve Sharing özelliklerini test etmek için adım adım yönergeler içerir.

---

## 🔧 ÖN HAZIRLIK

### 1. Gerekli Bağımlılıkları Kontrol Et
```bash
cd /workspace/ai-cv-builder
npm list qrcode jszip file-saver lucide-react
```

**Beklenen Çıktı:**
```
├── qrcode@1.5.3
├── jszip@3.10.1
├── file-saver@2.0.5
└── lucide-react@0.545.0
```

### 2. Dev Server'ı Başlat
```bash
cd /workspace/ai-cv-builder
npm run dev
```

### 3. Firebase'e Giriş Yap
- Browser'da uygulamayı aç
- Email/password ile giriş yap
- Dashboard'a yönlendirildiğini doğrula

---

## 📋 TEST SENARYOLARI

## TEST 1: Share Dialog - Basic Functionality

### 1.1 Share Dialog Açma
**Adımlar:**
1. Dashboard'da bir CV card bul
2. "Share" button'ına tıkla

**Beklenen:**
- ✅ Share dialog açılır
- ✅ Dialog title: "Share CV: [CV Name]"
- ✅ 3 tab görünür: Link, Email, QR Code
- ✅ Link tab default olarak aktif

### 1.2 Dialog İçeriği Kontrolü
**Kontrol Et:**
- ✅ "Require Password" switch var
- ✅ "Link Expires In" dropdown var
- ✅ "Allow Download" switch var
- ✅ "Create Share Link" button var
- ✅ Tüm UI elementleri düzgün hizalı

---

## TEST 2: Share Link Creation

### 2.1 Basic Link Oluşturma
**Adımlar:**
1. Share dialog'u aç
2. Settings'leri default'ta bırak
3. "Create Share Link" tıkla

**Beklenen:**
- ✅ Loading indicator görünür
- ✅ "Creating Link..." mesajı
- ✅ Link başarıyla oluşturulur
- ✅ Success alert görünür
- ✅ Share link input'ta görünür
- ✅ Copy button aktif

**Firestore Kontrolü:**
```javascript
// Firebase Console > Firestore > shared_cvs
{
  cvId: "[CV ID]",
  userId: "[User ID]",
  shareLink: "http://localhost:5173/cv/[unique-id]",
  password: null,
  expiresAt: null,
  viewCount: 0,
  maxViews: null,
  createdAt: [Timestamp],
  isActive: true
}
```

### 2.2 Link Format Kontrolü
**Kontrol Et:**
```
Format: http://localhost:5173/cv/[22-24 karakter unique ID]
Örnek: http://localhost:5173/cv/a7f3k9m2p5q8r1s4t6u9
```

---

## TEST 3: Password Protection

### 3.1 Password ile Link Oluşturma
**Adımlar:**
1. Share dialog'u aç
2. "Require Password" switch'i aktifleştir
3. Password input görünmeli
4. Password gir: "test1234"
5. "Create Share Link" tıkla

**Beklenen:**
- ✅ Password input görünür
- ✅ Password girilir
- ✅ Link oluşturulur
- ✅ Firestore'da password kaydedilir

**Firestore Kontrolü:**
```javascript
{
  ...
  password: "test1234",
  ...
}
```

### 3.2 Password Validation
**Not:** Şu anda frontend-only validation var. Backend validation gelecek versiyonlarda eklenecek.

---

## TEST 4: Link Expiration

### 4.1 Expiration Time Ayarlama
**Adımlar:**
1. Share dialog'u aç
2. "Link Expires In" dropdown'u aç
3. Seçenekleri kontrol et
4. "7 Days" seç
5. Link oluştur

**Beklenen Seçenekler:**
- ✅ Never
- ✅ 1 Day
- ✅ 7 Days
- ✅ 30 Days

**Firestore Kontrolü:**
```javascript
{
  ...
  expiresAt: [Timestamp 7 gün sonrası],
  ...
}
```

### 4.2 Expiration Date Hesaplama
**Kontrol:**
```
Bugün: 2024-10-08
7 Days seçildi
expiresAt: 2024-10-15 (aynı saat)
```

---

## TEST 5: Copy Link Functionality

### 5.1 Link Kopyalama
**Adımlar:**
1. Share link oluştur
2. Copy button'ına tıkla

**Beklenen:**
- ✅ Icon değişir: Copy → CheckCircle
- ✅ Link clipboard'a kopyalanır
- ✅ 2 saniye sonra icon geri Copy olur

### 5.2 Clipboard İçeriği
**Kontrol:**
1. Copy button'ına tıkla
2. Yeni tab aç
3. Ctrl+V (veya Cmd+V)

**Beklenen:**
```
http://localhost:5173/cv/a7f3k9m2p5q8r1s4t6u9
```

---

## TEST 6: Open Link

### 6.1 Link'i Yeni Sekmede Açma
**Adımlar:**
1. Share link oluştur
2. "Open Link" button'ına tıkla

**Beklenen:**
- ✅ Yeni tab açılır
- ✅ URL share link ile eşleşir
- ✅ (Şu anda 404 gösterebilir - CV viewer henüz yok)

### 6.2 Create New Link
**Adımlar:**
1. Var olan link'ten sonra
2. "Create New Link" tıkla

**Beklenen:**
- ✅ Link input temizlenir
- ✅ Settings tekrar gösterilir
- ✅ Yeni link oluşturulabilir

---

## TEST 7: Email Sharing

### 7.1 Email Tab
**Adımlar:**
1. Share link oluştur
2. "Email" tab'ına geç

**Beklenen:**
- ✅ Info alert görünür
- ✅ "Send via Email" button var
- ✅ Button enabled

### 7.2 Email Client Açma
**Adımlar:**
1. "Send via Email" button'ına tıkla

**Beklenen:**
- ✅ Default email client açılır (Outlook, Gmail, etc.)
- ✅ Subject: "Check out my CV: [CV Name]"
- ✅ Body:
  ```
  Hi,

  I'd like to share my CV with you.

  View it here: http://localhost:5173/cv/[unique-id]

  Best regards
  ```

### 7.3 Email Tab Without Link
**Adımlar:**
1. Email tab'a geç (link oluşturmadan)

**Beklenen:**
- ✅ Alert gösterir: "Create a share link first..."
- ✅ "Send via Email" button disabled

---

## TEST 8: QR Code Generation

### 8.1 QR Code Oluşturma
**Adımlar:**
1. Share link oluştur
2. "QR Code" tab'ına geç

**Beklenen:**
- ✅ QR code otomatik generate edilir
- ✅ QR code görselleştirilir (siyah-beyaz pattern)
- ✅ 256x256 pixel boyutunda
- ✅ White background, black pattern
- ✅ "Download QR Code" button aktif

### 8.2 QR Code Test (Mobile)
**Adımlar:**
1. QR code oluştur
2. Mobil cihazla QR code'u tara

**Beklenen:**
- ✅ Share link'i içerir
- ✅ Tarandığında doğru URL'e yönlendirir

### 8.3 QR Code Download
**Adımlar:**
1. QR code tab'ında
2. "Download QR Code" button'ına tıkla

**Beklenen:**
- ✅ PNG file download olur
- ✅ Filename: "[CV-Name]-qr.png"
- ✅ File açılabilir
- ✅ QR code doğru görünür

### 8.4 QR Code Without Link
**Adımlar:**
1. QR Code tab'a geç (link oluşturmadan)

**Beklenen:**
- ✅ Alert gösterir: "Create a share link first..."
- ✅ QR code görünmez

---

## TEST 9: Batch Export - Dialog

### 9.1 Batch Export Dialog Açma
**Adımlar:**
1. Dashboard header'da
2. "Batch Export" button'ına tıkla

**Beklenen:**
- ✅ Batch Export dialog açılır
- ✅ Title: "Batch Export CVs"
- ✅ Description: "Export multiple CVs at once..."
- ✅ CV list görünür
- ✅ Format selection görünür

### 9.2 Dialog İçeriği
**Kontrol Et:**
- ✅ "Select CVs (0 selected)" label
- ✅ "Select All" button
- ✅ CV checkboxları
- ✅ "Export Formats" section
- ✅ Format checkboxları (PDF, DOCX, TXT)
- ✅ "Export X CV(s)" button (disabled)

---

## TEST 10: Batch Export - CV Selection

### 10.1 Single CV Seçimi
**Adımlar:**
1. Batch Export dialog'u aç
2. Bir CV checkbox'ını işaretle

**Beklenen:**
- ✅ Checkbox işaretlenir
- ✅ Label: "Select CVs (1 selected)"
- ✅ Export button enabled

### 10.2 Multiple CV Seçimi
**Adımlar:**
1. 3 CV checkbox'ı işaretle

**Beklenen:**
- ✅ 3 checkbox işaretli
- ✅ Label: "Select CVs (3 selected)"
- ✅ Export button enabled

### 10.3 Select All
**Adımlar:**
1. "Select All" button'ına tıkla

**Beklenen:**
- ✅ Tüm CV'ler seçilir
- ✅ Label: "Select CVs ([total] selected)"
- ✅ Button text: "Deselect All"

### 10.4 Deselect All
**Adımlar:**
1. "Deselect All" button'ına tıkla

**Beklenen:**
- ✅ Tüm seçimler kaldırılır
- ✅ Label: "Select CVs (0 selected)"
- ✅ Button text: "Select All"
- ✅ Export button disabled

---

## TEST 11: Batch Export - Format Selection

### 11.1 Single Format Seçimi
**Adımlar:**
1. "PDF" checkbox'ını işaretle

**Beklenen:**
- ✅ PDF checkbox işaretli
- ✅ Default olarak PDF zaten seçili olmalı

### 11.2 Multiple Format Seçimi
**Adımlar:**
1. PDF, DOCX ve TXT'yi işaretle

**Beklenen:**
- ✅ 3 format seçili
- ✅ Export birden fazla format için çalışacak

### 11.3 Format Kaldırma
**Adımlar:**
1. Tüm formatları kaldır

**Beklenen:**
- ✅ Export button disabled olmalı
- ✅ En az 1 format gerekli

---

## TEST 12: Batch Export - Export Process

### 12.1 Basic Export
**Adımlar:**
1. 2 CV seç
2. PDF formatını seç
3. "Export 2 CVs" button'ına tıkla

**Beklenen:**
- ✅ Export button disabled olur
- ✅ Loading screen gösterilir
- ✅ "Exporting CVs..." mesajı
- ✅ Progress bar görünür
- ✅ "Processing 2 CVs in 1 format"
- ✅ Progress yüzdesi artar (0% → 100%)

### 12.2 Progress Tracking
**Kontrol:**
```
Total files = selectedCVs × selectedFormats
2 CVs × 1 format = 2 files
Progress: 50% after 1st file
Progress: 100% after 2nd file
```

### 12.3 Success State
**Beklenen:**
- ✅ Success screen gösterilir
- ✅ CheckCircle icon (green)
- ✅ "Export Complete!" message
- ✅ "Your CVs have been downloaded as a ZIP file"
- ✅ 2 saniye sonra dialog kapanır

---

## TEST 13: Batch Export - ZIP File

### 13.1 ZIP Download
**Kontrol Et:**
1. Downloads klasörünü aç
2. ZIP file'ı bul

**Beklenen Filename:**
```
CVs_Export_2024-10-08.zip
(veya bugünün tarihi)
```

### 13.2 ZIP İçeriği
**Adımlar:**
1. ZIP file'ı aç
2. İçeriği incele

**Beklenen Yapı:**
```
CVs_Export_2024-10-08.zip
├── Senior_Frontend_Developer/
│   └── Senior_Frontend_Developer.txt
└── React_Developer/
    └── React_Developer.txt
```

### 13.3 File İçeriği
**Adımlar:**
1. Bir TXT file aç
2. İçeriği kontrol et

**Beklenen Format:**
```
[FirstName] [LastName]
[Email]
[Phone]

[Summary]

EXPERIENCE
[Title] at [Company]
[Description]

EDUCATION
[Degree] in [Field]
[School]

SKILLS
[Skill1], [Skill2], [Skill3]...
```

### 13.4 Multiple Format Export
**Adımlar:**
1. 1 CV seç
2. PDF, DOCX, TXT seç
3. Export yap

**Beklenen:**
```
CVs_Export_2024-10-08.zip
└── CV_Name/
    ├── CV_Name.txt
    ├── CV_Name.txt (PDF as text)
    └── CV_Name.txt (DOCX as text)
```

**Not:** Şu anda tüm formatlar text olarak export ediliyor. Gerçek PDF/DOCX generation gelecek versiyonda.

---

## TEST 14: Edge Cases

### 14.1 Share - Empty Fields
**Test:**
1. Password enable et
2. Password alanını boş bırak
3. Link oluşturmayı dene

**Beklenen:**
- Validation eklenmeli (future)
- Şu anda boş password ile oluşturulabilir

### 14.2 Batch Export - No Selection
**Test:**
1. Batch Export dialog aç
2. Hiçbir CV seçmeden export et

**Beklenen:**
- ✅ Export button disabled
- ✅ Export yapılamaz

### 14.3 Share - Rapid Link Creation
**Test:**
1. Hızlıca 5 link oluştur
2. Her linkin unique olduğunu kontrol et

**Beklenen:**
- ✅ Her link farklı unique ID
- ✅ Çakışma yok
- ✅ Firestore'da 5 ayrı dokuman

### 14.4 Batch Export - Large Selection
**Test:**
1. 10+ CV seç
2. 3 format seç
3. Export yap

**Beklenen:**
- ✅ Progress bar smooth çalışır
- ✅ ZIP oluşturulur
- ✅ Tüm files dahil
- ✅ Download başarılı

---

## TEST 15: Firestore Integration

### 15.1 Share Link Persistence
**Test:**
1. Link oluştur
2. Dialog'u kapat
3. Firestore'u kontrol et

**Firebase Console Check:**
```
Collection: shared_cvs
Document ID: [auto-generated]
Fields: cvId, userId, shareLink, password, etc.
```

### 15.2 Multiple Shares per CV
**Test:**
1. Aynı CV için 3 farklı link oluştur
2. Firestore'da 3 dokuman olmalı

**Beklenen:**
- ✅ 3 ayrı shared_cvs dokuman
- ✅ Aynı cvId
- ✅ Farklı shareLink
- ✅ Farklı createdAt

### 15.3 User's Share Links
**Test:**
```javascript
// Service method test
const links = await shareService.getUserShareLinks(userId)
console.log(links.length) // Kullanıcının tüm share linkleri
```

---

## TEST 16: Responsive Design

### 16.1 Mobile - Share Dialog
**Test:**
1. Tarayıcıyı 375px genişliğe küçült
2. Share dialog'u aç

**Beklenen:**
- ✅ Dialog responsive
- ✅ Tabs mobile'da düzgün
- ✅ Tüm elementler görünür
- ✅ Scroll yapılabilir

### 16.2 Mobile - Batch Export
**Test:**
1. Mobile view'da Batch Export aç

**Beklenen:**
- ✅ Dialog responsive
- ✅ CV list scroll edilebilir
- ✅ Buttons düzgün hizalı

### 16.3 Tablet View
**Test:**
1. 768px genişlik
2. Tüm dialogs'u test et

**Beklenen:**
- ✅ Optimal layout
- ✅ Good spacing
- ✅ Readable text

---

## TEST 17: Error Handling

### 17.1 Network Error - Share
**Test:**
1. Network'ü offline yap
2. Share link oluşturmayı dene

**Beklenen:**
- Loading state
- Error (console)
- Graceful failure

### 17.2 Network Error - Batch Export
**Test:**
1. Export sırasında network'ü kes

**Beklenen:**
- Export devam etmeli (local operation)
- ZIP oluşturulmalı
- Download başarılı olmalı

### 17.3 Invalid CV Data
**Test:**
1. Eksik data'lı CV export et

**Beklenen:**
- ✅ Graceful handling
- ✅ Empty fields için placeholder
- ✅ Export tamamlanır

---

## TEST 18: Performance

### 18.1 Large Batch Export
**Test:**
1. 20+ CV seç
2. 3 format seç
3. Export yap
4. Süreyi ölç

**Metrics:**
- Export başlama: < 1s
- Progress update: Her 100ms
- ZIP generation: < 5s
- Download başlama: Hemen

### 18.2 QR Code Generation
**Test:**
1. QR Code tab'a geç
2. Generation süresini ölç

**Beklenen:**
- ✅ < 500ms
- ✅ Smooth rendering
- ✅ No lag

---

## ✅ TEST CHECKLIST

### Share Dialog
- [ ] Dialog açılıyor
- [ ] Tüm tabs çalışıyor
- [ ] Settings düzenleniyor
- [ ] Link oluşturuluyor
- [ ] Password protection çalışıyor
- [ ] Expiration ayarlanıyor
- [ ] Copy link çalışıyor
- [ ] Email sharing çalışıyor
- [ ] QR code generate ediliyor
- [ ] QR code download ediliyor

### Batch Export
- [ ] Dialog açılıyor
- [ ] CV selection çalışıyor
- [ ] Select All/Deselect All çalışıyor
- [ ] Format selection çalışıyor
- [ ] Progress bar gösteriliyor
- [ ] ZIP oluşturuluyor
- [ ] ZIP download oluyor
- [ ] ZIP içeriği doğru
- [ ] Success state gösteriliyor

### Firestore
- [ ] Share links kaydediliyor
- [ ] Data structure doğru
- [ ] Timestamps doğru
- [ ] Security rules çalışıyor

### UX/UI
- [ ] Loading states var
- [ ] Error messages var
- [ ] Success feedback var
- [ ] Responsive design
- [ ] Smooth animations

---

## 🐛 BUG REPORTING

Bir hata bulduğunuzda:

1. **Screenshot al**
2. **Console errors kopyala**
3. **Repro steps yaz**
4. **Expected vs Actual yaz**

**Bug Report Template:**
```
## Bug Title
Kısa ve açıklayıcı başlık

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
Ne olması gerekiyordu

## Actual Behavior
Ne oldu

## Screenshots
[Ekran görüntüleri]

## Console Errors
[Hata mesajları]

## Environment
- Browser: Chrome 119
- OS: Windows 11
- Screen: 1920x1080
```

---

## 📊 TEST RAPORU

Test tamamlandığında:

```markdown
# ADIM 24 - Test Raporu

## Test Özeti
- **Total Tests:** 60+
- **Passed:** __
- **Failed:** __
- **Skipped:** __

## Critical Issues
- [Liste critical bugları]

## Minor Issues
- [Liste minor bugları]

## Suggestions
- [İyileştirme önerileri]

## Overall Assessment
[Genel değerlendirme]
```

---

**Happy Testing! 🧪**
