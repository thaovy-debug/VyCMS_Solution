using System.ComponentModel.DataAnnotations;

namespace CMS.Data.Entities
{
    public class Banner
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập tiêu đề banner")]
        [StringLength(255)]
        public string Title { get; set; }

        public string? ImageUrl { get; set; }
    }
}
