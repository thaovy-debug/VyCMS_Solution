using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlToCategoryProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DiscountPercent",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SizeGuideImageUrl",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sizes",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Size",
                table: "OrderDetails",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "CategoriesProducts",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Banners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Banners", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Banners");

            migrationBuilder.DropColumn(
                name: "DiscountPercent",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SizeGuideImageUrl",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Sizes",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "OrderDetails");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "CategoriesProducts");
        }
    }
}
