using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using System.Threading.Tasks;
using Web.Modules;
using Web.Models;
using System;
using Common;
using Microsoft.AspNetCore.Authorization;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {

        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Account service";
            return Ok(info);
        }

        [HttpGet]
        public async Task<object> Get()
        {
            string login = HttpContext.User.Identity.Name;
            var user = await UserManager.GetUserInfo(login);
            if(user==null){
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                return Unauthorized(new { errorText = "Неверный логин/ пароль" });
            }
            return Ok(user);
        }

        [HttpGet("id")]
        public ActionResult<object> Get(int id)
        {
            return UserManager.GetByID(id);
        }
        [HttpGet("login")]
        public ActionResult<object> GetByLogin(string login)
        {
            return UserManager.GetByLogin(login);
        }
        [HttpPost("login")]
        public async Task<object> Login([FromBody] UserEntity person)
        {

            var identity = await GetIdentity(person.login, person.password, "ApplicationCookie");
            if (identity == null)
            {
                return Unauthorized(new { errorText = "Неверный логин/ пароль" });
            }

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));

            /*var now = DateTime.UtcNow;
            // создаем JWT-токен
            var jwt = new JwtSecurityToken(
                    issuer: AuthOptions.ISSUER,
                    audience: AuthOptions.AUDIENCE,
                    notBefore: now,
                    claims: identity.Claims,
                    expires: now.Add(TimeSpan.FromMinutes(AuthOptions.LIFETIME)),
                    signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256));
            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);
 
            var response = new
            {
                access_token = encodedJwt,
                username = identity.Name
            };
 
            return response;*/
            return Ok(new { resultText = "auth Ok" });

        }

        [HttpPost("remaindpwd")]
        public ActionResult<object> RemaindPwd([FromBody] UserEntity person)
        {
            try
            {
                UserEntity entity = UserManager.GetByLogin(person.login, true);
                if (entity != null)
                {
                    MailSender.SendAsync(
                        entity.login,
                        string.Format(@"<strong>Уважаемый(я) {0}!</strong><br/>
                            Напоминаем Ваши регистрационные данные на Архитектурном портале<br/>
                            <br/>
                            Логин: {1}<br/>
                            Пароль: {2}<br/>
                            <br/>
                            <a href='{3}'>Войти</a><br/>
                            ", entity.name, entity.login, entity.password, HttpContext.Request.Scheme + "://" + HttpContext.Request.Host.Value),
                                "Регистрационные данные Архитектурного портала"
                        );
                }
                if (entity == null)
                    return BadRequest("Пользователь не найден");
                return Ok("");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("request")]
        public ActionResult<object> DoRequest([FromBody] UserEntity person)
        {
            //person.password = StringCoder.Code(person.password);
            person.requestGuid = Guid.NewGuid().ToString();
            try
            {
                person = UserManager.Save(person);
                MailSender.SendAsync(
                    person.login,
                    string.Format(@"<strong>Уважаемый(я) {0}!</strong><br/>
                        Вы запросили регистрацию на Архитектурном портале<br/>
                        <br/>
                        Для завершения регистрации пройдите по <a href='{1}?regid={2}'>ссылке</a><br/>
                        <br/>
                        Если Вы не запрашивали регистрацию просто проигнорируйте данное письмо", person.name, HttpContext.Request.Scheme + "://" + HttpContext.Request.Host.Value + "/login.html", person.requestGuid),
                        "Подтвердите свой запрос регистрации на Архитектурном портале"
                    );
                person.password = "";
                return Ok(person);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("confirm")]
        public ActionResult<object> Confirm(string requestgiud)
        {
            return Ok(UserManager.ConfirmRequest(requestgiud));
        }

        private async Task<ClaimsIdentity> GetIdentity(string username, string password, string authType = "Token")
        {
            UserEntity person = await UserManager.Login(username, password);
            if (person != null)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimsIdentity.DefaultNameClaimType, person.login)
                };
                foreach (string role in person.roles)
                {
                    claims.Add(new Claim(ClaimsIdentity.DefaultRoleClaimType, role));
                }
                ClaimsIdentity claimsIdentity =
                new ClaimsIdentity(claims, authType, ClaimsIdentity.DefaultNameClaimType,
                    ClaimsIdentity.DefaultRoleClaimType);
                return claimsIdentity;
            }

            // если пользователя не найдено
            return null;
        }

        [HttpPost("logout")]
        public async void Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        }

        [HttpPut]
        public ActionResult<object> Put([FromBody] UserEntity value)
        {
            try
            {
                UserEntity entity = UserManager.Save(value);
                if (value.need2SendMessage)
                {
                    MailSender.SendAsync(
                        entity.login,
                        string.Format(@"<strong>Уважаемый(я) {0}!</strong><br/>
                    Статус Вашей учетной записи на Архитектурном портале установлен равным '{1}'<br/>", entity.name, entity.state),
                        "Регистрационные данные Архитектурного портала"
                        );
                }
                return Ok(entity);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                UserManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}