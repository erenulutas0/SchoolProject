import React, { useState, useEffect, useRef, useReducer } from 'react';
// Arka plan resmi için import ekleyelim
import airplaneImage from './assets/background.gif';
import './App.css';

// Import components
import ReservationModal from './components/ReservationModal';
import SqlEditor from './components/SqlEditor';
import PaymentModal from './components/PaymentModal';

// Import SQL file directly
import newDBSql from './assets/newDB.sql?raw';
import { extractTableData } from './sqlParser';

function App() {
  // State tanımlamaları
  const [treeData, setTreeData] = useState({
    name: 'newDB.sql',
    toggled: true,
    children: [
      {
        name: 'public',
        toggled: true,
        children: []
      }
    ]
  });
  const [database, setDatabase] = useState({});
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [isLoadingDefaultDB, setIsLoadingDefaultDB] = useState(true);
  const [dbLoadError, setDbLoadError] = useState(null);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [completedReservation, setCompletedReservation] = useState(null);

  // Tüm modalları sıfırlamak için forceUpdate
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Varsayılan SQL dosyasını yükle
  useEffect(() => {
    loadDefaultSqlFile();
  }, []);

  // Varsayılan SQL dosyasını yükleyen fonksiyon
  const loadDefaultSqlFile = async () => {
    try {
      setIsLoadingDefaultDB(true);

      // SQL dosyasını import ile alın
      const sqlContent = newDBSql;

      // SQL dosyasını parse et
      const parsedDb = extractTableData(sqlContent); // veya parseSqlFile(sqlContent)
      setDatabase(parsedDb);

      // Tree yapısını güncelle
      updateTreeData(parsedDb);

      setIsLoadingDefaultDB(false);
    } catch (error) {
      console.error("SQL dosyası yüklenirken hata:", error);
      setDbLoadError(error.message);
      setIsLoadingDefaultDB(false);
    }
  };

  // SQL dosyasını parse eden fonksiyon
  const parseSqlFile = (sqlContent) => {
    const parsedDb = {};
    
    try {
      // CREATE TABLE ifadelerini bul
      const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(\s*([\s\S]*?)\s*\);/g;
      let match;
      
      while ((match = tableRegex.exec(sqlContent)) !== null) {
        const tableName = match[1];
        const tableDefinition = match[2];
        
        console.log(`Tablo bulundu: ${tableName}`);
        
        // Kolonları çıkar
        const columns = [];
        const columnDefs = tableDefinition.split(',');
        
        for (let columnDef of columnDefs) {
          columnDef = columnDef.trim();
          if (columnDef && !columnDef.startsWith('PRIMARY KEY') && !columnDef.startsWith('FOREIGN KEY')) {
            const parts = columnDef.split(/\s+/);
            if (parts.length >= 2) {
              const colName = parts[0].replace(/["'`]/g, '');
              const colType = parts[1];
              
              columns.push({
                name: colName,
                type: colType,
                nullable: !columnDef.includes('NOT NULL')
              });
              
              console.log(`Kolon: ${colName} (${colType})`);
            }
          }
        }
        
        // Tabloyu veritabanına ekle
        parsedDb[tableName] = {
          columns,
          data: []
        };
      }
      
      // INSERT ifadelerini bul ve verileri ekle
      const insertRegex = /INSERT\s+INTO\s+(\w+)\s*(?:\(([\s\S]*?)\))?\s*VALUES\s*\(([\s\S]*?)\);/g;
      let insertMatch;
      
      while ((insertMatch = insertRegex.exec(sqlContent)) !== null) {
        const tableName = insertMatch[1];
        let columnNames = [];
        const valuesPart = insertMatch[3];
        
        // Tablo var mı kontrol et
        if (!parsedDb[tableName]) {
          console.log(`UYARI: ${tableName} tablosu bulunamadı, INSERT atlanıyor`);
          continue;
        }
        
        // Kolon isimleri belirtilmişse onları al, yoksa tablo tanımından al
        if (insertMatch[2]) {
          columnNames = insertMatch[2].split(',').map(col => col.trim().replace(/["'`]/g, ''));
        } else {
          columnNames = parsedDb[tableName].columns.map(col => col.name);
        }
        
        // Değerleri ayır
        const values = valuesPart.split(',').map(val => val.trim().replace(/^['"]|['"]$/g, ''));
        
        // Veriyi tabloya ekle
        if (values.length === columnNames.length) {
          const rowData = {};
          columnNames.forEach((col, idx) => {
            rowData[col] = values[idx];
          });
          parsedDb[tableName].data.push(rowData);
        }
      }
    } catch (error) {
      console.error("SQL parse hatası:", error);
    }
    
    return parsedDb;
  };

  // Tree yapısını güncelle
  const updateTreeData = (parsedDb) => {
    setTreeData({
      name: 'newDB.sql',
      toggled: true,
      children: Object.keys(parsedDb).map(tableName => ({
        name: tableName,
        toggled: false,
        children: parsedDb[tableName].columns.map(col =>
          typeof col === 'string'
            ? { name: col, type: '' }
            : { name: col.name, type: col.type || '' }
        )
      }))
    });
  };
  
  // SQL sorgusu çalıştırma
  const executeQuery = (query = null, reservationDetails = null) => { // Add reservationDetails parameter
    const queryToExecute = query && typeof query === 'string' ? query : sqlQuery;
    
    if (!queryToExecute || typeof queryToExecute !== 'string' || !queryToExecute.trim()) {
      console.error("Invalid query:", queryToExecute);
      setQueryResult({
        type: 'error',
        message: 'Invalid SQL query'
      });
      return;
    }
    
    console.log("Executing SQL query:", queryToExecute);
    // Bu noktada 'database' state'i, executeQuery fonksiyonunun çağrıldığı
    // render döngüsündeki güncel değerine sahip olacaktır.
    
    try {
      if (queryToExecute.trim().toUpperCase().startsWith('SELECT')) {
        // Handle SELECT query (existing code)
        const fromRegex = /FROM\s+(\w+)/i;
        const match = queryToExecute.match(fromRegex);
        
        if (match && match[1] && database[match[1]]) {
          const tableName = match[1];
          setQueryResult({
            type: 'success',
            columns: database[tableName].columns.map(col => col.name),
            data: database[tableName].data
          });
        } else {
          setQueryResult({
            type: 'error',
            message: 'Table not found'
          });
        }
      } 
      else if (queryToExecute.trim().toUpperCase().startsWith('INSERT INTO USERS')) {
        try {
          console.log('[App.jsx] Received INSERT INTO USERS query:', queryToExecute);
          if (reservationDetails) {
            console.log('[App.jsx] Received reservation details:', reservationDetails);
          }
          const insertUserRegex = /INSERT INTO users \(([^)]+)\) VALUES \(([^)]+)\)/i;
          const userMatch = queryToExecute.match(insertUserRegex);

          if (userMatch) {
            const userColumns = userMatch[1].split(',').map(col => col.trim().toLowerCase());
            const userValues = userMatch[2].split(',').map(val => {
              const trimmedVal = val.trim();
              return (trimmedVal.startsWith("'") && trimmedVal.endsWith("'")) ? trimmedVal.substring(1, trimmedVal.length - 1) : trimmedVal;
            });

            const newUser = {};
            userColumns.forEach((col, index) => {
              newUser[col.replace(/\s+/g, '_')] = userValues[index];
            });

            let nextUserId = 1;
            const usersData = (database.users && Array.isArray(database.users.data)) ? database.users.data : [];
            if (usersData.length > 0) {
              const existingUserIds = usersData.map(u => parseInt(u.user_id, 10)).filter(id => !isNaN(id));
              if (existingUserIds.length > 0) nextUserId = Math.max(...existingUserIds) + 1;
              else nextUserId = usersData.length + 1;
            }
            newUser.user_id = nextUserId.toString();

            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
            const currentTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
            newUser.created_at = currentTimestamp;

            if (!newUser.full_name || !newUser.email || !newUser.password_hash || !newUser.identification_number) {
              console.error('[App.jsx] Yeni kullanıcı verisi eksik:', newUser);
              setQueryResult({
                type: 'error',
                message: 'Kullanıcı eklenemedi: eksik veri.'
              });
              return;
            }
            
            let currentUsersTable = database.users || { columns: [], data: [] };
            let resolvedUsersColumns = (Array.isArray(currentUsersTable.columns) && currentUsersTable.columns.length > 0)
              ? [...currentUsersTable.columns]
              : [ 
                  { name: 'user_id', type: 'SERIAL PRIMARY KEY' },
                  { name: 'full_name', type: 'VARCHAR(100)' },
                  { name: 'email', type: 'VARCHAR(100)' },
                  { name: 'password_hash', type: 'VARCHAR(100)' },
                  { name: 'identification_number', type: 'CHAR(11)' }
                ];
            if (!resolvedUsersColumns.find(col => col.name === 'created_at')) {
              resolvedUsersColumns.push({ name: 'created_at', type: 'TIMESTAMP' });
            }
            const updatedUsersData = [...(currentUsersTable.data || []), newUser];

            // --- BOOKING INSERTION ---
            let newBooking = null;
            let updatedBookingsData = (database.bookings && database.bookings.data) ? [...database.bookings.data] : [];
            let resolvedBookingsColumns = (database.bookings && database.bookings.columns) ? [...database.bookings.columns] : [
                { name: 'booking_id', type: 'SERIAL PRIMARY KEY' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'booking_time', type: 'TIMESTAMP' },
                { name: 'status', type: 'VARCHAR(20)' }
            ];

            if (reservationDetails) {
              let nextBookingId = 1;
              const bookingsData = (database.bookings && Array.isArray(database.bookings.data)) ? database.bookings.data : [];
              if (bookingsData.length > 0) {
                const existingBookingIds = bookingsData.map(b => parseInt(b.booking_id, 10)).filter(id => !isNaN(id));
                if (existingBookingIds.length > 0) nextBookingId = Math.max(...existingBookingIds) + 1;
                else nextBookingId = bookingsData.length + 1;
              }
              
              newBooking = {
                booking_id: nextBookingId.toString(),
                user_id: newUser.user_id,
                booking_time: currentTimestamp,
                status: 'confirmed'
              };
              updatedBookingsData.push(newBooking);
              console.log('[App.jsx] Prepared new booking:', newBooking);
            }

            // --- TICKET INSERTION ---
            let newTicket = null;
            let updatedTicketsData = (database.tickets && database.tickets.data) ? [...database.tickets.data] : [];
            let resolvedTicketsColumns = (database.tickets && database.tickets.columns) ? [...database.tickets.columns] : [
                { name: 'ticket_id', type: 'SERIAL PRIMARY KEY' },
                { name: 'booking_id', type: 'INTEGER' },
                { name: 'flight_id', type: 'INTEGER' },
                { name: 'seat_number', type: 'VARCHAR(5)' },
                { name: 'class', type: 'VARCHAR(20)' },
                { name: 'price', type: 'DECIMAL(10,2)' },
                { name: 'ticket_code', type: 'VARCHAR(20)' }
            ];

            if (reservationDetails && newBooking) {
              let nextTicketId = 1;
              const ticketsData = (database.tickets && Array.isArray(database.tickets.data)) ? database.tickets.data : [];
              if (ticketsData.length > 0) {
                const existingTicketIds = ticketsData.map(t => parseInt(t.ticket_id, 10)).filter(id => !isNaN(id));
                if (existingTicketIds.length > 0) nextTicketId = Math.max(...existingTicketIds) + 1;
                else nextTicketId = ticketsData.length + 1;
              }

              let price;
              switch (reservationDetails.seatClass.toLowerCase()) {
                case 'first': price = 1500.00; break;
                case 'business': price = 1000.00; break;
                case 'economy': price = 750.00; break;
                default: price = 750.00; // Default or error
              }
              
              newTicket = {
                ticket_id: nextTicketId.toString(),
                booking_id: newBooking.booking_id,
                flight_id: reservationDetails.flightId.toString(),
                seat_number: reservationDetails.seatNumber,
                class: reservationDetails.seatClass.toLowerCase(),
                price: price.toFixed(2),
                ticket_code: `${reservationDetails.flightNumber}-${reservationDetails.seatNumber}`
              };
              updatedTicketsData.push(newTicket);
              console.log('[App.jsx] Prepared new ticket:', newTicket);
            }
            
            const updatedDatabase = {
              ...database, 
              users: { 
                columns: resolvedUsersColumns, 
                data: updatedUsersData,     
              },
              ...(reservationDetails && { // Conditionally add/update bookings and tickets
                bookings: {
                  columns: resolvedBookingsColumns,
                  data: updatedBookingsData
                },
                tickets: {
                  columns: resolvedTicketsColumns,
                  data: updatedTicketsData
                }
              })
            };
            setDatabase(updatedDatabase);

            let successMessage = `User '${newUser.full_name}' (ID: ${newUser.user_id}) successfully added.`;
            if (newBooking) successMessage += ` Booking (ID: ${newBooking.booking_id}) created.`;
            if (newTicket) successMessage += ` Ticket (ID: ${newTicket.ticket_id}) issued.`;
            
            console.log('[App.jsx] Operations completed. Database updated.');
            setQueryResult({
              type: 'success',
              message: successMessage,
              columns: resolvedUsersColumns.map(col => col.name), 
              data: updatedUsersData, // Or a more comprehensive result if needed
            });

          } else {
            console.error('[App.jsx] Geçersiz INSERT INTO USERS sorgu formatı:', queryToExecute);
            setQueryResult({
              type: 'error',
              message: 'USERS tablosu için geçersiz INSERT sorgu formatı. Beklenen: INSERT INTO users (sutun1, sutun2) VALUES (deger1, deger2)',
            });
          }
        } catch (error) {
          console.error("[App.jsx] INSERT INTO USERS işlenirken hata oluştu:", error);
          setQueryResult({
            type: 'error',
            message: `INSERT işlenirken hata: ${error.message}`,
          });
        }
      }
      else {
        setQueryResult({
          type: 'info',
          message: 'This demo currently supports SELECT queries and INSERT INTO USERS statements'
        });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      setQueryResult({
        type: 'error',
        message: `Error: ${error.message}`
      });
    }
  };
  
  // Bir tabloya tıklandığında
  const handleTableClick = (tableName) => {
    setSqlQuery(`SELECT * FROM ${tableName};`);
    executeQuery();
  };

  // Tablo toggle fonksiyonu
  const handleTableToggle = (idx) => {
    setTreeData(prev => {
      const newChildren = prev.children.map((table, i) =>
        i === idx ? { ...table, toggled: !table.toggled } : table
      );
      return { ...prev, children: newChildren };
    });
  };

  // Ana uygulama içinde PaymentModal kullanımını güncelle
  // window nesnesine bir fonksiyon ekleyelim
  useEffect(() => {
    // Uçuş rezervasyonu kapatma işlevini global olarak tanımla
    window.closeFlightReservation = function() {
      console.log("Rezervasyon kapatılıyor...");
      setShowReservationModal(false);
    };
    
    // executeQuery fonksiyonunu global olarak tanımla
    // executeQuery fonksiyonu her render'da yeniden oluştuğu için,
    // window.executeQuery'nin her zaman en güncel executeQuery'ye işaret etmesini sağlarız.
    window.executeQuery = executeQuery;
    
    // Component unmount olurken temizle
    return () => {
      window.closeFlightReservation = undefined;
      // Sadece bizim atadığımız fonksiyonu temizlediğimizden emin olalım
      if (window.executeQuery === executeQuery) {
        window.executeQuery = undefined;
      }
    };
  }, [executeQuery]); // executeQuery fonksiyonu değiştiğinde bu effect'i yeniden çalıştır.
                      // executeQuery her render'da yeniden oluştuğu için bu effect her render'da çalışır.

  // Database state değişikliğini takip eden useEffect ekleyin
  useEffect(() => {
    // database değiştiğinde log çıktısı görün
    console.log("Database state updated:", database);
    
    // database değiştiğinde açık sorgu varsa yeniden çalıştır
    // executeQuery'nin en güncel halini çağırdığından emin olmak için onu da dependency yapabiliriz,
    // ama bu durumda sonsuz döngü riski olabilir eğer executeQuery state güncelliyorsa.
    // Şimdilik sadece database ve sqlQuery yeterli.
    if (sqlQuery && sqlQuery.trim().toUpperCase().startsWith('SELECT')) {
      console.log("Database updated, refreshing query...");
      executeQuery(); // Bu, o anki kapsamdaki executeQuery'yi çağırır.
    }
  }, [database, sqlQuery]); // executeQuery'yi buradan çıkardık, çünkü bu effect'in amacı database veya sqlQuery değişince tetiklenmek.

  // Tüm modalları zorla kapatmak için fonksiyon
  const closeAllModals = () => {
    setShowReservationModal(false);
    setShowPaymentModal(false);
    setTimeout(() => {
      // DOM güncellemesinin tamamlanmasını sağlamak için timeout
      forceUpdate();
    }, 0);
  };

  return (
    <div className="app-container">
      {/* Sol Sidebar */}
      <div className="sidebar">
        {/* Başlık ve alt başlık */}
        <div className="app-title">
          <h1>AirDB Explorer</h1>
          <div className="subtitle">Database Management Interface</div>
        </div>
        
        {/* Veritabanı Şeması */}
        <div className="database-section">
          <h3 className="section-title">Database Schema</h3>
          
          <div className="tree-view">
            {isLoadingDefaultDB ? (
              <p>Loading database...</p>
            ) : dbLoadError ? (
              <p className="error-text">Error: {dbLoadError}</p>
            ) : (
              <div className="schema-tree">
                {/* newDB.sql */}
                <div className="db-item">
                  <span className="db-name">{treeData.name}</span>
                </div>
                {/* Tablolar sağa kaydırılmış şekilde */}
                <div style={{ marginLeft: 24 }}>
                  {treeData.children.map((table, idx) => (
                    <div key={idx} className="table-item">
                      <div
                        className="table-header"
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onClick={() => handleTableToggle(idx)}
                      >
                        <span className="toggle-icon">{table.toggled ? '▼' : '▶'}</span>
                        <span
                          className="table-name"
                          style={{ marginLeft: 4, cursor: 'pointer' }}
                          onClick={e => {
                            e.stopPropagation(); // Toggle'ı tetiklemesin
                            handleTableClick(table.name);
                          }}
                        >
                          {table.name}
                        </span>
                      </div>
                      {table.toggled && table.children && table.children.length > 0 && (
                        <div className="columns-list" style={{ marginLeft: 24 }}>
                          {table.children.map((col, colIdx) => (
                            <div key={colIdx} className="column-item" style={{ display: 'flex', alignItems: 'center' }}>
                              <span className="column-icon" style={{ marginRight: 4 }}>•</span>
                              <span className="column-name">
                                {col.name}
                                {col.type && (
                                  <span style={{ color: '#888', marginLeft: 6, fontSize: '0.95em' }}>
                                    : {col.type}
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Rezervasyon Butonu */}
        <div className="reservation-section">
          <button 
            className="reservation-btn"
            onClick={() => setShowReservationModal(true)}
          >
            Make Flight Reservation
          </button>
        </div>
      </div>
      
      {/* Ana İçerik */}
      <div className="main-content">
        {/* Arkaplan Görseli */}
        <div className="image-container">
          <img src={airplaneImage} alt="Airplane" className="airplane-image" />
        </div>
        
        {/* SQL Editor */}
        <div className="sql-editor-container">
          <textarea
            className="sql-editor"
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder="SELECT * FROM flights;"
          ></textarea>
          <button 
            className="execute-btn"
            onClick={executeQuery}
          >
            Execute
          </button>
        </div>
        
        {/* Sorgu Sonuçları */}
        {queryResult && (
          <div className="query-results">
            {queryResult.type === 'success' ? (
              <div className="result-table-container">
                <table className="result-table">
                  <thead>
                    <tr>
                      {queryResult.columns.map((col, idx) => (
                        <th key={idx}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Eğer tabloda seat_id sütunu varsa, ID'ye göre sırala */}
                    {queryResult.columns.includes('seat_id') 
                      ? [...queryResult.data]
                          .sort((a, b) => parseInt(a.seat_id) - parseInt(b.seat_id))
                          .map((row, rowIdx) => (
                            <tr key={rowIdx}>
                              {queryResult.columns.map((col, colIdx) => (
                                <td key={`${rowIdx}-${colIdx}`}>
                                  {/* Boolean değerleri t/f yerine true/false olarak göster */}
                                  {col === 'is_available' 
                                    ? row[col] === 't' ? 'true' : 'false'
                                    : row[col]}
                                </td>
                              ))}
                            </tr>
                          ))
                      : queryResult.data.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            {queryResult.columns.map((col, colIdx) => (
                              <td key={`${rowIdx}-${colIdx}`}>{row[col]}</td>
                            ))}
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`query-message ${queryResult.type}`}>
                {queryResult.message}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Rezervasyon Modal */}
      {showReservationModal && (
        <ReservationModal 
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)} 
          database={database}
          // flightOptions ve allSeats'i ReservationModal'a prop olarak geçirin
          // Bu verilerin ReservationModal içinde zaten mevcut olduğunu varsayıyorum,
          // değilse App.jsx'ten veya uygun bir kaynaktan sağlanmalıdır.
          // flightOptions={flightOptionsState} // flightOptionsState, App.jsx'te tutulan uçuş listesi olmalı
          // allSeats={allSeatsState}       // allSeatsState, App.jsx'te tutulan koltuk verisi olmalı
          onProceedToPayment={(details) => {
            setReservationDetails(details); // App.jsx'in reservationDetails state'ini güncelle
            setShowPaymentModal(true);    // App.jsx'e PaymentModal'ı göstermesini söyle
            setShowReservationModal(false); // ReservationModal'ı kapat
          }}
        />
      )}

      {/* Ödeme Modal */}
      {showPaymentModal && (
        <PaymentModal 
          onClose={(result) => {
            console.log("PaymentModal kapanıyor:", result);
            
            if (typeof result === 'object' && result.action === 'payment-completed') {
              console.log("Ödeme tamamlandı, modallar kapatılıyor");
              closeAllModals();
              
              setPaymentSuccess(true);
              // reservationDetails burada App.jsx'in state'idir ve onProceedToPayment ile set edilir.
              setCompletedReservation(reservationDetails); 
              
              setTimeout(() => {
                setPaymentSuccess(false);
                setCompletedReservation(null); // Başarı mesajı sonrası temizle
              }, 5000);
            } else {
              setShowPaymentModal(false); // Sadece ödeme modalını kapat
            }
          }} 
          reservationDetails={reservationDetails} 
        />
      )}

      {/* Ödeme Başarılı Mesajı */}
      {paymentSuccess && completedReservation && (
        <div className="payment-success-message">
          <div className="success-content">
            <div className="success-header">
              {/* İkonu buraya ekleyebilirsiniz */}
              <h3>Ödeme Başarılı!</h3>
            </div>
            
            <div className="reservation-details">
              <h4>Rezervasyon Detayları</h4>
              <div className="detail-row">
                <div className="detail-label">Uçuş No:</div>
                <div className="detail-value">{completedReservation.flightNumber || completedReservation.flight?.split(' - ')[0]}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Tarih:</div>
                <div className="detail-value">{completedReservation.date}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Saat:</div>
                <div className="detail-value">{completedReservation.time}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Koltuk No:</div>
                <div className="detail-value">{completedReservation.seatNumber || completedReservation.seat?.split(' (')[0]}</div>
              </div>
            </div>
            
            <div className="success-message">
              Rezervasyonunuz başarıyla oluşturuldu. Uçuş detaylarınızı yukarıda görebilirsiniz.
            </div>
            
            <button className="close-success" onClick={() => {
              setPaymentSuccess(false);
              // İsteğe bağlı: Ana ekrana dönülmesini garanti etmek için
              setShowReservationModal(false);
              setShowPaymentModal(false);
            }}>
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* Style eklemeyi, return içindeki en son kapanış div'inden önce ekleyelim */}
      <style>
        {`
          .payment-success-message {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          
          .success-content {
            background: linear-gradient(135deg, #1b2838 0%, #2a3c5a 100%);
            border-radius: 10px;
            padding: 25px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            color: white;
            border: 1px solid rgba(114, 137, 218, 0.5);
          }
          
          .success-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            color: #4CAF50;
          }
          
          .success-header svg {
            margin-right: 10px;
          }
          
          .success-header h3 {
            margin: 0;
            font-size: 22px;
          }
          
          .reservation-details {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .reservation-details h4 {
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 18px;
            color: #adbce6;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            font-weight: 500;
            color: #adbce6;
          }
          
          .detail-value {
            font-weight: 600;
          }
          
          .success-message {
            margin-bottom: 20px;
            text-align: center;
            color: #4CAF50;
          }
          
          .close-success {
            background-color: #5865f2;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 5px;
            width: 100%;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .close-success:hover {
            background-color: #4752c4;
          }
        `}
      </style>
    </div>
  );
}

export default App;