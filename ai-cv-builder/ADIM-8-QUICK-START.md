# 🚀 ADIM 8 Quick Start Guide

## AI LinkedIn Photo Generator - Setup in 3 Minutes

### Step 1: Get API Key (Choose One)

#### Option A: OpenAI (Best Quality) ⭐ Recommended
```bash
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with sk-...)
```

#### Option B: Stability AI (Cheapest)
```bash
1. Go to: https://platform.stability.ai/
2. Sign up for free account
3. Get API key from dashboard
```

#### Option C: Replicate (Good Balance)
```bash
1. Go to: https://replicate.com/
2. Sign in with GitHub
3. Get token from Account settings
```

### Step 2: Configure .env File

Create `.env` in project root:

```env
# Choose one provider
VITE_AI_PROVIDER=openai

# Add your API key (only need one)
VITE_OPENAI_API_KEY=sk-your-key-here
VITE_STABILITY_API_KEY=sk-your-key-here
VITE_REPLICATE_API_KEY=r8-your-key-here
```

### Step 3: Start Application

```bash
npm run dev
```

### Step 4: Test the Feature

1. Navigate to **Profile** page
2. Scroll to "Profile Photo" card
3. Click **"Generate AI Photo"** button
4. Upload a clear selfie
5. Choose a style (Professional/Business/Casual/Creative)
6. Click **"Generate Photos"**
7. Wait 30-60 seconds
8. Select your favorite photo
9. Click **"Save as Profile Photo"**

## ✅ What You'll See

### Profile Page
- Avatar upload section (existing)
- **NEW:** "Generate AI Photo" button with sparkles icon ✨

### AI Photo Dialog (4 Steps)

**Step 1 - Upload**
```
┌─────────────────────────────────┐
│  AI LinkedIn Photo Generator    │
│  Upload a photo and let AI...   │
├─────────────────────────────────┤
│                                 │
│      [Upload Circle Area]       │
│                                 │
│  Upload a clear selfie or...    │
└─────────────────────────────────┘
```

**Step 2 - Style Selection**
```
┌─────────────────────────────────┐
│      [Preview Image]            │
│                                 │
│  Choose a style:                │
│  ┌────────┬────────┐           │
│  │ Prof.  │Business│  <-Radio  │
│  ├────────┼────────┤           │
│  │ Casual │Creative│           │
│  └────────┴────────┘           │
│          [Back] [Generate]      │
└─────────────────────────────────┘
```

**Step 3 - Generating**
```
┌─────────────────────────────────┐
│                                 │
│      [Spinning Loader]          │
│                                 │
│  Generating your photos...      │
│  This may take 30-60 seconds    │
│                                 │
└─────────────────────────────────┘
```

**Step 4 - Select Photo**
```
┌─────────────────────────────────┐
│  ┌──────┬──────┐                │
│  │ [1]  │ [2]  │  <- Clickable  │
│  │  ↓   │      │     Grid       │
│  ├──────┼──────┤                │
│  │ [3]  │ [4]  │                │
│  └──────┴──────┘                │
│                                 │
│      [Regenerate] [Save]        │
└─────────────────────────────────┘
```

## 💡 Tips for Best Results

### Photo Upload Tips
- ✅ Use well-lit photo
- ✅ Face clearly visible
- ✅ Direct face view (not profile)
- ✅ Clean background
- ❌ Avoid sunglasses
- ❌ Avoid hats
- ❌ Avoid group photos

### Style Guide
- **Professional**: Formal, corporate, dark suit
- **Business**: Executive, office setting
- **Casual**: Smart casual, approachable
- **Creative**: Modern, artistic, unique

## 🔧 Troubleshooting

### Issue: "Generation failed"
**Solution:**
1. Check API key is correct in `.env`
2. Restart dev server: `npm run dev`
3. Check browser console for errors
4. Verify account has credits

### Issue: Button not visible
**Solution:**
1. Make sure you're on Profile page
2. Scroll to "Profile Photo" section
3. Clear browser cache
4. Check browser console for errors

### Issue: Slow generation
**Solution:**
- This is normal (30-60 seconds)
- OpenAI: ~30-45 seconds
- Replicate: ~45-90 seconds
- Stability: ~20-40 seconds

### Issue: Photos don't look good
**Solution:**
1. Use higher quality upload photo
2. Try different style option
3. Ensure good lighting in source
4. Make sure face is clearly visible

## 📊 Cost Per Generation

| Provider | 4 Photos | 100 Generations |
|----------|----------|-----------------|
| Stability AI | $0.008 | $0.80 |
| Replicate | $0.075 | $7.50 |
| OpenAI | $0.16 | $16.00 |

**Recommendation:** Start with Stability AI for testing!

## 🎯 Testing Checklist

- [ ] Build completes: `npm run build`
- [ ] Dev server starts: `npm run dev`
- [ ] Navigate to Profile page
- [ ] See "Generate AI Photo" button
- [ ] Click button, dialog opens
- [ ] Upload works
- [ ] Style selection works
- [ ] Generate triggers (needs API key)
- [ ] Loading shows correctly
- [ ] Photos display in grid
- [ ] Download individual photo works
- [ ] Save as profile photo works
- [ ] Avatar updates across app

## 🆘 Need Help?

### Check Implementation
```bash
# Verify files exist
ls -la src/services/ai-image.service.ts
ls -la src/components/profile/AIPhotoGenerator.tsx

# Check for TypeScript errors
npm run build
```

### API Key Issues
```bash
# Check .env is loaded
echo $VITE_OPENAI_API_KEY  # Should print your key

# Restart dev server
# Press Ctrl+C, then:
npm run dev
```

### Error Logs
Open browser DevTools (F12) and check:
1. Console tab for errors
2. Network tab for API calls
3. Check status codes (401 = bad key, 429 = rate limit)

## ✅ Success Criteria

You'll know it works when:
1. ✅ Button appears on Profile page
2. ✅ Dialog opens with 4 steps
3. ✅ Upload accepts images
4. ✅ Style selection has 4 options
5. ✅ Loading spinner shows during generation
6. ✅ 4 photos appear in grid
7. ✅ Download works
8. ✅ Save updates profile photo
9. ✅ No console errors

## 🎉 What's Next?

After successful setup:
1. Generate your first AI photo
2. Test all 4 style options
3. Compare results
4. Save best one to profile
5. Download others for LinkedIn

---

**Ready to go?** Start with Step 1 above! 🚀

**Need full details?** See `ADIM-8-IMPLEMENTATION-SUMMARY.md`