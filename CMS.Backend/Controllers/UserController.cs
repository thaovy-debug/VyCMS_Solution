using Microsoft.AspNetCore.Mvc;
using CMS.Data.Entities;
using System.Collections.Generic;

namespace CMS.Backend.Controllers
{
    public class UserController : Controller
    {
        // Tạo dữ liệu giả cho danh sách người dùng
        private static List<User> _users = new List<User>
        {
            new User { Id = 1, Username = "admin_thai", FullName = "Nguyễn Cao Thái", Role = "Administrator" },
            new User { Id = 2, Username = "editor_01", FullName = "Trần Văn Biên Tập", Role = "Editor" },
            new User { Id = 3, Username = "author_minh", FullName = "Lê Quang Minh", Role = "Author" }
        };

        public IActionResult Index()
        {
            // Truyền danh sách sang View
            return View(_users);
        }
    }
}