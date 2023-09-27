# Utilizziamo nodemailer con sendgrid (100 email free per month)
npm install --save nodemailer nodemailer-sendgrid-transport
(Integra sendgrid automaticamente)

# Utilizzo

```
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport')

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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',
  }
}));

 return transporter.sendMail({
        to: email,
        from: 'EMAIL@GMAIL.com',
        subject: 'Signup succeeded',
        html: '<h1>You successfully signed up!'
      })
      .catch(err => console.log(err))
```