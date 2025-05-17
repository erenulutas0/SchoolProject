import React, { useState, useEffect } from 'react';
import { Treebeard } from 'react-treebeard';
import { customStyles } from './TreebeardStyles';
import { parseSQLSchema, extractTableData } from './sqlParser';
import ErrorBoundary from './ErrorBoundary';
import './App.css';
import SqlEditor from './components/SqlEditor';

function formatDateTime(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function App() {
  const [treeData, setTreeData] = useState({ 
    name: 'Database Schema', 
    toggled: true, 
    children: [] 
  });
  const [cursor, setCursor] = useState(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [database, setDatabase] = useState({});
  const [sqlContent, setSqlContent] = useState('');
  
  // Dosya yüklemesi işleme
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.sql')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setSqlContent(content);
        
        const parsedTables = parseSQLSchema(content);
        
        if (parsedTables.length > 0) {
          const tableTree = {
            name: file.name,
            toggled: true,
            children: parsedTables.map(tableName => ({
              name: tableName,
              toggled: false,
              children: []
            }))
          };
          
          setTreeData(tableTree);
          
          const extractedData = extractTableData(content);
          // --- Tarih alanlarını Date nesnesine çevir ---
          for (const tableName in extractedData) {
            const table = extractedData[tableName];
            table.data.forEach(row => {
              for (const columnName in row) {
                if (
                  typeof row[columnName] === 'string' &&
                  (columnName.toLowerCase().includes('time') || columnName.toLowerCase().includes('date'))
                ) {
                  let val = row[columnName];
                  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(val)) {
                    val = val.replace(' ', 'T');
                  }
                  const d = new Date(val);
                  if (!isNaN(d.getTime())) {
                    row[columnName] = d;
                  }
                }
              }
            });
          }
          setDatabase(extractedData);
          console.log("Extracted database:", extractedData);
        } else {
          alert('SQL dosyasında tablo bulunamadı.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Lütfen bir .sql dosyası yükleyin.');
    }
  };

  // Ağaç düğümüne tıklama işleyicisi
  const onToggle = (node, toggled) => {
    if (cursor) {
      cursor.active = false;
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }
    setCursor(node);
    setTreeData({...treeData});
    if (node.name && node.name !== 'Database Schema' && !node.name.endsWith('.sql')) {
      setSqlQuery(`SELECT * FROM ${node.name};`);
    }
  };

  // SQL sorgusunu çalıştır
  const executeQuery = () => {
    if (!sqlQuery.trim()) {
      alert('Lütfen bir SQL sorgusu girin.');
      return;
    }
    
    // Check if query ends with semicolon
    if (!sqlQuery.trim().endsWith(';')) {
      alert('SQL sorgusu noktalı virgül (;) ile bitmelidir.');
      return;
    }
    
    // Remove the trailing semicolon before processing
    const queryWithoutSemicolon = sqlQuery.trim().replace(/;$/, '');
    const processedQuery = preprocessSQLQuery(queryWithoutSemicolon);
    const result = executeSimpleQuery(processedQuery, database);
    setQueryResult(result);
    setShowResults(true);
  };

  // SQL sorgusunu ön işleme tabi tut
  const preprocessSQLQuery = (query) => {
    let processedQuery = query.replace(/\b(\w+)\s+as\s+(\w+)\b/gi, '$1 AS $2');
    processedQuery = processedQuery.replace(/\bcount\s*\(\s*([^)]+)\s*\)/gi, 'COUNT($1)');
    processedQuery = processedQuery.replace(/\bsum\s*\(\s*([^)]+)\s*\)/gi, 'SUM($1)');
    processedQuery = processedQuery.replace(/\bavg\s*\(\s*([^)]+)\s*\)/gi, 'AVG($1)');
    processedQuery = processedQuery.replace(/\bmin\s*\(\s*([^)]+)\s*\)/gi, 'MIN($1)');
    processedQuery = processedQuery.replace(/\bmax\s*\(\s*([^)]+)\s*\)/gi, 'MAX($1)');
    
    // Process string functions
    processedQuery = processedQuery.replace(/\bupper\s*\(\s*([^)]+)\s*\)/gi, 'UPPER($1)');
    processedQuery = processedQuery.replace(/\blower\s*\(\s*([^)]+)\s*\)/gi, 'LOWER($1)');
    
    // Process CASE expressions (basic support)
    const casePattern = /CASE\s+WHEN\s+(.+?)\s+THEN\s+(.+?)\s+ELSE\s+(.+?)\s+END/gi;
    processedQuery = processedQuery.replace(casePattern, 'CASE_WHEN_THEN_ELSE($1,$2,$3)');
    
    return processedQuery;
  };

  const executeSimpleQuery = (query, db) => {
    console.log("Executing query:", query);
    console.log("Using database:", db);
    
    const lowercaseQuery = query.toLowerCase().trim();

    if (!lowercaseQuery.startsWith('select')) {
      return { error: 'Sadece SELECT sorguları destekleniyor.' };
    }

    // SELECT clause ayrıştırma kısmını aşağıdaki gibi güncelleyin:
    let selectClause = '';
    let isDistinct = false;
    let distinctOnColumns = [];

    if (/^select\s+distinct\s+on\s*\(/i.test(query)) {
        isDistinct = true;
        const distinctOnRegex = /^select\s+distinct\s+on\s*\(([^)]+)\)\s+([\s\S]+?)\s+from\s+/i;
        const match = query.match(distinctOnRegex);
        if (match) {
            // DISTINCT ON sütunlarını ayırın
            distinctOnColumns = match[1].split(',').map(s => s.trim());
            // Gerçek SELECT sütunlarını alın (ON(...) kısmı çıkartıldı)
            selectClause = match[2];
        }
    } else {
        const selectMatch = query.match(/^select\s+(distinct\s+)?([\s\S]+?)\s+from\s+/i);
        if (selectMatch) {
            if (selectMatch[1] && selectMatch[1].toLowerCase().includes('distinct')) {
                isDistinct = true;
            }
            selectClause = selectMatch[2];
        }
    }

    if (/^distinct\s+on\s*\(([^)]+)\)/i.test(selectClause)) {
      // distinctOnColumns'ı yeniden declare etmeyin, sadece atama yapın:
      distinctOnColumns = selectClause.match(/^distinct\s+on\s*\(([^)]+)\)/i)[1].split(',').map(s => s.trim());
      // DISTINCT ON kısmını selectClause'den çıkarın:
      selectClause = selectClause.replace(/^distinct\s+on\s*\([^)]+\)\s*/i, '');
      // İsteğe bağlı olarak isDistinct'i de true yapabilirsiniz
      isDistinct = true;
    }

    const fromMatch = query.match(/\sfrom\s+(\w+)(?:\s+(?:as\s+)?(\w+))?/i);
    const joinMatches = [...query.matchAll(/(left|right|inner|full)?\s*join\s+(\w+)(?:\s+(?:as\s+)?(\w+))?\s+on\s+([^.]+)\.(\w+)\s*=\s*([^.]+)\.(\w+)/gi)];
    const whereMatch = query.match(/\swhere\s+(.+?)(?:\sgroup\s+by|\sorder\s+by|\shaving|\slimit|\soffset|$)/i);
    const groupByMatch = query.match(/\sgroup\s+by\s+(.+?)(?:\shaving|\sorder\s+by|\slimit|\soffset|$)/i);
    const havingMatch = query.match(/\shaving\s+(.+?)(?:\sorder\s+by|\slimit|\soffset|$)/i);
    const orderByMatch = query.match(/\sorder\s+by\s+(.+?)(?:\slimit|\soffset|$)/i);
    const limitMatch = query.match(/\slimit\s+(\d+)/i);
    const offsetMatch = query.match(/\soffset\s+(\d+)/i);
    const limitValue = limitMatch ? parseInt(limitMatch[1]) : null;
    const offsetValue = offsetMatch ? parseInt(offsetMatch[1]) : 0;

    if (!selectClause || !fromMatch) {
      return { error: 'SELECT veya FROM ifadesi bulunamadı.' };
    }

    const mainTable = fromMatch[1];
    const mainAlias = fromMatch[2] || mainTable;
    const tableAliases = { [mainAlias]: mainTable };
    if (!db[mainTable]) return { error: `Tablo '${mainTable}' bulunamadı.` };

    joinMatches.forEach(match => {
      const joinTable = match[2];
      const joinAlias = match[3] || joinTable;
      tableAliases[joinAlias] = joinTable;
    });

    let rows = [];
    
    if (db[mainTable] && db[mainTable].data) {
      rows = db[mainTable].data.map(row => {
        const newRow = { ...row };
        for (const [k, v] of Object.entries(row)) {
          newRow[`${mainAlias}.${k}`] = v;
        }
        return newRow;
      });
    }

    for (const match of joinMatches) {
      const joinType = (match[1] || 'inner').toUpperCase();
      const joinTable = match[2];
      const joinAlias = match[3] || joinTable;
      const leftTable = match[4];
      const leftCol = match[5];
      const rightTable = match[6];
      const rightCol = match[7];

      if (!db[joinTable]) return { error: `Tablo '${joinTable}' bulunamadı.` };

      const rightRows = db[joinTable].data.map(row =>
        Object.fromEntries(Object.entries(row).map(([k, v]) => [`${joinAlias}.${k}`, v]))
      );

      let newRows = [];
      if (joinType === 'INNER') {
        for (const l of rows) {
          for (const r of rightRows) {
            if (
              l[`${leftTable}.${leftCol}`] !== undefined &&
              r[`${rightTable}.${rightCol}`] !== undefined &&
              l[`${leftTable}.${leftCol}`] == r[`${rightTable}.${rightCol}`]
            ) {
              newRows.push({ ...l, ...r });
            }
          }
        }
      } else if (joinType === 'LEFT') {
        for (const l of rows) {
          let matched = false;
          for (const r of rightRows) {
            if (
              l[`${leftTable}.${leftCol}`] !== undefined &&
              r[`${rightTable}.${rightCol}`] !== undefined &&
              l[`${leftTable}.${leftCol}`] == r[`${rightTable}.${rightCol}`]
            ) {
              newRows.push({ ...l, ...r });
              matched = true;
            }
          }
          if (!matched) {
            const nulls = Object.fromEntries(
              Object.keys(db[joinTable].columns).map(col => [`${joinAlias}.${db[joinTable].columns[col]}`, null])
            );
            newRows.push({ ...l, ...nulls });
          }
        }
      }
      rows = newRows;
    }

    // ... JOIN işlemleri tamamlandıktan sonra, GROUP BY öncesinde WHERE koşulunu uygulayın:
    if (whereMatch) {
      const whereCond = whereMatch[1].trim();
      // Basit WHERE koşulu değerlendirme; evaluateCondition fonksiyonu eşitlik ve basit karşılaştırmaları destekliyor
      rows = rows.filter(row => evaluateCondition(whereCond, row));
    }

    let groupByCols = [];
    if (groupByMatch) {
      console.log("GROUP BY Match bulundu:", groupByMatch[1]);

      groupByCols = groupByMatch[1].split(',').map(s => s.trim());
      const groupMap = new Map();
      
      for (const row of rows) {
        const keyParts = groupByCols.map(col => {
          let value;
          const dateFnMatch = col.match(/^date\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)$/i);
          if (dateFnMatch) {
            const dateCol = dateFnMatch[1];
            const val = row[dateCol] !== undefined ? row[dateCol] : row[dateCol.replace(/^.*\./, '')];
            const dt = val instanceof Date ? val : new Date(val);
            if (!isNaN(dt)) {
              const dayStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
              row['day'] = dayStr;
              value = dayStr;
            }
          } else {
            value = row[col];
            if ((value === undefined || value === null) && col.toLowerCase() === 'day' && row.booking_time) {
              const dt = new Date(row.booking_time);
              if (!isNaN(dt)) {
                value = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
                row['day'] = value;
              }
            }
          }
          return value !== undefined && value !== null ? value : '';
        });
        
        const key = keyParts.join('|');
        console.log(`Oluşturulan grup anahtarı: ${key}`);
        
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key).push(row);
      }
      
      const aggregatedResults = [];
      
      for (const [key, groupRows] of groupMap.entries()) {
        console.log(`${key} grubunda ${groupRows.length} satır var`);
        const resultRow = {};
        
        const selectColumns = splitByCommaOutsideParentheses(selectClause).map(expr => expr.trim());
        
        for (const expr of selectColumns) {
          const trimmedExpr = expr.trim();
          
          const countMatch = trimmedExpr.match(/^count\s*\(\s*(distinct\s+)?([a-zA-Z0-9_\.]+|\*)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
          if (countMatch) {
            const isDistinct = !!countMatch[1];
            const countCol = countMatch[2];
            const alias = countMatch[3] || `count_${countCol.replace(/\./g, '_')}`;
            
            if (countCol === '*') {
                resultRow[alias] = groupRows.length;
            } else if (isDistinct) {
                const uniqueVals = new Set();
                groupRows.forEach(r => {
                    const val = r[countCol] !== undefined ? r[countCol] : r[countCol.replace(/^.*\./, '')];
                    if (val !== null && val !== undefined) uniqueVals.add(val);
                });
                resultRow[alias] = uniqueVals.size;
            } else {
                resultRow[alias] = groupRows.filter(r => {
                    const val = r[countCol] !== undefined ? r[countCol] : r[countCol.replace(/^.*\./, '')];
                    return val !== null && val !== undefined;
                }).length;
            }
            continue;
          }
          
          const sumMatch = trimmedExpr.match(/^sum\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
          if (sumMatch) {
            const sumCol = sumMatch[1];
            const alias = sumMatch[2] || `sum_${sumCol.replace(/\./g, '_')}`;
            
            resultRow[alias] = groupRows.reduce((acc, r) => {
              const val = r[sumCol] !== undefined ? r[sumCol] : r[sumCol.replace(/^.*\./, '')];
              const numVal = parseFloat(val);
              return acc + (isNaN(numVal) ? 0 : numVal);
            }, 0);
            continue;
          }
          
          const minMatch = trimmedExpr.match(/^min\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
          if (minMatch) {
            const minCol = minMatch[1];
            const alias = minMatch[2] || `min_${minCol.replace(/\./g, '_')}`;
            
            const isDateColumn = minCol.toLowerCase().includes('time') || minCol.toLowerCase().includes('date');
            
            if (isDateColumn) {
              let minDate = null;
              for (const r of groupRows) {
                const val = r[minCol] !== undefined ? r[minCol] : r[minCol.replace(/^.*\./, '')];
                if (val instanceof Date) {
                  if (minDate === null || val < minDate) {
                    minDate = val;
                  }
                } else if (val) {
                  const dateVal = new Date(val);
                  if (!isNaN(dateVal) && (minDate === null || dateVal < minDate)) {
                    minDate = dateVal;
                  }
                }
              }
              resultRow[alias] = minDate;
            } else {
              const values = groupRows.map(r => {
                const val = r[minCol] !== undefined ? r[minCol] : r[minCol.replace(/^.*\./, '')];
                return val !== null && val !== undefined ? parseFloat(val) : null;
              }).filter(val => val !== null && !isNaN(val));
              
              resultRow[alias] = values.length > 0 ? Math.min(...values) : null;
            }
            continue;
          }
          
          const maxMatch = trimmedExpr.match(/^max\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
          if (maxMatch) {
            const maxCol = maxMatch[1];
            const alias = maxMatch[2] || `max_${maxCol.replace(/\./g, '_')}`;
            
            const isDateColumn = maxCol.toLowerCase().includes('time') || maxCol.toLowerCase().includes('date');
            
            if (isDateColumn) {
              let maxDate = null;
              for (const r of groupRows) {
                const val = r[maxCol] !== undefined ? r[maxCol] : r[maxCol.replace(/^.*\./, '')];
                if (val instanceof Date) {
                  if (maxDate === null || val > maxDate) {
                    maxDate = val;
                  }
                } else if (val) {
                  const dateVal = new Date(val);
                  if (!isNaN(dateVal) && (maxDate === null || dateVal > maxDate)) {
                    maxDate = dateVal;
                  }
                }
              }
              resultRow[alias] = maxDate;
            } else {
              const values = groupRows.map(r => {
                const val = r[maxCol] !== undefined ? r[maxCol] : r[maxCol.replace(/^.*\./, '')];
                return val !== null && val !== undefined ? parseFloat(val) : null;
              }).filter(val => val !== null && !isNaN(val));
              
              resultRow[alias] = values.length > 0 ? Math.max(...values) : null;
            }
            continue;
          }
          
          const avgMatch = trimmedExpr.match(/^avg\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
          if (avgMatch) {
            const avgCol = avgMatch[1];
            const alias = avgMatch[2] || `avg_${avgCol.replace(/\./g, '_')}`;
            
            const values = groupRows.map(r => {
              const val = r[avgCol] !== undefined ? r[avgCol] : r[avgCol.replace(/^.*\./, '')];
              return val !== null && val !== undefined ? parseFloat(val) : null;
            }).filter(val => val !== null && !isNaN(val));
            
            resultRow[alias] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
            continue;
          }
          
          const columnMatch = expr.match(/^(\w+)\.(\w+)$/);
          if (columnMatch) {
            const tableAlias = columnMatch[1];
            const columnName = columnMatch[2];
            resultRow[columnName] = groupRows[0][expr];
            continue;
          }
          
          const asMatch = expr.match(/^([a-zA-Z0-9_\.]+)\s+as\s+([a-zA-Z0-9_]+)/i);
          if (asMatch) {
            const col = asMatch[1];
            const alias = asMatch[2];
            resultRow[alias] = groupRows[0][col];
            continue;
          }
          
          const upperMatch = trimmedExpr.match(/^upper\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
          if (upperMatch) {
            const col = upperMatch[1];
            const alias = upperMatch[2] || `upper_${col.replace(/\./g, '_')}`;
            const val = groupRows[0][col] !== undefined ? groupRows[0][col] : groupRows[0][col.replace(/^.*\./, '')];
            resultRow[alias] = typeof val === 'string' ? val.toUpperCase() : val;
            continue;
          }
          
          const lowerMatch = trimmedExpr.match(/^lower\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
          if (lowerMatch) {
            const col = lowerMatch[1];
            const alias = lowerMatch[2] || `lower_${col.replace(/\./g, '_')}`;
            const val = groupRows[0][col] !== undefined ? groupRows[0][col] : groupRows[0][col.replace(/^.*\./, '')];
            resultRow[alias] = typeof val === 'string' ? val.toLowerCase() : val;
            continue;
          }
          
          const dateFnMatch = trimmedExpr.match(/^date\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))/i);
          if (dateFnMatch) {
            const col = dateFnMatch[1];
            const alias = dateFnMatch[2];
            const val = groupRows[0][col] !== undefined ? groupRows[0][col] : groupRows[0][col.replace(/^.*\./, '')];
            const dt = val instanceof Date ? val : new Date(val);
            if (!isNaN(dt)) {
              const yyyy = dt.getFullYear();
              const mm = String(dt.getMonth() + 1).padStart(2, '0');
              const dd = String(dt.getDate()).padStart(2, '0');
              resultRow[alias] = `${yyyy}-${mm}-${dd}`;
            } else {
              resultRow[alias] = null;
            }
            continue;
          }
          
          resultRow[expr] = groupRows[0][expr];
        }
        
        const keyParts = key.split('|');
        groupByCols.forEach((col, i) => {
          // Eğer tam sütun adı zaten sonuç satırında yoksa ekle
          // Ya da bu satırı tamamen kaldırın
          if (!resultRow.hasOwnProperty(col) && !resultRow.hasOwnProperty(col.split('.')[1])) {
            resultRow[col] = keyParts[i];
          }
        });
        
        aggregatedResults.push(resultRow);
      }
      
      rows = aggregatedResults;
      
      if (havingMatch) {
        const havingCond = havingMatch[1].trim();
        rows = rows.filter(row => {
          return evaluateHavingCondition(havingCond, row);
        });
      }
    } else {
      let expandedSelectColumns = [];
      
      const hasAggregation = selectClause.toLowerCase().includes('count(') || 
                            selectClause.toLowerCase().includes('sum(') || 
                            selectClause.toLowerCase().includes('avg(') ||
                            selectClause.toLowerCase().includes('min(') ||
                            selectClause.toLowerCase().includes('max(');
      
      if (hasAggregation) {
        const selectParts = splitByCommaOutsideParentheses(selectClause);
        const resultRow = {};
        
        for (const expr of selectParts) {
          const trimmedExpr = expr.trim();
          
          const countMatch = trimmedExpr.match(/^count\s*\(\s*(distinct\s+)?([a-zA-Z0-9_\.]+|\*)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
          if (countMatch) {
            const isDistinct = !!countMatch[1];
            const countCol = countMatch[2];
            const alias = countMatch[3] || `count_${countCol.replace(/\./g, '_')}`;
            
            if (countCol === '*') {
              resultRow[alias] = rows.length;
            } else if (isDistinct) {
              const uniqueVals = new Set();
              rows.forEach(r => {
                const val = r[countCol] !== undefined ? r[countCol] : r[countCol.replace(/^.*\./, '')];
                if (val !== null && val !== undefined) uniqueVals.add(val);
              });
              resultRow[alias] = uniqueVals.size;
            } else {
              resultRow[alias] = rows.filter(r => {
                const val = r[countCol] !== undefined ? r[countCol] : r[countCol.replace(/^.*\./, '')];
                return val !== null && val !== undefined;
              }).length;
            }
            continue;
          }
          
          const sumMatch = trimmedExpr.match(/^sum\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
          if (sumMatch) {
            const sumCol = sumMatch[1];
            const alias = sumMatch[2] || `sum_${sumCol.replace(/\./g, '_')}`;
            resultRow[alias] = rows.reduce((acc, r) => {
              const val = r[sumCol] !== undefined ? r[sumCol] : r[sumCol.replace(/^.*\./, '')];
              return acc + (parseFloat(val) || 0);
            }, 0);
            continue;
          }

          const avgMatch = trimmedExpr.match(/^avg\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
          if (avgMatch) {
            const avgCol = avgMatch[1];
            const alias = avgMatch[2] || `avg_${avgCol.replace(/\./g, '_')}`;
            const vals = rows.map(r => {
              const val = r[avgCol] !== undefined ? r[avgCol] : r[avgCol.replace(/^.*\./, '')];
              return parseFloat(val);
            }).filter(v => !isNaN(v));
            resultRow[alias] = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : null;
            continue;
          }
          
          const minMatch = trimmedExpr.match(/^min\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
          if (minMatch) {
            const minCol = minMatch[1];
            const alias = minMatch[2] || `min_${minCol.replace(/\./g, '_')}`;
            
            const isDateColumn = minCol.toLowerCase().includes('time') || minCol.toLowerCase().includes('date');
            
            if (isDateColumn) {
              let minDate = null;
              for (const r of rows) {
                const val = r[minCol] !== undefined ? r[minCol] : r[minCol.replace(/^.*\./, '')];
                if (val instanceof Date) {
                  if (minDate === null || val < minDate) {
                    minDate = val;
                  }
                } else if (val) {
                  const dateVal = new Date(val);
                  if (!isNaN(dateVal) && (minDate === null || dateVal < minDate)) {
                    minDate = dateVal;
                  }
                }
              }
              resultRow[alias] = minDate;
            } else {
              const values = rows.map(r => {
                const val = r[minCol] !== undefined ? r[minCol] : r[minCol.replace(/^.*\./, '')];
                return val !== null && val !== undefined ? parseFloat(val) : null;
              }).filter(val => val !== null && !isNaN(val));
              
              resultRow[alias] = values.length > 0 ? Math.min(...values) : null;
            }
            continue;
          }
          
          const maxMatch = trimmedExpr.match(/^max\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
          if (maxMatch) {
            const maxCol = maxMatch[1];
            const alias = maxMatch[2] || `max_${maxCol.replace(/\./g, '_')}`;
            
            const isDateColumn = maxCol.toLowerCase().includes('time') || maxCol.toLowerCase().includes('date');
            
            if (isDateColumn) {
              let maxDate = null;
              for (const r of rows) {
                const val = r[maxCol] !== undefined ? r[maxCol] : r[maxCol.replace(/^.*\./, '')];
                if (val instanceof Date) {
                  if (maxDate === null || val > maxDate) {
                    maxDate = val;
                  }
                } else if (val) {
                  const dateVal = new Date(val);
                  if (!isNaN(dateVal) && (maxDate === null || dateVal > maxDate)) {
                    maxDate = dateVal;
                  }
                }
              }
              resultRow[alias] = maxDate;
            } else {
              const values = rows.map(r => {
                const val = r[maxCol] !== undefined ? r[maxCol] : r[maxCol.replace(/^.*\./, '')];
                return val !== null && val !== undefined ? parseFloat(val) : null;
              }).filter(val => val !== null && !isNaN(val));
              
              resultRow[alias] = values.length > 0 ? Math.max(...values) : null;
            }
            continue;
          }
        }
        
        rows = [resultRow];
      } else {
        if (selectClause.trim() === '*') {
          if (db[mainTable] && db[mainTable].data && db[mainTable].data.length > 0) {
            expandedSelectColumns = Object.keys(db[mainTable].data[0]);
          }
        } else {
          const selectParts = splitByCommaOutsideParentheses(selectClause);
          for (const part of selectParts) {
            const trimmedPart = part.trim();
            const aliasWildcardMatch = trimmedPart.match(/^(\w+)\.\*$/);
            if (aliasWildcardMatch) {
              const tableAlias = aliasWildcardMatch[1];
              const actualTableName = tableAliases[tableAlias];
              if (db[actualTableName] && db[actualTableName].data && db[actualTableName].data.length > 0) {
                const tableColumns = Object.keys(db[actualTableName].data[0]);
                expandedSelectColumns.push(...tableColumns);
              }
            } else {
              expandedSelectColumns.push(trimmedPart);
            }
          }
        }
        rows = rows.map(row => {
          const resultRow = {};
          for (const expr of expandedSelectColumns) {
            const asMatch = expr.match(/^([a-zA-Z0-9_\.]+)\s+as\s+([a-zA-Z0-9_]+)/i);
            if (asMatch) {
              const col = asMatch[1];
              const alias = asMatch[2];
              resultRow[alias] = row[col];
              continue;
            }
            
            const columnMatch = expr.match(/^(\w+)\.(\w+)$/);
            if (columnMatch) {
              const tableAlias = columnMatch[1];
              const columnName = columnMatch[2];
              resultRow[columnName] = row[expr];
              continue;
            }
            
            const upperMatch = expr.match(/^upper\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
            if (upperMatch) {
              const col = upperMatch[1];
              const alias = upperMatch[2] || `upper_${col.replace(/\./g, '_')}`;
              const val = row[col] !== undefined ? row[col] : row[col.replace(/^.*\./, '')];
              resultRow[alias] = typeof val === 'string' ? val.toUpperCase() : val;
              continue;
            }
            
            const lowerMatch = expr.match(/^lower\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))?/i);
            if (lowerMatch) {
              const col = lowerMatch[1];
              const alias = lowerMatch[2] || `lower_${col.replace(/\./g, '_')}`;
              const val = row[col] !== undefined ? row[col] : row[col.replace(/^.*\./, '')];
              resultRow[alias] = typeof val === 'string' ? val.toLowerCase() : val;
              continue;
            }
            
            const caseMatch = expr.match(/^CASE_WHEN_THEN_ELSE\(([^,]+),([^,]+),([^)]+)\)(?:\s+as\s+([a-zA-Z0-9_]+))?/i);
            if (caseMatch) {
              const [_, condition, thenValue, elseValue, alias] = caseMatch;
              const resultAlias = alias || 'case_result';
              
              const condResult = evaluateCondition(condition, row);
              
              resultRow[resultAlias] = condResult ? 
                thenValue.trim().replace(/^'|'$/g, '') : 
                elseValue.trim().replace(/^'|'$/g, '');
              continue;
            }
            
            const dateFnMatch = expr.match(/^date\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)\s*(?:as\s+([a-zA-Z0-9_]+))/i);
            if (dateFnMatch) {
              const col = dateFnMatch[1];
              const alias = dateFnMatch[2];
              const val = row[col] !== undefined ? row[col] : row[col.replace(/^.*\./, '')];
              const dt = val instanceof Date ? val : new Date(val);
              if (!isNaN(dt)) {
                const yyyy = dt.getFullYear();
                const mm = String(dt.getMonth() + 1).padStart(2, '0');
                const dd = String(dt.getDate()).padStart(2, '0');
                resultRow[alias] = `${yyyy}-${mm}-${dd}`;
              } else {
                resultRow[alias] = null;
              }
              continue;
            }
            
            resultRow[expr] = row[expr];
          }
          return resultRow;
        });
      }
    }

    let columns = [];
    if (rows.length > 0) {
      if (selectClause === '*') {
        if (db[mainTable]) {
          if (db[mainTable].data && db[mainTable].data.length > 0) {
            columns = Object.keys(db[mainTable].data[0]);
          } else if (db[mainTable].columns) {
            columns = Object.values(db[mainTable].columns);
          }
        }
      } else {
        columns = Object.keys(rows[0]);
      }
    }

    if (orderByMatch) {
      const orderByClause = orderByMatch[1].trim();
      const orderParts = orderByClause.split(',').map(part => {
        const trimmedPart = part.trim();
        const descMatch = / desc$/i.test(trimmedPart);
        const fieldName = trimmedPart.replace(/ (asc|desc)$/i, '').trim();
        const direction = descMatch ? -1 : 1;
        return { field: fieldName, direction };
      });

      rows.sort((a, b) => {
        for (const { field, direction } of orderParts) {
          let valA = a[field] !== undefined ? a[field] : a[field.replace(/^.*\./, '')];
          let valB = b[field] !== undefined ? b[field] : b[field.replace(/^.*\./, '')];

          // If both values are Date objects, compare using getTime()
          if (valA instanceof Date && valB instanceof Date) {
              if (valA.getTime() !== valB.getTime()) {
                  return (valA.getTime() - valB.getTime()) * direction;
              }
              continue;
          }

          // For numeric fields like price, use number conversion
          if (field === "price" || field.endsWith(".price")) {
              const numA = parseFloat(valA);
              const numB = parseFloat(valB);
              const aIsNumber = !isNaN(numA);
              const bIsNumber = !isNaN(numB);
              if (aIsNumber && bIsNumber) {
                  if (numA === numB) continue;
                  return (numA - numB) * direction;
              } else if (aIsNumber && !bIsNumber) {
                  return -1;
              } else if (!aIsNumber && bIsNumber) {
                  return 1;
              }
          }

          // Fallback to string comparison
          const aStr = String(valA ?? '');
          const bStr = String(valB ?? '');
          const compResult = aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' });
          if (compResult !== 0) {
              return compResult * direction;
          }
        }
        return 0;
      });
    }

    if (isDistinct && rows.length > 0) {
      if (distinctOnColumns.length > 0) {
        const uniqueRows = new Set();
        const distinctRows = [];
        
        for (const row of rows) {
          const signature = distinctOnColumns.map(col => {
            return row[col] !== undefined ? row[col] : row[col.replace(/^.*\./, '')] || '';
          }).join('|');
          
          if (!uniqueRows.has(signature)) {
            uniqueRows.add(signature);
            distinctRows.push(row);
          }
        }
        
        rows = distinctRows;
      } else {
        const uniqueRows = new Set();
        const distinctRows = [];
        
        for (const row of rows) {
          const signature = columns.map(col => {
            const val = row[col];
            return val === null || val === undefined ? 'NULL' : String(val);
          }).join('|');
          
          if (!uniqueRows.has(signature)) {
            uniqueRows.add(signature);
            distinctRows.push(row);
          }
        }
        
        rows = distinctRows;
      }
    }

    if (offsetValue > 0) {
      rows = rows.slice(offsetValue);
    }

    if (limitValue !== null && !isNaN(limitValue)) {
      rows = rows.slice(0, limitValue);
    }

    return { columns, rows };
  };

  // Helper function to evaluate conditions for CASE expressions
  function evaluateCondition(condition, row) {
    condition = condition.trim();

    // Handle DATE_TRUNC('month', <col>) = DATE '<YYYY-MM-DD>' conditions
    const dateTruncMatch = condition.match(/date_trunc\s*\(\s*['"]month['"]\s*,\s*([a-zA-Z0-9_\.]+)\s*\)\s*=\s*date\s+['"]?(\d{4}-\d{2}-\d{2})['"]?/i);
    if (dateTruncMatch) {
      const col = dateTruncMatch[1];
      const targetStr = dateTruncMatch[2]; // e.g. "2025-05-01"
      // Create a "YYYY-MM" string from the target date
      const targetYearMonth = targetStr.substring(0, 7); // "2025-05"
      let cellDate = row[col] !== undefined ? row[col] : row[col.replace(/^.*\./, '')];
      if (!(cellDate instanceof Date)) {
        cellDate = new Date(cellDate);
      }
      if (isNaN(cellDate.getTime())) return false;
      // Build a "YYYY-MM" string from the cell date
      const cellYearMonth = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}`;
      return cellYearMonth === targetYearMonth;
    }

    // Handle BETWEEN clause
    if (/BETWEEN/i.test(condition)) {
        const betweenMatch = condition.match(/([a-zA-Z0-9_\.]+)\s+BETWEEN\s+["']?(\d+(?:\.\d+)?)["']?\s+AND\s+["']?(\d+(?:\.\d+)?)["']?/i);
        if (betweenMatch) {
            const col = betweenMatch[1];
            const min = parseFloat(betweenMatch[2]);
            const max = parseFloat(betweenMatch[3]);
            let cell = row[col] || row[col.replace(/^.*\./, '')];
            const cellValue = parseFloat(cell);
            return !isNaN(cellValue) && cellValue >= min && cellValue <= max;
        }
        return false;
    }

    // Split on AND for simple conditions
    const conditions = condition.split(/\s+and\s+/i);
    return conditions.every(cond => {
        cond = cond.trim();

        // LIKE and ILIKE support
        const likeMatch = cond.match(/([a-zA-Z0-9_\.]+)\s+(NOT\s+)?(ILIKE|LIKE)\s+(['"])(.*?)\4/i);
        if (likeMatch) {
            const col = likeMatch[1];
            const notOperator = Boolean(likeMatch[2]);
            const operator = likeMatch[3].toUpperCase();
            const pattern = likeMatch[5];
            const cell = row[col] || row[col.replace(/^.*\./, '')];
            const regexPattern = '^' + pattern.replace(/[%]/g, '.*').replace(/_/g, '.') + '$';
            const flags = operator === 'ILIKE' ? 'i' : '';
            const regex = new RegExp(regexPattern, flags);
            const result = regex.test(cell);
            return notOperator ? !result : result;
        }

        // Equal condition
        const eqMatch = cond.match(/([a-zA-Z0-9_\.]+)\s*=\s*(['"]?[^'"]+['"]?|\d+)/);
        if (eqMatch) {
            const col = eqMatch[1];
            const valRaw = eqMatch[2].replace(/^['"]|['"]$/g, '');
            const cell = row[col] || row[col.replace(/^.*\./, '')];
            return cell == valRaw;
        }

        // Greater-than condition with NOW() support
        const gtMatch = cond.match(/([a-zA-Z0-9_\.]+)\s*>\s*(NOW\(\)|['"]?[^'"]+['"]?|\d+(?:\.\d+)?)/i);
        if (gtMatch) {
            const col = gtMatch[1];
            let raw = gtMatch[2].replace(/^['"]|['"]$/g, '');
            let expected;
            if (raw.toLowerCase() === "now()") {
                expected = new Date();
            } else if (!isNaN(parseFloat(raw))) {
                expected = parseFloat(raw);
            } else {
                expected = raw;
            }
            const cell = row[col] || row[col.replace(/^.*\./, '')];
            // If comparing dates, do so as Date objects.
            if (cell instanceof Date && expected instanceof Date) {
                return cell > expected;
            } else {
                return Number(cell) > expected;
            }
        }

        // Less-than condition with NOW() support
        const ltMatch = cond.match(/([a-zA-Z0-9_\.]+)\s*<\s*(NOW\(\)|['"]?[^'"]+['"]?|\d+(?:\.\d+)?)/i);
        if (ltMatch) {
            const col = ltMatch[1];
            let raw = ltMatch[2].replace(/^['"]|['"]$/g, '');
            let expected;
            if (raw.toLowerCase() === "now()") {
                expected = new Date();
            } else if (!isNaN(parseFloat(raw))) {
                expected = parseFloat(raw);
            } else {
                expected = raw;
            }
            const cell = row[col] || row[col.replace(/^.*\./, '')];
            if (cell instanceof Date && expected instanceof Date) {
                return cell < expected;
            } else {
                return Number(cell) < expected;
            }
        }

        return false;
    });
  }

  // Helper function to evaluate HAVING conditions
  function evaluateHavingCondition(condition, row) {
    condition = condition.trim();

    const aggFuncPattern = /(COUNT|SUM|MIN|MAX|AVG)\s*\(\s*([a-zA-Z0-9_\.]+|\*)\s*\)\s*(=|!=|<>|>|<|>=|<=)\s*(\d+)/i;
    const aggMatch = condition.match(aggFuncPattern);
    if (aggMatch) {
      const [_, funcName, col, op, val] = aggMatch;
      const numVal = parseFloat(val);
      const possibleColNames = [];

      // Special alias matching
      if (col.includes('booking_id')) {
        possibleColNames.push('booking_count');
      }
      if (col.includes('ticket_id') && row.hasOwnProperty('ticket_count')) {
        possibleColNames.push('ticket_count');
      }

      // Default expected names based on function and column name
      possibleColNames.push(`${funcName.toLowerCase()}_${col.replace(/\./g, '_')}`);
      possibleColNames.push(col.split('.').pop());

      // For COUNT(*) when col is *, also add any key that contains the function name (e.g., ticket_count)
      if (col === '*') {
        Object.keys(row).forEach(key => {
          if (key.toLowerCase().includes(funcName.toLowerCase())) {
            possibleColNames.push(key);
          }
        });
      }

      console.log("HAVING condition:", condition);
      console.log("Row data:", row);
      console.log("Possible column names:", possibleColNames);

      for (const colName of possibleColNames) {
        if (row.hasOwnProperty(colName)) {
          const rowVal = parseFloat(row[colName]);
          if (!isNaN(rowVal)) {
            switch (op) {
              case '=': return rowVal === numVal;
              case '!=':
              case '<>': return rowVal !== numVal;
              case '>': return rowVal > numVal;
              case '<': return rowVal < numVal;
              case '>=': return rowVal >= numVal;
              case '<=': return rowVal <= numVal;
            }
          }
        }
      }
      return false;
    }

    return false;
  }

  // Process string functions in expressions
  function processStringFunctions(expr, row) {
    expr = expr.replace(/UPPER\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)/gi, (match, col) => {
      const val = row[col] !== undefined ? row[col] : row[col.replace(/^.*\./, '')];
      return typeof val === 'string' ? `'${val.toUpperCase()}'` : val;
    });
    
    expr = expr.replace(/LOWER\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)/gi, (match, col) => {
      const val = row[col] !== undefined ? row[col] : row[col.replace(/^.*\./, '')];
      return typeof val === 'string' ? `'${val.toLowerCase()}'` : val;
    });
    
    return expr;
  }

  // Process CASE expressions
  function processCaseExpressions(expr) {
    return expr;
  }

  function splitByCommaOutsideParentheses(str) {
    const result = [];
    let parenLevel = 0;
    let current = '';
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '(') parenLevel++;
      if (char === ')') parenLevel--;
      if (char === ',' && parenLevel === 0) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current) result.push(current);
    return result;
  }

  const closeResults = () => {
    setShowResults(false);
  };

  useEffect(() => {
    if (Object.keys(database).length > 0) {
      console.log("Database loaded:", database);
      if (database.aircrafts) {
        console.log("Aircrafts table:", database.aircrafts);
        console.log("Sample data:", database.aircrafts.data);
      }
    }
  }, [database]);

  return (
    <div className="container">
      <div className="sidebar">
        <div className="app-title">
          <h1>Airlines Automation System</h1>
          <div className="subtitle">Database Management</div>
        </div>
        
        <label className="upload-btn">
          +
          <input type="file" accept=".sql" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
        
        <div className="schema">
          <ErrorBoundary>
            <Treebeard
              data={treeData}
              onToggle={onToggle}
              style={customStyles}
            />
          </ErrorBoundary>
        </div>
      </div>
      
      <div className="main-content">
        <div className="query-container">
          <SqlEditor 
            value={sqlQuery} 
            onChange={(value) => setSqlQuery(value)} 
          />
          <button className="execute-btn" onClick={executeQuery}>EXECUTE</button>
        </div>
        
        {showResults && queryResult && (
          <div className="results-overlay">
            <div className="results-container">
              <div className="results-header">
                <h3>Query Results</h3>
                <button className="close-btn" onClick={closeResults}>×</button>
              </div>
              <div className="results-content">
                {queryResult.error ? (
                  <div className="error-message">{queryResult.error}</div>
                ) : (
                  <table className="results-table">
                    <thead>
                      <tr>
                        {queryResult.columns.map((column, index) => (
                          <th key={index}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows && queryResult.rows.length > 0 ? (
                        queryResult.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {queryResult.columns.map((column, colIndex) => {
                              const cellValue = row[column];
                              return (
                                <td key={colIndex}>
                                    {cellValue instanceof Date 
                                        ? formatDateTime(cellValue) 
                                        : (cellValue !== undefined && cellValue !== null 
                                            ? String(cellValue) 
                                            : 'null')
                                    }
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={queryResult.columns.length} style={{ textAlign: 'center' }}>
                            Sonuç bulunamadı
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;