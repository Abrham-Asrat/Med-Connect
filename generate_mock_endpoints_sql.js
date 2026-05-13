const fs = require('fs');

const mockApis = JSON.parse(fs.readFileSync('mock_api_endpoints.json', 'utf8'));

let sql = `-- Mock API Endpoints Data SQL Script\n`;
sql += `USE [MedConnectDB];\nGO\n\n`;

mockApis.appointments.forEach((app, i) => {
    sql += `-- Appointment ${i + 1}\n`;
    sql += `INSERT INTO Appointments (AppointmentId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, AppointmentDate, AppointmentTime, AppointmentTimeSpan, AppointmentType, Status)\n`;
    sql += `VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '${app.doctorId}', '${app.patientId}', '${app.appointmentDate}', '${app.appointmentTime}', '00:30:00', ${app.appointmentType === 'Online' ? 1 : 0}, 0);\n\n`;
});

mockApis.reviews.forEach((rev, i) => {
    sql += `-- Review ${i + 1}\n`;
    sql += `INSERT INTO Reviews (ReviewId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, StarRating, ReviewText, HelpfulCount, IsPublic)\n`;
    sql += `VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '${rev.doctorId}', '${rev.patientId}', ${rev.starRating}, '${rev.reviewText}', 0, 1);\n\n`;
});

mockApis.blogs.forEach((blog, i) => {
    sql += `-- Blog ${i + 1}\n`;
    sql += `INSERT INTO Blogs (BlogId, Id, CreatedAt, UpdatedAt, AuthorId, Title, Content)\n`;
    sql += `VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '${blog.authorId}', '${blog.title}', '${blog.content}');\n\n`;
});

mockApis.messages.forEach((msg, i) => {
    sql += `-- Message ${i + 1} (And Conversation if necessary)\n`;
    sql += `IF NOT EXISTS (SELECT 1 FROM Conversations WHERE ConversationId = '${msg.conversationId}')\n`;
    sql += `BEGIN\n`;
    sql += `  INSERT INTO Conversations (ConversationId, Id, CreatedAt, UpdatedAt) VALUES ('${msg.conversationId}', NEWID(), GETUTCDATE(), GETUTCDATE());\n`;
    sql += `END\n`;
    sql += `INSERT INTO Messages (MessageId, Id, CreatedAt, UpdatedAt, ConversationId, SenderId, MessageText, IsRead, Type)\n`;
    sql += `VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '${msg.conversationId}', '${msg.senderId}', '${msg.messageText}', 0, ${msg.type});\n\n`;
});

mockApis.blogComments.forEach((comment, i) => {
    sql += `-- Blog Comment ${i + 1}\n`;
    // Assumes BlogComments table structure: BlogCommentId, Id, BlogId, SenderId, CommentText
    sql += `INSERT INTO BlogComments (BlogCommentId, Id, CreatedAt, UpdatedAt, BlogId, SenderId, CommentText)\n`;
    sql += `VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '${comment.blogId}', '${comment.senderId}', '${comment.commentText}');\n\n`;
});

fs.writeFileSync('mock_api_endpoints.sql', sql);
console.log('Successfully generated mock_api_endpoints.sql');
