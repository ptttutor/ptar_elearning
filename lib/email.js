/**
 * Email notification service
 * ส่ง email แจ้งเตือนไปยัง admin เมื่อมีการจ่ายเงินสำเร็จหรือไม่สำเร็จ
 */

import nodemailer from 'nodemailer';
import { siteConfig } from '@/lib/site-config';

// สร้าง email transporter
const createTransporter = () => {
  // ถ้าต้องการใช้ Gmail กับ App Password
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // ต้องเป็น App Password
      },
    });
  }

  // สำหรับ SMTP Provider อื่น ๆ
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
    },
    // สำหรับการทดสอบเท่านั้น - ปิดการตรวจสอบ SSL
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * ส่ง email แจ้งเตือนเมื่อได้รับ slip และกำลังตรวจสอบ
 * @param {Object} paymentData - ข้อมูลการชำระเงิน
 * @param {Object} orderData - ข้อมูลคำสั่งซื้อ
 * @param {Object} userData - ข้อมูลผู้ใช้
 * @param {number} confidence - ความเชื่อมั่นของระบบ
 */
export const sendPaymentPendingNotification = async (paymentData, orderData, userData, confidence = 0) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
      console.log('⚠️ Email configuration not found, skipping email notification');
      return { success: false, error: 'Email configuration not found' };
    }

    const transporter = createTransporter();

    // สร้างเนื้อหา email
    const itemName = orderData.course?.title || orderData.ebook?.title || 'ไม่ระบุ';
    const itemType = orderData.course ? 'คอร์สเรียน' : 'E-book';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ffc107; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6; }
          .footer { background-color: #6c757d; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; }
          .info-row { margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #dee2e6; }
          .label { font-weight: bold; color: #495057; }
          .value { color: #212529; }
          .pending { color: #ffc107; font-weight: bold; }
          .amount { font-size: 18px; font-weight: bold; color: #007bff; }
          .discount { font-size: 16px; font-weight: bold; color: #52c41a; }
          .original-price { text-decoration: line-through; color: #8c8c8c; font-size: 14px; }
          .note { background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 15px 0; }
          .price-summary { background-color: #e6f7ff; padding: 15px; border-radius: 5px; border-left: 4px solid #1890ff; margin: 15px 0; }
          .coupon-info { background-color: #f6ffed; padding: 15px; border-radius: 5px; border-left: 4px solid #52c41a; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📋 รอตรวจสอบ Slip การชำระเงิน</h2>
            <p>มี Slip การชำระเงินใหม่รอการตรวจสอบ</p>
          </div>
          
          <div class="content">
            <h3>ข้อมูลการชำระเงิน</h3>
            
            <div class="info-row">
              <span class="label">สถานะ:</span>
              <span class="value pending">⏳ รอการตรวจสอบ</span>
            </div>
            
            <div class="info-row">
              <span class="label">หมายเลขคำสั่งซื้อ:</span>
              <span class="value">${orderData.id}</span>
            </div>
            
            <div class="info-row">
              <span class="label">รายการ:</span>
              <span class="value">${itemName} (${itemType})</span>
            </div>
            
            ${orderData.couponCode ? `
            <div class="coupon-info">
              <strong>🎫 ข้อมูลคูปองส่วนลด</strong><br>
              <div style="margin-top: 8px;">
                <span class="label">รหัสคูปอง:</span> <code>${orderData.couponCode}</code><br>
                ${orderData.coupon?.name ? `<span class="label">ชื่อคูปอง:</span> ${orderData.coupon.name}<br>` : ''}
                <span class="label">ประเภทส่วนลด:</span> ${getCouponTypeText(orderData.coupon?.type)}<br>
                <span class="label">ค่าส่วนลด:</span> <span class="discount">-฿${(orderData.couponDiscount || 0).toLocaleString()}</span>
              </div>
            </div>
            ` : ''}
            
            <div class="price-summary">
              <strong>💰 สรุปการชำระเงิน</strong><br>
              <div style="margin-top: 8px;">
                <span class="label">ราคาสินค้า:</span> 
                ${orderData.couponDiscount > 0 ? 
                  `<span class="original-price">฿${orderData.subtotal.toLocaleString()}</span>` : 
                  `฿${orderData.subtotal.toLocaleString()}`
                }<br>
                ${orderData.shippingFee > 0 ? `<span class="label">ค่าจัดส่ง:</span> ฿${orderData.shippingFee.toLocaleString()}<br>` : ''}
                ${orderData.couponDiscount > 0 ? `<span class="label">ส่วนลด:</span> <span class="discount">-฿${orderData.couponDiscount.toLocaleString()}</span><br>` : ''}
                <span class="label">ยอดที่ต้องชำระ:</span> <span class="amount">฿${paymentData.amount.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="info-row">
              <span class="label">วิธีชำระเงิน:</span>
              <span class="value">${getPaymentMethodText(paymentData.method)}</span>
            </div>
            
            <div class="info-row">
              <span class="label">ลูกค้า:</span>
              <span class="value">${userData.name} (${userData.email})</span>
            </div>
            
            <div class="info-row">
              <span class="label">เวลาที่อัปโหลด:</span>
              <span class="value">${new Date(paymentData.uploadedAt).toLocaleString('th-TH')}</span>
            </div>
            
            <div class="info-row">
              <span class="label">ความเชื่อมั่นของระบบ:</span>
              <span class="value">${confidence}%</span>
            </div>
            
            ${paymentData.slipUrl ? `
            <div class="info-row">
              <span class="label">Slip URL:</span>
              <span class="value"><a href="${paymentData.slipUrl}" target="_blank">ดู Slip</a></span>
            </div>
            ` : ''}
            
            <div class="note">
              <strong>📝 หมายเหตุ:</strong><br>
              ${paymentData.notes || 'กรุณาตรวจสอบ Slip การชำระเงินใน Admin Panel'}
            </div>
          </div>
          
          <div class="footer">
            <p>ระบบ E-Learning - ${siteConfig.siteName}</p>
            <p>เวลาส่ง: ${new Date().toLocaleString('th-TH')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"ระบบ E-Learning" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `📋 รอตรวจสอบ Slip - ${itemName} (฿${paymentData.amount.toLocaleString()})`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Payment pending email sent:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending payment pending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ส่ง email แจ้งเตือนการชำระเงินสำเร็จ
 * @param {Object} paymentData - ข้อมูลการชำระเงิน
 * @param {Object} orderData - ข้อมูลคำสั่งซื้อ
 * @param {Object} userData - ข้อมูลผู้ใช้
 */
export const sendPaymentSuccessNotification = async (paymentData, orderData, userData) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
      console.log('⚠️ Email configuration not found, skipping email notification');
      return { success: false, error: 'Email configuration not found' };
    }

    const transporter = createTransporter();

    // สร้างเนื้อหา email
    const itemName = orderData.course?.title || orderData.ebook?.title || 'ไม่ระบุ';
    const itemType = orderData.course ? 'คอร์สเรียน' : 'E-book';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6; }
          .footer { background-color: #6c757d; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; }
          .info-row { margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #dee2e6; }
          .label { font-weight: bold; color: #495057; }
          .value { color: #212529; }
          .success { color: #28a745; font-weight: bold; }
          .amount { font-size: 18px; font-weight: bold; color: #28a745; }
          .discount { font-size: 16px; font-weight: bold; color: #52c41a; }
          .original-price { text-decoration: line-through; color: #8c8c8c; font-size: 14px; }
          .price-summary { background-color: #e6f7ff; padding: 15px; border-radius: 5px; border-left: 4px solid #1890ff; margin: 15px 0; }
          .coupon-info { background-color: #f6ffed; padding: 15px; border-radius: 5px; border-left: 4px solid #52c41a; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 การชำระเงินสำเร็จ</h2>
            <p>มีการชำระเงินใหม่ในระบบ</p>
          </div>
          
          <div class="content">
            <h3>ข้อมูลการชำระเงิน</h3>
            
            <div class="info-row">
              <span class="label">สถานะ:</span>
              <span class="value success">✅ ชำระเงินสำเร็จ</span>
            </div>
            
            <div class="info-row">
              <span class="label">หมายเลขคำสั่งซื้อ:</span>
              <span class="value">${orderData.id}</span>
            </div>
            
            <div class="info-row">
              <span class="label">รายการ:</span>
              <span class="value">${itemName} (${itemType})</span>
            </div>
            
            ${orderData.couponCode ? `
            <div class="coupon-info">
              <strong>🎫 ข้อมูลคูปองส่วนลด</strong><br>
              <div style="margin-top: 8px;">
                <span class="label">รหัสคูปอง:</span> <code>${orderData.couponCode}</code><br>
                ${orderData.coupon?.name ? `<span class="label">ชื่อคูปอง:</span> ${orderData.coupon.name}<br>` : ''}
                <span class="label">ประเภทส่วนลด:</span> ${getCouponTypeText(orderData.coupon?.type)}<br>
                <span class="label">ค่าส่วนลด:</span> <span class="discount">-฿${(orderData.couponDiscount || 0).toLocaleString()}</span>
              </div>
            </div>
            ` : ''}
            
            <div class="price-summary">
              <strong>💰 สรุปการชำระเงิน</strong><br>
              <div style="margin-top: 8px;">
                <span class="label">ราคาสินค้า:</span> 
                ${orderData.couponDiscount > 0 ? 
                  `<span class="original-price">฿${orderData.subtotal.toLocaleString()}</span>` : 
                  `฿${orderData.subtotal.toLocaleString()}`
                }<br>
                ${orderData.shippingFee > 0 ? `<span class="label">ค่าจัดส่ง:</span> ฿${orderData.shippingFee.toLocaleString()}<br>` : ''}
                ${orderData.couponDiscount > 0 ? `<span class="label">ส่วนลด:</span> <span class="discount">-฿${orderData.couponDiscount.toLocaleString()}</span><br>` : ''}
                <span class="label">ยอดที่ชำระ:</span> <span class="amount">฿${paymentData.amount.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="info-row">
              <span class="label">วิธีชำระเงิน:</span>
              <span class="value">${getPaymentMethodText(paymentData.method)}</span>
            </div>
            
            <div class="info-row">
              <span class="label">ลูกค้า:</span>
              <span class="value">${userData.name} (${userData.email})</span>
            </div>
            
            <div class="info-row">
              <span class="label">เวลาที่ชำระ:</span>
              <span class="value">${new Date(paymentData.paidAt || paymentData.updatedAt).toLocaleString('th-TH')}</span>
            </div>
            
            ${paymentData.confidence ? `
            <div class="info-row">
              <span class="label">ความเชื่อมั่น:</span>
              <span class="value">${paymentData.confidence}%</span>
            </div>
            ` : ''}
            
            ${paymentData.adminNotes ? `
            <div class="info-row">
              <span class="label">หมายเหตุ:</span>
              <span class="value">${paymentData.adminNotes}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>ระบบ E-Learning - ${siteConfig.siteName}</p>
            <p>เวลาส่ง: ${new Date().toLocaleString('th-TH')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"ระบบ E-Learning" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `✅ การชำระเงินสำเร็จ - ${itemName} (฿${paymentData.amount.toLocaleString()})`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Payment success email sent:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending payment success email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ส่ง email แจ้งเตือนการชำระเงินไม่สำเร็จ
 * @param {Object} paymentData - ข้อมูลการชำระเงิน
 * @param {Object} orderData - ข้อมูลคำสั่งซื้อ
 * @param {Object} userData - ข้อมูลผู้ใช้
 * @param {string} reason - เหตุผลที่ไม่สำเร็จ
 */
export const sendPaymentFailureNotification = async (paymentData, orderData, userData, reason = '') => {
  try {
    if (!process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
      console.log('⚠️ Email configuration not found, skipping email notification');
      return { success: false, error: 'Email configuration not found' };
    }

    const transporter = createTransporter();

    // สร้างเนื้อหา email
    const itemName = orderData.course?.title || orderData.ebook?.title || 'ไม่ระบุ';
    const itemType = orderData.course ? 'คอร์สเรียน' : 'E-book';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6; }
          .footer { background-color: #6c757d; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; }
          .info-row { margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #dee2e6; }
          .label { font-weight: bold; color: #495057; }
          .value { color: #212529; }
          .error { color: #dc3545; font-weight: bold; }
          .amount { font-size: 18px; font-weight: bold; color: #dc3545; }
          .discount { font-size: 16px; font-weight: bold; color: #52c41a; }
          .original-price { text-decoration: line-through; color: #8c8c8c; font-size: 14px; }
          .reason { background-color: #f8d7da; padding: 10px; border-radius: 5px; border-left: 4px solid #dc3545; margin: 15px 0; }
          .price-summary { background-color: #e6f7ff; padding: 15px; border-radius: 5px; border-left: 4px solid #1890ff; margin: 15px 0; }
          .coupon-info { background-color: #f6ffed; padding: 15px; border-radius: 5px; border-left: 4px solid #52c41a; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>❌ การชำระเงินไม่สำเร็จ</h2>
            <p>มีการชำระเงินที่ไม่สำเร็จในระบบ</p>
          </div>
          
          <div class="content">
            <h3>ข้อมูลการชำระเงิน</h3>
            
            <div class="info-row">
              <span class="label">สถานะ:</span>
              <span class="value error">❌ ${getPaymentStatusText(paymentData.status)}</span>
            </div>
            
            <div class="info-row">
              <span class="label">หมายเลขคำสั่งซื้อ:</span>
              <span class="value">${orderData.id}</span>
            </div>
            
            <div class="info-row">
              <span class="label">รายการ:</span>
              <span class="value">${itemName} (${itemType})</span>
            </div>
            
            ${orderData.couponCode ? `
            <div class="coupon-info">
              <strong>🎫 ข้อมูลคูปองส่วนลด</strong><br>
              <div style="margin-top: 8px;">
                <span class="label">รหัสคูปอง:</span> <code>${orderData.couponCode}</code><br>
                ${orderData.coupon?.name ? `<span class="label">ชื่อคูปอง:</span> ${orderData.coupon.name}<br>` : ''}
                <span class="label">ประเภทส่วนลด:</span> ${getCouponTypeText(orderData.coupon?.type)}<br>
                <span class="label">ค่าส่วนลด:</span> <span class="discount">-฿${(orderData.couponDiscount || 0).toLocaleString()}</span>
              </div>
            </div>
            ` : ''}
            
            <div class="price-summary">
              <strong>💰 สรุปการชำระเงิน</strong><br>
              <div style="margin-top: 8px;">
                <span class="label">ราคาสินค้า:</span> 
                ${orderData.couponDiscount > 0 ? 
                  `<span class="original-price">฿${orderData.subtotal.toLocaleString()}</span>` : 
                  `฿${orderData.subtotal.toLocaleString()}`
                }<br>
                ${orderData.shippingFee > 0 ? `<span class="label">ค่าจัดส่ง:</span> ฿${orderData.shippingFee.toLocaleString()}<br>` : ''}
                ${orderData.couponDiscount > 0 ? `<span class="label">ส่วนลด:</span> <span class="discount">-฿${orderData.couponDiscount.toLocaleString()}</span><br>` : ''}
                <span class="label">ยอดที่ต้องชำระ:</span> <span class="amount">฿${paymentData.amount.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="info-row">
              <span class="label">วิธีชำระเงิน:</span>
              <span class="value">${getPaymentMethodText(paymentData.method)}</span>
            </div>
            
            <div class="info-row">
              <span class="label">ลูกค้า:</span>
              <span class="value">${userData.name} (${userData.email})</span>
            </div>
            
            <div class="info-row">
              <span class="label">เวลาที่อัปเดต:</span>
              <span class="value">${new Date(paymentData.updatedAt).toLocaleString('th-TH')}</span>
            </div>
            
            ${paymentData.confidence ? `
            <div class="info-row">
              <span class="label">ความเชื่อมั่น:</span>
              <span class="value">${paymentData.confidence}%</span>
            </div>
            ` : ''}
            
            ${reason && `
            <div class="reason">
              <strong>เหตุผลที่ไม่สำเร็จ:</strong><br>
              ${reason}
            </div>
            `}
            
            ${paymentData.adminNotes ? `
            <div class="info-row">
              <span class="label">หมายเหตุ:</span>
              <span class="value">${paymentData.adminNotes}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>ระบบ E-Learning - ${siteConfig.siteName}</p>
            <p>เวลาส่ง: ${new Date().toLocaleString('th-TH')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"ระบบ E-Learning" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `❌ การชำระเงินไม่สำเร็จ - ${itemName} (฿${paymentData.amount.toLocaleString()})`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Payment failure email sent:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending payment failure email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * แปลงประเภทคูปองเป็นข้อความภาษาไทย
 */
const getCouponTypeText = (type) => {
  const types = {
    'PERCENTAGE': 'ส่วนลดเปอร์เซ็นต์ (%)',
    'FIXED_AMOUNT': 'ส่วนลดจำนวนคงที่ (฿)',
    'FREE_SHIPPING': 'ฟรีค่าจัดส่ง'
  };
  return types[type] || type;
};

/**
 * แปลงวิธีชำระเงินเป็นข้อความภาษาไทย
 */
const getPaymentMethodText = (method) => {
  const methods = {
    'BANK_TRANSFER': 'โอนเงินผ่านธนาคาร',
    'CREDIT_CARD': 'บัตรเครดิต',
    'DEBIT_CARD': 'บัตรเดบิต',
    'MOBILE_BANKING': 'Mobile Banking',
    'PROMPT_PAY': 'PromptPay',
    'TRUE_WALLET': 'TrueMoney Wallet',
    'FREE': 'ฟรี',
    'CASH': 'เงินสด'
  };
  return methods[method] || method;
};

/**
 * แปลงสถานะการชำระเงินเป็นข้อความภาษาไทย
 */
const getPaymentStatusText = (status) => {
  const statuses = {
    'PENDING': 'รอการชำระเงิน',
    'PENDING_VERIFICATION': 'รอการตรวจสอบ',
    'APPROVED': 'อนุมัติแล้ว',
    'COMPLETED': 'ชำระเงินสำเร็จ',
    'REJECTED': 'ถูกปฏิเสธ',
    'FAILED': 'ล้มเหลว',
    'CANCELLED': 'ยกเลิก'
  };
  return statuses[status] || status;
};

/**
 * ส่ง email แจ้งเตือนทั่วไป
 * @param {string} to - อีเมลผู้รับ
 * @param {string} subject - หัวข้อ
 * @param {string} htmlContent - เนื้อหา HTML
 */
export const sendEmailNotification = async (to, subject, htmlContent) => {
  try {
    if (!process.env.EMAIL_USER) {
      console.log('⚠️ Email configuration not found');
      return { success: false, error: 'Email configuration not found' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"ระบบ E-Learning" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};
