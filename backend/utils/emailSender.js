const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Configuración del transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verificar conexión
transporter.verify((error) => {
  if (error) {
    console.error('Error al conectar con el servidor de correo:', error);
  } else {
    console.log('✅ Servidor de correo listo');
  }
});

// Plantillas de email
const loadTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, `../templates/emails/${templateName}.hbs`);
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  const template = handlebars.compile(templateContent);
  return template(data);
};

const emailService = {
  // Envío de email genérico
  sendEmail: async ({ to, subject, template, context }) => {
    try {
      const html = loadTemplate(template, context);
      
      const mailOptions = {
        from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
        attachments: context.attachments || []
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email enviado a ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw new Error('Error al enviar el correo electrónico');
    }
  },

  // Métodos específicos
  sendWelcomeEmail: async (user) => {
    return emailService.sendEmail({
      to: user.email,
      subject: 'Bienvenido a nuestra plataforma educativa',
      template: 'welcome',
      context: {
        name: `${user.firstName} ${user.lastName}`,
        loginUrl: `${process.env.FRONTEND_URL}/login`
      }
    });
  },

  sendPasswordReset: async (user, token) => {
    return emailService.sendEmail({
      to: user.email,
      subject: 'Restablece tu contraseña',
      template: 'password-reset',
      context: {
        name: user.firstName,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
        expiryHours: process.env.PASSWORD_RESET_EXPIRY || 24
      }
    });
  },

  sendTaskGradedNotification: async (user, task, grade) => {
    return emailService.sendEmail({
      to: user.email,
      subject: `Calificación recibida - ${task.title}`,
      template: 'task-graded',
      context: {
        name: user.firstName,
        taskTitle: task.title,
        courseName: task.Course.name,
        grade,
        maxScore: task.maxScore,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
      }
    });
  }
};

module.exports = emailService;
