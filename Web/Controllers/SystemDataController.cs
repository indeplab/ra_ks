using ExcelTool;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Text.Json;
using Web.Models;
using Web.Modules;
using Web.UI;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemDataController : BaseListController
    {

        protected override string key => "systemdata_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Systems data list service";
            return Ok(info);
        }
        [HttpGet]
        public ActionResult<object> Get()
        {
            FilterEntity filter = GetFromKey();
            return Ok(filter.search);
        }
        [HttpPost]
        public ActionResult<object> Post([FromBody] SystemDataEntity entity)
        {
            return Ok(SystemDataManager.Get(entity.id));
        }

        [HttpPut]
        public ActionResult<object> Put([FromBody] SystemDataEntity value)
        {
            SystemDataEntity entity = SystemDataManager.Save(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                SystemDataManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("list")]
        public ActionResult<object> GetList([FromBody] FilterEntity filter)
        {
            var manager = new SystemDataManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    System_data.ID,
                    System_data.system_id,
                    system.name as system,
                    data.Name,
                    CASE system_data.flowtype 
                        WHEN 'master' THEN 'Мастер-данные'
                        WHEN 'copy' THEN 'Копия данных'
                        WHEN 'transfer' THEN 'Не храниться'
                        ELSE ''
                    END as flowtype,
                    data.Description
                FROM 
                    system_data
                    inner join data on system_data.data_id=data.id
                    inner join system on system_data.system_id=system.id
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
        [HttpPost("excel")]
        public ActionResult<object> ToExcel([FromBody] FilterEntity filter)
        {
            var manager = new SystemDataManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    System_data.ID,
                    System_data.system_id,
                    system.name as system,
                    data.Name,
                    CASE system_data.flowtype 
                        WHEN 'master' THEN 'Мастер-данные'
                        WHEN 'copy' THEN 'Копия данных'
                        WHEN 'transfer' THEN 'Не храниться'
                        ELSE ''
                    END as flowtype,
                    data.Description
                FROM 
                    system_data
                    inner join data on system_data.data_id=data.id
                    inner join system on system_data.system_id=system.id
            ");
            DataTable data = SystemDataManager.MapColumn(manager.GetDataTable(),
                new Dictionary<string, string>()
                {
                    { "id", "Код" },
                    { "flowtype", "Отношение к системе" },
                    { "system", "Система" },
                    { "name", "Наименование" },
                    {"description" , "Описание" }
                },
                new string[] { "system_id" }
            );
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
        }

    }
}
