import React, { useState, useEffect } from 'react';

// SVG logoları için bileşenler - SVG tanımlarında stroke ekleyerek VISA'nın S'sinin daha net görünmesini sağlayalım
const VisaSVG = (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/800px-Visa_Inc._logo.svg.png" 
    alt="Visa" 
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    }}
  />
);

const MasterCardSVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <path fill="#FF5F00" d="M24 33.5A14.5 14.5 0 0 1 24 4.5A14.5 14.5 0 0 1 24 33.5Z"/>
    <path fill="#EB001B" d="M24 4.5A14.5 14.5 0 0 0 9.5 19 14.5 14.5 0 0 0 24 33.5 14.5 14.5 0 0 0 9.5 19Z"/>
    <path fill="#F79E1B" d="M24 4.5A14.5 14.5 0 0 1 38.5 19 14.5 14.5 0 0 1 24 33.5 14.5 14.5 0 0 1 38.5 19Z"/>
  </svg>
);

// Banka transfer simgesi için basit SVG
const bankLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjMwcHgiIGhlaWdodD0iMzBweCI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMiAyMGgxOSIvPjxwYXRoIGQ9Ik0yIDEwbDEwLTdsMTAgN3YySDJ6Ii8+PHBhdGggZD0iTTQgMTJ2NiIvPjxwYXRoIGQ9Ik0xOCAxMnY2Ii8+PHBhdGggZD0iTTExIDEydjYiLz48L2c+PC9zdmc+";

const PaymentModal = ({ onClose, reservationDetails, database, setDatabase }) => {
  const [activePaymentMethod, setActivePaymentMethod] = useState('credit-card'); // Varsayılan ödeme yöntemi
  const [failedMethod, setFailedMethod] = useState('credit_card'); // Varsayılan failedMethod
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Credit card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardType, setCardType] = useState(null);
  
  // PayPal form state
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalPassword, setPaypalPassword] = useState('');

  // Kart numarası değiştiğinde kart tipini tespit et
  useEffect(() => {
    // Kart numarasının başlangıç rakamlarına bakarak tipini belirle
    // Visa kartları 4 ile başlar
    // MasterCard kartları 51-55 aralığında veya 2221-2720 aralığında başlar
    if (cardNumber.startsWith('4')) {
      setCardType('visa');
    } else if (
      (cardNumber.startsWith('5') && ['1', '2', '3', '4', '5'].includes(cardNumber[1])) ||
      (parseInt(cardNumber.substring(0, 4)) >= 2221 && parseInt(cardNumber.substring(0, 4)) <= 2720)
    ) {
      setCardType('mastercard');
    } else {
      setCardType(null);
    }
  }, [cardNumber]);

  // Kart numarasını formatlama (her 4 rakamdan sonra boşluk)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Kart numarasındaki değişiklikleri yönetme
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  // Tarih formatını doğrulama ve güncelleme (MM/YY)
  const handleExpiryChange = (e) => {
    let { value } = e.target;
    value = value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    setCardExpiry(value);
  };

  // Ödeme yöntemi seçildiğinde içerik gösterme
  const renderPaymentMethodContent = () => {
    switch (activePaymentMethod) {
      case 'credit-card':
        return (
          <div className="payment-method-content">
            {/* Kredi kartı görsel simülasyonu */}
            <div className="credit-card-preview" style={{
              width: '100%',
              height: '200px',
              borderRadius: '12px',
              // Uzay temalı gradient arka plan
              background: cardType === 'visa' 
                ? 'linear-gradient(135deg, #051941 0%, #0a3172 50%, #173d7c 100%)' 
                : cardType === 'mastercard'
                ? 'linear-gradient(135deg, #1f1f1f 0%, #333333 50%, #5a5a5a 100%)'
                : 'linear-gradient(135deg, #051941 0%, #0a3172 50%, #173d7c 100%)',
              // Uzay görüntüsü için overlay ekleyin
              backgroundImage: "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')",
              backgroundBlendMode: "soft-light",
              backgroundSize: "cover",
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Uzay hissi için ek parıltı efekti */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 60%)',
                pointerEvents: 'none'
              }} />
              
              {/* Kart çipi - daha altın rengi */}
              <div style={{
                width: '45px',
                height: '35px',
                borderRadius: '6px',
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'linear-gradient(145deg, #f0c840 30%, #dfa920 90%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(4, 1fr)',
                gap: '2px',
                padding: '4px'
              }}>
                {/* Chip detayları için grid */}
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} style={{
                    backgroundColor: i % 2 === 0 ? '#e8ba30' : '#d9a520',
                    borderRadius: '1px'
                  }} />
                ))}
              </div>
              
              {/* Kart logosu - pozisyon düzeltildi */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                height: '35px',
                width: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '4px',
                padding: '1px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>
                {cardType === 'visa' ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {VisaSVG}
                  </div>
                ) : cardType === 'mastercard' ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {MasterCardSVG}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%', padding: '2px' }}>
                    {/* VISA ve MasterCard'ın yerini değiştirdik */}
                    <div style={{ width: '48%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {MasterCardSVG}
                    </div>
                    <div style={{ width: '48%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {VisaSVG}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Kart numarası */}
              <div style={{
                position: 'absolute',
                top: '80px',
                left: '20px',
                color: 'white',
                fontSize: '10px'
              }}>CARD DETAILS</div>
              <div style={{
                position: 'absolute',
                top: '100px',
                left: '20px',
                color: 'white',
                fontSize: '20px',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
              }}>
                {cardNumber || '•••• •••• •••• ••••'}
              </div>
              
              {/* Kart bilgileri alt taraf */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                display: 'flex',
                width: 'calc(100% - 40px)',
                justifyContent: 'space-between'
              }}>
                {/* Kart sahibi ismi */}
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '10px' }}>CARD HOLDER</div>
                  <div style={{ color: 'white', fontSize: '16px', textTransform: 'uppercase' }}>
                    {cardHolder || 'NAME SURNAME'}
                  </div>
                </div>
                
                {/* Kart geçerlilik tarihi */}
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '10px' }}>VALID THRU</div>
                  <div style={{ color: 'white', fontSize: '16px' }}>
                    {cardExpiry || 'MM/YY'}
                  </div>
                </div>

                {/* CVV bilgisi eklendi */}
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '10px' }}>CVV</div>
                  <div style={{ color: 'white', fontSize: '16px' }}>
                    {cardCVV || '•••'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  style={{ 
                    backgroundImage: cardType === 'visa' ? 'linear-gradient(to right, rgba(21, 101, 192, 0.05), transparent)' : 
                              cardType === 'mastercard' ? 'linear-gradient(to right, rgba(255, 95, 0, 0.05), transparent)' : 'none',
                    borderColor: cardType ? '#4CAF50' : ''
                  }}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Card Holder</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={cardHolder}
                  onChange={(e) => {
                    // 20 karakter sınırı koyalım
                    if (e.target.value.length <= 20) {
                      setCardHolder(e.target.value);
                    }
                  }}
                  maxLength={20} // HTML maxLength özelliği de ekleyelim
                />
                <small style={{ color: '#aaa', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                  Max. 20 characters ({cardHolder.length}/20)
                </small>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group half">
                <label>Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  maxLength={5}
                />
              </div>
              <div className="form-group half">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={cardCVV}
                  onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').substring(0, 3))}
                  maxLength={3}
                />
              </div>
            </div>
            {/* Butonun disabled durumunu kontrol eden mantığı güçlendirelim */}
            <button
              className="submit-btn"
              onClick={() => processPayment('credit-card')}
              style={{ 
                width: '100%', 
                marginTop: '20px',
                backgroundColor: isCardFormValid ? '#ff9800' : 'rgba(255, 152, 0, 0.4)',
                cursor: isCardFormValid ? 'pointer' : 'not-allowed'
              }}
              disabled={!isCardFormValid}
            >
              Make Payment
            </button>
          </div>
        );
        
      case 'paypal':
        return (
          <div className="payment-method-content paypal-form" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            padding: '20px',
            color: '#333'
          }}>
            <div className="paypal-logo" style={{ marginBottom: '15px', textAlign: 'center' }}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                alt="PayPal"
                style={{ height: 50 }}
              />
            </div>
            <p style={{ 
              textAlign: 'center', 
              marginBottom: '20px', 
              color: '#0070ba', 
              fontWeight: 600,
              fontSize: '16px' 
            }}>Secure payment with PayPal</p>
            <div className="form-group">
              <label style={{ 
                color: '#333', 
                fontWeight: 600, 
                display: 'block',
                marginBottom: '5px',
                fontSize: '14px'
              }}>Email</label>
              <input
                type="email"
                placeholder="Your email address"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: '#333',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                }}
              />
            </div>
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label style={{ 
                color: '#333', 
                fontWeight: 600, 
                display: 'block',
                marginBottom: '5px',
                fontSize: '14px'
              }}>Password</label>
              <input
                type="password"
                placeholder="Your PayPal password"
                value={paypalPassword}
                onChange={(e) => setPaypalPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: '#333',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                }}
              />
            </div>
            <button
              className="submit-btn"
              onClick={() => processPayment('paypal')}
              style={{ 
                width: '100%', 
                marginTop: '20px', 
                background: '#0070ba',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Pay with PayPal
            </button>
          </div>
        );
        
      case 'bank-transfer':
        return (
          <div className="payment-method-content transfer-details-form">
            <h4>Bank Transfer Details</h4>
            <div className="account-details">
              <p><strong>Bank:</strong> Turkey Airways Bank</p>
              <p><strong>Branch:</strong> Central Branch</p>
              <p><strong>IBAN:</strong> TR12 3456 7890 1234 5678 9012 34</p>
              <p><strong>Account Holder:</strong> Airlines Demo Inc.</p>
              <p><strong>Reference:</strong> {reservationDetails?.bookingId || "Reservation No"}</p>
            </div>
            <div className="bank-info">
              <h4>Note:</h4>
              <p>Please send us your payment receipt by email after completing your transaction.</p>
              <p>Your ticket will be sent to your email address after payment verification.</p>
            </div>
            <button
              className="submit-btn"
              onClick={() => processPayment('bank-transfer')}
              style={{ width: '100%', marginTop: '20px' }}
            >
              Send Payment Notification
            </button>
          </div>
        );
        
      default:
        return (
          <div className="select-payment-method">
            <p>Please select a payment method.</p>
          </div>
        );
    }
  };
  
// Ödeme işlemini başlatan fonksiyon - PostgreSQL'e uyarlandı
const processPayment = async (method) => {
  setLoading(true);
  let dbMethod = method;
  if (method === 'credit-card') {
    dbMethod = 'credit_card';
  } else if (method === 'bank-transfer') {
    dbMethod = 'bank_transfer';
  }

  const bookingIdToUse = reservationDetails?.bookingId || "1";
  const amountToUse = reservationDetails?.totalPrice?.replace('₺', '') || reservationDetails?.amount || "0";

  // 1. Ödeme Kaydını Ekle - Bu INSERT INTO PAYMENTS deyimi App.jsx tarafından destekleniyor
  const insertPaymentQuery = `
    INSERT INTO payments (booking_id, amount, payment_date, method, status) 
    VALUES (${bookingIdToUse}, ${amountToUse}, NOW(), '${dbMethod}', 'completed');
  `;

  console.log(`[PaymentModal.jsx] 🚀 Payment process starting with method: ${method}, dbMethod: ${dbMethod}`);
  console.log(`[PaymentModal.jsx] Executing payment insert: ${insertPaymentQuery}`);

  try {
    // INSERT INTO PAYMENTS App.jsx'de koltuk güncellemesini otomatik olarak tetikleyecektir
    await window.executeQuery(insertPaymentQuery, { 
      paymentMethod: dbMethod, 
      bookingId: reservationDetails?.bookingId,
      seatId: reservationDetails?.seatId, 
      flightId: reservationDetails?.flightId, 
      seatNumber: "A5", // Hard-coded A5 koltuğunu kullanıyoruz
      userId: reservationDetails?.userId,
      action: 'seat_status_updated' // Bu eylem App.jsx'e koltuk durumunu güncellemesi gerektiğini bildirir
    });
    
    console.log('[PaymentModal.jsx] ✅ Payment inserted and seat updated.');
    
    // 2. Veritabanı değişikliklerini görebilmek için tabloları yeniden sorgula
    await window.executeQuery("SELECT * FROM payments;");
    await window.executeQuery("SELECT * FROM seats;");
    
    console.log('[PaymentModal.jsx] ✅ Database tables refreshed.');
    
    setPaymentComplete(true);
  } catch (error) {
    console.error('[PaymentModal.jsx] ❌ Error during payment or seat update:', error);
  } finally {
    setLoading(false);
  }
};

  // Kart formunun geçerliliğini kontrol eden fonksiyon
  const isCardFormValid = 
    cardNumber.replace(/\s/g, '').length >= 16 && // en az 16 rakam (boşluklar hariç)
    cardHolder.trim().length >= 3 && // en az 3 karakter
    cardExpiry.length === 5 && // MM/YY formatı
    cardCVV.length === 3; // 3 rakam

  // Ödeme tamamlandığında, users ve seats tablolarını yeniden sorgulayalım
  const handlePaymentComplete = () => {
    // Ödeme işlemi tamamlandığında users ve seats tablolarını sorgula
    if (window.executeQuery) {
      window.executeQuery("SELECT * FROM users;");
      window.executeQuery("SELECT * FROM seats;"); // Seats tablosunu da güncelleyelim
    }
    
    onClose({ action: 'payment-completed', paymentMethod: selectedPaymentMethod }); // Kullanıcının seçtiği ödeme yöntemi
  };

  const handleClose = () => {
    if (reservationDetails) {
      const now = new Date();
      const currentTimestamp = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      // bookings tablosunun son satırındaki booking_id'yi al
      const lastBookingId = database.bookings?.data?.[database.bookings.data.length - 1]?.booking_id || null;

      // TL sembolünü kaldır ve sayıya dönüştür
      const amount = parseFloat(reservationDetails.totalPrice?.replace('₺', '').trim()) || 0;

      const failedPayment = {
        payment_id: (database.payments?.data?.length || 0) + 1, // Yeni payment_id
        booking_id: lastBookingId, // Son booking_id'yi kullan
        amount: amount.toFixed(2), // Sayıyı iki ondalık basamakla formatla
        payment_time: currentTimestamp,
        method: failedMethod, // failedMethod'u kullan
        status: 'failed' // Status "failed" olarak ayarlanır
      };

      const updatedPaymentsData = [...(database.payments?.data || []), failedPayment];
      const updatedDatabase = {
        ...database,
        payments: {
          columns: database.payments?.columns || [
            { name: 'payment_id', type: 'SERIAL PRIMARY KEY' },
            { name: 'booking_id', type: 'INTEGER' },
            { name: 'amount', type: 'DECIMAL(10,2)' },
            { name: 'payment_time', type: 'TIMESTAMP' },
            { name: 'method', type: 'VARCHAR(30)' },
            { name: 'status', type: 'VARCHAR(20)' }
          ],
          data: updatedPaymentsData
        }
      };

      setDatabase(updatedDatabase);
      console.log("Payment marked as failed and added to payments table:", failedPayment);
    }

    onClose(); // Modal'ı kapat
  };

  // Ödeme yöntemi değiştiğinde çağrılan fonksiyon
  const updatePaymentMethod = (method) => {
    setActivePaymentMethod(method);

    // failedMethod'u seçilen ödeme yöntemine göre güncelle
    if (method === 'credit-card') {
      setFailedMethod('credit_card');
    } else if (method === 'paypal') {
      setFailedMethod('paypal');
    } else if (method === 'bank-transfer') {
      setFailedMethod('bank_transfer');
    }
  };

  return (
    <div className="payment-modal" style={{ zIndex: 1000 }}>
      <div className="payment-content">
        <div className="payment-header">
          <h2>Payment Information</h2>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>
        
        <div className="payment-body">
          <h3 style={{ marginBottom: '15px' }}>Payment Method</h3>
          <div className="payment-methods" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <div 
              className={`payment-method ${activePaymentMethod === 'credit-card' ? 'active' : ''}`}
              onClick={() => updatePaymentMethod('credit-card')}
              style={{
                flex: 1,
                padding: '15px 10px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                border: activePaymentMethod === 'credit-card' ? '2px solid #ff9800' : '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: activePaymentMethod === 'credit-card' ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                margin: '0 5px'
              }}
            >
              Credit Card
            </div>
            <div 
              className={`payment-method ${activePaymentMethod === 'paypal' ? 'active' : ''}`}
              onClick={() => updatePaymentMethod('paypal')}
              style={{
                flex: 1,
                padding: '15px 10px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                border: activePaymentMethod === 'paypal' ? '2px solid #0070ba' : '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: activePaymentMethod === 'paypal' ? 'rgba(0, 112, 186, 0.1)' : 'transparent',
                margin: '0 5px'
              }}
            >
              PayPal
            </div>
            <div 
              className={`payment-method ${activePaymentMethod === 'bank-transfer' ? 'active' : ''}`}
              onClick={() => updatePaymentMethod('bank-transfer')}
              style={{
                flex: 1,
                padding: '15px 10px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                border: activePaymentMethod === 'bank-transfer' ? '2px solid #4caf50' : '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: activePaymentMethod === 'bank-transfer' ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                margin: '0 5px'
              }}
            >
              Bank Transfer
            </div>
          </div>
          
          {!paymentComplete && (
            <>
              {loading ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 220,
                }}>
                  <div className="loader"></div>
                  <div className="payment-processing-text">Processing your payment...</div>
                  <style>
                    {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
                  </style>
                </div>
              ) : (
                !paymentComplete && renderPaymentMethodContent()
              )}
            </>
          )}
          
          {/* Ödeme tamamlandı mesajı */}
          {paymentComplete && (
            <div className="message success payment-animation">
              <div className="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2>Payment Completed Successfully!</h2>
              <p>Your ticket information will be sent to your email address.</p>
              <button
                className="submit-btn"
                onClick={(e) => {
                  e.preventDefault();
                  
                  // Seats tablosunu yeniden sorgulayalım
                  if (window.executeQuery) {
                    window.executeQuery("SELECT * FROM seats;");
                  }
                  
                  // Önce rezervasyon modalını kapat
                  if (window.closeReservationModal) {
                    console.log("ReservationModal kapatma çağrısı yapılıyor...");
                    window.closeReservationModal();
                  }

                  // Sonra ödeme modalını kapat
                  onClose({
                    action: 'payment-completed',
                    closeReservation: true
                  });
                }}
                style={{ width: '100%', marginTop: '20px' }}
              >
                Done
              </button>
            </div>
          )}
        </div>
        
        {/* Footer actions */}
        {!loading && !paymentComplete && activePaymentMethod && (
          <div className="form-actions" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button className="cancel-btn" onClick={onClose}>
              Back
            </button>
          </div>
        )}
      </div>

      {/* Ek stil tanımlamaları */}
      <style>
        {`
          .payment-method-content .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
          }
          .payment-method-content .form-group {
            flex: 1;
          }
          .payment-method-content .form-group.half {
            flex: 0.5;
          }
          .payment-method-content label {
            display: block;
            margin-bottom: 5px;
            color: #ddd;
          }
          .payment-method-content input {
            width: 100%;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background-color: rgba(255, 255, 255, 0.1);
            color: #fff;
            border-radius: 4px;
            font-size: 16px;
          }
          .payment-method-content input:focus {
            outline: none;
            border-color: #ff9800;
          }
          .submit-btn:disabled {
            background-color: rgba(255, 152, 0, 0.4);
            cursor: not-allowed;
          }
          .message.success {
            border-radius: 8px;
            background-color: rgba(76, 175, 80, 0.1);
            border: 1px solid #4CAF50;
            padding: 30px;
            text-align: center;
            color: white;
            transition: all 0.5s ease;
          }
          
          .success-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
            color: #4CAF50;
            transform: scale(0);
            transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          .payment-animation .success-icon {
            transform: scale(1);
          }
          
          .payment-animation h2 {
            font-size: 24px;
            margin: 10px 0;
            animation: fadeInUp 0.5s forwards 0.2s;
            opacity: 0;
          }
          
          .payment-animation p {
            margin: 10px 0 20px;
            animation: fadeInUp 0.5s forwards 0.4s;
            opacity: 0;
          }
          
          .payment-animation .submit-btn {
            animation: fadeInUp 0.5s forwards 0.6s;
            opacity: 0;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Yükleme animasyonu için daha belirgin stil */
          .loader {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #ff9800;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          
          /* Ödeme işlemi yapılıyor yazısı için daha belirgin stil */
          .payment-processing-text {
            font-size: 22px;
            color: #ffffff;
            text-align: center;
            animation: pulse 1.5s infinite;
          }
          
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
        `}
      </style>
    </div>
  );
};

export default PaymentModal;