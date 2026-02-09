using System;
using System.Net.Mail;
using System.Net;
using System.Threading;
using Web;
using Modules.Config;
using Microsoft.Extensions.Logging;

namespace Common
{
    public class MailSender
    {

        public static void SendAsync(string addresses, string message, string subject = "", MailPriority priority = MailPriority.Normal)
        {
            new Thread(delegate () {
                var error = "";
                Send(addresses, message, subject, out error, priority);
            }).Start();
        }
        public static bool Send(string addresses, string message, string subject, out string error, MailPriority priority = MailPriority.Normal)
        {
            string MailBoxName = Startup.Configuration["MailSender:Name"];
            string MailBox = Startup.Configuration["MailSender:Box"];
            string MailLogin = Startup.Configuration["MailSender:Login"];
            string MailPwd = Startup.Configuration["MailSender:Pwd"];
            string SmtpServer = Startup.Configuration["MailSender:SmtpServer"];
            int SmtpPort = int.Parse(Startup.Configuration["MailSender:SmtpPort"]);
            bool UseSSL = Startup.Configuration["MailSender:UseSSL"].Equals("true", StringComparison.OrdinalIgnoreCase);
            error = string.Empty;

            try
            {
                MailMessage m = new MailMessage();
                m.From = new MailAddress(MailBox, MailBoxName);
                foreach (string email in addresses.Split(new char[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries))
                    m.To.Add(new MailAddress(email.Trim()));

                m.Subject = subject;
                m.Body = message;
                m.IsBodyHtml = true;
                m.Priority = priority;
                SmtpClient smtp = new SmtpClient(SmtpServer, SmtpPort);
                smtp.Credentials = new NetworkCredential(MailLogin, MailPwd);
                smtp.EnableSsl = UseSSL;
                smtp.Send(m);
                return true;
            }
            catch(Exception ex) {
                ApplicationInstance.Logger?.LogError("Ошибка отправки почты. \nOUT:{0}", ex.Message);
                error = ex.Message;
                return false; 
            }
        }
    }
}
