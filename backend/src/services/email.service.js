import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
})

export const sendReminderEmail = async ({ to, productName, daysBeforeExpiry, expiryDate }) => {
    const subject = daysBeforeExpiry === 1
        ? `⚠️ Warranty expires tomorrow: ${productName}`
        : `Warranty expiring in ${daysBeforeExpiry} days: ${productName}`

    const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    })

    await transporter.sendMail({
        from: `"Receipt Collector" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text: `Your warranty for "${productName}" expires on ${formattedDate}. Make sure to file any claims before then.`
    })
}