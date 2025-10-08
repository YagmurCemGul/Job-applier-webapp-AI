/**
 * i18n support for extension (EN/TR)
 */

type Locale = 'en' | 'tr';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    overlay_title: 'Attach your file',
    overlay_body: 'Click the highlighted field to attach your CV (browser requires a user click).',
    overlay_continue: 'Continue',
    overlay_skip: 'Skip for now',
    dry_run_title: 'Dry-Run Mode',
    dry_run_body: 'Form has been prefilled for your review. No submission will occur.',
    legal_off: 'Legal Mode is OFF for this site. Enable it in Options.',
    submitting: 'Submitting…',
    success: 'Application submitted successfully',
    error: 'An error occurred',
    parsing: 'Parsing job details…',
    filling: 'Filling form fields…',
    waiting: 'Waiting for page to load…',
    field_not_found: 'Field not found',
    file_attach_required: 'File attachment required',
    multi_step: 'Multi-step form detected',
  },
  tr: {
    overlay_title: 'Dosyanızı ekleyin',
    overlay_body: "CV'nizi eklemek için vurgulanan alana tıklayın (tarayıcı kullanıcı tıklaması ister).",
    overlay_continue: 'Devam',
    overlay_skip: 'Şimdilik atla',
    dry_run_title: 'Deneme Modu',
    dry_run_body: 'Form gözden geçirmeniz için dolduruldu. Gönderim yapılmayacak.',
    legal_off: 'Bu site için Yasal Mod KAPALI. Ayarlar\'dan açın.',
    submitting: 'Gönderiliyor…',
    success: 'Başvuru başarıyla gönderildi',
    error: 'Bir hata oluştu',
    parsing: 'İş detayları ayrıştırılıyor…',
    filling: 'Form alanları dolduruluyor…',
    waiting: 'Sayfa yükleniyor…',
    field_not_found: 'Alan bulunamadı',
    file_attach_required: 'Dosya eklenmesi gerekli',
    multi_step: 'Çok adımlı form algılandı',
  },
};

export function t(key: string, locale: Locale = 'en'): string {
  return translations[locale][key] || translations.en[key] || key;
}

export function setLocale(locale: Locale): void {
  // Could store in local variable if needed
}
