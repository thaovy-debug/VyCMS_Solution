using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

class Program {
    static async Task Main() {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer("Server=THAOVY\\SQLEXPRESS;Database=VyCMS_DB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True")
            .Options;
        
        using var context = new ApplicationDbContext(options);
        var products = await context.Products.ToListAsync();
        
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        
        string uploadsFolder = "e:\\asp\\VyCMS_Solution\\CMS.Backend\\wwwroot\\uploads";
        if (!Directory.Exists(uploadsFolder)) {
            Directory.CreateDirectory(uploadsFolder);
        }
        
        foreach (var product in products) {
            if (!string.IsNullOrEmpty(product.ImageUrl) && product.ImageUrl.StartsWith("http")) {
                try {
                    var response = await httpClient.GetAsync(product.ImageUrl);
                    if (response.IsSuccessStatusCode) {
                        var bytes = await response.Content.ReadAsByteArrayAsync();
                        string fileName = Guid.NewGuid().ToString() + ".webp";
                        string filePath = Path.Combine(uploadsFolder, fileName);
                        await File.WriteAllBytesAsync(filePath, bytes);
                        
                        product.ImageUrl = "/uploads/" + fileName;
                        Console.WriteLine($"Downloaded image for Product ID {product.Id}");
                    } else {
                        Console.WriteLine($"Failed to download image for Product ID {product.Id}: {response.StatusCode}");
                    }
                } catch (Exception ex) {
                    Console.WriteLine($"Error downloading image for Product ID {product.Id}: {ex.Message}");
                }
            }
        }
        
        await context.SaveChangesAsync();
        Console.WriteLine("Done.");
    }
}
