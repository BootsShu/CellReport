﻿using System;
using System.Security.Cryptography;
using System.Text;
using CellReport;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Collections.Generic;
using System.Collections.Specialized;
using Microsoft.Extensions.Primitives;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Threading.Tasks;
using CellReport.exporter;
using Microsoft.AspNetCore.Hosting;
using System.Text.Json;

namespace reportWeb.Pages
{
    public class MyLogger : CellReport.running.Logger
    {
        ILogger _logger;
        public MyLogger(ILogger _logger):base(null)
        {
            this._logger = _logger;
        }
        
        public override void Info(String info)
        {
            _logger.LogInformation(info);
        }
        public override void Warn(String info)
        {
            _logger.LogWarning(info);
        }
        public override void Debug(String info)
        {
            _logger.LogDebug(info);
        }
        public override void Error(String info)
        {
            _logger.LogError(info);
        }
    }

    [IgnoreAntiforgeryToken(Order = 2000)]
    public class ReportModel : PageModel, IDisposable
    {
        protected string ReportDefinePath = @"";
        private readonly MyLogger logger;
        protected Rpt_group rpt_group;
        private IConfiguration configuration;
        private readonly IWebHostEnvironment WebHostEnvironment;
        public ReportModel(IConfiguration configuration, ILogger<ReportModel> logger, ScopedObj scopedObj)
        {
            this.configuration = configuration;
            this.rpt_group= scopedObj.rpt_group ;
            this.WebHostEnvironment = scopedObj.WebHostEnvironment;
            ReportDefinePath = this.rpt_group.report_path;
            this.logger = new MyLogger(logger);
        }
        public void OnGet()
        {
        }
        public void OnPost()
        {

        }
        public string FromAppendString = "";
        private String mc_report_id;
        private String tmpFileName;
        public string tips = "";
        protected virtual bool pre_page_load(IDictionary<Object, Object> before_exec_result=null)
        {
            return true;
        }
        public CellReport.BaseCache myCache { get;protected set;} = null;
        
        protected CellReport.running.Env report_env;
        public async Task Page_Load()
        {
            if(rpt_group==null)
                throw new Exception("没有定义rpt_group");
            if(rpt_group.default_page.Split(",").Contains(Request.Path.Value.Substring(1))==false)
                throw new Exception("不被允许的调用："+ Request.Path.Value);
            string UserAgent = Request.Headers["User-Agent"];
            if (String.IsNullOrEmpty(UserAgent))
                UserAgent = "";
            Regex regex = new Regex("(iPhone|iPod|Android|ios|SymbianOS)", RegexOptions.IgnoreCase);
            var isPhone=regex.IsMatch(UserAgent);
            string needType = Request.Headers["needType"];
            if (Request.HasFormContentType && (
                Request.Form.Keys.Contains("__updated") ||
                Request.Form.Keys.Contains("__inserted") ||
                Request.Form.Keys.Contains("__deleted"))
                )
                needType = "json";
            if (needType == "json")
            {
                Response.ContentType = "application/json";
            }
            else
            {
                
                var file_path=Path.Combine(this.WebHostEnvironment.WebRootPath,"run.html");
                var report_content = await System.IO.File.ReadAllTextAsync(file_path, System.Text.Encoding.UTF8);
                string Referer = Request.Headers["Referer"];
                string Authorization = Request.Headers["Authorization"];
                report_content=report_content.Replace("<head>", $"<head><script>var __real_referer='{Referer}';__Authorization='{Authorization}'</script>");
                if (isPhone)
                {
                    await Response.WriteAsync(report_content);//.Replace("<script src=\"cdn/xlsx/dist/xlsx.full.min.js\"></script>", "")
                }
                else
                {
                    await Response.WriteAsync(report_content);
                }                
                return;
            }
            try
            {
                reportDefineForWeb = new ReportDefineForWeb()
                {
                    ReportDefinePath = this.ReportDefinePath,
                    httpRequest = HttpContext.Request,
                    logger= logger
                };

                //if(Request.Path != "/" + rpt_group.default_page)
                //{
                //    throw new Exception("非法路径！请使用run模式。当前："+ Request.Path);
                //}

                report_env = reportDefineForWeb.CurrentReportDefine.getEnv();                
                Dictionary<string, string> user_dict = new Dictionary<string, string>();
                foreach (var one in HttpContext?.User?.Claims)
                {
                    user_dict.TryAdd(one.Type, one.Value);
                }
                
                foreach (var one in this.rpt_group.db_connection_list)
                {
                    report_env.addDataSource(one.name,one.conn_str,one.db_type,"0");
                }
                var exprFaced = report_env.getExprFaced();
                exprFaced.addVariable("isPhone", isPhone);
                int grid_cnt=reportDefineForWeb.CurrentReportDefine.getGridList().FindAll(x=>x.XmlElementName=="grid").Count;
                exprFaced.addVariable("use_luckysheet", 1);
                
                exprFaced.getVariableDefine("_zb_url_").value = configuration["zb_url"];
                exprFaced.getVariableDefine("_zb_user_").value = rpt_group.zb_user;
                exprFaced.getVariableDefine("_zb_password_").value = rpt_group.zb_password;
                exprFaced.getVariableDefine("_rpt_group_").value = rpt_group;
                exprFaced.addVariable("__page__",HttpContext.Request);
                exprFaced.getVariableDefine("_user_").value = user_dict; 
                exprFaced.getVariableDefine("_user_").value = reportWeb.Controllers.UserController.ValidateJwtToken(HttpContext, HttpContext.Request.Cookies["access_token"]);
                //exprFaced.addVariable("_cache_", RedisHelper.Instance);
                parse_fresh_ds();
                if (!Request.Query.TryGetValue("reportName", out var a1))
                    throw new Exception("没有设置reportName参数"); ;
                var start_time = DateTime.Now;
                reportDefineForWeb.putRequestParamForForm();

                IDictionary<Object, Object> before_exec_result=null;
                if (exprFaced.hasVariable("before_exec"))
                {
                    before_exec_result =exprFaced.calculate("=before_exec()", report_env.getDataSetResultMap())
                        as IDictionary<Object, Object>;
                    if (before_exec_result != null)
                    {
                        exprFaced.addVariable("before_exec_result", before_exec_result);
                        if (before_exec_result.TryGetValue("continue", out var my_continue))
                        {
                            if (my_continue is Boolean && (Boolean)my_continue == false)
                                throw new Exception("不能继续执行，原因："+before_exec_result["tips"]?.ToString());
                        }
                        if (before_exec_result.TryGetValue("cache_id", out Object cache_id) && cache_id != null)
                        {
                            myCache = new CellReport.Redis_Cache(cache_id.ToString(), report_env.logger);//*/myCache = null;
                            myCache.getFreshFlag = () => before_exec_result["fresh_flag"].ToString();
                        }
                        this.tips = before_exec_result["tips"]?.ToString()? .Replace("\\n", "\n");
                    }
                }
                //Console.WriteLine("before_exec:" + (DateTime.Now - start_time) / 10000 + "秒");
                if (false == pre_page_load(before_exec_result))
                    return;
                //Console.WriteLine("pre_page_load:" + (DateTime.Now - start_time) / 10000 + "秒");
                mc_report_id = reportDefineForWeb.getParamSortedString();
                if (Request.Query["reportName"] == "")
                {
                    
                }
                else
                {
                   await output();
                }
                //report_env.logger.Info(mc_report_id);
               // Console.WriteLine("output:" + (DateTime.Now - start_time) / 10000 + "秒");
                Response.Body.Flush();
                this.HttpContext.Response.RegisterForDispose(reportDefineForWeb);
            }
            catch (System.Exception e)
            {
                output_expection(e, logger,report_env);
                throw;
            }
            finally
            {
                reportDefineForWeb.Dispose();
                //GC.Collect(2, GCCollectionMode.Forced);
            }
        }

        internal static void output_expection(Exception e, CellReport.running.Logger logger, CellReport.running.Env report_env)
        {
            logger.Error("-----------------------------------");
            String curCellName = "`0";
            if (report_env != null)
            {
                if (report_env.Curr_calc_cell != null)
                    curCellName = report_env.Curr_calc_cell.getName();
                StringBuilder sb = new("参数：");
                foreach (var kv in report_env.getParamMap())
                {
                    if (kv.Key == "reportName")
                        continue;
                    sb.Append("\t" + kv.Key + "='" + kv.Value + "'");
                }
                logger.Error("当前报表："
                    + report_env.getExprFaced().calculate("=_rpt_group_.Id").ToString()
                    + ":"
                    + report_env.getAppPath() + "/" + report_env.getReportName());
                logger.Error(sb.ToString());
                logger.Error("疑似出错单元格：" + curCellName);
            }
            System.Exception inner_e = e;
            while (inner_e != null)
            {
                logger.Error(inner_e.Message);
                logger.Error(inner_e.StackTrace);
                if (inner_e.StackTrace != null)
                    break;
                inner_e = inner_e.InnerException;
            }            
        }

        private void parse_fresh_ds()
        {
            if (!Request.HasFormContentType)
                return;
            if(!Request.Form.TryGetValue("_fresh_ds",out var _fresh_ds))
                return;
            List<String> calcDsNames = null;
            List<String> calcGridNames = null;

            if (!String.IsNullOrEmpty(_fresh_ds))
            {
                foreach (var item in JsonDocument.Parse(_fresh_ds).RootElement.EnumerateArray())
                {
                    var one = item.GetString().Split(":");
                    if (one[0] == "数据集")
                    {
                        if (calcDsNames == null)
                        {
                            if (calcGridNames == null)
                            {
                                calcGridNames = new List<String>();
                            }
                            calcDsNames = new List<String>();
                        }
                        calcDsNames.Add(one[1]);
                    }
                    if (one[0] == "表格")
                    {
                        if (calcGridNames == null)
                        {
                            calcGridNames = new List<String>();
                        }
                        calcGridNames.Add(one[1]);
                    }
                }
            }
            reportDefineForWeb.CurrentReportDefine.calcGridNames = calcGridNames?.ToArray();
            reportDefineForWeb.CurrentReportDefine.calcDsNames = new HashSet<String>( calcDsNames );
        } 
        protected internal ReportDefineForWeb reportDefineForWeb;
        public async Task output()
        {
            var aaa=Regex.Replace(mc_report_id, @"[:|\|""|\?|/|<|>]", "_");
            
            tmpFileName = rpt_group.Id+":"+mc_report_id.Replace('/', '.').Replace(':', '_').Replace('\\', '_')
                        .Replace('"', '_').Replace('?', '_').Replace('/', '_').Replace('<', '_')
                        .Replace('>', '_').Replace('|', '_');
            //if (tmpFileName.Length > 150)
            //    tmpFileName = UserMd5(tmpFileName);
            //HttpContext.Request.Form["_param_name_"]
            if (myCache == null || (Request.HasFormContentType 
                &&( Request.Form.ContainsKey("__updated")
                || Request.Form.ContainsKey("__inserted")
                || Request.Form.ContainsKey("__deleted")
                || Request.Form.ContainsKey("_fresh_ds")
                || Request.Form.ContainsKey("_param_name_")
                 )))
            {
                using (MemoryStream jsonStream = CellReport.Redis_Cache.manager.GetStream())
                {
                    using (MyTextWrite htmlWrite = new MyTextWrite(jsonStream))
                    {
                        if (Request.HasFormContentType && Request.Form.ContainsKey("_param_name_") &&
                            Request.Form["_param_name_"].ToString() != "")
                        {
                            var exprFaced = report_env.getExprFaced();
                            this.reportDefineForWeb.CurrentReportDefine.calcGridNames = new String[] { };
                            exprFaced.addVariable("_createFormParam_", true);
                            exprFaced.addVariable("_param_name_", Request.Form["_param_name_"].ToString());
                        }
                        if(Request.HasFormContentType && (Request.Form.ContainsKey("__updated") ||
                            Request.Form.ContainsKey("__inserted") || Request.Form.ContainsKey("__deleted") ))
                        {
                            string grid_name = Request.Query["_g"];
                            this.reportDefineForWeb.CurrentReportDefine.getGrid(grid_name).getAllCell();
                            this.reportDefineForWeb.CurrentReportDefine.getGrid(grid_name).exportHtml(htmlWrite);
                        }
                        else
                        {
                            await calc_output(htmlWrite);
                            htmlWrite.Write(",\"notebook\":");
                            htmlWrite.Write(System.Text.Json.JsonSerializer.Serialize(report_env.TemplateGet("notebook"), report_env.getJsonOption()));
                            htmlWrite.Write("\n}");
                        }
                        await htmlWrite.FlushAsync();
                        jsonStream.Position = 0;
                        await jsonStream.CopyToAsync(Response.Body);
                    }
                }
            }
            else
            {
                await myCache.OutputOrCalcAndCache(tmpFileName, Response, 
                    async(jsonWrite) => await calc_output(jsonWrite));
                
                await Response.Body.FlushAsync();
                await Response.WriteAsync(",\"notebook\":");
                await Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(report_env.TemplateGet("notebook"), report_env.getJsonOption()));

                if (this.myCache != null )
                {
                    this.tips = this.tips
                         + "\n刷新标记是：" + this.myCache.fresh_flag
                        + "\n刷新标记取得时间:" + this.myCache.global_time.ToString("yyyy-MM-dd hh:mm:ss fff")
                         + "\n本报表计算时间：" + this.myCache.fresh_time.ToString("yyyy-MM-dd hh:mm:ss fff");

                    this.tips = System.Text.Json.JsonSerializer.Serialize(this.tips, report_env.getJsonOption());
                    await Response.WriteAsync($",\"cache_key\":\"{myCache.cacheKey(tmpFileName)}\" ,\"tips\":{this.tips}");
                }
                await Response.WriteAsync("\n}");
            }
        }

        private async Task calc_output(MyTextWrite jsonWrite)
        {
            await this.reportDefineForWeb.calcReport(jsonWrite);//命令格式：(g表格|d数据集|u修改数据)，
            if (reportDefineForWeb.Report == null)
                if (reportDefineForWeb.currentException != null)
                {
                    throw reportDefineForWeb.currentException;
                }
            if (Request.Query["_fresh_ds"].ToString() == "")
            {
                await reportDefineForWeb.Report.exportJson(jsonWrite);
            }
        }
        /// MD5　32位加密
        /// &lt;/summary&gt;
        /// &lt;param name="str"&gt;&lt;/param&gt;
        /// &lt;returns&gt;&lt;/returns&gt;
        public static string UserMd5(string str)
        {
            string cl = str;
            string pwd = "";
            MD5 md5 = MD5.Create();//实例化一个md5对像
            // 加密后是一个字节类型的数组，这里要注意编码UTF8/Unicode等的选择　
            byte[] s = md5.ComputeHash(Encoding.UTF8.GetBytes(cl));
            // 通过使用循环，将字节类型的数组转换为字符串，此字符串是常规字符格式化所得
            for (int i = 0; i < s.Length; i++)
            {
                // 将得到的字符串使用十六进制类型格式。格式后的字符是小写的字母，如果使用大写（X）则格式后的字符是大写字符 
                pwd = pwd + s[i].ToString("X");
            }
            return pwd;
        }

        public void Dispose()
        {
            reportDefineForWeb?.Dispose();
        }
    }
}