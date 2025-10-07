# ✅ ADIM 15 - Test Checklist

## 🧪 TEST SENARYOLARI

### Test 1: Save Prompt
**Amaç:** Yeni prompt kaydedebilme

**Adımlar:**
1. Cover Letter Generator'a git
2. Custom prompt textarea'ya bir text yaz
   - Örnek: "Focus on my 5 years of React experience"
3. "Save" butonuna tıkla
4. Dialog açılır
5. Prompt adı gir: "React Expertise"
6. "Save Prompt" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Dialog kapanır
- ✅ Prompt kaydedilir
- ✅ "Show Saved Prompts" açıldığında görünür

---

### Test 2: Folder Oluşturma
**Amaç:** Yeni folder oluşturabilme

**Adımlar:**
1. "Manage Folders" butonuna tıkla
2. Folder adı gir: "Frontend Jobs"
3. Renk seç: "Blue"
4. "Create Folder" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Folder "Existing Folders" listesinde görünür
- ✅ Rengi doğru gösterilir
- ✅ Prompt count: 0 prompts

---

### Test 3: Prompt'a Folder Atama
**Amaç:** Prompt'u folder'a atayabilme

**Adımlar:**
1. Yeni prompt kaydet
2. Dialog'da "Folder" dropdown'ını aç
3. "Frontend Jobs" seç
4. Save et

**Beklenen Sonuç:**
- ✅ Prompt kaydedilir
- ✅ Library'de folder badge'i görünür
- ✅ Folder Management'ta count güncellenir (1 prompt)

---

### Test 4: Tag Ekleme
**Amaç:** Prompt'a tag ekleyebilme

**Adımlar:**
1. Save dialog aç
2. Tag input'a "react" yaz
3. Enter'a bas veya "Add" butonuna tıkla
4. "typescript" ekle
5. Save et

**Beklenen Sonuç:**
- ✅ Tag'ler badge olarak görünür
- ✅ X butonuyla silinebilir
- ✅ Library'de prompt altında görünür

---

### Test 5: Tag Silme
**Amaç:** Tag silebilme

**Adımlar:**
1. Tag eklenen prompt'u aç
2. Tag badge'indeki X'e tıkla

**Beklenen Sonuç:**
- ✅ Tag anında silinir
- ✅ Diğer tag'ler kalır

---

### Test 6: Template Kullanma
**Amaç:** Quick template seçebilme

**Adımlar:**
1. "Show Saved Prompts & Templates" butonuna tıkla
2. Quick Templates bölümünde "Emphasize Leadership" seç

**Beklenen Sonuç:**
- ✅ Template içeriği textarea'ya yüklenir
- ✅ Library otomatik kapanır
- ✅ İçerik düzenlenebilir

---

### Test 7: Saved Prompt Kullanma
**Amaç:** Kaydedilmiş prompt kullanabilme

**Adımlar:**
1. Library'yi aç
2. "My Prompts" bölümünden bir prompt seç

**Beklenen Sonuç:**
- ✅ Prompt içeriği textarea'ya yüklenir
- ✅ Usage count +1 artar
- ✅ Library kapanır

---

### Test 8: Search Functionality
**Amaç:** Prompt arama

**Adımlar:**
1. 3-4 farklı prompt kaydet
2. Library'yi aç
3. Search box'a "react" yaz

**Beklenen Sonuç:**
- ✅ Sadece "react" içeren prompts görünür
- ✅ Search temizlenince tüm prompts görünür
- ✅ İsim, içerik ve tag'lerde arama yapar

---

### Test 9: Filter by Folder
**Amaç:** Folder'a göre filtreleme

**Adımlar:**
1. Farklı folder'lara prompt'lar ekle
2. Library'yi aç
3. Folder dropdown'dan "Frontend Jobs" seç

**Beklenen Sonuç:**
- ✅ Sadece o folder'daki prompts görünür
- ✅ "All Folders" seçilince tümü görünür
- ✅ "No Folder" seçilince folder'sızlar görünür

---

### Test 10: Set Default Prompt
**Amaç:** Default prompt ayarlama

**Adımlar:**
1. Saved prompt'un üç nokta menüsünü aç
2. "Set as Default" seç

**Beklenen Sonuç:**
- ✅ Prompt'un yanında "Default" badge'i görünür
- ✅ Diğer prompt'ların default'u kaldırılır
- ✅ Sadece bir prompt default olabilir

---

### Test 11: Delete Prompt
**Amaç:** Prompt silme

**Adımlar:**
1. Prompt'un üç nokta menüsünü aç
2. "Delete" seç
3. Confirmation dialog'da "Delete" onayla

**Beklenen Sonuç:**
- ✅ Confirmation dialog gösterilir
- ✅ Prompt silinir
- ✅ Listeden kaldırılır
- ✅ Folder count güncellenir

---

### Test 12: Delete Folder
**Amaç:** Folder silme (prompts korunur)

**Adımlar:**
1. İçinde prompt olan bir folder seç
2. Trash icon'a tıkla
3. Confirmation dialog'da onayla

**Beklenen Sonuç:**
- ✅ Confirmation mesajı doğru
- ✅ Folder silinir
- ✅ Folder'daki prompts "No Folder"a taşınır
- ✅ Prompts silinmez

---

### Test 13: Edit Folder
**Amaç:** Folder düzenleme

**Adımlar:**
1. Folder'ın Edit icon'una tıkla
2. Adı değiştir: "Senior Frontend Jobs"
3. Rengi değiştir: "Purple"
4. "Update Folder" tıkla

**Beklenen Sonuç:**
- ✅ Form edit mode'a geçer
- ✅ Mevcut değerler doldurulur
- ✅ Update sonrası değişiklikler görünür
- ✅ Prompt'lardaki folder ismi güncellenir

---

### Test 14: Usage Count
**Amaç:** Kullanım sayısı artırma

**Adımlar:**
1. Yeni prompt kaydet
2. 3 kez kullan (seç ve textarea'ya yükle)
3. Library'de kontrol et

**Beklenen Sonuç:**
- ✅ "Used 3 times" görünür
- ✅ Her seçimde +1 artar
- ✅ LocalStorage'da saklanır

---

### Test 15: LocalStorage Persistence
**Amaç:** Verilerin kalıcılığı

**Adımlar:**
1. 2-3 prompt ve folder oluştur
2. Sayfayı yenile (F5)
3. Kontrol et

**Beklenen Sonuç:**
- ✅ Tüm prompts korunur
- ✅ Tüm folders korunur
- ✅ Usage counts korunur
- ✅ Default prompt korunur

---

### Test 16: Empty States
**Amaç:** Boş durumlar

**Adımlar:**
1. Tüm prompts'ları sil
2. Library'yi aç

**Beklenen Sonuç:**
- ✅ "No saved prompts yet" mesajı görünür
- ✅ Templates hala görünür
- ✅ Search/filter disabled değil

---

### Test 17: Collapsible Library
**Amaç:** Açılır kapanır library

**Adımlar:**
1. "Show Saved Prompts" butonuna tıkla
2. Library açılır
3. "Hide" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Library smooth animation ile açılır
- ✅ Buton text'i "Hide"a değişir
- ✅ Tekrar tıklayınca kapanır

---

### Test 18: Save Button State
**Amaç:** Save butonunun durumu

**Adımlar:**
1. Textarea boş iken kontrol et
2. Text yaz
3. Kontrol et

**Beklenen Sonuç:**
- ✅ Boşken disabled
- ✅ Text yazılınca enabled
- ✅ Hover efekti çalışır

---

### Test 19: Form Validation
**Amaç:** Save dialog validasyonu

**Adımlar:**
1. Save dialog aç
2. Name boş bırak
3. Save'e tıkla

**Beklenen Sonuç:**
- ✅ Save butonu disabled
- ✅ Name veya content boşsa kaydetmez
- ✅ Minimum bir alan dolu olmalı

---

### Test 20: Multiple Prompts with Same Tag
**Amaç:** Aynı tag'li multiple prompts

**Adımlar:**
1. 3 prompt oluştur, hepsine "leadership" tag'i ekle
2. "leadership" ara

**Beklenen Sonuç:**
- ✅ 3 prompt de görünür
- ✅ Tag badge'leri doğru gösterilir
- ✅ Arama case-insensitive

---

## 📊 TEST SONUÇLARI

Tüm testleri tamamladıktan sonra işaretle:

- [ ] Test 1: Save Prompt
- [ ] Test 2: Folder Oluşturma
- [ ] Test 3: Prompt'a Folder Atama
- [ ] Test 4: Tag Ekleme
- [ ] Test 5: Tag Silme
- [ ] Test 6: Template Kullanma
- [ ] Test 7: Saved Prompt Kullanma
- [ ] Test 8: Search Functionality
- [ ] Test 9: Filter by Folder
- [ ] Test 10: Set Default Prompt
- [ ] Test 11: Delete Prompt
- [ ] Test 12: Delete Folder
- [ ] Test 13: Edit Folder
- [ ] Test 14: Usage Count
- [ ] Test 15: LocalStorage Persistence
- [ ] Test 16: Empty States
- [ ] Test 17: Collapsible Library
- [ ] Test 18: Save Button State
- [ ] Test 19: Form Validation
- [ ] Test 20: Multiple Prompts with Same Tag

## 🎯 BAŞARI KRİTERİ

**20/20 Test PASS** = ✅ ADIM 15 TAM BAŞARILI

---

**Not:** Her test senaryosu için screenshot alınması önerilir.