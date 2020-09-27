using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using O10.Client.Web.Common.Hubs;
using O10.Client.Web.Common.Services;
using O10.Core.Configuration;
using O10.Core.ExtensionMethods;
using O10.Core.Logging;
using O10.Web.Server.Hubs;

namespace O10.Web.Server
{
    public class Startup
    {
        private readonly CancellationTokenSource _cancellationTokenSource;
        private readonly Log4NetLogger _logger;

        public Startup(IWebHostEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true);

            Configuration = builder.Build();

            _cancellationTokenSource = new CancellationTokenSource();
            _logger = new Log4NetLogger(null);
            _logger.Initialize(nameof(Startup), "log4net.xml");
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            //services.AddCors(o => o.AddPolicy("EnableAllCors", builder =>
            //{
            //    builder.AllowAnyOrigin()
            //           .AllowAnyMethod()
            //           .AllowAnyHeader();
            //}));

            services.AddControllers().AddNewtonsoftJson();

            services.AddSignalR();
            //services.TryAddTransient<IClaimsService, ClaimsService>();

            services.AddBootstrapper<WebApiBootstrapper>(_logger);
            AspAppConfig aspAppConfig = new AspAppConfig(Configuration);
            services.Replace(new ServiceDescriptor(typeof(IAppConfig), _ => new AspAppConfig(Configuration), ServiceLifetime.Singleton));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app?.ApplicationServices
                .UseBootstrapper<WebApiBootstrapper>(_cancellationTokenSource.Token, _logger);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/error");
            }

            //app.UseHttpsRedirection();

            app.UseRouting();
            app.UseCors(builder => 
            {
                builder
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            });

            //app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();

                endpoints.MapHub<IdentitiesHub>("/identitiesHub", o =>
                {
                    o.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransportType.LongPolling | Microsoft.AspNetCore.Http.Connections.HttpTransportType.WebSockets;
                });

                endpoints.MapHub<ConsentManagementHub>("/consentHub", o =>
                {
                    o.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransportType.LongPolling | Microsoft.AspNetCore.Http.Connections.HttpTransportType.WebSockets;
                });
            });
        }
    }
}
