import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft, Check, Download } from 'lucide-react';
import { bookingApi } from '../../services/api';
import { Button } from '../ui/button';
import { BookingSteps } from './BookingSteps';
import { PriceBreakdown } from './PriceBreakdown';
import { CountdownTimer } from './CountdownTimer';
import { format } from 'date-fns';
import { BookingLayout } from './BookingLayout';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatPrice } from '../../lib/utils';

interface Booking {
  _id: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  bookingDetails: {
    checkIn: string;
    checkOut: string;
    rooms: number;
    totalPrice: number;
  };
  status: string;
  createdAt: string;
  payment?: {
    slipUrl: string;
    date: string;
  };
}

export function BookingConfirmation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [booking, setBooking] = React.useState<Booking | null>(null);

  const villa = useSelector((state: RootState) => state.villa.villa);
  const basePrice = villa?.pricePerNight || 0;
  const discountedPrice = villa?.discountedPrice || 0;

  const handleBackToMain = () => {
    navigate('/');
  };

  const generateReceipt = async () => {
    if (!booking) return;

    // Format currency
    const formatPDFPrice = (amount: number) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    // Create receipt content
    const receiptContent = document.createElement('div');
    receiptContent.style.width = '595px'; // A4 width in pixels
    receiptContent.style.height = '842px'; // A4 height
    receiptContent.style.position = 'relative';
    receiptContent.style.background = 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)';
    receiptContent.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    receiptContent.style.color = '#000000';
    receiptContent.style.margin = '0';
    receiptContent.style.padding = '0';
    receiptContent.style.overflow = 'hidden';

    // Add top orange section with curve
    const topSection = document.createElement('div');
    topSection.style.width = '100%';
    topSection.style.height = '100px';
    topSection.style.background = 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)';
    topSection.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    topSection.style.position = 'relative';
    topSection.style.marginBottom = '20px';

    // Add curve to top section
    const curve = document.createElement('div');
    curve.style.position = 'absolute';
    curve.style.bottom = '-20px';
    curve.style.width = '100%';
    curve.style.height = '40px';
    curve.style.background = 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)';
    curve.style.borderTopLeftRadius = '50% 100%';
    curve.style.borderTopRightRadius = '50% 100%';
    topSection.appendChild(curve);

    // Add villa name
    const villaName = document.createElement('div');
    villaName.style.position = 'absolute';
    villaName.style.top = '50%';
    villaName.style.left = '50%';
    villaName.style.transform = 'translate(-50%, -80%)';
    villaName.style.color = '#ffffff';
    villaName.style.fontSize = '24px';
    villaName.style.fontWeight = '500';
    villaName.style.textAlign = 'center';
    villaName.style.width = '100%';
    villaName.style.padding = '0 20px';
    villaName.innerHTML = villa?.name?.th || villa?.name?.en || 'Luxury Villa';
    topSection.appendChild(villaName);

    receiptContent.appendChild(topSection);

    // Add booking reference
    const reference = document.createElement('div');
    reference.style.padding = '0 30px';
    reference.style.marginBottom = '15px';
    reference.style.display = 'flex';
    reference.style.justifyContent = 'space-between';
    reference.style.fontSize = '11px';
    reference.style.color = '#555555';
    reference.innerHTML = `
      <div>เลขที่การจอง: ${booking._id || 'ไม่มีเลขอ้างอิง'}</div>
      <div>วันที่: ${format(new Date(), 'PPP')}</div>
    `;
    receiptContent.appendChild(reference);

    // Define luxury sections
    const sections = [
      {
        title: 'รายละเอียดการจอง',
        content: [
          ['เช็คอิน', format(new Date(booking.bookingDetails.checkIn), 'PPP')],
          ['เช็คเอาท์', format(new Date(booking.bookingDetails.checkOut), 'PPP')],
          ['สถานะ', booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอการยืนยัน']
        ]
      },
      {
        title: 'ข้อมูลลูกค้า',
        content: [
          ['ชื่อ-นามสกุล', `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`],
          ['อีเมล', booking.customerInfo.email],
          ['เบอร์โทรศัพท์', booking.customerInfo.phone]
        ]
      },
      {
        title: 'รายละเอียดราคา',
        content: [
          ['ราคารวม', `฿${formatPDFPrice(booking.bookingDetails.totalPrice)}`]
        ]
      }
    ];

    // Add sections with luxury styling
    sections.forEach((section, index) => {
      const sectionDiv = document.createElement('div');
      sectionDiv.style.padding = '0 30px';
      sectionDiv.style.marginBottom = '15px';

      // Section header
      const header = document.createElement('div');
      header.style.background = 'linear-gradient(90deg, #FF9800 0%, #FFB74D 100%)';
      header.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
      header.style.color = '#ffffff';
      header.style.padding = '6px 12px';
      header.style.fontSize = '12px';
      header.style.fontWeight = '500';
      header.style.borderRadius = '2px';
      header.innerHTML = section.title;
      sectionDiv.appendChild(header);

      // Section content
      const content = document.createElement('table');
      content.style.width = '100%';
      content.style.borderCollapse = 'collapse';
      content.style.background = 'linear-gradient(180deg, #ffffff 0%, #fafafa 50%, #ffffff 100%)';
      content.style.backdropFilter = 'blur(8px)';
      content.style.marginTop = '5px';

      section.content.forEach(([label, value]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="padding: 8px 12px; color: #555555; font-weight: normal; width: 100px; font-size: 11px; vertical-align: top">${label}</td>
          <td style="padding: 8px 12px; color: #333333; font-size: 11px; vertical-align: top">${value}</td>
        `;
        content.appendChild(row);
      });

      sectionDiv.appendChild(content);
      receiptContent.appendChild(sectionDiv);
    });

    // Add footer with orange curve
    const footerSection = document.createElement('div');
    footerSection.style.position = 'absolute';
    footerSection.style.bottom = '0';
    footerSection.style.width = '100%';
    footerSection.style.height = '150px';

    // Add curve
    const footerCurve = document.createElement('div');
    footerCurve.style.position = 'absolute';
    footerCurve.style.bottom = '0';
    footerCurve.style.right = '0';
    footerCurve.style.width = '150px';
    footerCurve.style.height = '150px';
    footerCurve.style.background = 'linear-gradient(45deg, #FFB74D 0%, #FF9800 100%)';
    footerCurve.style.borderTopLeftRadius = '100%';
    footerSection.appendChild(footerCurve);

    // Add footer text
    const footer = document.createElement('div');
    footer.style.position = 'absolute';
    footer.style.bottom = '20px';
    footer.style.left = '30px';
    footer.style.color = '#666666';
    footer.style.fontSize = '10px';
    footer.style.lineHeight = '1.4';
    footer.innerHTML = `
      <div style="margin-bottom: 4px">ขอบคุณที่เลือกใช้บริการวิลล่าของเรา หวังว่าจะได้ต้อนรับคุณเร็วๆ นี้</div>
      <div>สร้างเมื่อ ${format(new Date(), 'PPP')}</div>
    `;
    footerSection.appendChild(footer);
    receiptContent.appendChild(footerSection);
    receiptContent.appendChild(footer);

    // Temporarily add to document
    document.body.appendChild(receiptContent);

    try {
      // Convert to canvas
      const canvas = await html2canvas(receiptContent, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`luxury-villa-receipt-${booking._id || 'no-reference'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง');
    } finally {
      // Clean up
      document.body.removeChild(receiptContent);
    }
  };

  React.useEffect(() => {
    async function fetchBooking() {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const response = await bookingApi.getBooking(id);
        if (!response?.data?.booking) {
          toast.error(t('booking.errors.notFound'));
          navigate('/');
          return;
        }
        setBooking(response.data.booking);
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error(t('booking.errors.fetchFailed'));
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooking();
  }, [id, navigate, t]);

  if (isLoading || !booking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate total nights and price only if we have valid booking details
  const calculatePricing = () => {
    if (!booking?.bookingDetails?.checkIn || !booking?.bookingDetails?.checkOut) {
      return {
        totalNights: 0,
        totalPrice: 0,
        actualPricePerNight: 0
      };
    }

    const pricePerNight = basePrice;
    const actualPricePerNight = discountedPrice > 0 ? discountedPrice : pricePerNight;

    const totalNights = Math.ceil(
      (new Date(booking.bookingDetails.checkOut).getTime() - new Date(booking.bookingDetails.checkIn).getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    const totalPrice = booking.bookingDetails.totalPrice || (actualPricePerNight * totalNights);

    return {
      totalNights,
      totalPrice,
      actualPricePerNight
    };
  };

  const { totalNights, totalPrice, actualPricePerNight } = calculatePricing();

  return (
    <BookingLayout>
      <BookingSteps currentStep={3} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('booking.confirmation.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('booking.confirmation.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Booking Details */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">{t('booking.confirmation.details')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.checkIn')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(booking.bookingDetails.checkIn), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.checkOut')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(booking.bookingDetails.checkOut), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.rooms')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.bookingDetails.rooms} {t('booking.room', { count: booking.bookingDetails.rooms })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.status')}</p>
                <p className="font-medium capitalize text-gray-900 dark:text-white">
                  {t(`booking.confirmation.statusTypes.${booking.status}`)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">{t('booking.confirmation.customerInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booking.customerInfo ? (
                <>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.name')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.customerInfo.firstName} {booking.customerInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t('booking.form.email')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.customerInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t('booking.form.phone')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.customerInfo.phone}</p>
                  </div>
                </>
              ) : (
                <div className="col-span-2">
                  <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.pendingInfo')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <PriceBreakdown 
              breakdown={{
                basePrice: basePrice,
                numberOfNights: totalNights,
                discount: discountedPrice > 0 ? (basePrice - actualPricePerNight) * totalNights : undefined,
                discountedPrice: discountedPrice > 0 ? actualPricePerNight : undefined,
                total: totalPrice
              }} 
            />
          </div>

          {/* Download Receipt Button */}
          <div className="mt-6">
            <Button
              onClick={generateReceipt}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600"
            >
              <Download className="w-5 h-5" />
              {t('booking.confirmation.downloadReceipt')}
            </Button>
          </div>

          {/* Payment Timer */}
          {booking.status === 'pending_payment' && (
            <div className="mt-6">
              <CountdownTimer
                expiryTime={new Date(booking.createdAt).getTime() + 24 * 60 * 60 * 1000}
                onExpire={() => {
                  toast.error(t('booking.payment.expired'));
                  navigate('/');
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleBackToMain}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('common.backToMain')}
          </Button>
        </div>
      </motion.div>
    </BookingLayout>
  );
}