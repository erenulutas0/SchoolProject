import React, { useState, useEffect } from 'react';
import PaymentModal from './PaymentModal';

// formatDate fonksiyonunun burada tanımlı veya import edilmiş olduğundan emin olun
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('tr-TR', options); // Örnek formatlama
};

function ReservationModal({ isOpen, onClose, database, onProceedToPayment, flightOptions: propFlightOptions, allSeats: propAllSeats }) {
  const [flightOptions, setFlightOptions] = useState([]);
  const [seatOptions, setSeatOptions] = useState([]);
  const [formData, setFormData] = useState({
    passengerName: '',
    passport: '',
    email: '',
    password: '',
    flightId: '',
    seatId: '',
    seatNumber: '', // Ensure all fields are here for initialization
    seatClass: '',  // Ensure all fields are here for initialization
    price: 0        // Ensure all fields are here for initialization
  });
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [allSeats, setAllSeats] = useState({});
  const [seatPrices, setSeatPrices] = useState({
    first: 1500,
    business: 1000,
    economy: 750
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [reservationData, setReservationData] = useState(null);

  // Sayfa açılışında ve hata durumlarında kullanmak için init fonksiyonu
  const initializeForm = () => {
    setFormData({
      passengerName: '',
      passport: '',
      email: '',
      password: '',
      flightId: '',
      seatId: '',
      seatNumber: '', // Add if not present
      seatClass: '',  // Add if not present
      price: 0        // Add if not present
    });
    setSelectedFlight(null);
    setSeatOptions([]);
    setMessage({ text: '', type: '' }); 
  };
  
  // Uçuş ve koltuk verilerini yükle ve formu başlat
  useEffect(() => {
    if (isOpen) {
      // propFlightOptions ve propAllSeats'i kullanmak yerine doğrudan loadFlightData'yı çağırabiliriz
      // eğer bu proplar App.jsx'ten geliyorsa ve öncelikliyse, o zaman mevcut mantık korunabilir
      // ancak loadFlightData içinde zaten hardcoded flightOptions var.
      loadFlightData(); // Uçuş ve koltuk verilerini yükle
      initializeForm(); // Formu sıfırla
    }
    // loadFlightData, `database` prop'unu kullandığı için dependency array'e eklenmeli.
    // initializeForm ve loadFlightData fonksiyonları bu component içinde tanımlı olduğu için,
    // ve dışarıdan değişen proplara (database hariç) doğrudan bağlı olmadıkları için,
    // useCallback ile sarmalanmadıkları sürece her renderda yeniden oluşabilirler.
    // Ancak temel sorun `loadFlightData`'nın çağrılmaması gibi duruyor.
  }, [isOpen, database]); // `database` prop'unu dependency olarak ekleyin.

  // Uçuş ve koltuk verilerini yükle
  const loadFlightData = async () => {
    try {
      // Uçuşları yükle
      const flights = [
        { id: 1, flight_number: 'TK100', origin: 'Dalaman', destination: 'Istanbul', departure_time: '2025-06-01T08:00:00', arrival_time: '2025-06-01T09:20:00' },
        { id: 2, flight_number: 'TK101', origin: 'Istanbul', destination: 'Antalya', departure_time: '2025-06-02T08:00:00', arrival_time: '2025-06-02T09:20:00' },
        { id: 3, flight_number: 'TK102', origin: 'Ankara', destination: 'Izmir', departure_time: '2025-06-03T08:00:00', arrival_time: '2025-06-03T09:20:00' },
        { id: 4, flight_number: 'TK103', origin: 'Ankara', destination: 'Istanbul', departure_time: '2025-06-04T08:00:00', arrival_time: '2025-06-04T09:20:00' },
        { id: 5, flight_number: 'TK104', origin: 'Dalaman', destination: 'Trabzon', departure_time: '2025-06-05T08:00:00', arrival_time: '2025-06-05T09:20:00' },
        { id: 6, flight_number: 'TK105', origin: 'Istanbul', destination: 'Dalaman', departure_time: '2025-06-06T08:00:00', arrival_time: '2025-06-06T09:20:00' },
        { id: 7, flight_number: 'TK106', origin: 'Antalya', destination: 'Istanbul', departure_time: '2025-06-07T08:00:00', arrival_time: '2025-06-07T09:20:00' },
        { id: 8, flight_number: 'TK107', origin: 'Istanbul', destination: 'Ankara', departure_time: '2025-06-08T08:00:00', arrival_time: '2025-06-08T09:20:00' },
        { id: 9, flight_number: 'TK108', origin: 'Ankara', destination: 'Izmir', departure_time: '2025-06-09T08:00:00', arrival_time: '2025-06-09T09:20:00' },
        { id: 10, flight_number: 'TK109', origin: 'Trabzon', destination: 'Dalaman', departure_time: '2025-06-10T08:00:00', arrival_time: '2025-06-10T09:20:00' }
      ];
      
      setFlightOptions(flights);
      
      // Instead of creating fake seat data, use the actual database
      if (database && database.seats && database.seats.data) {
        // Create an organized structure for seats by flight_id
        const seatsData = {};
        
        // Group seats by flight_id
        database.seats.data.forEach(seat => {
          const flightId = parseInt(seat.flight_id);
          if (!seatsData[flightId]) {
            seatsData[flightId] = [];
          }
          
          // Add seat with proper structure
          seatsData[flightId].push({
            id: seat.seat_id,
            flight_id: flightId,
            seat_number: seat.seat_number,
            class: seat.class,
            price: seat.class === 'first' ? 1500 : seat.class === 'business' ? 1000 : 750,
            is_available: seat.is_available === 't' || seat.is_available === true
          });
        });
        
        setAllSeats(seatsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ text: 'Error loading flight information.', type: 'error' });
    }
  };
  
  // Seçilen uçuş için koltukları yükle
  const loadSeatOptions = (flightId) => {
    try {
      const selectedFlightObj = flightOptions.find(flight => flight.id.toString() === flightId.toString());
      
      if (!selectedFlightObj) {
        console.error('Selected flight not found');
        setMessage({ text: 'Selected flight information not found.', type: 'error' });
        return;
      }
      
      setSelectedFlight(selectedFlightObj);
      
      // flightId'nin sayısal olduğundan emin olalım
      const numericFlightId = parseInt(flightId, 10);
      
      if (allSeats && allSeats[numericFlightId]) {
        // Tüm koltukları göster (boş veya dolu)
        setSeatOptions(allSeats[numericFlightId]);
        console.log(`Loaded ${allSeats[numericFlightId].length} seats for flight ID ${numericFlightId}`);
      } else {
        console.warn(`No seats found for flight ID ${numericFlightId}`);
        setSeatOptions([]);
        // Default koltuklar oluştur
        const defaultSeats = [];
        // First Class (A sırası - 1-5)
        for (let i = 1; i <= 5; i++) {
          defaultSeats.push({
            id: `A${i}`,
            flight_id: numericFlightId,
            seat_number: `A${i}`,
            class: 'first',
            price: 1500,
            is_available: true
          });
        }
        // Business Class (B sırası - 1-10)
        for (let i = 1; i <= 10; i++) {
          defaultSeats.push({
            id: `B${i}`,
            flight_id: numericFlightId,
            seat_number: `B${i}`,
            class: 'business',
            price: 1000,
            is_available: true
          });
        }
        // Economy Class (C sırası - 1-15)
        for (let i = 1; i <= 15; i++) {
          defaultSeats.push({
            id: `C${i}`,
            flight_id: numericFlightId,
            seat_number: `C${i}`,
            class: 'economy',
            price: 750,
            is_available: true
          });
        }
        setSeatOptions(defaultSeats);
      }
    } catch (error) {
      console.error('Error loading seat options:', error);
      setMessage({ text: 'Error loading seat options.', type: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'flightId' && value) {
      loadSeatOptions(value);
    }
  };

  // handleSeatSelect fonksiyonunu güvenli hale getirelim
  const handleSeatSelect = (seatId, flightId, seatNumber, seatClass, isAvailable, price) => {
    try {
      if (!isAvailable) {
        setMessage({ text: 'This seat is already taken.', type: 'error' });
        return;
      }
      
      if (!seatId || !seatNumber) {
        setMessage({ text: 'Invalid seat information.', type: 'error' });
        return;
      }
      
      console.log("Seat selected:", { seatId, flightId, seatNumber, seatClass, price });
      
      // Koltuk seçimini güncelle
      setFormData(prev => ({
        ...prev,
        seatId: seatId || '',
        seatNumber: seatNumber || '',
        seatClass: seatClass || 'economy',
        price: price || 750
      }));
      
      // Hata mesajını temizle - ASLA NULL OLMASIN
      setMessage({ text: '', type: '' });
    } catch (error) {
      console.error("Error in handleSeatSelect:", error);
      setMessage({ text: 'Error selecting seat.', type: 'error' });
    }
  };

  // handleSubmit fonksiyonunu düzeltelim
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' }); // Clear previous messages

    // Form validation
    if (!formData.passengerName || !formData.passport || !formData.email || !formData.password || !formData.flightId || !formData.seatId) {
      setMessage({
        text: 'Lütfen tüm yolcu bilgilerini ve uçuş/koltuk seçimini tamamlayın.',
        type: 'error'
      });
      return;
    }
    if (formData.passport.length !== 11 || !/^\d+$/.test(formData.passport)) {
        setMessage({ text: 'Kimlik/Pasaport numarası 11 haneli ve sadece rakamlardan oluşmalıdır.', type: 'error' });
        return;
    }

    try {
      const passwordHash = btoa(formData.password); 
      const insertUserSQL = `INSERT INTO users (full_name, email, password_hash, identification_number) VALUES ('${formData.passengerName}', '${formData.email}', '${passwordHash}', '${formData.passport}')`;

      const selectedFlightForTicket = flightOptions.find(f => f.id.toString() === formData.flightId.toString());
      const flightNumberForTicket = selectedFlightForTicket ? selectedFlightForTicket.flight_number : 'UNKNOWN_FLIGHT';

      const reservationDataForDb = {
        flightId: formData.flightId,
        seatNumber: formData.seatNumber,
        seatClass: formData.seatClass,
        flightNumber: flightNumberForTicket
      };

      console.log("Executing SQL for user:", insertUserSQL);
      console.log("Passing reservation details for DB:", reservationDataForDb);

      if (window.executeQuery) {
        try {
          window.executeQuery(insertUserSQL, reservationDataForDb); 
          console.log("SQL executed, proceeding to payment simulation.");

          const currentSelectedFlight = flightOptions.find(flight => flight.id.toString() === formData.flightId.toString());
          // allSeats'in formData.flightId için veri içerdiğinden emin olun
          const flightSeatsArray = allSeats[formData.flightId] || [];
          const currentSelectedSeat = flightSeatsArray.find(seat => seat.id.toString() === formData.seatId.toString()); // seat.id'nin string veya number olmasına göre karşılaştırın

          if (!currentSelectedFlight || !currentSelectedSeat) {
              console.error("Selected flight or seat not found for creating payment details.");
              setMessage({ text: 'Seçili uçuş veya koltuk bilgileri bulunamadı. Lütfen tekrar deneyin.', type: 'error'});
              return;
          }
          
          const departureTime = new Date(currentSelectedFlight.departure_time);

          // App.jsx'in PaymentModal'ı ve başarı mesajı için detayları hazırla
          const detailsForPayment = {
            flight: `${currentSelectedFlight.flight_number} - ${currentSelectedFlight.origin} → ${currentSelectedFlight.destination}`,
            date: formatDate(currentSelectedFlight.departure_time),
            time: departureTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            passenger: formData.passengerName,
            seat: `${currentSelectedSeat.seat_number} (${
              currentSelectedSeat.class === 'first' ? 'First Class' :
              currentSelectedSeat.class === 'business' ? 'Business Class' : 'Economy Class'
            })`,
            totalPrice: `${currentSelectedSeat.price}₺`,
            // Başarı mesajı için ek alanlar
            flightNumber: currentSelectedFlight.flight_number,
            seatNumber: currentSelectedSeat.seat_number,
          };
          
          // App.jsx'e ödeme adımına geçmesi için sinyal gönder
          if (onProceedToPayment) {
            onProceedToPayment(detailsForPayment);
          } else {
            console.error("onProceedToPayment prop is not defined in ReservationModal");
          }
          // ReservationModal burada kendisini kapatmamalı, App.jsx onProceedToPayment içinde halledecek.

        } catch (sqlError) {
          console.error("Error during SQL execution or proceeding to payment:", sqlError);
          setMessage({
            text: `Bir hata oluştu: ${sqlError.message}`,
            type: 'error'
          });
        }
      } else {
        setMessage({ text: 'Sorgu yürütme fonksiyonu bulunamadı.', type: 'error' });
      }
    } catch (error) {
      console.error("Reservation error:", error);
      setMessage({
        text: `An error occurred: ${error.message}`,
        type: 'error'
      });
    }
  };
  
  const handlePaymentComplete = (success, paymentMethod) => {
    if (success) {
      // Başarılı ödeme - işlemi tamamla (gerçek uygulamada veritabanına yazılır)
      const bookingId = reservationData.bookingId;
      
      // UI test için veritabanına yazmıyoruz ama normalde burada INSERT işlemleri olacak
      console.log("INSERT INTO users başarılı");
      console.log("INSERT INTO bookings başarılı");
      console.log("INSERT INTO tickets başarılı");
      console.log("INSERT INTO payments başarılı");
      
      // Ödeme modalını kapat
      setShowPaymentModal(false);
      
      // Başarılı mesajı göster
      setMessage({
        text: `Rezervasyon ve ödeme başarıyla tamamlandı! Referans: #${bookingId}`,
        type: 'success'
      });
      
      // Formu temizle
      setTimeout(() => {
        setFormData({
          passengerName: '',
          passport: '',
          email: '',
          password: '',
          flightId: '',
          seatId: ''
        });
        setSelectedFlight(null);
        setSeatOptions([]);
      }, 2000);
    } else {
      // Başarısız ödeme
      setShowPaymentModal(false);
      setMessage({
        text: 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.',
        type: 'error'
      });
    }
  };
  
  // Ödeme modalını kapatmak için fonksiyon ekleyelim
  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
  };

  // ReservationModal component'ini güncelleyerek window'a bir fonksiyon ekleyelim
  useEffect(() => {
    // Global bir değişken olarak kapanma fonksiyonunu tanımla
    window.closeReservationModal = () => {
      console.log("ReservationModal kapatılıyor...");
      onClose();
    };

    return () => {
      window.closeReservationModal = undefined;
    };
  }, [onClose]);

  // Koltuk oluşturma ve seçimi için ortak bir fonksiyon
  const renderSeat = (seatNumber, seatClass, priceValue) => {
    // Önce seatOptions kontrolü yapalım
    if (!seatOptions || seatOptions.length === 0) {
      return (
        <div 
          key={seatNumber}
          className={`seat ${seatClass} unavailable`}
          title={`${seatNumber} - Bilgi yükleniyor...`}
        >
          {seatNumber.substring(1)}
        </div>
      );
    }
    
    const seat = seatOptions.find(s => s && s.seat_number === seatNumber);
    const isAvailable = seat && seat.is_available;
    
    return (
      <div 
        key={seatNumber}
        className={`seat ${seatClass} ${!isAvailable ? 'unavailable' : ''} ${formData.seatId === (seat?.id || '') ? 'selected' : ''}`}
        onClick={() => {
          // Güvenli çağrı ile kontrol ekleyelim
          if (seat && isAvailable) {
            try {
              handleSeatSelect(
                seat.id || '',
                formData.flightId || '',
                seat.seat_number || '',
                seat.class || seatClass,
                true,
                priceValue || 0
              );
            } catch (error) {
              console.error("Error selecting seat:", error);
              setMessage({ text: 'An error occurred while selecting seat.', type: 'error' });
            }
          } else if (seat && !isAvailable) {
            setMessage({ text: 'This seat is already taken.', type: 'error' });
          } else {
            setMessage({ text: 'Seat information is not available.', type: 'error' });
          }
        }}
        title={`${seatNumber} - ${seatClass.charAt(0).toUpperCase() + seatClass.slice(1)} Class ${isAvailable ? `- ${priceValue}₺` : '- Dolu'}`}
      >
        {seatNumber.substring(1)}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="reservation-modal" style={{ zIndex: 999 }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Flight Reservation</h2>
          <span className="close-btn" onClick={onClose}>&times;</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Passenger Information</h3>
            <div className="form-group">
              <label htmlFor="passengerName">Full Name</label>
              <input 
                type="text" 
                id="passengerName"
                name="passengerName" 
                value={formData.passengerName}
                onChange={handleChange}
                placeholder="Full Name"
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="passport">Identification Number (11 digits)</label>
              <input 
                type="text" 
                id="passport" 
                name="passport"
                pattern="\d{11}"
                title="Identification number must be exactly 11 digits"
                maxLength="11"
                value={formData.passport}
                onChange={handleChange}
                placeholder="11111111111"
                required 
              />
              <small style={{ color: '#aaa', fontSize: '11px' }}>Must be exactly 11 digits</small>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required 
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3>Flight Selection</h3>
            <div className="form-group">
              <label htmlFor="flight">Select Flight</label>
              <select 
                id="flight" 
                name="flightId"
                value={formData.flightId}
                onChange={handleChange} 
                required
              >
                <option value="">Select a flight</option>
                {flightOptions.map(flight => (
                  <option key={flight.id} value={flight.id}>
                    {flight.flight_number} - {flight.origin} → {flight.destination} ({formatDate(flight.departure_time)})
                  </option>
                ))}
              </select>
            </div>
            
            {formData.flightId && (
              <div className="form-group">
                <label>Koltuk Seçin</label>
                <div className="seat-selection">
                  <div className="seats-visual">
                    <div className="seat-info">
                      <div className="seat-class">
                        <span className="seat-icon first"></span> First Class - 1500₺
                      </div>
                      <div className="seat-class">
                        <span className="seat-icon business"></span> Business Class - 1000₺
                      </div>
                      <div className="seat-class">
                        <span className="seat-icon economy"></span> Economy Class - 750₺
                      </div>
                      <div className="seat-class">
                        <span className="seat-icon unavailable"></span> Dolu
                      </div>
                    </div>
                    
                    <div className="airplane-layout">
                      <div className="aircraft-body">
                        {/* Ön bölüm (Kokpit) */}
                        <div className="cockpit"></div>
                        
                        {/* First Class (A sırası - 1-5) */}
                        <div className="cabin first-class-cabin">
                          <div className="cabin-label">First Class</div>
                          <div className="seat-row-labels">
                            <div className="row-label">A</div>
                          </div>
                          <div className="seats-container">
                            <div className="seat-row">
                              {[1, 2, 3, 4, 5].map(num => renderSeat(`A${num}`, 'first', 1500))}
                            </div>
                          </div>
                        </div>

                        {/* Business Class (B sırası - 1-10) */}
                        <div className="cabin business-class-cabin">
                          <div className="cabin-label">Business Class</div>
                          <div className="seat-row-labels">
                            <div className="row-label">B</div>
                          </div>
                          <div className="seats-container">
                            <div className="seat-row">
                              {[1, 2, 3, 4, 5].map(num => renderSeat(`B${num}`, 'business', 1000))}
                            </div>
                            <div className="seat-row">
                              {[6, 7, 8, 9, 10].map(num => renderSeat(`B${num}`, 'business', 1000))}
                            </div>
                          </div>
                        </div>

                        {/* Economy Class (C sırası - 1-15) */}
                        <div className="cabin economy-class-cabin">
                          <div className="cabin-label">Economy Class</div>
                          <div className="seat-row-labels">
                            <div className="row-label">C</div>
                          </div>
                          <div className="seats-container">
                            <div className="seat-row">
                              {[1, 2, 3, 4, 5].map(num => renderSeat(`C${num}`, 'economy', 750))}
                            </div>
                            <div className="seat-row">
                              {[6, 7, 8, 9, 10].map(num => renderSeat(`C${num}`, 'economy', 750))}
                            </div>
                            <div className="seat-row">
                              {[11, 12, 13, 14, 15].map(num => renderSeat(`C${num}`, 'economy', 750))}
                            </div>
                          </div>
                        </div>

                        {/* Kuyruk bölümü */}
                        <div className="tail"></div>
                      </div>
                    </div>

                    {formData.seatId && (
                      <div className="selected-seat-info">
                        {(() => {
                          // Güvenli bir şekilde koltuk bilgisini göster
                          try {
                            const selectedSeat = seatOptions.find(s => s && s.id === formData.seatId);
                            if (selectedSeat) {
                              return (
                                <div>
                                  <p>Seçilen koltuk: <strong>{selectedSeat.seat_number || 'Bilinmeyen'}</strong></p>
                                  <p>Sınıf: <strong>
                                    {selectedSeat.class === 'first' ? 'First Class' : 
                                     selectedSeat.class === 'business' ? 'Business Class' : 
                                     'Economy Class'}
                                  </strong></p>
                                  <p>Fiyat: <strong>{selectedSeat.price || 0}₺</strong></p>
                                </div>
                              );
                            } else {
                              return <p>Koltuk bilgisi bulunamadı.</p>;
                            }
                          } catch (error) {
                            console.error("Error rendering selected seat info:", error);
                            return <p>Koltuk bilgisi gösterilirken bir hata oluştu.</p>;
                          }
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Mesaj gösterme kısmı - her zaman nesne olduğundan emin olun */}
          {message && typeof message === 'object' && message.text ? (
            <div className={`message ${message.type || ''}`}>
              <p>{message.text}</p>
            </div>
          ) : null}
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Complete Reservation
            </button>
          </div>
        </form>
      </div>
      
      {/* Ödeme Modal */}
      {showPaymentModal && reservationData && (
        <PaymentModal
          reservationDetails={reservationData}
          onClose={handlePaymentModalClose}
        />
      )}
    </div>
  );
}

export default ReservationModal;