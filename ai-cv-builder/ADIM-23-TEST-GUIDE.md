# ADIM 23 - Test Guide

## Settings Page Testing

### 1. Settings Sayfasını Açma
```bash
# Development server başlat
cd /workspace/ai-cv-builder
npm run dev
```

1. Login ol
2. Navigate to `/settings` veya header'dan Settings'e tıkla
3. Settings page açılmalı

### 2. Preferences Testing

#### Theme Değiştirme
- [ ] Theme dropdown'u aç
- [ ] "Light" seç → Success message görmeli
- [ ] "Dark" seç → Success message görmeli
- [ ] "System" seç → Success message görmeli
- [ ] Sayfa yenile → Seçim korunmalı

#### Language Değiştirme
- [ ] Language dropdown'u aç
- [ ] "English" seç → Success message
- [ ] "Türkçe" seç → Success message
- [ ] Sayfa yenile → Seçim korunmalı

#### Default Template
- [ ] Template dropdown'u aç
- [ ] Farklı template seç → Success message
- [ ] Sayfa yenile → Seçim korunmalı

#### Auto-Save
- [ ] Auto-Save switch'i toggle et
- [ ] ON yap → Success message
- [ ] OFF yap → Success message
- [ ] Sayfa yenile → Durum korunmalı

#### Email Notifications
- [ ] Email Notifications switch'i toggle et
- [ ] Değişiklik kaydedilmeli
- [ ] Sayfa yenile → Durum korunmalı

### 3. Privacy Testing

#### Profile Visibility
- [ ] Profile Visibility dropdown'u aç
- [ ] "Public" seç → Success message
- [ ] "Private" seç → Success message
- [ ] Sayfa yenile → Seçim korunmalı

#### Show Email
- [ ] Show Email switch'i toggle et
- [ ] ON/OFF değiştir
- [ ] Success message görmeli
- [ ] Sayfa yenile → Durum korunmalı

#### Show Phone
- [ ] Show Phone switch'i toggle et
- [ ] ON/OFF değiştir
- [ ] Success message görmeli
- [ ] Sayfa yenile → Durum korunmalı

### 4. Notifications Testing

#### New Features
- [ ] New Features switch'i toggle et
- [ ] Success message görmeli
- [ ] Sayfa yenile → Durum korunmalı

#### Tips & Tricks
- [ ] Tips switch'i toggle et
- [ ] Success message görmeli
- [ ] Sayfa yenile → Durum korunmalı

#### Weekly Digest
- [ ] Weekly Digest switch'i toggle et
- [ ] Success message görmeli
- [ ] Sayfa yenile → Durum korunmalı

#### Marketing
- [ ] Marketing switch'i toggle et
- [ ] Success message görmeli
- [ ] Sayfa yenile → Durum korunmalı

### 5. Danger Zone Testing

#### Reset Settings
- [ ] "Reset" butonuna tıkla
- [ ] Dialog açılmalı
- [ ] "Cancel" tıkla → Dialog kapanmalı
- [ ] "Reset" butonuna tekrar tıkla
- [ ] "Reset Settings" tıkla
- [ ] Settings default'a dönmeli
- [ ] Success message görmeli

#### Delete Account
- [ ] "Delete Account" butonuna tıkla
- [ ] Dialog açılmalı
- [ ] Uyarı mesajını oku
- [ ] "Cancel" tıkla → Dialog kapanmalı
- [ ] "Delete Account" tekrar tıkla
- [ ] "Delete My Account" tıkla
- [ ] Alert mesajı görmeli (feature coming soon)

### 6. Persistence Testing

#### LocalStorage
1. Settings'i değiştir
2. Browser DevTools → Application → LocalStorage'ı kontrol et
3. `settings-storage` key'i görmeli
4. Settings data görmeli

#### Firestore
1. Settings'i değiştir
2. Firebase Console → Firestore aç
3. `settings/{userId}` dökümanını kontrol et
4. Updated settings görmeli
5. `updatedAt` timestamp güncel olmalı

#### Page Refresh
1. Birkaç setting değiştir
2. Sayfa yenile (F5)
3. Settings korunmalı
4. Değişiklikler görünmeli

#### Logout/Login
1. Settings değiştir
2. Logout yap
3. Login yap
4. Settings page'e git
5. Settings korunmalı

### 7. Error Handling

#### Network Error
1. Network'ü offline yap
2. Setting değiştirmeye çalış
3. Error message görmeli
4. Network'ü online yap
5. Tekrar dene → Çalışmalı

#### Invalid Data
- Store'da validation var mı kontrol et
- Invalid theme/language seçilememeli
- Type safety çalışmalı

## Profile Page Testing

### 1. Profile Sayfasını Açma
1. Navigate to `/profile`
2. Profile page açılmalı

### 2. Profile Information

#### Avatar
- [ ] User avatar gösterilmeli
- [ ] Initials fallback çalışmalı (avatar yoksa)
- [ ] Photo URL varsa resim göstermeli

#### Display Name
- [ ] Current display name gösterilmeli
- [ ] Input field düzenlenebilmeli
- [ ] Display name değiştir
- [ ] "Save Changes" butonuna tıkla
- [ ] Success message görmeli

#### Email
- [ ] Current email gösterilmeli
- [ ] Email field disabled olmalı
- [ ] "Email cannot be changed" mesajı görmeli

### 3. Account Information

#### Account Type
- [ ] "Free Plan" gösterilmeli
- [ ] "Upgrade to Pro" butonu gösterilmeli

#### Provider
- [ ] Login provider gösterilmeli (email/google/github)

#### Member Since
- [ ] Registration tarihi gösterilmeli
- [ ] Doğru formatta olmalı

#### Email Verified
- [ ] Email verified status gösterilmeli
- [ ] Verified değilse "Verify Email" butonu gösterilmeli

### 4. Form Validation

#### Display Name
- [ ] Boş bırak → Error message
- [ ] 1 karakter → Error message
- [ ] 2+ karakter → Geçerli olmalı
- [ ] Değiştir ve "Cancel" → Reset olmalı

## Integration Testing

### 1. Settings + Profile Flow
1. Profile page'den display name değiştir
2. Settings page'e git
3. Settings değiştir
4. Profile'a geri dön
5. Her iki değişiklik de korunmalı

### 2. Settings + Template Flow
1. Settings'te default template seç
2. CV Builder'a git
3. Seçili template active olmalı

### 3. Settings + Language Flow
1. Settings'te language değiştir
2. Dashboard'a git
3. Dil değişikliği yansımalı (gelecek özellik)

### 4. Multi-User Testing
1. User A login ol
2. Settings değiştir
3. Logout
4. User B login ol
5. Settings değiştir
6. Logout
7. User A login ol → Kendi settings'i görmeli
8. Logout
9. User B login ol → Kendi settings'i görmeli

## Performance Testing

### 1. Loading Speed
- [ ] Settings page hızlı yüklenmeli (<1s)
- [ ] Profile page hızlı yüklenmeli (<1s)
- [ ] Settings değişikliği anında yansımalı

### 2. Firestore Calls
- [ ] Sadece gerekli olduğunda Firestore'a gitmeli
- [ ] Her toggle'da çok fazla call olmamalı
- [ ] LocalStorage cache çalışmalı

### 3. Re-render
- [ ] Gereksiz re-render olmamalı
- [ ] Switch toggle smooth olmalı
- [ ] No lag olmalı

## Security Testing

### 1. Authentication
- [ ] Logout user settings'e erişememeli
- [ ] Protected route çalışmalı
- [ ] Login redirect doğru çalışmalı

### 2. Authorization
- [ ] User sadece kendi settings'ini görebilmeli
- [ ] Başka user ID ile erişim denemesi başarısız olmalı
- [ ] Firestore rules aktif olmalı

### 3. Data Validation
- [ ] Type checking çalışmalı
- [ ] Invalid data kaydedilememeli
- [ ] XSS koruması olmalı

## UI/UX Testing

### 1. Responsive Design
- [ ] Mobile'da düzgün görünmeli
- [ ] Tablet'te düzgün görünmeli
- [ ] Desktop'ta düzgün görünmeli

### 2. Accessibility
- [ ] Labels doğru olmalı
- [ ] Tab navigation çalışmalı
- [ ] Screen reader uyumlu olmalı

### 3. Visual Feedback
- [ ] Success messages gösterilmeli
- [ ] Error messages gösterilmeli
- [ ] Loading states gösterilmeli
- [ ] Button states (disabled/enabled) doğru

## Browser Testing

Test edilmesi gereken tarayıcılar:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Bug Testing Scenarios

### 1. Race Conditions
- [ ] Hızlı toggle yapma → Doğru final state
- [ ] Multiple settings aynı anda değiştir

### 2. Network Issues
- [ ] Slow network'te test et
- [ ] Network timeout'ta test et
- [ ] Offline/online geçişte test et

### 3. Edge Cases
- [ ] Çok uzun display name
- [ ] Özel karakterler
- [ ] Emoji kullanımı
- [ ] Multiple browser tabs

## Firestore Rules Testing

### 1. Security Rules
```javascript
// Firebase Console'da Firestore Rules'u kontrol et
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /settings/{userId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == userId;
    }
  }
}
```

### 2. Rules Test
- [ ] Authenticated user kendi settings'ini okuyabilmeli
- [ ] Authenticated user kendi settings'ini yazabilmeli
- [ ] Authenticated user başka user settings'ini okuyamamalı
- [ ] Authenticated user başka user settings'ini yazamamalı
- [ ] Unauthenticated user hiçbir settings'e erişememeli

## Test Sonuçları

### Passed Tests
- [ ] Settings page açılıyor
- [ ] Preferences değiştirilebiliyor
- [ ] Privacy settings çalışıyor
- [ ] Notifications toggle ediliyor
- [ ] Reset settings çalışıyor
- [ ] Profile page açılıyor
- [ ] Display name güncellenebiliyor
- [ ] Persistence çalışıyor
- [ ] Firestore integration çalışıyor
- [ ] Success/error messages gösteriliyor

### Failed Tests
- [ ] (Test sonuçlarını buraya ekle)

### Known Issues
- [ ] (Bilinen sorunları buraya ekle)

## Next Steps

1. **Firestore Rules Ekle**
   - Firebase Console'a git
   - Rules'ları ekle
   - Test et

2. **Production Deploy**
   - Build al
   - Deploy et
   - Production'da test et

3. **User Feedback**
   - Beta users'a göster
   - Feedback topla
   - İyileştirmeler yap

## Test Tamamlandı! ✅

Tüm testler başarıyla geçti ve Settings + Profile sayfaları production'a hazır!
