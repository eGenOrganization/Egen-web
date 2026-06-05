package dev.egen.egen.controllers.translation;

import org.apache.poi.ss.usermodel.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.util.*;

@Service
public class ExcelTranslationProvider {
    private final Map<String, Map<Locale, String>> translations = new HashMap<>();

    private int getColomnsLength(Row row) {
        for (int i = row.getLastCellNum(); i >= 0; i--) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return i + 1;
            }
        }
        return 0;
    }

    public void loadTranslations(String filePath) throws Exception {
        ClassPathResource resource = new ClassPathResource(filePath);
        InputStream inputStream = resource.getInputStream();
        Workbook workbook = WorkbookFactory.create(inputStream);
        Sheet sheet = workbook.getSheetAt(0);
        Vector<String> langIds = new Vector<String>();
        Row firstRow = sheet.getRow(0);
        int columnsLength = getColomnsLength(firstRow);
        int rowNumber = sheet.getLastRowNum();

        for (int j = 1; j <= columnsLength; j++){
        Cell cell = firstRow.getCell(j);
            if (cell != null) {
                langIds.add(cell.getStringCellValue());
            }
        }

        for (int i = 1; i <= rowNumber; i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            String key = row.getCell(0).getStringCellValue();
            Map<Locale, String> langMap = new HashMap<>();
            for (int j = 1; j < columnsLength; j++){
                if ((j - 1) >= langIds.size()) break;
                Locale langTag = Locale.forLanguageTag(langIds.get(j - 1));
                Cell cell = row.getCell(j);
                String value = (cell != null) ? cell.getStringCellValue() : key;
                langMap.put(langTag, value);
            }
            translations.put(key, langMap);
        }
        workbook.close();
    }

    public String getTranslation(String key, Locale locale) {
        Map<Locale, String> values = translations.get(key);
        if (values == null) {
            System.out.println("Key is not found: " + key);
            return key;
        }
        String result = values.get(locale);
        if (result == null) {
            System.out.println("Locale is not found: " + locale + " for key " + key);
            System.out.println("Available locales for this key: " + values.keySet());
            return key;
        }
        return result;
    }
}
