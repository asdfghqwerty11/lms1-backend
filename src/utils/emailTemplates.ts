export const emailTemplates = {
  passwordReset: (resetUrl: string, userName: string) => ({
    subject: 'Reset Your DentNode Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .email-header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .email-body {
              padding: 30px;
            }
            .email-body p {
              margin: 15px 0;
            }
            .cta-button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .cta-button:hover {
              background-color: #764ba2;
            }
            .email-footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>DentNode by DentalKart</h1>
            </div>
            <div class="email-body">
              <p>Hello <strong>${userName}</strong>,</p>
              <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
              <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
              <a href="${resetUrl}" class="cta-button">Reset Password</a>
              <div class="warning">
                <strong>Or copy and paste this link:</strong><br>
                <small>${resetUrl}</small>
              </div>
              <p>If you continue to have trouble accessing your account, contact our support team.</p>
            </div>
            <div class="email-footer">
              <p>© 2024 DentalKart. All rights reserved. | <a href="https://dentalkart.com" style="color: #667eea; text-decoration: none;">Visit Website</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  welcome: (userName: string, tempPassword?: string) => ({
    subject: 'Welcome to DentNode - Your DentalKart Lab Management System',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .email-header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .email-body {
              padding: 30px;
            }
            .email-body p {
              margin: 15px 0;
            }
            .cta-button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .cta-button:hover {
              background-color: #764ba2;
            }
            .credentials-box {
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
            }
            .credentials-box p {
              margin: 8px 0;
            }
            .email-footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
            }
            .features {
              margin: 20px 0;
            }
            .feature-item {
              margin: 10px 0;
              padding-left: 20px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Welcome to DentNode!</h1>
            </div>
            <div class="email-body">
              <p>Hello <strong>${userName}</strong>,</p>
              <p>Your account has been created successfully. Welcome to DentNode, your comprehensive dental lab management system.</p>

              <h3 style="color: #667eea; margin-top: 25px;">Getting Started</h3>
              <div class="features">
                <div class="feature-item">✓ Manage cases and track their status in real-time</div>
                <div class="feature-item">✓ Process invoices and payments securely</div>
                <div class="feature-item">✓ Track inventory levels and alerts</div>
                <div class="feature-item">✓ Collaborate with your team seamlessly</div>
              </div>

              ${tempPassword ? `
                <div class="credentials-box">
                  <p><strong>Your temporary password is:</strong></p>
                  <p style="font-family: monospace; background: white; padding: 8px; border-radius: 4px; word-break: break-all;">
                    ${tempPassword}
                  </p>
                  <p><small>Please change this password after your first login for security.</small></p>
                </div>
              ` : ''}

              <a href="https://dentalkart.com/login" class="cta-button">Sign In Now</a>

              <p style="margin-top: 25px;">If you have any questions or need assistance, our support team is here to help.</p>
            </div>
            <div class="email-footer">
              <p>© 2024 DentalKart. All rights reserved. | <a href="https://dentalkart.com" style="color: #667eea; text-decoration: none;">Visit Website</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  caseStatusUpdate: (dentistName: string, caseNumber: string, newStatus: string, patientName: string) => ({
    subject: `Case ${caseNumber} Status Updated to ${newStatus}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .email-header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .email-body {
              padding: 30px;
            }
            .case-info {
              background-color: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .case-info-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
            }
            .case-info-label {
              font-weight: 600;
              color: #666;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 12px;
              background-color: #667eea;
              color: white;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
            .cta-button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .cta-button:hover {
              background-color: #764ba2;
            }
            .email-footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Case Status Update</h1>
            </div>
            <div class="email-body">
              <p>Hello <strong>${dentistName}</strong>,</p>
              <p>One of your cases has been updated. Here are the details:</p>

              <div class="case-info">
                <div class="case-info-row">
                  <span class="case-info-label">Case Number:</span>
                  <span>${caseNumber}</span>
                </div>
                <div class="case-info-row">
                  <span class="case-info-label">Patient Name:</span>
                  <span>${patientName}</span>
                </div>
                <div class="case-info-row">
                  <span class="case-info-label">Status:</span>
                  <span><span class="status-badge">${newStatus}</span></span>
                </div>
              </div>

              <p>Log in to DentNode to view complete details and any notes from our team.</p>
              <a href="https://dentalkart.com/cases/${caseNumber}" class="cta-button">View Case</a>
            </div>
            <div class="email-footer">
              <p>© 2024 DentalKart. All rights reserved. | <a href="https://dentalkart.com" style="color: #667eea; text-decoration: none;">Visit Website</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  caseSubmissionConfirmation: (dentistName: string, caseNumber: string, patientName: string) => ({
    subject: `Case Submission Confirmed - ${caseNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .email-header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .success-icon {
              font-size: 48px;
              margin: 10px 0;
            }
            .email-body {
              padding: 30px;
            }
            .case-info {
              background-color: #d4edda;
              border-left: 4px solid #28a745;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #155724;
            }
            .case-info-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
            }
            .cta-button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #28a745;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .cta-button:hover {
              background-color: #218838;
            }
            .email-footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Case Submission Confirmed</h1>
              <div class="success-icon">✓</div>
            </div>
            <div class="email-body">
              <p>Hello <strong>${dentistName}</strong>,</p>
              <p>Your case submission has been received and confirmed. Our team is now reviewing it.</p>

              <div class="case-info">
                <div class="case-info-row">
                  <span><strong>Case Number:</strong></span>
                  <span>${caseNumber}</span>
                </div>
                <div class="case-info-row">
                  <span><strong>Patient Name:</strong></span>
                  <span>${patientName}</span>
                </div>
              </div>

              <p>You will receive updates via email as the case progresses through our workflow. You can also check the status anytime by logging into DentNode.</p>
              <a href="https://dentalkart.com/cases/${caseNumber}" class="cta-button">View Case Details</a>
            </div>
            <div class="email-footer">
              <p>© 2024 DentalKart. All rights reserved. | <a href="https://dentalkart.com" style="color: #667eea; text-decoration: none;">Visit Website</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  invoiceNotification: (dentistName: string, invoiceNumber: string, amount: number, dueDate: string) => ({
    subject: `Invoice ${invoiceNumber} - Amount Due`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .email-header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .email-body {
              padding: 30px;
            }
            .invoice-box {
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 6px;
              padding: 20px;
              margin: 20px 0;
            }
            .invoice-row {
              display: flex;
              justify-content: space-between;
              margin: 12px 0;
              font-size: 16px;
            }
            .invoice-row.total {
              border-top: 2px solid #667eea;
              padding-top: 12px;
              font-weight: 600;
              font-size: 18px;
              color: #667eea;
            }
            .cta-button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .cta-button:hover {
              background-color: #764ba2;
            }
            .due-date {
              color: #dc3545;
              font-weight: 600;
            }
            .email-footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Invoice Notification</h1>
            </div>
            <div class="email-body">
              <p>Hello <strong>${dentistName}</strong>,</p>
              <p>A new invoice has been generated for your account. Please review and process payment at your earliest convenience.</p>

              <div class="invoice-box">
                <div class="invoice-row">
                  <span>Invoice Number:</span>
                  <span>${invoiceNumber}</span>
                </div>
                <div class="invoice-row">
                  <span>Amount Due:</span>
                  <span>$${amount.toFixed(2)}</span>
                </div>
                <div class="invoice-row">
                  <span>Due Date:</span>
                  <span class="due-date">${dueDate}</span>
                </div>
              </div>

              <p>Log in to your DentNode account to view the full invoice details and payment options.</p>
              <a href="https://dentalkart.com/billing/invoices/${invoiceNumber}" class="cta-button">View Invoice</a>
            </div>
            <div class="email-footer">
              <p>© 2024 DentalKart. All rights reserved. | <a href="https://dentalkart.com" style="color: #667eea; text-decoration: none;">Visit Website</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  lowStockAlert: (itemName: string, currentQuantity: number, minQuantity: number) => ({
    subject: `Low Stock Alert: ${itemName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .email-header {
              background: #ffc107;
              color: #333;
              padding: 30px;
              text-align: center;
            }
            .email-header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .email-body {
              padding: 30px;
            }
            .alert-box {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .stock-info {
              margin: 15px 0;
            }
            .cta-button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #ffc107;
              color: #333;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .cta-button:hover {
              background-color: #e0a800;
            }
            .email-footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>⚠ Low Stock Alert</h1>
            </div>
            <div class="email-body">
              <p>An item in your inventory has fallen below the minimum stock level.</p>

              <div class="alert-box">
                <div class="stock-info">
                  <p><strong>Item:</strong> ${itemName}</p>
                  <p><strong>Current Stock:</strong> ${currentQuantity}</p>
                  <p><strong>Minimum Required:</strong> ${minQuantity}</p>
                </div>
              </div>

              <p>Please order additional inventory to maintain adequate stock levels. Click the button below to manage your inventory.</p>
              <a href="https://dentalkart.com/inventory" class="cta-button">Manage Inventory</a>
            </div>
            <div class="email-footer">
              <p>© 2024 DentalKart. All rights reserved. | <a href="https://dentalkart.com" style="color: #667eea; text-decoration: none;">Visit Website</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  shipmentUpdate: (recipientName: string, trackingNumber: string, status: string, estimatedDelivery?: string) => ({
    subject: `Shipment Update - Tracking #${trackingNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .email-header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .email-body {
              padding: 30px;
            }
            .shipment-box {
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 6px;
              padding: 20px;
              margin: 20px 0;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 12px;
              background-color: #28a745;
              color: white;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
            .shipment-row {
              margin: 12px 0;
            }
            .cta-button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .cta-button:hover {
              background-color: #764ba2;
            }
            .email-footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Your Shipment is On Its Way!</h1>
            </div>
            <div class="email-body">
              <p>Hello <strong>${recipientName}</strong>,</p>
              <p>Your shipment has been updated. Here are the latest details:</p>

              <div class="shipment-box">
                <div class="shipment-row">
                  <strong>Tracking Number:</strong> ${trackingNumber}
                </div>
                <div class="shipment-row">
                  <strong>Status:</strong> <span class="status-badge">${status}</span>
                </div>
                ${estimatedDelivery ? `
                <div class="shipment-row">
                  <strong>Estimated Delivery:</strong> ${estimatedDelivery}
                </div>
                ` : ''}
              </div>

              <p>Track your shipment in real-time and get updates to your inbox.</p>
              <a href="https://dentalkart.com/shipments/${trackingNumber}" class="cta-button">Track Shipment</a>
            </div>
            <div class="email-footer">
              <p>© 2024 DentalKart. All rights reserved. | <a href="https://dentalkart.com" style="color: #667eea; text-decoration: none;">Visit Website</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};
