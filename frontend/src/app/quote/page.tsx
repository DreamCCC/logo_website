"use client";

import { QuoteWizard } from "@/components/QuoteWizard";
import { useLanguage } from "@/components/LanguageProvider";

export default function QuotePage() {
  const { t } = useLanguage();

  return (
    <main className="ls-app-page ls-standalone-quote">
      <div className="ls-app-container">
        <div className="ls-page-heading">
          <div>
            <p className="eyebrow">{t.quote.eyebrow}</p>
            <h1>{t.quote.title}</h1>
          </div>
          <p className="ls-muted ls-heading-copy">{t.quote.intro}</p>
        </div>
        <QuoteWizard />
      </div>
    </main>
  );
}
