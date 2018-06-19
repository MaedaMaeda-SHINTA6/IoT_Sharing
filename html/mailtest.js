//モジュールロード
var nodemailer = require('nodemailer');

//SMTPサーバーの設定
nodemailer.SMTP = {
    host: 'smtp.gmail.com',
    port: 465,
    ssl: true,
    use_authentication: true,
    user: '**********@gmail.com',
    pass: '**********',
};

//メール情報の作成
var message = {
    sender: '*************',
    to: '****************',
    subject: 'test',
    body: 'test2',
    debug: true
};

// メール送信のコールバック関数
var callback = function (error, success) {
    if (error) {
        console.log("Error occured");
        console.log(error.message);
        return;
    }
    if (success) {
        console.log("Message sent successfully!");
    } else {
        console.log("Message failed, reschedule!");
    }
};

// メール送信
var mail;
try {
    mail = nodemailer.send_mail(message, callback);
} catch (e) {
    console.log("Caught Exception", e);
}