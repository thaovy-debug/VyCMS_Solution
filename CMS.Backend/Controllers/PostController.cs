using Microsoft.AspNetCore.Mvc;
using CMS.Data.Entities;
using System.Collections.Generic;
using System;

namespace CMS.Backend.Controllers
{
    [Route("Post")]
    public class PostController : Controller
    {
        public IActionResult Index()
        {
            // Tạo dữ liệu giả khớp với Model Post của Thảo
            var listPosts = new List<Post>()
            {
                new Post {
                    Id = 1,
                    Title = "Lộ trình học ASP.NET Core cho người mới",
                    Content = "Nội dung bài viết về lộ trình học .NET...",
                    ImageUrl = "https://via.placeholder.com/400x200",
                    CreatedDate = new DateTime(2026, 4, 7)
                },
                new Post {
                    Id = 2,
                    Title = "ReactJS và WebAPI: Xu hướng Fullstack 2026",
                    Content = "Nội dung bài viết về sự kết hợp React và API...",
                    ImageUrl = "https://via.placeholder.com/400x200",
                    CreatedDate = new DateTime(2026, 4, 6)
                },
                new Post {
                    Id = 3,
                    Title = "Hướng dẫn cài đặt môi trường Visual Studio",
                    Content = "Các bước cài đặt công cụ cần thiết cho lập trình...",
                    ImageUrl = "https://via.placeholder.com/400x200",
                    CreatedDate = new DateTime(2026, 4, 5)
                }
            };

            return View(listPosts);
        }
    }
}