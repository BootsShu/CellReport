﻿using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using reportWeb;

namespace reportWeb.Controllers
{
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ApiController]
    public class Rpt_groupController : Controller 
    {
        private readonly ReportDbContext _context;
        
        public Rpt_groupController(ReportDbContext context)
        {
            _context = context;
            
        }
        private String cur_userid { get { return HttpContext.User.Claims.FirstOrDefault(x => x.Type == "userid").Value; } }
        // GET: api/Rpt_group
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rpt_group>>> GetRpt_group()
        {
            var grp_register = await _context.Rpt_group.Include(x => x.db_connection_list).ToListAsync();
            if (cur_userid != "admin")
                grp_register = grp_register.FindAll(x => x.owner == cur_userid);
            return new JsonResult ( new {
                grp_register,
                login_script= _context.Rpt_config.FirstOrDefault()?.login_script,
                link_type =DbProviderFactories.GetProviderInvariantNames()
        } );
        }

        // GET: api/Rpt_group/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Rpt_group>> GetRpt_group(string id)
        {
            var rpt_group = await _context.Rpt_group.FindAsync(id);
            
            if (rpt_group == null)
            {
                return NotFound();
            }
            rpt_group.db_connection_list.ToList();
            return rpt_group;
        }

        // PUT: api/Rpt_group/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRpt_group(string id, Rpt_group rpt_group)
        {
            if (id != rpt_group.Id)
            {
                return BadRequest();
            }
            if (cur_userid != "admin" && rpt_group.owner!= cur_userid)
            {
                throw new Exception("非管理员不能修改管理员信息。如果需要，请通知管理员修改。");
            }
            if (Rpt_groupExists(id))
                _context.Entry(rpt_group).State = EntityState.Modified;
            else
                _context.Entry(rpt_group).State = EntityState.Added;
            List<int> all_conn_id_list = new List<int>();
            rpt_group?.db_connection_list.ForEach(one =>
            {
                if (Rpt_connectionExists(one.Id))
                {
                    all_conn_id_list.Add(one.Id);
                }
            });
            List<int> del_conn_id_list = new List<int>();
            await _context.Rpt_db_connection.Where(x => x.grp_id == rpt_group.Id && !all_conn_id_list.Contains(x.Id)).ForEachAsync(x => {
                {
                    del_conn_id_list.Add(x.Id);
                    _context.Rpt_db_connection.Remove(x);
                }
            });
            rpt_group?.db_connection_list.ForEach(one =>
            {
                if (del_conn_id_list.Contains(one.Id))
                    return;
                if (Rpt_connectionExists(one.Id))
                    _context.Entry(one).State = EntityState.Modified;
                else
                    _context.Entry(one).State = EntityState.Added;
            });
            
            //_context.Rpt_group.Update(rpt_group);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Rpt_groupExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return new JsonResult(new { errcode = 0, message = "成功" });
        }

        // POST: api/Rpt_group
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Rpt_group>> PostRpt_group(Rpt_group rpt_group)
        {
            _context.Rpt_group.Add(rpt_group);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (Rpt_groupExists(rpt_group.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetRpt_group", new { id = rpt_group.Id }, rpt_group);
        }

        // DELETE: api/Rpt_group/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRpt_group(string id)
        {
            var rpt_group = _context.Rpt_group.Include(x=>x.db_connection_list).Where(x=>x.Id==id).First();
            if (rpt_group == null)
            {
                return NotFound();
            }
            rpt_group.db_connection_list.Clear();
            _context.Rpt_group.Remove(rpt_group);
            
            await _context.SaveChangesAsync();

            return new JsonResult(new { errcode = 0, message = "成功" });
        }

        private bool Rpt_groupExists(string id)
        {
            return _context.Rpt_group.Any(e => e.Id == id);
        }
        private bool Rpt_connectionExists(int id)
        {
            return _context.Rpt_db_connection.Any(e => e.Id == id);
        }
    }
}
