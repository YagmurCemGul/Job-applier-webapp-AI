# ADIM 23 - Quick Start Guide

## 🚀 Hızlı Başlangıç

### 1. Firebase Firestore Rules Ekle

Firebase Console'a git ve aşağıdaki rules'ı ekle:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Existing rules...
    
    // Settings collection - ADIM 23
    match /settings/{userId} {
      // Users can only read/write their own settings
      allow read, write: if request.auth != null && 
                          request.auth.uid == userId;
    }
  }
}
```

### 2. Development Server Başlat

```bash
cd /workspace/ai-cv-builder
npm run dev
```

### 3. Test Et

1. **Login Ol**
   - Mevcut bir hesapla login ol veya yeni hesap oluştur

2. **Settings Sayfasını Aç**
   - URL: `http://localhost:5173/settings`
   - veya Header'dan "Settings" linkine tıkla

3. **Ayarları Değiştir**
   - Theme'i değiştir
   - Language seç
   - Switch'leri toggle et
   - Success message göreceksin

4. **Sayfa Yenile**
   - F5 veya refresh
   - Settings korunmuş olmalı

5. **Profile Sayfasını Aç**
   - URL: `http://localhost:5173/profile`
   - Display name'i değiştir
   - Save Changes

## 📋 Hızlı Test Checklist

### Settings Page
- [ ] Settings page açılıyor ✓
- [ ] Theme değişiyor ✓
- [ ] Language değişiyor ✓
- [ ] Switches çalışıyor ✓
- [ ] Success messages gösteriliyor ✓
- [ ] Firestore'a kaydediliyor ✓

### Profile Page
- [ ] Profile page açılıyor ✓
- [ ] Avatar gösteriliyor ✓
- [ ] Display name güncellenebiliyor ✓
- [ ] Account info gösteriliyor ✓

## 🔧 Settings Store Kullanımı

### Component'te Kullanım

```typescript
import { useSettingsStore } from '@/stores/settings.store'
import { useAuthStore } from '@/stores/auth.store'

function MyComponent() {
  const { user } = useAuthStore()
  const { settings, loadSettings, updateSettings } = useSettingsStore()

  useEffect(() => {
    if (user) {
      loadSettings(user.uid)
    }
  }, [user, loadSettings])

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    if (!user || !settings) return
    
    await updateSettings(user.uid, {
      preferences: {
        ...settings.preferences,
        theme
      }
    })
  }

  return (
    <div>
      Current theme: {settings?.preferences.theme}
    </div>
  )
}
```

### Settings Okuma

```typescript
const { settings } = useSettingsStore()

// Theme
const theme = settings?.preferences.theme // 'light' | 'dark' | 'system'

// Language
const language = settings?.preferences.language // 'en' | 'tr'

// Auto-save
const autoSave = settings?.preferences.autoSave // boolean

// Email notifications
const emailNotif = settings?.preferences.emailNotifications // boolean

// Default template
const defaultTemplate = settings?.preferences.defaultTemplate // string

// Profile visibility
const visibility = settings?.privacy.profileVisibility // 'public' | 'private'
```

### Settings Güncelleme

```typescript
const { user } = useAuthStore()
const { updateSettings } = useSettingsStore()

// Theme değiştir
await updateSettings(user!.uid, {
  preferences: {
    ...settings!.preferences,
    theme: 'dark'
  }
})

// Language değiştir
await updateSettings(user!.uid, {
  preferences: {
    ...settings!.preferences,
    language: 'tr'
  }
})

// Privacy settings güncelle
await updateSettings(user!.uid, {
  privacy: {
    ...settings!.privacy,
    profileVisibility: 'public'
  }
})

// Notification settings güncelle
await updateSettings(user!.uid, {
  notifications: {
    ...settings!.notifications,
    newFeatures: true,
    tips: true
  }
})
```

### Settings Reset

```typescript
const { resetSettings } = useSettingsStore()

// Tüm settings'i default'a dön
await resetSettings(user!.uid)
```

## 🎨 UI Components

### Switch Kullanımı

```typescript
import { Switch } from '@/components/ui/switch'

<Switch
  id="autoSave"
  checked={settings?.preferences.autoSave}
  onCheckedChange={(checked) => handleUpdatePreference('autoSave', checked)}
/>
```

### Select Kullanımı

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<Select
  value={settings?.preferences.theme}
  onValueChange={(value) => handleUpdatePreference('theme', value)}
>
  <SelectTrigger className="w-[180px]">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem>
  </SelectContent>
</Select>
```

### Alert Dialog Kullanımı

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline">Reset</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Reset Settings?</AlertDialogTitle>
      <AlertDialogDescription>
        This will reset all your settings to their default values.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleResetSettings}>
        Reset Settings
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## 📊 Firestore Yapısı

### Settings Document

```
settings/
  {userId}/
    userId: "abc123"
    preferences: {
      theme: "light"
      language: "en"
      emailNotifications: true
      autoSave: true
      defaultTemplate: "template-modern"
    }
    privacy: {
      profileVisibility: "private"
      showEmail: false
      showPhone: false
    }
    notifications: {
      newFeatures: true
      tips: true
      weeklyDigest: false
      marketing: false
    }
    updatedAt: Timestamp
```

### Firestore Query

```typescript
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase.config'

// Settings oku
const settingsRef = doc(db, 'settings', userId)
const settingsDoc = await getDoc(settingsRef)

if (settingsDoc.exists()) {
  const settings = settingsDoc.data()
  console.log(settings)
}

// Settings yaz
import { setDoc } from 'firebase/firestore'

await setDoc(settingsRef, {
  ...settings,
  updatedAt: new Date()
}, { merge: true })
```

## 🔐 Security

### Firestore Rules
- User sadece kendi settings'ini okuyabilir/yazabilir
- Authentication gerekli
- userId match kontrolü

### Type Safety
- TypeScript types ile güvenli
- Zod validation (gelecek özellik)
- Runtime validation

## 🐛 Troubleshooting

### Settings yüklenmiyor?
1. User login oldu mu kontrol et
2. Firestore rules eklenmiş mi kontrol et
3. Console'da error var mı kontrol et
4. Network tab'ı kontrol et

### Settings kaydedilmiyor?
1. Firestore connection kontrolü
2. User authentication kontrolü
3. Settings store state kontrolü
4. Error messages kontrol et

### Switch çalışmıyor?
1. Component import kontrolü
2. Event handler kontrolü
3. State update kontrolü
4. Console error kontrolü

## 📱 Responsive Design

Settings ve Profile sayfaları responsive:
- Mobile: Single column
- Tablet: Single column, wider
- Desktop: Max-width 4xl, centered

## ♿ Accessibility

- Labels doğru tanımlı
- ARIA attributes var
- Keyboard navigation destekli
- Screen reader uyumlu

## 🎯 Best Practices

### 1. Always Check User
```typescript
if (!user) return // veya redirect
```

### 2. Handle Loading States
```typescript
if (loading) return <Loader />
```

### 3. Handle Errors
```typescript
try {
  await updateSettings(...)
} catch (error) {
  showErrorMessage(error)
}
```

### 4. Optimistic Updates
```typescript
// UI'ı hemen güncelle
setLocalSettings(newSettings)

// Sonra Firestore'a kaydet
await saveToFirestore(newSettings)
```

### 5. Debounce Rapid Changes
```typescript
// Çok hızlı değişikliklerde debounce kullan
const debouncedUpdate = debounce(updateSettings, 500)
```

## 🚀 Production Checklist

- [ ] Firestore rules eklendi
- [ ] Development'ta test edildi
- [ ] Responsive design test edildi
- [ ] Error handling test edildi
- [ ] Performance test edildi
- [ ] Security test edildi
- [ ] Build başarılı
- [ ] Deploy edildi
- [ ] Production'da test edildi

## 📚 Daha Fazla Bilgi

- [ADIM-23-TAMAMLANDI.md](./ADIM-23-TAMAMLANDI.md) - Detaylı dokümantasyon
- [ADIM-23-TEST-GUIDE.md](./ADIM-23-TEST-GUIDE.md) - Test guide

## ✅ Tamamlandı!

ADIM 23 başarıyla tamamlandı. Settings ve Profile sayfaları kullanıma hazır!

Sonraki adım: ADIM 24 - Advanced Features
