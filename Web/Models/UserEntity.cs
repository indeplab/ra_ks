using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
//using Microsoft.AspNetCore.Identity;
//using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore;

namespace Web.Models
{
    public class UserEntity
    {
        public long id {get; set; }
        public string login { get; set; }
        public string name { get; set; }
        public string password { get; set; }
        public string requestGuid{get;set;}
        public List<string> roles { get; set; }
        public int state_id { get; set ;  }
        public bool need2SendMessage {get;set;}
        public string state
        {
            get
            {
                switch (state_id)
                {
                    case -1:
                        return "Подтверждение e-mail";
                    case 0:
                        return "Новая заявка";
                    case 1:
                        return "Активен";
                    case 2:
                        return "Заблокирован";
                }
                return string.Empty;
            }
        }
    }
}
