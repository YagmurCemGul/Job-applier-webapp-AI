# 🚀 ADIM 15 - Quick Start Guide

## Custom Prompt Kaydetme ve Klasörleme Sistemi

### 1️⃣ Prompt Kaydetme

```typescript
// Custom prompt yaz
const prompt = "Focus on my leadership experience and team management skills"

// Save butonuna tıkla
// Dialog'da:
{
  name: "Leadership Focus",
  content: prompt,
  folderId: "tech-jobs-folder-id",
  tags: ["leadership", "management"],
  isDefault: false
}
```

### 2️⃣ Folder Oluşturma

```typescript
// Manage Folders butonuna tıkla
// Yeni folder oluştur:
{
  name: "Tech Jobs",
  color: "blue", // blue, green, purple, orange, pink, gray
}
```

### 3️⃣ Prompt Kullanma

```typescript
// Library'yi aç
// Template veya saved prompt seç
// Otomatik olarak textarea'ya yüklenir
// Usage count +1
```

### 4️⃣ Arama ve Filtreleme

```typescript
// Search box: "leadership"
// Filter dropdown: "Tech Jobs" folder
// Sonuçlar anında güncellenir
```

## 📊 Store Usage

```typescript
import { useCustomPromptsStore } from '@/store/customPrompts.store'

function MyComponent() {
  const {
    prompts,
    folders,
    addPrompt,
    addFolder,
    incrementUsage,
    setDefaultPrompt,
    getPromptsByFolder,
  } = useCustomPromptsStore()

  // Prompt ekle
  const handleSave = () => {
    addPrompt({
      name: 'My Prompt',
      content: 'Emphasize technical skills',
      tags: ['technical'],
      isDefault: false,
    })
  }

  // Folder ekle
  const handleCreateFolder = () => {
    addFolder({
      name: 'My Folder',
      color: 'blue',
    })
  }

  // Folder'daki prompts'ları al
  const folderPrompts = getPromptsByFolder('folder-id')

  // Default prompt al
  const defaultPrompt = prompts.find(p => p.isDefault)
}
```

## 🎨 Component Usage

### SavePromptDialog

```typescript
import { SavePromptDialog } from '@/components/customPrompts/SavePromptDialog'

<SavePromptDialog
  content={customPrompt}
  trigger={
    <Button variant="outline" size="sm">
      <Save className="h-4 w-4 mr-2" />
      Save
    </Button>
  }
  onSaved={() => console.log('Saved!')}
/>
```

### FolderManagementDialog

```typescript
import { FolderManagementDialog } from '@/components/customPrompts/FolderManagementDialog'

<FolderManagementDialog />
```

### PromptsLibrary

```typescript
import { PromptsLibrary } from '@/components/customPrompts/PromptsLibrary'

<PromptsLibrary
  onSelect={(content) => setCustomPrompt(content)}
/>
```

## 📝 Hazır Templates

```typescript
// 5 hazır template mevcut:
1. Emphasize Leadership
   - Leadership ve team management vurgusu

2. Technical Focus
   - Teknik yetenekler ve problem solving

3. Career Change
   - Kariyer değişikliği ve transferable skills

4. Startup Culture
   - Startup deneyimi ve adaptability

5. Remote Work
   - Remote çalışma deneyimi ve self-motivation
```

## 🎯 Use Cases

### Use Case 1: Teknik İş Başvurusu
```
1. "Technical Focus" template'i seç
2. Customize et
3. "Tech Jobs" folder'ına kaydet
4. "technical" tag'i ekle
5. Gelecekte aynı folder'dan kullan
```

### Use Case 2: Default Prompt
```
1. Sık kullandığın prompt'u kaydet
2. "Set as Default" işaretle
3. Her açılışta otomatik yüklenir
```

### Use Case 3: Folder Organization
```
Tech Jobs/
├── Backend Focus
├── Frontend Focus
└── Full Stack

Startups/
├── Early Stage
└── Scale-up

Remote/
├── Async Communication
└── Timezone Management
```

## 🔍 Search & Filter

```typescript
// İsme göre ara
search: "leadership"

// Folder'a göre filtrele
folder: "tech-jobs-id"

// Tag'e göre ara
search: "management"

// Tüm folder'lar
folder: "all"

// Folder'sız prompts
folder: "none"
```

## 💾 LocalStorage

```typescript
// Otomatik persist
// Key: 'custom-prompts-storage'
{
  state: {
    prompts: [...],
    folders: [...],
    selectedPromptId: null
  },
  version: 0
}
```

## ⚡ Quick Tips

1. **Sık kullanılan prompt'ları kaydet** - Zaman kazanır
2. **Folder'lara organize et** - Kolayca bul
3. **Tag kullan** - Hızlıca ara
4. **Default prompt belirle** - Her defasında seçme
5. **Template'lerden başla** - Hızlı başlangıç

## 🎉 Tamamlandı!

Artık Cover Letter için tam özellikli custom prompt kaydetme ve organization sistemi hazır!