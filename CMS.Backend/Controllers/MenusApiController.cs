using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenusApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MenusApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/MenusApi
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Menu>>> GetMenus()
        {
            return await _context.Menus
                .Where(m => !m.IsHidden)
                .OrderBy(m => m.OrderIndex)
                .ToListAsync();
        }
    }
}
