using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    [Route("api/Banners")]
    [ApiController]
    public class BannersApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BannersApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Banners
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Banner>>> GetBanners()
        {
            return await _context.Banners.Where(b => b.IsVisible).ToListAsync();
        }
    }
}
