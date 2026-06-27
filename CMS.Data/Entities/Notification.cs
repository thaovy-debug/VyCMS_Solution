using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        public int CustomerId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Message { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Type of notification: "Order", "Review", "System", "AdminMessage"
        [MaxLength(50)]
        public string? Type { get; set; }

        // ID related to the notification (e.g., OrderId or ReviewId)
        public int? RelatedId { get; set; }

        [ForeignKey("CustomerId")]
        public virtual Customer? Customer { get; set; }
    }
}
