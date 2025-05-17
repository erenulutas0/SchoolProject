// SQL dosyalarını analiz eden gelişmiş parser

export function parseSQLSchema(sqlContent) {
  // Tablo adlarını bulma - PostgreSQL formatına daha uygun
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?["']?(\w+)["']?/gi;
  const tables = [];
  let tableMatch;
  
  while ((tableMatch = tableRegex.exec(sqlContent)) !== null) {
    const tableName = tableMatch[1];
    if (tableName) {
      tables.push(tableName);
    }
  }
  
  console.log('Bulunan tablolar:', tables);
  return tables;
}

export function extractTableData(sqlContent) {
  const database = {};
  
  // 1. Önce tüm tabloları bul
  const tables = parseSQLSchema(sqlContent);
  
  // 2. Her tablo için yapıyı analiz et
  tables.forEach(tableName => {
    try {
      // Tablo tanımını bul - PostgreSQL formatına uygun
      const tableDefRegex = new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(?:public\\.)?["']?${tableName}["']?\\s*\\(([\\s\\S]*?)\\);`, 'i');
      const tableDefMatch = tableDefRegex.exec(sqlContent);
      
      if (tableDefMatch) {
        const columnDef = tableDefMatch[1];
        
        // Sütunları analiz et
        const columns = extractColumns(columnDef);
        
        // INSERT ifadelerini bul
        const insertData = extractInsertData(sqlContent, tableName);
        
        database[tableName] = {
          columns: columns,
          data: insertData
        };
      }
    } catch (err) {
      console.error(`${tableName} tablosu analiz edilirken hata:`, err);
    }
  });
  
  return database;
}

function extractColumns(columnDef) {
  // Yorum satırlarını ve boşlukları temizle
  const cleanColumnDef = columnDef.replace(/--.*$/gm, '').trim();
  
  // Virgülle ayırarak sütun tanımlarını al
  const columnLines = cleanColumnDef.split(',').map(line => line.trim());
  const columns = [];
  
  columnLines.forEach(line => {
    // Boş satırları atla
    if (!line) return;
    
    // İlk kelime sütun adıdır
    const columnMatch = line.match(/^["']?(\w+)["']?\s+/);
    if (columnMatch) {
      columns.push(columnMatch[1]);
    }
  });
  
  return columns;
}

function extractInsertData(sqlContent, tableName) {
  const rows = [];
  
  try {
    // 1. INSERT INTO ifadeleri için
    const insertRegexStr = `INSERT\\s+INTO\\s+(?:public\\.)?["']?${tableName}["']?\\s*\\(([^)]+)\\)\\s*VALUES\\s*\\(([^)]+)\\)`;
    const insertRegex = new RegExp(insertRegexStr, 'gi');
    
    let insertMatch;
    while ((insertMatch = insertRegex.exec(sqlContent)) !== null) {
      try {
        const columnsPart = insertMatch[1];
        const valuesPart = insertMatch[2];
        
        // Sütun adlarını parse et
        const columns = columnsPart.split(',').map(col => col.trim().replace(/["']/g, ''));
        
        // Değerleri parse et
        let values = parseValues(valuesPart);
        
        // Bir satır oluştur
        const row = {};
        columns.forEach((col, i) => {
          if (i < values.length) {
            row[col] = values[i];
          }
        });
        
        rows.push(row);
      } catch (err) {
        console.error(`INSERT analiz edilirken hata:`, err);
      }
    }
    
    // 2. COPY ifadeleri için (PostgreSQL dump'ları için)
    const copyRegexStr = `COPY\\s+(?:public\\.)?["']?${tableName}["']?\\s*\\(([^)]+)\\)\\s*FROM\\s*stdin;\\s*([\\s\\S]*?)\\\\\\.\s*`;
    const copyRegex = new RegExp(copyRegexStr, 'gi');
    
    let copyMatch;
    while ((copyMatch = copyRegex.exec(sqlContent)) !== null) {
      try {
        const columnsPart = copyMatch[1];
        const dataPart = copyMatch[2];
        
        // Sütun adlarını parse et
        const columns = columnsPart.split(',').map(col => col.trim().replace(/["']/g, ''));
        
        // Verileri satır satır parse et
        const dataRows = dataPart.trim().split('\n');
        
        dataRows.forEach(dataRow => {
          if (dataRow.trim()) {
            // Tab karakteri ile ayrılmış değerler
            const values = dataRow.split('\t');
            const row = {};
            
            columns.forEach((col, i) => {
              if (i < values.length) {
                row[col] = values[i] === '\\N' ? null : values[i];
              }
            });
            
            rows.push(row);
          }
        });
      } catch (err) {
        console.error(`COPY analiz edilirken hata:`, err);
      }
    }
  } catch (err) {
    console.error(`Veri çıkarma sırasında hata:`, err);
  }
  
  return rows;
}

function parseValues(valuesPart) {
  const values = [];
  let currentValue = '';
  let inQuote = false;
  let quoteChar = null;
  
  // Karakter karakter ayrıştırma
  for (let i = 0; i < valuesPart.length; i++) {
    const char = valuesPart[i];
    
    // Alıntı (quote) işaretlerini kontrol et
    if ((char === "'" || char === '"') && (i === 0 || valuesPart[i-1] !== '\\')) {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
      }
    }
    
    // Virgülle ayrılmış değerler
    if (char === ',' && !inQuote) {
      values.push(cleanValue(currentValue));
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Son değeri ekle
  if (currentValue) {
    values.push(cleanValue(currentValue));
  }
  
  return values;
}

// Değerleri temizleme fonksiyonu
function cleanValue(value) {
  // Değerleri temizleme
  let cleanedValue = value.trim();
  
  // Tırnak işaretlerini kaldır
  if ((cleanedValue.startsWith("'") && cleanedValue.endsWith("'")) || 
      (cleanedValue.startsWith('"') && cleanedValue.endsWith('"'))) {
    cleanedValue = cleanedValue.substring(1, cleanedValue.length - 1);
  }
  
  // NULL değerlerini kontrol et
  if (cleanedValue.toLowerCase() === 'null') {
    return null;
  }
  
  return cleanedValue;
}