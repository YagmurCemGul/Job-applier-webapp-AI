/**
 * Minimal i18n for extension content scripts
 */

type Lang = 'en' | 'tr'

const dict: Record<Lang, Record<string, string>> = {
  en: {
    overlay_title: 'Attach your file',
    overlay_body:
      'Click the highlighted field to attach your CV (browser requires a user click).',
    continue: 'Continue',
    skip: 'Skip',
    dry_run: 'Dry-Run: form has been prefilled for your review.',
    legal_off: 'Legal Mode is OFF for this site. Enable it in Options.',
    submitting: 'Submitting…',
    success: 'Application submitted successfully!',
    error: 'An error occurred',
    review_needed: 'Please review and complete the application manually.',
    field_label: 'Field',
    intended_value: 'Intended value',
    current_value: 'Current value'
  },
  tr: {
    overlay_title: 'Dosyanızı ekleyin',
    overlay_body:
      "CV'nizi eklemek için vurgulanan alana tıklayın (tarayıcı kullanıcı tıklaması ister).",
    continue: 'Devam',
    skip: 'Atla',
    dry_run: 'Deneme: Form gözden geçirmeniz için dolduruldu.',
    legal_off: 'Bu site için Yasal Mod KAPALI. Ayarlar\'dan açın.',
    submitting: 'Gönderiliyor…',
    success: 'Başvuru başarıyla gönderildi!',
    error: 'Bir hata oluştu',
    review_needed: 'Lütfen başvuruyu manuel olarak gözden geçirin ve tamamlayın.',
    field_label: 'Alan',
    intended_value: 'İstenen değer',
    current_value: 'Mevcut değer'
  }
}

export function t(key: string, lang: Lang = 'en'): string {
  return dict[lang][key] ?? dict.en[key] ?? key
}
