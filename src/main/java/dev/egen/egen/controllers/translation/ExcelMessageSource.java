package dev.egen.egen.controllers.translation;

import org.springframework.context.support.AbstractMessageSource;
import org.springframework.stereotype.Component;
import java.text.MessageFormat;
import java.util.Locale;

@Component("messageSource")
public class ExcelMessageSource extends AbstractMessageSource {
    private final ExcelTranslationProvider provider;

    public ExcelMessageSource(ExcelTranslationProvider provider) throws Exception {
        this.provider = provider;
        this.provider.loadTranslations("static/translations.xlsx");
    }

    @Override
    protected MessageFormat resolveCode(String code, Locale locale) {
        String translation = provider.getTranslation(code, locale);
        return new MessageFormat(translation, locale);
    }
}
