using Common;
using DA;
using System.Collections.Generic;
using System.Data;
using Web.Models;
using Microsoft.Extensions.Configuration;
using System.Linq;
using Modules.Config;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Novell.Directory.Ldap;
using System.Threading.Tasks;
using System;

namespace Web.Modules
{
    public class UserManager
    {
        public static async Task<UserEntity> GetUserInfo(string login){
            string authMethod = Startup.Configuration["ApplicationParam:AuthMethod"];
            switch(authMethod.ToLower()){
                case "ldap":
                    return await GetUserInfoLdapAsync(login);
                default:
                    return GetUserInfoBasic(login);
            }
        }
        public static async Task<UserEntity> GetUserInfoLdapAsync(string username)
        {
            return await LoginLdapAsync(username,"",false);
            /*UserEntity empty = null;
            if(string.IsNullOrWhiteSpace(username)){
                ApplicationInstance.Logger?.LogInformation("Неавторизован, пустой логин");
                return empty;
            }
                return empty;
            
            string ldapServer = Startup.Configuration["Ldap:Server"];
            int ldapPort = int.Parse(Startup.Configuration["Ldap:Port"]);
            string ldapUser = Startup.Configuration["Ldap:User"];
            string ldapPassword = Startup.Configuration["Ldap:Pwd"];
            string ldapPath = Startup.Configuration["Ldap:Path"];
            var roles = Startup.Configuration.GetSection("Ldap:RoleMapping").Get<Dictionary<string, string>>();
            try
            {
                using (var connection = new LdapConnection(new LdapDirectoryIdentifier(ldapServer, ldapPort))
                {
                    AuthType = AuthType.Basic
                })
                {
                    connection.SessionOptions.ProtocolVersion = 3;
                    connection.Bind(new System.Net.NetworkCredential(GetGlobalID(ldapUser), ldapPassword));
                    var request = new SearchRequest(ldapPath, "(sAMAccountName=" + GetLocalID(username) + ")", SearchScope.OneLevel, new string[]{
                        "displayName",
                        "memberOf"
                    });

                    SearchResponse result = (SearchResponse)connection.SendRequest(request);
                    if (result != null && result.Entries.Count > 0)
                    {
                        var entry = result.Entries[0];
                        var entity = new UserEntity()
                        {
                            name = entry.Attributes["displayName"][0].ToString(),
                            login = GetGlobalID(username)
                        };
                        entity.roles = new List<string>();
                        for (int i = 0; i < entry.Attributes["memberOf"].Count; i++)
                        {
                            var group = entry.Attributes["memberOf"][i].ToString();
                            foreach (string part in group.Split(","))
                            {
                                string[] lst = part.Split("=");
                                if (lst.Length > 0 && lst[0].ToLower().Trim() == "cn")
                                {
                                    var role = roles.FirstOrDefault(x => x.Value.Equals(lst[1],System.StringComparison.OrdinalIgnoreCase)).Key;
                                    if (!string.IsNullOrWhiteSpace(role))
                                        entity.roles.Add(role);
                                }
                            }

                        }
                        return entity;
                    }
                    ApplicationInstance.Logger?.LogInformation("Пользователь '{0}' не найден", username);
                    return empty;
                }

            }
            catch (LdapException ex)
            {
                // Log exception
                ApplicationInstance.Logger?.LogError("Ошибка LDAP. \nOUT:{0}", ex.Message);
                return empty;
            }*/
        }
        public static UserEntity GetUserInfoBasic(string login)
        {
            string selectRoleSQL = @"
                select role.name as name from staffrole inner join role on staffrole.role_id=role.id where LOWER(staffrole.staff_login)=LOWER(@login)
            ";
            string selectSQL = @"
                select name from staff where LOWER(login)=LOWER(@login)
            ";
            UserEntity result = null;
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                var d = manager.GetDataTable(selectSQL, new DataParameter("login", ValueManager.GetString(login)));
                if (d != null && d.Rows.Count > 0)
                {
                    result = new UserEntity(){
                        login = login,
                        name = ValueManager.GetString(d.Rows[0]["name"])
                    };
                }
                data = manager.GetDataTable(selectRoleSQL, new DataParameter("login", ValueManager.GetString(login)));
            }
            if (data != null && result != null)
            {
                result.roles = new List<string>();
                foreach (DataRow row in data.Rows)
                    result.roles.Add(ValueManager.GetString(row["name"]));
            }
            return result;
        }
        public static UserEntity GetByID(int id)
        {
            string selectSQL = @"
                select * from staff where id=@id
            ";
            string selectRoleSQL = @"
                select role.name as name from staffrole inner join role on staffrole.role_id=role.id where LOWER(staffrole.staff_login) in (select LOWER(login) from staff where id=@id)
            ";
            DataTable data = null;
            DataTable data2 = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL, new DataParameter("id", id));
                data2 = manager.GetDataTable(selectRoleSQL, new DataParameter("id", id));
            }
            UserEntity entity = null;
            if (data != null && data.Rows.Count > 0)
            {

                entity = new UserEntity()
                {
                    login = ValueManager.GetString(data.Rows[0]["login"]),
                    name = ValueManager.GetString(data.Rows[0]["name"]),
                    password = StringCoder.Decode(ValueManager.GetString(data.Rows[0]["passwd"])),
                    state_id = ValueManager.GetInt(data.Rows[0]["state_id"])
                };
                if (data2 != null)
                {
                    entity.roles = new List<string>();
                    foreach (DataRow row in data2.Rows)
                        entity.roles.Add(ValueManager.GetString(row["name"]));
                }
            }
            return entity;
        }
        public static UserEntity GetByLogin(string login, bool withpass = false)
        {
            string selectSQL = @"
                select * from staff where LOWER(login)=LOWER(@login)
            ";
            DataTable data = null;
            using (DataManager manager = new DataManager())
                data = manager.GetDataTable(selectSQL, new DataParameter("login", login));
            UserEntity entity = null;
            if (data != null && data.Rows.Count > 0)
            {

                entity = new UserEntity()
                {
                    login = ValueManager.GetString(data.Rows[0]["login"]),
                    name = ValueManager.GetString(data.Rows[0]["name"])
                };
                if (withpass)
                    entity.password = StringCoder.Decode(ValueManager.GetString(data.Rows[0]["passwd"]));
            }
            return entity;
        }
        private static UserEntity FillRoles(UserEntity entity)
        {
            string selectRoleSQL = @"
                select role.name as name from staffrole inner join role on staffrole.role_id=role.id where LOWER(staffrole.staff_login)=LOWER(@login)
            ";
            entity.roles = new List<string>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectRoleSQL, new DataParameter("login", ValueManager.GetString(entity.login)));
            }
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                    entity.roles.Add(ValueManager.GetString(row["name"]));
            }
            return entity;

        }
        private static UserEntity FillRolesForLdap(UserEntity entity)
        {
            string selectRoleSQL = @"
                select role.name as name from staffrole inner join role on staffrole.role_id=role.id where LOWER(staffrole.staff_login)=LOWER(@login)
            ";
            entity.roles = new List<string>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectRoleSQL, new DataParameter("login", GetLocalID(entity.login) + "@aeroflot.ru"));
            }
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                    entity.roles.Add(ValueManager.GetString(row["name"]));
            }
            return entity;

        }
        public static async Task<UserEntity> Login(string login, string password){
            string authMethod = Startup.Configuration["ApplicationParam:AuthMethod"];
            switch(authMethod.ToLower()){
                case "ldap":
                    ApplicationInstance.Logger?.LogInformation("Аутентификация LDAP для '{0}'", login);
                    return await LoginLdapAsync(login, password);
                default:
                    ApplicationInstance.Logger?.LogInformation("Аутентификация Basic для '{0}'", login);
                    return LoginBasic(login, password);
            }
        }
        public static UserEntity LoginBasic(string login, string password)
        {
            UserEntity entity = GetByLogin(login, true);
            if (entity != null)
            {
                //if (entity.StateID != 1)
                //return null;
                string pass = entity.password;
                if (!password.Equals(pass))
                    return null;
                else
                    entity = FillRoles(entity);
            }
            return entity;
        }
        private static string GetLocalID(string username)
        {
            var list = username.Split('\\');
            return list[list.Length - 1];
        }
        private static string GetGlobalID(string username)
        {
            string ldapDomain = Startup.Configuration["Ldap:Domain"];
            return string.Format("{0}\\{1}", ldapDomain, GetLocalID(username));
        }
        /*public static UserEntity LoginLdap1(string username, string password)
        {
            UserEntity empty = null;
            string ldapServer = Startup.Configuration["Ldap:Server"];
            int ldapPort = int.Parse(Startup.Configuration["Ldap:Port"]);
            string ldapUser = Startup.Configuration["Ldap:User"];
            string ldapPassword = Startup.Configuration["Ldap:Pwd"];
            string ldapPath = Startup.Configuration["Ldap:Path"];
            var roles = Startup.Configuration.GetSection("Ldap:RoleMapping").Get<Dictionary<string, string>>();
            try
            {
                using (var connection = new LdapConnection(new LdapDirectoryIdentifier(ldapServer, ldapPort))
                {
                    AuthType = AuthType.Basic
                })
                {
                    connection.SessionOptions.ProtocolVersion = 3;
                    connection.SessionOptions.SecureSocketLayer = (ldapPort==636);

                    ApplicationInstance.Logger?.LogInformation("Check exists for '{0}'", username);
                    connection.Bind(new System.Net.NetworkCredential(GetGlobalID(username), password));

                    ApplicationInstance.Logger?.LogInformation("Start LDAP auth for '{0}'", username);
                    connection.Bind(new System.Net.NetworkCredential(GetGlobalID(ldapUser), ldapPassword));

                    ApplicationInstance.Logger?.LogInformation("Get LDAP roles for '{0}'", username);
                    var request = new SearchRequest(ldapPath, "(sAMAccountName=" + GetLocalID(username) + ")", SearchScope.OneLevel, new string[]{
                        "displayName",
                        "memberOf"
                    });

                    SearchResponse result = (SearchResponse)connection.SendRequest(request);
                    if (result != null && result.Entries.Count > 0)
                    {
                        var entry = result.Entries[0];
                        var entity = new UserEntity()
                        {
                            name = entry.Attributes["displayName"][0].ToString(),
                            login = GetGlobalID(username)
                        };
                        entity.roles = new List<string>();
                        for (int i = 0; i < entry.Attributes["memberOf"].Count; i++)
                        {
                            var group = entry.Attributes["memberOf"][i].ToString();
                            foreach (string part in group.Split(","))
                            {
                                string[] lst = part.Split("=");
                                if (lst.Length > 0 && lst[0].ToLower().Trim() == "cn")
                                {
                                    var role = roles.FirstOrDefault(x => x.Value.Equals(lst[1],System.StringComparison.OrdinalIgnoreCase)).Key;
                                    if (!string.IsNullOrWhiteSpace(role))
                                        entity.roles.Add(role);
                                }
                            }

                        }

                        return entity;
                    }
                    ApplicationInstance.Logger?.LogInformation("Пользователь '{0}' не найден", username);
                    return empty;
                }

            }
            catch (LdapException ex)
            {
                // Log exception
                ApplicationInstance.Logger?.LogError("Ошибка LDAP. \nOUT:{0}", ex.Message);
                return empty;
            }
        }*/
        public static bool OnRemoteCertificateValidation(object sender, System.Security.Cryptography.X509Certificates.X509Certificate certificate, System.Security.Cryptography.X509Certificates.X509Chain chain,
                  System.Net.Security.SslPolicyErrors sslPolicyErrors){
                    return true;
            }

        public static async Task<UserEntity> LoginLdapAsync(string username, string password, bool checkExists = true)
        {
            UserEntity entity = null;
            if(string.IsNullOrWhiteSpace(username)){
                ApplicationInstance.Logger?.LogInformation("Неавторизован, пустой логин");
                return entity;
            }
            string ldapServer = Startup.Configuration["Ldap:Server"];
            string ldapDomain = Startup.Configuration["Ldap:Domain"];
            int ldapPort = int.Parse(Startup.Configuration["Ldap:Port"]);
            string ldapUser = Startup.Configuration["Ldap:User"];
            string ldapPassword = Startup.Configuration["Ldap:Pwd"];
            string ldapPath = Startup.Configuration["Ldap:Path"];
            bool UseSSL = Startup.Configuration["Ldap:UseSSL"].Equals("true", StringComparison.OrdinalIgnoreCase);
            var roles = Startup.Configuration.GetSection("Ldap:RoleMapping").Get<Dictionary<string, string>>();
            try
            {
                var options = new LdapConnectionOptions();
                options.ConfigureRemoteCertificateValidationCallback(OnRemoteCertificateValidation);
                using (var connection = new LdapConnection(options) {SecureSocketLayer = UseSSL})
                {
                    await connection.ConnectAsync(ldapServer, ldapPort);
                    
                    if(checkExists){
                        ApplicationInstance.Logger?.LogInformation("Check exists for '{0}'", username);
                        await connection.BindAsync(LdapConnection.LdapV3,$"{GetLocalID(username)}@{ldapDomain}", password);
                        if(!connection.Bound){
                            ApplicationInstance.Logger?.LogInformation("Пользователь '{0}' не аутентифицирован", username);
                            return entity;
                        }
                    }

                    ApplicationInstance.Logger?.LogInformation("Start LDAP auth for '{0}'", username);
                    await connection.BindAsync(LdapConnection.LdapV3,$"{ldapUser}@{ldapDomain}", ldapPassword);
                    if (connection.Bound){
                        LdapSearchConstraints cons = new LdapSearchConstraints();
                        cons.TimeLimit = 10000 ;
                        LdapSearchResults searchResults =
                                (LdapSearchResults)await connection.SearchAsync(ldapPath,       // object to read
                                    LdapConnection.ScopeSub,   // scope - read single object
                                    "(sAMAccountName=" + GetLocalID(username) + ")",          // search filter
                                    new string[]{
                                        "displayName",
                                        "memberOf"
                                    },         // return only required attributes
                                    false,         // return attrs and values
                                    cons );        // time out value
                        LdapEntry nextEntry = null;
                        try 
                        {
                            nextEntry = await searchResults.NextAsync();
                        }
                        catch(LdapException e) 
                        {
                            ApplicationInstance.Logger?.LogInformation("Пользователь '{0}' не найден.\nOUT:{1}", username, e.Message);
                            return entity;
                        }      
                        LdapAttributeSet attributeSet = nextEntry.GetAttributeSet();
                        var allAttributes = attributeSet.GetEnumerator();

                        entity = new UserEntity(){
                            login = GetGlobalID(username)
                        };
                        entity.roles = new List<string>();
                        while(allAttributes.MoveNext()) 
                        {
                            LdapAttribute attribute = (LdapAttribute)allAttributes.Current;
                            string attributeName = attribute.Name;
                            switch(attributeName){
                                case "displayName":
                                    entity.name = attribute.StringValue;
                                break;
                                /*case "memberOf":
                                    foreach(string group in attribute.StringValueArray)
                                    {
                                        foreach (string part in group.Split(","))
                                        {
                                            string[] lst = part.Split("=");
                                            if (lst.Length > 0 && lst[0].ToLower().Trim() == "cn")
                                            {
                                                var role = roles.FirstOrDefault(x => x.Value.Equals(lst[1],System.StringComparison.OrdinalIgnoreCase)).Key;
                                                if (!string.IsNullOrWhiteSpace(role))
                                                    entity.roles.Add(role);
                                            }
                                        }

                                    }
                                break;*/
                            }
                        }
                        entity = FillRolesForLdap(entity);
                        return entity;
                    }
                    ApplicationInstance.Logger?.LogInformation("Пользователь '{0}' не найден", username);
                    return entity;
                }
            }
            catch (LdapException ex)
            {
                // Log exception
                ApplicationInstance.Logger?.LogError("Ошибка LDAP. \nOUT:{0}", ex.Message);
                return entity;
            }
        }
        public static int ConfirmRequest(string requestgiud)
        {
            string selectSQL = @"
                select id, state_id from staff where requestguid=@requestguid
            ";
            string confirmSQL = @"
                update staff set state_id=0 where id=@id and state_id=-1
            ";
            long id = 0;
            int state = -2;
            using (DataManager manager = new DataManager())
            {
                DataTable data = manager.GetDataTable(selectSQL, new DataParameter("requestguid", requestgiud));
                if (data != null && data.Rows.Count > 0)
                {
                    id = ValueManager.GetLong(data.Rows[0]["id"]);
                    state = ValueManager.GetInt(data.Rows[0]["state_id"]);
                }
                if (id != 0 && state == -1)
                    manager.ExecuteNonQuery(confirmSQL, new DataParameter("id", id));
            }
            return (state);
        }
        public static UserEntity Save(UserEntity entity)
        {
            string selectSQL = @"
                select id from staff where LOWER(login) = LOWER(@login)
            ";
            string deleteRoleSQL = @"
                delete from staffrole where LOWER(staff_login) = LOWER(@login)
            ";
            string insertRoleSQL = @"
                insert into staffrole(staff_login,role_id,user_name) select LOWER(@login), id, @user_name from role where name ilike @role
            ";
            string insertSQL = @"
                insert into staff (login,name,passwd,requestguid,state_id) values (LOWER(@login),@name,@passwd,@requestguid,@state_id)
            ";
            string updatePassSQL = @"
                update staff set name=@name,state_id=@state_id,passwd=@passwd where id=@id
            ";
            string updateSQL = @"
                update staff set name=@name,state_id=@state_id,passwd=@passwd where id=@id
            ";
            object check = null;
            using (DataManager manager = new DataManager())
            {
                if (entity.id == 0)
                {
                    check = manager.ExecuteScalar(selectSQL
                        , new DataParameter("login", entity.login)
                        , new DataParameter("id", entity.id)
                        );
                    if (check == null)
                    {
                        entity.id = ValueManager.GetLong(manager.ExecuteScalar(insertSQL
                            , new DataParameter("login", entity.login)
                            , new DataParameter("name", ValueManager.GetValueOrDBNull(entity.name))
                            , new DataParameter("passwd", StringCoder.Code(ValueManager.GetString(entity.password)))
                            , new DataParameter("requestguid", ValueManager.GetValueOrDBNull(entity.requestGuid))
                            , new DataParameter("state_id", entity.state_id)
                        ));
                        manager.ExecuteNonQuery(deleteRoleSQL, new DataParameter("login", entity.login));
                        if (entity.roles != null)
                        {
                            foreach (string role in entity.roles)
                            {
                                manager.ExecuteNonQuery(insertRoleSQL
                                    , new DataParameter("login", entity.login)
                                    , new DataParameter("role", role)
                                    , new DataParameter("user_name", entity.name)
                                );
                            }
                        }
                        return entity;
                    }
                }
                else
                {
                    manager.ExecuteScalar(string.IsNullOrWhiteSpace(entity.password)? updateSQL: updatePassSQL
                        , new DataParameter("id", entity.id)
                        , new DataParameter("name", entity.name)
                        , new DataParameter("passwd", StringCoder.Code(ValueManager.GetString(entity.password)))
                        , new DataParameter("state_id", entity.state_id)
                    );
                    manager.ExecuteNonQuery(deleteRoleSQL, new DataParameter("login", entity.login));
                    if (entity.roles != null)
                    {
                        foreach (string role in entity.roles)
                        {
                            manager.ExecuteNonQuery(insertRoleSQL
                                , new DataParameter("login", entity.login)
                                , new DataParameter("role", role)
                                , new DataParameter("user_name", entity.name)
                            );
                        }
                    }
                    return entity;
                }
            }
            if (check != null)
                throw new System.Exception("Невозможно сохранить оператора - дубль логина");
            return null;
        }

        public static void Delete(int id)
        {
            string deleteRoleSQL = @"
                delete from staffrole where LOWER(staff_login) in (select LOWER(login) from staff where id=@id)
            ";
            string deleteSQL = @"
                DELETE FROM staff WHERE id=@id
            ";
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(deleteRoleSQL, new DataParameter("id", id));
                manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }

        }
    }
}
