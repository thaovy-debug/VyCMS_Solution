using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class OrderHistory
    {
        [Key]
        public int Id { get; set; }

        public int OrderId { get; set; }

        [Required]
        public string Action { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string PerformedBy { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; }

        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }
    }
}
