using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Modules.Config;
using System;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using Modules;
using System.IO;


namespace Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            //UserEntity person = UserManager.Login2(@"INDEPLAB\indeplab", "Rhtlbnjdfybt5");
            var loggerFactory = LoggerFactory.Create(builder =>
            {
                builder.AddSimpleConsole(options =>
                    {
                        //options.IncludeScopes = false;
                        options.TimestampFormat = "HH:mm:ss ";
                        options.SingleLine = true;
                    }
                );
            });
 
            var logpath = Path.Combine(Directory.GetCurrentDirectory(),"log");
            if(!Directory.Exists(logpath))
                Directory.CreateDirectory(logpath);
            loggerFactory.AddFile(Path.Combine(logpath, string.Format("log_{0}.txt", DateTime.Today.ToString("yyyy-MM-dd"))));
 
            ApplicationInstance.Logger = loggerFactory.CreateLogger("FileLogger");
 
            ApplicationInstance.Logger?.LogInformation(string.Format("Сервис запущен.", ""));
        }

        public static IConfiguration Configuration { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<SqlConnectionConfiguration>(Configuration.GetSection("SqlConnection"));
            services.Configure<SqlConnectionConfiguration>(Configuration.GetSection("MailSender"));
            services.Configure<SqlConnectionConfiguration>(Configuration.GetSection("FileStore"));
            services.Configure<SqlConnectionConfiguration>(Configuration.GetSection("ApplicationParam"));
            services.Configure<SqlConnectionConfiguration>(Configuration.GetSection("Ldap"));
            services.Configure<Dictionary<string,string>>(Configuration.GetSection("Ldap:RoleMapping"));
            services.Configure<SqlConnectionConfiguration>(Configuration.GetSection("KS:Auth"));

            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options => //CookieAuthenticationOptions
                {
                    options.LoginPath = new Microsoft.AspNetCore.Http.PathString("/Login.html");
                    options.ExpireTimeSpan = TimeSpan.FromSeconds(double.Parse(Startup.Configuration["ApplicationParam:TokenExpireTime"]));
                    options.Cookie.MaxAge = options.ExpireTimeSpan;
                    options.SlidingExpiration = false;
                });

            services.AddSession();

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            
            //services.AddControllersWithViews();            
            /*services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                    .AddJwtBearer(options =>
                    {
                        options.RequireHttpsMetadata = false;
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            // укзывает, будет ли валидироваться издатель при валидации токена
                            ValidateIssuer = true,
                            // строка, представляющая издателя
                            ValidIssuer = AuthOptions.ISSUER,
 
                            // будет ли валидироваться потребитель токена
                            ValidateAudience = true,
                            // установка потребителя токена
                            ValidAudience = AuthOptions.AUDIENCE,
                            // будет ли валидироваться время существования
                            ValidateLifetime = true,
 
                            // установка ключа безопасности
                            IssuerSigningKey = AuthOptions.GetSymmetricSecurityKey(),
                            // валидация ключа безопасности
                            ValidateIssuerSigningKey = true,
                        };
                    });*/

            services.AddControllersWithViews();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors(builder => builder.WithOrigins("*")
                                          .AllowAnyMethod()
                                          .AllowAnyHeader());
            //app.UseHttpsRedirection();

            DefaultFilesOptions options = new DefaultFilesOptions();
            options.DefaultFileNames.Clear();
            options.DefaultFileNames.Add("search.html");
            app.UseDefaultFiles(options);

            app.UseRouting();

            app.UseAuthentication();
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });
            app.UseAuthorization();

            app.UseStaticFiles(new StaticFileOptions { 
                OnPrepareResponse = ctx => {
                    /*if(ctx.Context.Request.Cookies["at_token"]!=null){
                        var token = new JwtSecurityTokenHandler().ReadJwtToken(ctx.Context.Request.Cookies["at_token"]);
                        var identity = new ClaimsPrincipal(new ClaimsIdentity(token.Claims));
                        //var b = identity.IsInRole("admin") Identity.IsAuthenticated;
                    }*/
                    if (
                        !ctx.Context.User.Identity.IsAuthenticated 
                        && !ctx.Context.Request.Path.StartsWithSegments("/log")
                        && !ctx.Context.Request.Path.StartsWithSegments("/login.html")
                        && !ctx.Context.Request.Path.StartsWithSegments("/header.html")
                        && !ctx.Context.Request.Path.StartsWithSegments("/footer.html")
                        && !ctx.Context.Request.Path.StartsWithSegments("/portal")
                        && !ctx.Context.Request.Path.StartsWithSegments("/lib")
                        && !ctx.Context.Request.Path.StartsWithSegments("/images")
                        && !ctx.Context.Request.Path.StartsWithSegments("/js")
                        && !ctx.Context.Request.Path.StartsWithSegments("/templates")
                        && !ctx.Context.Request.Path.StartsWithSegments("/css")
                    )
                        ctx.Context.Response.Redirect("/login.html?returl=" + Uri.EscapeDataString(ctx.Context.Request.Path.Value + ctx.Context.Request.QueryString));
                }
            });

            app.UseSession();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
