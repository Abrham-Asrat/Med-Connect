using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorPreferenceClinicFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AcceptsInPerson",
                table: "DoctorPreferences",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "AcceptsOnline",
                table: "DoctorPreferences",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "ClinicAddress",
                table: "DoctorPreferences",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClinicCity",
                table: "DoctorPreferences",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClinicName",
                table: "DoctorPreferences",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AcceptsInPerson",
                table: "DoctorPreferences");

            migrationBuilder.DropColumn(
                name: "AcceptsOnline",
                table: "DoctorPreferences");

            migrationBuilder.DropColumn(
                name: "ClinicAddress",
                table: "DoctorPreferences");

            migrationBuilder.DropColumn(
                name: "ClinicCity",
                table: "DoctorPreferences");

            migrationBuilder.DropColumn(
                name: "ClinicName",
                table: "DoctorPreferences");
        }
    }
}
