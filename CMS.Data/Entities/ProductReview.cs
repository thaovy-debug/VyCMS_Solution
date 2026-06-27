using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class ProductReview
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }
        public int CustomerId { get; set; }
        public int OrderId { get; set; }

        public int Rating { get; set; } // 1 to 5
        public string? Comment { get; set; }
        public string? ImageUrl { get; set; }
        
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public string? AdminReply { get; set; }
        public DateTime? ReplyDate { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }

        [ForeignKey("CustomerId")]
        public virtual Customer? Customer { get; set; }

        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }
    }
}
