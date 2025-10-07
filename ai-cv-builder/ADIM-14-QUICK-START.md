# 🚀 ADIM 14 Quick Start Guide - Cover Letter System

## 📖 Nasıl Kullanılır?

### 1. Development Mode (Mock Data - API Key Gerekmez)

```bash
cd ai-cv-builder
npm run dev
```

**Test Adımları:**
1. CV Builder'a git (`/cv-builder`)
2. Bir CV yükle
3. Job posting ekle
4. "Cover Letter" tabına tıkla
5. Tone seç (örn: Professional)
6. Length seç (örn: Medium)
7. Optional: Custom prompt ekle
8. "Generate Cover Letter" butonuna tıkla
9. Mock cover letter oluşturuldu! ✨

### 2. Production Mode (Real AI - API Key Gerekli)

**.env dosyası oluştur:**
```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

```bash
cd ai-cv-builder
npm run dev
```

## 🎨 UI Özellikleri

### Generator Panel (Sol Taraf)
```
┌─────────────────────────────────┐
│ ✨ Generate Cover Letter        │
├─────────────────────────────────┤
│ Tone: [Professional ▼]          │
│ Length: [Medium ▼]              │
│                                  │
│ Additional Instructions:         │
│ ┌──────────────────────────┐   │
│ │ Your custom prompt here  │   │
│ └──────────────────────────┘   │
│                                  │
│ [✨ Generate Cover Letter]       │
│                                  │
│ 💡 Tip: The AI will create...   │
└─────────────────────────────────┘
```

### Preview Panel (Sağ Taraf)
```
┌─────────────────────────────────┐
│ Cover Letter                     │
│ [250 words] [1,234 characters]  │
│                            [Copy]│
├─────────────────────────────────┤
│ [Your Name]                      │
│ [Your Email]                     │
│                                  │
│ Dear Hiring Manager,            │
│                                  │
│ I am writing to express...      │
│ ...                              │
└─────────────────────────────────┘
│                                  │
│ Download Options                 │
├─────────────────────────────────┤
│ [📄 PDF]        [📝 DOCX]       │
│ [📋 TXT]        [🔗 Google]     │
└─────────────────────────────────┘
```

## 🎯 Tone Options

| Tone | Açıklama | Kullanım |
|------|----------|----------|
| **Professional** | Standart iş tonu | Çoğu pozisyon için |
| **Casual** | Rahat, samimi | Startup, tech firmaları |
| **Enthusiastic** | Coşkulu, heyecanlı | Yaratıcı pozisyonlar |
| **Formal** | Resmi, ciddi | Kurumsal, yönetici |

## 📏 Length Options

| Length | Word Count | Kullanım |
|--------|-----------|----------|
| **Short** | 200-250 | Hızlı başvurular |
| **Medium** | 300-400 | Standart (önerilen) |
| **Long** | 400-500 | Detaylı açıklamalar |

## 💡 Custom Prompt Örnekleri

```
"Emphasize my leadership experience"
"Mention my passion for sustainable technology"
"Highlight my international experience"
"Focus on my problem-solving skills"
"Show enthusiasm for remote work"
```

## 📥 Export Options

### PDF
- Universal format
- Ready to attach
- Professional appearance

### DOCX
- Editable format
- Can customize further
- MS Word compatible

### TXT
- Plain text
- Copy-paste ready
- Email-friendly

### Google Docs
- Opens in new tab
- Cloud-based editing
- Share easily

## 🔥 Advanced Usage

### Custom Prompt Combinations

**Örnek 1: Tech Startup**
```
Tone: Casual
Length: Medium
Custom: "Show passion for innovation and fast-paced environment"
```

**Örnek 2: Fortune 500**
```
Tone: Formal
Length: Long
Custom: "Emphasize leadership and strategic thinking"
```

**Örnek 3: Remote Position**
```
Tone: Professional
Length: Medium
Custom: "Highlight remote work experience and self-motivation"
```

## 🎬 Demo Workflow

1. **Upload CV**
   ```
   Upload → CV parsed → Continue
   ```

2. **Add Job Posting**
   ```
   Paste job → Analyze → Continue
   ```

3. **Generate Cover Letter**
   ```
   Select options → Generate → Preview
   ```

4. **Export**
   ```
   Copy/Download → Use in application
   ```

## 🐛 Troubleshooting

### API Key Issues
```
Error: "Failed to generate cover letter"
Solution: Check VITE_ANTHROPIC_API_KEY in .env
```

### Mock Data Not Showing
```
Issue: Generation fails
Solution: Remove API key to use mock data
```

### Export Fails
```
Issue: Download doesn't work
Solution: Check browser permissions
```

## 📊 Expected Results

### Generation Time
- Mock: Instant (~100ms)
- AI: 3-5 seconds

### Content Quality
- ✅ Personalized to CV
- ✅ Matches job requirements
- ✅ Professional format
- ✅ Action-oriented
- ✅ No generic templates

### Metadata
- Word count: Accurate
- Character count: Accurate
- Suggestions: 3-4 helpful tips

## 🎓 Best Practices

1. **Always customize**: Use custom prompts
2. **Match tone**: Choose appropriate for company
3. **Review & edit**: Personalize placeholders
4. **Test variations**: Try different tones/lengths
5. **Export multiple**: Keep different versions

## 🚦 Status Indicators

| State | Indicator | Meaning |
|-------|-----------|---------|
| Ready | ✨ Button enabled | Can generate |
| Loading | ⏳ Spinner | Generating... |
| Success | ✅ Preview shown | Generated! |
| Error | ❌ Alert visible | Failed |
| Copied | ✓ Green check | In clipboard |
| Exported | ✓ Success message | Downloaded |

## 📝 Tips

- Start with Professional/Medium
- Add 2-3 specific points to custom prompt
- Review suggestions before finalizing
- Personalize [placeholders] with real info
- Test multiple tones for best fit

## 🎉 Ready to Use!

Navigate to `/cv-builder` and start creating personalized cover letters! 🚀