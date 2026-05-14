using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Messages — most critical: every chat load hits ConversationId
            migrationBuilder.CreateIndex(
                name: "IX_Messages_ConversationId",
                table: "Messages",
                column: "ConversationId");

            // ConversationMemberships — first step of GetAllConversations
            migrationBuilder.CreateIndex(
                name: "IX_ConversationMemberships_UserId",
                table: "ConversationMemberships",
                column: "UserId");

            // Notifications — explains the 82-second notification endpoint
            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            // DoctorAvailabilities — queried on every appointment booking
            migrationBuilder.CreateIndex(
                name: "IX_DoctorAvailabilities_DoctorId",
                table: "DoctorAvailabilities",
                column: "DoctorId");

            // Educations / Experiences — loaded per doctor profile
            migrationBuilder.CreateIndex(
                name: "IX_Educations_DoctorId",
                table: "Educations",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Experiences_DoctorId",
                table: "Experiences",
                column: "DoctorId");

            // Reviews
            migrationBuilder.CreateIndex(
                name: "IX_Reviews_DoctorId",
                table: "Reviews",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_PatientId",
                table: "Reviews",
                column: "PatientId");

            // MessageFileAssociations
            migrationBuilder.CreateIndex(
                name: "IX_MessageFileAssociations_MessageId",
                table: "MessageFileAssociations",
                column: "MessageId");

            // Blogs
            migrationBuilder.CreateIndex(
                name: "IX_Blogs_AuthorId",
                table: "Blogs",
                column: "AuthorId");

            // BlogComments
            migrationBuilder.CreateIndex(
                name: "IX_BlogComments_BlogId",
                table: "BlogComments",
                column: "BlogId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "IX_Messages_ConversationId",           table: "Messages");
            migrationBuilder.DropIndex(name: "IX_ConversationMemberships_UserId",     table: "ConversationMemberships");
            migrationBuilder.DropIndex(name: "IX_Notifications_UserId",               table: "Notifications");
            migrationBuilder.DropIndex(name: "IX_DoctorAvailabilities_DoctorId",      table: "DoctorAvailabilities");
            migrationBuilder.DropIndex(name: "IX_Educations_DoctorId",                table: "Educations");
            migrationBuilder.DropIndex(name: "IX_Experiences_DoctorId",               table: "Experiences");
            migrationBuilder.DropIndex(name: "IX_Reviews_DoctorId",                   table: "Reviews");
            migrationBuilder.DropIndex(name: "IX_Reviews_PatientId",                  table: "Reviews");
            migrationBuilder.DropIndex(name: "IX_MessageFileAssociations_MessageId",  table: "MessageFileAssociations");
            migrationBuilder.DropIndex(name: "IX_Blogs_AuthorId",                     table: "Blogs");
            migrationBuilder.DropIndex(name: "IX_BlogComments_BlogId",                table: "BlogComments");
        }
    }
}
