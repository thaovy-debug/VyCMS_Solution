using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMenuTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Colors",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Menus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Link = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsHidden = table.Column<bool>(type: "bit", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Menus", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Menus");

            migrationBuilder.DropColumn(
                name: "Colors",
                table: "Products");
        }
    }
}
