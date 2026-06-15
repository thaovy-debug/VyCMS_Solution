using System.ComponentModel.DataAnnotations;

namespace CMS.Data.Entities
{
    public class Menu
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên menu không được để trống")]
        [MaxLength(200)]
        [Display(Name = "Tên menu")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Link không được để trống")]
        [MaxLength(500)]
        [Display(Name = "Đường dẫn (Link)")]
        public string Link { get; set; }

        [Display(Name = "Ẩn menu")]
        public bool IsHidden { get; set; }

        [Display(Name = "Vị trí sắp xếp")]
        public int OrderIndex { get; set; }
    }
}
