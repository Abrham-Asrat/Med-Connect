using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTelemedicineSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HelpfulCount",
                table: "Reviews",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                table: "Reviews",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "AudioDuration",
                table: "Messages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AudioUrl",
                table: "Messages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "Messages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Messages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "AppointmentId",
                table: "Conversations",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastMessageAt",
                table: "Conversations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Conversations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "PrescriptionModel",
                columns: table => new
                {
                    PrescriptionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MessageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Medication = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Dosage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Frequency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Duration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrescriptionModel", x => x.PrescriptionId);
                    table.ForeignKey(
                        name: "FK_PrescriptionModel_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "DoctorId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PrescriptionModel_Messages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "Messages",
                        principalColumn: "MessageId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PrescriptionModel_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "PatientId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_AppointmentId",
                table: "Conversations",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionModel_DoctorId",
                table: "PrescriptionModel",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionModel_MessageId",
                table: "PrescriptionModel",
                column: "MessageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionModel_PatientId",
                table: "PrescriptionModel",
                column: "PatientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Appointments_AppointmentId",
                table: "Conversations",
                column: "AppointmentId",
                principalTable: "Appointments",
                principalColumn: "AppointmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Appointments_AppointmentId",
                table: "Conversations");

            migrationBuilder.DropTable(
                name: "PrescriptionModel");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_AppointmentId",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "HelpfulCount",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "IsPublic",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "AudioDuration",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "AudioUrl",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "IsRead",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "AppointmentId",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "LastMessageAt",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Conversations");
        }
    }
}
