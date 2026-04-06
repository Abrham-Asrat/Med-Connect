using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class PatentEntitiy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PatientModelPatientId",
                table: "Reviews",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PatientModelPatientId",
                table: "Appointments",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MedicalHistory = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmergencyContactName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmergencyContactPhone = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.PatientId);
                    table.ForeignKey(
                        name: "FK_Patients_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_PatientModelPatientId",
                table: "Reviews",
                column: "PatientModelPatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_PatientModelPatientId",
                table: "Appointments",
                column: "PatientModelPatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_UserId",
                table: "Patients",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Patients_PatientModelPatientId",
                table: "Appointments",
                column: "PatientModelPatientId",
                principalTable: "Patients",
                principalColumn: "PatientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Patients_PatientModelPatientId",
                table: "Reviews",
                column: "PatientModelPatientId",
                principalTable: "Patients",
                principalColumn: "PatientId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Patients_PatientModelPatientId",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Patients_PatientModelPatientId",
                table: "Reviews");

            migrationBuilder.DropTable(
                name: "Patients");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_PatientModelPatientId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_PatientModelPatientId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "PatientModelPatientId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "PatientModelPatientId",
                table: "Appointments");
        }
    }
}
