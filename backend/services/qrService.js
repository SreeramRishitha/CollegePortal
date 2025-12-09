const QRCode = require('qrcode')
const path = require('path')
const fs = require('fs').promises

/**
 * Generate QR code for a notice
 */
async function generateQRCode(noticeId, publicUrl) {
  try {
    // Generate QR code as data URL
    const qrDataURL = await QRCode.toDataURL(publicUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    // Save QR code to file
    const qrDir = 'uploads/qrcodes'
    try {
      await fs.access(qrDir)
    } catch {
      await fs.mkdir(qrDir, { recursive: true })
    }

    const qrFileName = `notice-${noticeId}.png`
    const qrPath = path.join(qrDir, qrFileName)

    // Convert data URL to buffer and save
    const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '')
    await fs.writeFile(qrPath, base64Data, 'base64')

    return `/uploads/qrcodes/${qrFileName}`
  } catch (error) {
    console.error('QR code generation error:', error)
    throw error
  }
}

/**
 * Generate short URL for notice
 */
function generateShortUrl(noticeId) {
  // In production, use a URL shortener service
  // For now, return a simple path
  return `/notices/${noticeId}`
}

module.exports = {
  generateQRCode,
  generateShortUrl,
}

