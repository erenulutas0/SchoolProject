import React, { useState, useEffect, useRef, useReducer } from 'react';
// Arka plan resmi için import ekleyelim
import airplaneImage from './assets/background.gif';
import './App.css';

// Import components
import ReservationModal from './components/ReservationModal';
// SqlEditor component is not used directly in App.jsx based on current code,
// but if it were, its import would be here.
// import SqlEditor from './components/SqlEditor'; 
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
  const [showResults, setShowResults] = useState(false); // Tablo görünürlüğü için state

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
      const sqlContent = newDBSql;
      const parsedDb = extractTableData(sqlContent);
      setDatabase(parsedDb);
      updateTreeData(parsedDb);
      setIsLoadingDefaultDB(false);
    } catch (error) {
      console.error("SQL dosyası yüklenirken hata:", error);
      setDbLoadError(error.message);
      setIsLoadingDefaultDB(false);
    }
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
  // The `reservationDetailsFromCaller` parameter is primarily for the INSERT INTO USERS flow from ReservationModal.
  // For INSERT INTO PAYMENTS, `executeQuery` will use the `reservationDetails` state of App.jsx.
  const executeQuery = (query = null, reservationDetailsFromCaller = null) => {
    const queryToExecute = query && typeof query === 'string' ? query : sqlQuery;
    
    if (!queryToExecute || typeof queryToExecute !== 'string' || !queryToExecute.trim()) {
      console.error("Invalid query:", queryToExecute);
      setQueryResult({ type: 'error', message: 'Invalid SQL query' });
      return;
    }
    
    console.log("Executing SQL query:", queryToExecute, "with caller details:", reservationDetailsFromCaller);
    
    try {
      if (queryToExecute.trim().toUpperCase().startsWith('SELECT')) {
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
          setQueryResult({ type: 'error', message: 'Table not found or invalid SELECT query.' });
        }
      } 
      else if (queryToExecute.trim().toUpperCase().startsWith('INSERT INTO USERS')) {
        try {
          console.log('[App.jsx] Received INSERT INTO USERS query:', queryToExecute);
          if (reservationDetailsFromCaller) {
            console.log('[App.jsx] Received reservation details for user insert:', reservationDetailsFromCaller);
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
              else nextUserId = usersData.length > 0 ? usersData.length + 1: 1;
            }
            newUser.user_id = nextUserId.toString();

            const now = new Date();
            const currentTimestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
            newUser.created_at = currentTimestamp;

            if (!newUser.full_name || !newUser.email || !newUser.password_hash || !newUser.identification_number) {
              console.error('[App.jsx] New user data incomplete:', newUser);
              setQueryResult({ type: 'error', message: 'User creation failed: incomplete data.' });
              return;
            }
            
            let currentUsersTable = database.users || { columns: [], data: [] };
            let resolvedUsersColumns = (Array.isArray(currentUsersTable.columns) && currentUsersTable.columns.length > 0)
              ? [...currentUsersTable.columns]
              : [ { name: 'user_id', type: 'SERIAL PRIMARY KEY' }, { name: 'full_name', type: 'VARCHAR(100)' }, { name: 'email', type: 'VARCHAR(100)' }, { name: 'password_hash', type: 'VARCHAR(100)' }, { name: 'identification_number', type: 'CHAR(11)' } ];
            if (!resolvedUsersColumns.find(col => col.name === 'created_at')) {
              resolvedUsersColumns.push({ name: 'created_at', type: 'TIMESTAMP' });
            }
            const updatedUsersData = [...(currentUsersTable.data || []), newUser];

            let newBooking = null;
            let updatedBookingsData = (database.bookings && database.bookings.data) ? [...database.bookings.data] : [];
            let resolvedBookingsColumns = (database.bookings && database.bookings.columns) ? [...database.bookings.columns] : [ { name: 'booking_id', type: 'SERIAL PRIMARY KEY' }, { name: 'user_id', type: 'INTEGER' }, { name: 'booking_time', type: 'TIMESTAMP' }, { name: 'status', type: 'VARCHAR(20)' } ];

            if (reservationDetailsFromCaller) {
              let nextBookingId = 1;
              const bookingsData = (database.bookings && Array.isArray(database.bookings.data)) ? database.bookings.data : [];
              if (bookingsData.length > 0) {
                const existingBookingIds = bookingsData.map(b => parseInt(b.booking_id, 10)).filter(id => !isNaN(id));
                if (existingBookingIds.length > 0) nextBookingId = Math.max(...existingBookingIds) + 1;
                else nextBookingId = bookingsData.length > 0 ? bookingsData.length + 1 : 1;
              }
              
              newBooking = { booking_id: nextBookingId.toString(), user_id: newUser.user_id, booking_time: currentTimestamp, status: 'confirmed' };
              updatedBookingsData.push(newBooking);
            }

            let newTicket = null;
            let updatedTicketsData = (database.tickets && database.tickets.data) ? [...database.tickets.data] : [];
            let resolvedTicketsColumns = (database.tickets && database.tickets.columns) ? [...database.tickets.columns] : [ { name: 'ticket_id', type: 'SERIAL PRIMARY KEY' }, { name: 'booking_id', type: 'INTEGER' }, { name: 'flight_id', type: 'INTEGER' }, { name: 'seat_number', type: 'VARCHAR(5)' }, { name: 'class', type: 'VARCHAR(20)' }, { name: 'price', type: 'DECIMAL(10,2)' }, { name: 'ticket_code', type: 'VARCHAR(20)' } ];

            if (reservationDetailsFromCaller && newBooking) {
              let nextTicketId = 1;
              const ticketsData = (database.tickets && Array.isArray(database.tickets.data)) ? database.tickets.data : [];
              if (ticketsData.length > 0) {
                const existingTicketIds = ticketsData.map(t => parseInt(t.ticket_id, 10)).filter(id => !isNaN(id));
                if (existingTicketIds.length > 0) nextTicketId = Math.max(...existingTicketIds) + 1;
                else nextTicketId = ticketsData.length > 0 ? ticketsData.length + 1 : 1;
              }

              let price;
              switch (reservationDetailsFromCaller.seatClass?.toLowerCase()) {
                case 'first': price = 1500.00; break;
                case 'business': price = 1000.00; break;
                case 'economy': price = 750.00; break;
                default: price = 750.00; 
              }
              
              newTicket = { ticket_id: nextTicketId.toString(), booking_id: newBooking.booking_id, flight_id: reservationDetailsFromCaller.flightId.toString(), seat_number: reservationDetailsFromCaller.seatNumber, class: reservationDetailsFromCaller.seatClass?.toLowerCase(), price: price.toFixed(2), ticket_code: `${reservationDetailsFromCaller.flightNumber}-${reservationDetailsFromCaller.seatNumber}` };
              updatedTicketsData.push(newTicket);
            }
            
            const updatedDatabase = {
              ...database, 
              users: { columns: resolvedUsersColumns, data: updatedUsersData },
              ...(reservationDetailsFromCaller && { 
                bookings: { columns: resolvedBookingsColumns, data: updatedBookingsData },
                tickets: { columns: resolvedTicketsColumns, data: updatedTicketsData }
              })
            };
            setDatabase(updatedDatabase);

            let successMessage = `User '${newUser.full_name}' (ID: ${newUser.user_id}) successfully added.`;
            if (newBooking) successMessage += ` Booking (ID: ${newBooking.booking_id}) created.`;
            if (newTicket) successMessage += ` Ticket (ID: ${newTicket.ticket_id}) issued.`;
            
            setQueryResult({ type: 'success', message: successMessage });
          } else {
            setQueryResult({ type: 'error', message: 'Invalid INSERT INTO USERS query format.' });
          }
        } catch (error) {
          setQueryResult({ type: 'error', message: `Error processing USER insert: ${error.message}` });
        }
      }
      else if (queryToExecute.trim().toUpperCase().startsWith('INSERT INTO PAYMENTS')) {
        try {
          console.log('[App.jsx] Received INSERT INTO PAYMENTS query:', queryToExecute);
          
          // Instead of erroring out, assign default values if specific fields are missing.
          const userId = reservationDetails && reservationDetails.userId ? reservationDetails.userId : "1";
          const flightId = reservationDetails && reservationDetails.flightId ? reservationDetails.flightId : "1";
          const seatNumber = reservationDetails && reservationDetails.seatNumber 
            ? reservationDetails.seatNumber 
            : (reservationDetails && reservationDetails.seat 
                ? ((reservationDetails.seat.match(/^([A-Z][0-9]+)/) || [])[1] || "A5")
                : "A5");
          const seatId = reservationDetails && reservationDetails.seatId ? reservationDetails.seatId : "1";
          
          // Log the values used.
          console.log('[App.jsx] Using reservation details: userId:', userId, 'flightId:', flightId, 'seatNumber:', seatNumber, 'seatId:', seatId);

          const paymentRegex = /INSERT INTO payments\s*\(([\s\S]+?)\)\s*VALUES\s*\(([\s\S]+?)\)/i;
          const paymentMatch = queryToExecute.match(paymentRegex);

          if (paymentMatch) {
            const paymentColumns = paymentMatch[1]
              .split(',')
              .map(col => col.trim().toLowerCase());
            const paymentValues = paymentMatch[2]
              .split(',')
              .map(val => {
                const trimmedVal = val.trim();
                return (trimmedVal.startsWith("'") && trimmedVal.endsWith("'"))
                  ? trimmedVal.substring(1, trimmedVal.length - 1)
                  : trimmedVal;
              });
              
            const parsedQueryData = {}; // Data parsed from the SQL query
            paymentColumns.forEach((col, index) => {
              parsedQueryData[col.replace(/\s+/g, '_')] = paymentValues[index];
            });
            
            let finalPaymentMethod;
            // const methodFromSql = parsedQueryData.method; // SQL'den ayrıştırılan metot

            // Önceliklendirme:
            // 1. PaymentModal tarafından reservationDetailsFromCaller aracılığıyla doğrudan gönderilen metot.
            // 2. SQL sorgusundan ayrıştırılan metot (PaymentModal göndermezse veya geçersizse yedek olarak).
            // 3. App state'indeki reservationDetails.paymentMethod (daha düşük olasılık).
            // 4. Varsayılan olarak 'credit_card'.

            if (reservationDetailsFromCaller && reservationDetailsFromCaller.paymentMethod && typeof reservationDetailsFromCaller.paymentMethod === 'string' && reservationDetailsFromCaller.paymentMethod.trim() !== '') {
              finalPaymentMethod = reservationDetailsFromCaller.paymentMethod;
              console.log(`[App.jsx] Using payment method from PaymentModal (via callerDetails): '${finalPaymentMethod}'`);
            } else {
              const methodFromSql = parsedQueryData.method; // SQL'den ayrıştırmayı burada yedek olarak kullan
              console.warn(`[App.jsx] Payment method not found in callerDetails from PaymentModal. Falling back to SQL parsing or default.`);
              if (methodFromSql && typeof methodFromSql === 'string' && methodFromSql.trim() !== '') {
                finalPaymentMethod = methodFromSql;
                console.log(`[App.jsx] Using payment method from parsed SQL query: '${finalPaymentMethod}'`);
                if (reservationDetails && reservationDetails.paymentMethod && reservationDetails.paymentMethod.toLowerCase() !== finalPaymentMethod) {
                  console.warn(`[App.jsx] SQL method '${finalPaymentMethod}' differs from reservationDetails.paymentMethod '${reservationDetails.paymentMethod.toLowerCase()}'. Prioritizing method from SQL for this payment insertion.`);
                }
              } else {
                if (reservationDetails && reservationDetails.paymentMethod) {
                  finalPaymentMethod = reservationDetails.paymentMethod.toLowerCase();
                  console.log(`[App.jsx] SQL parsed method was '${methodFromSql}'. Using method from reservationDetails state: '${finalPaymentMethod}'`);
                } else {
                  finalPaymentMethod = 'credit_card'; // Varsayılan
                  console.warn(`[App.jsx] Payment method from SQL was '${methodFromSql}'. No method in reservationDetails state. Defaulting to '${finalPaymentMethod}'.`);
                }
              }
            }
            
            // Update parsedQueryData.method to ensure newPayment object uses the correctly determined method.
            // This also makes the subsequent console.log consistent.
            parsedQueryData.method = finalPaymentMethod;
            console.log('[App.jsx] Using payment method:', finalPaymentMethod);

            if (parsedQueryData.user_id !== userId.toString()) {
              console.warn('[App.jsx] User ID mismatch between payment query and App state. Query:', parsedQueryData.user_id, 'State:', userId);
            }
            
            // Determine bookingIdToUse using reservationDetails.bookingId if present.
            let bookingIdToUse = reservationDetails && reservationDetails.bookingId ? reservationDetails.bookingId : null;
            const ticketsData = database.tickets?.data || [];
            const bookingsData = database.bookings?.data || [];
            
            if (!bookingIdToUse) {
              // Önce, eğer booking var ise, en son eklenen booking_id'yi kullan.
              if (bookingsData.length > 0) {
                const maxBookingId = bookingsData.reduce((max, booking) =>
                  parseInt(booking.booking_id, 10) > parseInt(max, 10) ? booking.booking_id : max, "0");
                bookingIdToUse = maxBookingId;
                console.log('[App.jsx] Using last booking_id from bookings table:', bookingIdToUse);
              } else {
                // Eğer bookings yoksa, alternatif olarak matching ticket arayalım.
                const matchingTicket = ticketsData.find(ticket =>
                  ticket.flight_id === flightId.toString() &&
                  ticket.seat_number === seatNumber &&
                  bookingsData.some(booking => booking.booking_id === ticket.booking_id && booking.user_id === userId.toString())
                );
                
                if (matchingTicket && matchingTicket.booking_id) {
                  bookingIdToUse = matchingTicket.booking_id;
                } else {
                  console.warn('[App.jsx] Could not determine booking_id for payment. Using default booking ID "1".');
                  bookingIdToUse = "1";
                }
              }
            }
            
            // Determine amount based on the last ticket's price.
            let computedAmount = parsedQueryData.amount; // fallback value
            const existingTicketsData = database.tickets?.data || []; // veya daha önce tanımlandıysa, doğrudan ticketsData'yı kullanın.
            if (existingTicketsData.length > 0) {
              const lastTicket = existingTicketsData[existingTicketsData.length - 1];
              if (lastTicket && lastTicket.price) {
                computedAmount = lastTicket.price;
                console.log('[App.jsx] Using last ticket price for amount:', computedAmount);
              }
            }
            
            // Prepare the new payment object using bookingIdToUse and computedAmount
            const newPayment = {
              booking_id: bookingIdToUse,
              amount: parseFloat(computedAmount).toFixed(2),
              method: parsedQueryData.method,
              status: 'paid'
            };
            
            let nextPaymentId = 1;
            const currentPaymentsData = (database.payments && Array.isArray(database.payments.data)) ? database.payments.data : [];
            if (currentPaymentsData.length > 0) {
              const existingPaymentIds = currentPaymentsData.map(p => parseInt(p.payment_id, 10)).filter(id => !isNaN(id));
              if (existingPaymentIds.length > 0)
                nextPaymentId = Math.max(...existingPaymentIds) + 1;
              else nextPaymentId = currentPaymentsData.length + 1;
            }
            newPayment.payment_id = nextPaymentId.toString();
            
            const now = new Date();
            newPayment.payment_time = `${now.getFullYear()}-${(now.getMonth() + 1)
              .toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
            
            if (!newPayment.method || !newPayment.booking_id || isNaN(parseFloat(newPayment.amount)) || parseFloat(newPayment.amount) <= 0) {
              console.error('[App.jsx] New payment data incomplete or invalid:', newPayment);
              setQueryResult({ type: 'error', message: 'Payment failed: Incomplete or invalid payment data.' });
              return;
            }
            
            let currentPaymentsTable = database.payments || { columns: [], data: [] };
            let resolvedPaymentsColumns = (Array.isArray(currentPaymentsTable.columns) && currentPaymentsTable.columns.length > 0)
              ? [...currentPaymentsTable.columns]
              : [ 
                  { name: 'payment_id', type: 'SERIAL PRIMARY KEY' },
                  { name: 'booking_id', type: 'INTEGER' },
                  { name: 'amount', type: 'DECIMAL(10,2)' },
                  { name: 'payment_time', type: 'TIMESTAMP' },
                  { name: 'method', type: 'VARCHAR(30)' },
                  { name: 'status', type: 'VARCHAR(20)' }
                ];
            
            const updatedPaymentsData = [...(currentPaymentsTable.data || []), newPayment];
            
            // Update the seat availability in the seats table based on the last ticket entry
            let updatedSeatsData = [...(database.seats?.data || [])];
            if (database.tickets && Array.isArray(database.tickets.data) && database.tickets.data.length > 0) {
                // Use the last inserted ticket's information
                const lastTicket = database.tickets.data[database.tickets.data.length - 1];
                const setFlightId = lastTicket.flight_id.toString();
                const setSeatNumber = lastTicket.seat_number;
                updatedSeatsData = updatedSeatsData.map(seat => {
                  if (seat.flight_id === setFlightId && seat.seat_number === setSeatNumber) {
                    return { ...seat, is_available: 'f' }; // 'f' for false (seat taken)
                  }
                  return seat;
                });
            } else {
                console.warn('[App.jsx] No ticket information available to update seat availability.');
            }

            const updatedDatabase = {
              ...database, 
              payments: { columns: resolvedPaymentsColumns, data: updatedPaymentsData },
              seats: { ...(database.seats || { columns: [], data: [] }), data: updatedSeatsData }
            };
            setDatabase(updatedDatabase);
            
            setQueryResult({ type: 'success', message: `Payment (ID: ${newPayment.payment_id}) recorded for Booking ID: ${newPayment.booking_id}. Seat updated.` });
            
          } else {
            setQueryResult({ type: 'error', message: 'Invalid INSERT INTO PAYMENTS query format.' });
          }
        } catch (error) {
          setQueryResult({ type: 'error', message: `Error processing PAYMENT insert: ${error.message}` });
        }
      }
      else {
        setQueryResult({ type: 'info', message: 'This demo supports SELECT, INSERT INTO USERS, and INSERT INTO PAYMENTS statements.' });
      }
    } catch (error) {
      setQueryResult({ type: 'error', message: `Query execution error: ${error.message}` });
    }
  };
  
  const handleTableClick = (tableName) => {
    const newQuery = `SELECT * FROM ${tableName};`;
    setSqlQuery(newQuery);
    executeQuery(newQuery); // Pass the new query directly
  };

  const handleTableToggle = (idx) => {
    setTreeData(prev => {
      const newChildren = prev.children.map((table, i) =>
        i === idx ? { ...table, toggled: !table.toggled } : table
      );
      return { ...prev, children: newChildren };
    });
  };

  useEffect(() => {
    window.closeFlightReservation = function() {
      setShowReservationModal(false);
    };
    window.executeQuery = executeQuery;
    return () => {
      window.closeFlightReservation = undefined;
      if (window.executeQuery === executeQuery) {
        window.executeQuery = undefined;
      }
    };
  }, [executeQuery]); 

  useEffect(() => {
    console.log("Database state updated:", database);
    if (sqlQuery && sqlQuery.trim().toUpperCase().startsWith('SELECT')) {
      // Re-run SELECT queries if the database changes and a SELECT query is in the editor
      // This might be too aggressive if updates are frequent. Consider if this is desired.
      // executeQuery(sqlQuery); 
    }
  }, [database]); // Removed sqlQuery from dependencies to avoid loop with handleTableClick

  const closeAllModals = () => {
    setShowReservationModal(false);
    setShowPaymentModal(false);
    setTimeout(() => { forceUpdate(); }, 0);
  };

  const handleCloseResultsTable = () => {
    setQueryResult(null);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="app-title">
          <h1>AirDB Explorer</h1>
          <div className="subtitle">Database Management Interface</div>
        </div>
        <div className="database-section">
          <h3 className="section-title">Database Schema</h3>
          <div className="tree-view">
            {isLoadingDefaultDB ? (
              <p>Loading database...</p>
            ) : dbLoadError ? (
              <p className="error-text">Error: {dbLoadError}</p>
            ) : (
              <div className="schema-tree">
                <div className="db-item">
                  <span className="db-name">{treeData.name}</span>
                </div>
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
                          onClick={e => { e.stopPropagation(); handleTableClick(table.name); }}
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
        <div className="reservation-section">
          <button className="reservation-btn" onClick={() => setShowReservationModal(true)}>
            Make Flight Reservation
          </button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="image-container">
          <img src={airplaneImage} alt="Airplane" className="airplane-image" />
        </div>
        <div className="sql-editor-container">
          <textarea
            className="sql-editor"
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder="SELECT * FROM flights;"
          ></textarea>
          <button className="execute-btn" onClick={() => executeQuery(sqlQuery)}>
            Execute
          </button>
        </div>
        
        {queryResult && (
          <div className="query-results">
            <button onClick={handleCloseResultsTable} className="close-results-btn">
              ×
            </button>
            {queryResult.type === 'success' ? (
              <div className="result-table-container">
                <table className="result-table">
                  <thead>
                    <tr>
                      {queryResult.columns?.map((col, idx) => ( <th key={idx}>{col}</th> ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.columns?.includes('seat_id') 
                      ? [...(queryResult.data || [])]
                          .sort((a, b) => parseInt(a.seat_id) - parseInt(b.seat_id))
                          .map((row, rowIdx) => (
                            <tr key={rowIdx}>
                              {queryResult.columns.map((col, colIdx) => (
                                <td key={`${rowIdx}-${colIdx}`}>
                                  {col === 'is_available' ? (row[col] === 't' ? 'true' : 'false') : row[col]}
                                </td>
                              ))}
                            </tr>
                          ))
                      : (queryResult.data || []).map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            {queryResult.columns?.map((col, colIdx) => ( <td key={`${rowIdx}-${colIdx}`}>{row[col]}</td> ))}
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
                {queryResult.message && queryResult.data === undefined && ( /* Show message if success but no table data */
                    <div className={`query-message ${queryResult.type}`}>{queryResult.message}</div>
                )}
              </div>
            ) : (
              <div className={`query-message ${queryResult.type}`}>
                {queryResult.message}
              </div>
            )}
          </div>
        )}
      </div>
      
      {showReservationModal && (
        <ReservationModal 
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)} 
          database={database}
          onProceedToPayment={(details) => {
            // Attempt to find userId from email provided by ReservationModal
            let userIdToSet = null;
            if (details.email && database.users && database.users.data) {
                const user = database.users.data.find(u => u.email === details.email);
                if (user) {
                    userIdToSet = user.user_id;
                } else {
                    console.warn("[App.jsx] User not found by email for reservation:", details.email);
                }
            } else {
                console.warn("[App.jsx] Email not provided or users data unavailable for finding userId.");
            }
            // Ensure all necessary details from ReservationModal are included
            setReservationDetails({ ...details, userId: userIdToSet }); 
            setShowPaymentModal(true);    
            setShowReservationModal(false); 
          }}
        />
      )}

      {showPaymentModal && (
        <PaymentModal 
          onClose={(result) => {
            console.log("PaymentModal closing with result:", result);
            if (typeof result === 'object' && result.action === 'payment-completed') {
              console.log("Payment marked as completed by PaymentModal, showing final success message.");
              closeAllModals();
              setPaymentSuccess(true);
              setCompletedReservation(reservationDetails); // Use App's current reservationDetails
              setTimeout(() => {
                setPaymentSuccess(false);
                setCompletedReservation(null); 
              }, 5000);
            } else {
              console.log("PaymentModal closed without completion or with error:", result);
              setShowPaymentModal(false); 
            }
          }} 
          reservationDetails={reservationDetails}
          database={database} // database'i props olarak geçiyoruz
          setDatabase={setDatabase} // setDatabase fonksiyonunu props olarak geçiyoruz
        />
      )}

      {paymentSuccess && completedReservation && (
        <div className="payment-success-message">
          <div className="success-content">
            <div className="success-header">
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
            <button className="close-success" onClick={() => { setPaymentSuccess(false); setCompletedReservation(null); }}>
              Tamam
            </button>
          </div>
        </div>
      )}
      <style>
        {`
          .payment-success-message { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
          .success-content { background: linear-gradient(135deg, #1b2838 0%, #2a3c5a 100%); border-radius: 10px; padding: 25px; width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); color: white; border: 1px solid rgba(114, 137, 218, 0.5); }
          .success-header { display: flex; align-items: center; margin-bottom: 20px; color: #4CAF50; }
          .success-header svg { margin-right: 10px; }
          .success-header h3 { margin: 0; font-size: 22px; }
          .reservation-details { background-color: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .reservation-details h4 { margin-top: 0; margin-bottom: 15px; font-size: 18px; color: #adbce6; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 500; color: #adbce6; }
          .detail-value { font-weight: 600; }
          .success-message { margin-bottom: 20px; text-align: center; color: #4CAF50; } /* Adjusted for better visibility */
          .close-success { background-color: #5865f2; color: white; border: none; padding: 12px 20px; border-radius: 5px; width: 100%; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
          .close-success:hover { background-color: #4752c4; }

          .query-results {
            position: relative; /* Kapatma düğmesinin konumlandırılması için */
            /* Mevcut diğer stilleriniz burada kalabilir */
            display: flex; /* Flexbox'ı etkinleştir */
            flex-direction: column; /* Çocukları dikey olarak sırala */
            max-height: calc(100vh - 250px); /* Örnek bir maksimum yükseklik, sql editör ve diğer elemanlara göre ayarlayın */
          }
          .result-table-container {
            overflow-y: auto; /* Dikey kaydırmayı etkinleştir */
            flex-grow: 1; /* Kalan alanı doldurmasını sağla */
            border: 1px solid #333; /* Kenarlık ekleyelim */
            border-radius: 4px; /* Köşeleri yuvarlayalım */
          }
          .result-table {
            width: 100%;
            border-collapse: collapse;
          }
          .result-table th, .result-table td {
            border: 1px solid #444;
            padding: 8px 12px;
            text-align: left;
            white-space: nowrap; /* Hücre içeriğinin tek satırda kalmasını sağlar */
          }
          .result-table thead th {
            position: sticky;
            top: 0;
            background-color: #2a3c5a; /* Arka plan rengi, temanıza uygun seçin */
            color: white;
            z-index: 1; /* Diğer içeriklerin üzerinde kalmasını sağlar */
          }
          .close-results-btn {
            position: absolute;
            top: 8px; /* Konumu biraz ayarlayalım */
            left: 8px; /* Konumu biraz ayarlayalım */
            background-color: rgba(40, 40, 40, 0.6); /* Koyu yarı saydam arka plan */
            color: white;
            border: none;
            border-radius: 50%; /* Tamamen yuvarlak köşeler (dairesel) */
            width: 22px; /* Genişlik */
            height: 22px; /* Yükseklik */
            padding: 0; /* İç boşluğu sıfırla, boyut width/height ile kontrol edilecek */
            cursor: pointer;
            font-size: 14px; /* '×' karakteri için font boyutu */
            font-weight: bold;
            z-index: 10; /* Diğer içeriklerin üzerinde olmasını sağlar */
            display: flex; /* İçeriği ortalamak için flexbox */
            align-items: center; /* Dikey ortalama */
            justify-content: center; /* Yatay ortalama */
            transition: background-color 0.2s ease; /* Yumuşak geçiş efekti */
          }
          .close-results-btn:hover {
            background-color: rgba(20, 20, 20, 0.8); /* Hover durumunda daha koyu arka plan */
          }
        `}
      </style>
    </div>
  );
}

export default App;