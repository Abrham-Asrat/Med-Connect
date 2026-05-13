-- Mock API Endpoints Data SQL Script
USE [MedConnectDB];
GO

-- Appointment 1
INSERT INTO Appointments (AppointmentId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, AppointmentDate, AppointmentTime, AppointmentTimeSpan, AppointmentType, Status)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '79c82171-c750-47d5-aedc-add43f646c3b', 'a5f02243-7d65-4eb7-0ce6-08deb0758ed9', '2026-06-10', '10:30', '00:30:00', 1, 0);

-- Appointment 2
INSERT INTO Appointments (AppointmentId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, AppointmentDate, AppointmentTime, AppointmentTimeSpan, AppointmentType, Status)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '0e4caad2-3286-4eb6-b08e-ea03013c7e84', '49edfe7b-c31e-4397-0ceb-08deb0758ed9', '2026-06-11', '10:30', '00:30:00', 0, 0);

-- Appointment 3
INSERT INTO Appointments (AppointmentId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, AppointmentDate, AppointmentTime, AppointmentTimeSpan, AppointmentType, Status)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '5064006d-840a-4bd8-b0fc-96a5193e6c04', '08780d5f-170f-4b90-0ce7-08deb0758ed9', '2026-06-12', '10:30', '00:30:00', 1, 0);

-- Appointment 4
INSERT INTO Appointments (AppointmentId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, AppointmentDate, AppointmentTime, AppointmentTimeSpan, AppointmentType, Status)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'baba70c8-8725-45d2-b09e-2480b1e67812', '0e304274-3320-4d1e-0cec-08deb0758ed9', '2026-06-13', '10:30', '00:30:00', 0, 0);

-- Appointment 5
INSERT INTO Appointments (AppointmentId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, AppointmentDate, AppointmentTime, AppointmentTimeSpan, AppointmentType, Status)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'e3d85cd2-2ea1-4698-bd60-1e2cf25fc95f', 'c536db66-5102-44c1-0ce4-08deb0758ed9', '2026-06-14', '10:30', '00:30:00', 1, 0);

-- Appointment 6
INSERT INTO Appointments (AppointmentId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, AppointmentDate, AppointmentTime, AppointmentTimeSpan, AppointmentType, Status)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '858035dd-0f63-4241-abcc-daccf8ec57a8', '0ed889df-3708-4cde-0ce8-08deb0758ed9', '2026-06-15', '10:30', '00:30:00', 0, 0);

-- Appointment 7
INSERT INTO Appointments (AppointmentId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, AppointmentDate, AppointmentTime, AppointmentTimeSpan, AppointmentType, Status)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'acf9f3e5-7fb7-4050-bd3f-cff7e6458547', 'ce98f8c7-8ae4-4a0a-0cea-08deb0758ed9', '2026-06-16', '10:30', '00:30:00', 1, 0);

-- Appointment 8
INSERT INTO Appointments (AppointmentId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, AppointmentDate, AppointmentTime, AppointmentTimeSpan, AppointmentType, Status)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '1e8d517d-e7ed-4efa-818a-e86054a50332', 'b8df9328-264d-4fdd-0ce5-08deb0758ed9', '2026-06-17', '10:30', '00:30:00', 0, 0);

-- Appointment 9
INSERT INTO Appointments (AppointmentId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, AppointmentDate, AppointmentTime, AppointmentTimeSpan, AppointmentType, Status)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '8d6543c3-1f71-482d-9248-e4e2998f8ed5', '127c2166-cb2a-4698-0ce9-08deb0758ed9', '2026-06-18', '10:30', '00:30:00', 1, 0);

-- Appointment 10
INSERT INTO Appointments (AppointmentId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, AppointmentDate, AppointmentTime, AppointmentTimeSpan, AppointmentType, Status)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'd1d167a5-ae78-4d24-acb5-cd885da07df8', '27ae8a64-3b83-4dd4-0ce3-08deb0758ed9', '2026-06-19', '10:30', '00:30:00', 0, 0);

-- Review 1
INSERT INTO Reviews (ReviewId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, StarRating, ReviewText, HelpfulCount, IsPublic)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '79c82171-c750-47d5-aedc-add43f646c3b', 'a5f02243-7d65-4eb7-0ce6-08deb0758ed9', 4, 'This is a comprehensive review for the doctor highlighting their expertise. This is a comprehensive review for the doctor highlighting their expertise. ', 0, 1);

-- Review 2
INSERT INTO Reviews (ReviewId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, StarRating, ReviewText, HelpfulCount, IsPublic)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '0e4caad2-3286-4eb6-b08e-ea03013c7e84', '49edfe7b-c31e-4397-0ceb-08deb0758ed9', 5, 'This is a comprehensive review for the doctor highlighting their expertise. This is a comprehensive review for the doctor highlighting their expertise. ', 0, 1);

-- Review 3
INSERT INTO Reviews (ReviewId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, StarRating, ReviewText, HelpfulCount, IsPublic)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '5064006d-840a-4bd8-b0fc-96a5193e6c04', '08780d5f-170f-4b90-0ce7-08deb0758ed9', 4, 'This is a comprehensive review for the doctor highlighting their expertise. This is a comprehensive review for the doctor highlighting their expertise. ', 0, 1);

-- Review 4
INSERT INTO Reviews (ReviewId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, StarRating, ReviewText, HelpfulCount, IsPublic)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'baba70c8-8725-45d2-b09e-2480b1e67812', '0e304274-3320-4d1e-0cec-08deb0758ed9', 5, 'This is a comprehensive review for the doctor highlighting their expertise. This is a comprehensive review for the doctor highlighting their expertise. ', 0, 1);

-- Review 5
INSERT INTO Reviews (ReviewId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, StarRating, ReviewText, HelpfulCount, IsPublic)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'e3d85cd2-2ea1-4698-bd60-1e2cf25fc95f', 'c536db66-5102-44c1-0ce4-08deb0758ed9', 4, 'This is a comprehensive review for the doctor highlighting their expertise. This is a comprehensive review for the doctor highlighting their expertise. ', 0, 1);

-- Review 6
INSERT INTO Reviews (ReviewId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, StarRating, ReviewText, HelpfulCount, IsPublic)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '858035dd-0f63-4241-abcc-daccf8ec57a8', '0ed889df-3708-4cde-0ce8-08deb0758ed9', 5, 'This is a comprehensive review for the doctor highlighting their expertise. This is a comprehensive review for the doctor highlighting their expertise. ', 0, 1);

-- Review 7
INSERT INTO Reviews (ReviewId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, StarRating, ReviewText, HelpfulCount, IsPublic)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'acf9f3e5-7fb7-4050-bd3f-cff7e6458547', 'ce98f8c7-8ae4-4a0a-0cea-08deb0758ed9', 4, 'This is a comprehensive review for the doctor highlighting their expertise. This is a comprehensive review for the doctor highlighting their expertise. ', 0, 1);

-- Review 8
INSERT INTO Reviews (ReviewId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, StarRating, ReviewText, HelpfulCount, IsPublic)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '1e8d517d-e7ed-4efa-818a-e86054a50332', 'b8df9328-264d-4fdd-0ce5-08deb0758ed9', 5, 'This is a comprehensive review for the doctor highlighting their expertise. This is a comprehensive review for the doctor highlighting their expertise. ', 0, 1);

-- Review 9
INSERT INTO Reviews (ReviewId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, StarRating, ReviewText, HelpfulCount, IsPublic)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '8d6543c3-1f71-482d-9248-e4e2998f8ed5', '127c2166-cb2a-4698-0ce9-08deb0758ed9', 4, 'This is a comprehensive review for the doctor highlighting their expertise. This is a comprehensive review for the doctor highlighting their expertise. ', 0, 1);

-- Review 10
INSERT INTO Reviews (ReviewId, Id, CreatedAt, UpdatedAt, DoctorId, PatientId, StarRating, ReviewText, HelpfulCount, IsPublic)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'd1d167a5-ae78-4d24-acb5-cd885da07df8', '27ae8a64-3b83-4dd4-0ce3-08deb0758ed9', 5, 'This is a comprehensive review for the doctor highlighting their expertise. This is a comprehensive review for the doctor highlighting their expertise. ', 0, 1);

-- Blog 1
INSERT INTO Blogs (BlogId, Id, CreatedAt, UpdatedAt, AuthorId, Title, Content)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'cefb9696-6526-490d-98fb-1172418e7029', 'Health and Wellness Guide Vol 1', 'Maintaining proper health requires diligent action and persistent habit forming routines. This is a highly detailed post meant to fulfill the length requirement of the blog content field which must exceed one hundred characters consistently. Make sure to drink water.');

-- Blog 2
INSERT INTO Blogs (BlogId, Id, CreatedAt, UpdatedAt, AuthorId, Title, Content)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '70043e0c-72fa-4fa3-be4a-d640f3532191', 'Health and Wellness Guide Vol 2', 'Maintaining proper health requires diligent action and persistent habit forming routines. This is a highly detailed post meant to fulfill the length requirement of the blog content field which must exceed one hundred characters consistently. Make sure to drink water.');

-- Blog 3
INSERT INTO Blogs (BlogId, Id, CreatedAt, UpdatedAt, AuthorId, Title, Content)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'eee3fd0b-ebc7-4a27-8868-2a0e6df44e3a', 'Health and Wellness Guide Vol 3', 'Maintaining proper health requires diligent action and persistent habit forming routines. This is a highly detailed post meant to fulfill the length requirement of the blog content field which must exceed one hundred characters consistently. Make sure to drink water.');

-- Blog 4
INSERT INTO Blogs (BlogId, Id, CreatedAt, UpdatedAt, AuthorId, Title, Content)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '70043e0c-72fa-4fa3-be4a-d640f3532191', 'Health and Wellness Guide Vol 4', 'Maintaining proper health requires diligent action and persistent habit forming routines. This is a highly detailed post meant to fulfill the length requirement of the blog content field which must exceed one hundred characters consistently. Make sure to drink water.');

-- Blog 5
INSERT INTO Blogs (BlogId, Id, CreatedAt, UpdatedAt, AuthorId, Title, Content)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'f77bec76-78f5-41dd-81db-638ef45b2d35', 'Health and Wellness Guide Vol 5', 'Maintaining proper health requires diligent action and persistent habit forming routines. This is a highly detailed post meant to fulfill the length requirement of the blog content field which must exceed one hundred characters consistently. Make sure to drink water.');

-- Blog 6
INSERT INTO Blogs (BlogId, Id, CreatedAt, UpdatedAt, AuthorId, Title, Content)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '70043e0c-72fa-4fa3-be4a-d640f3532191', 'Health and Wellness Guide Vol 6', 'Maintaining proper health requires diligent action and persistent habit forming routines. This is a highly detailed post meant to fulfill the length requirement of the blog content field which must exceed one hundred characters consistently. Make sure to drink water.');

-- Blog 7
INSERT INTO Blogs (BlogId, Id, CreatedAt, UpdatedAt, AuthorId, Title, Content)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'dfaf3f61-ba6e-4396-be02-a84624d0ab78', 'Health and Wellness Guide Vol 7', 'Maintaining proper health requires diligent action and persistent habit forming routines. This is a highly detailed post meant to fulfill the length requirement of the blog content field which must exceed one hundred characters consistently. Make sure to drink water.');

-- Blog 8
INSERT INTO Blogs (BlogId, Id, CreatedAt, UpdatedAt, AuthorId, Title, Content)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '70043e0c-72fa-4fa3-be4a-d640f3532191', 'Health and Wellness Guide Vol 8', 'Maintaining proper health requires diligent action and persistent habit forming routines. This is a highly detailed post meant to fulfill the length requirement of the blog content field which must exceed one hundred characters consistently. Make sure to drink water.');

-- Blog 9
INSERT INTO Blogs (BlogId, Id, CreatedAt, UpdatedAt, AuthorId, Title, Content)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '126c51aa-f8df-4f01-bc76-e12338c098dd', 'Health and Wellness Guide Vol 9', 'Maintaining proper health requires diligent action and persistent habit forming routines. This is a highly detailed post meant to fulfill the length requirement of the blog content field which must exceed one hundred characters consistently. Make sure to drink water.');

-- Blog 10
INSERT INTO Blogs (BlogId, Id, CreatedAt, UpdatedAt, AuthorId, Title, Content)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '70043e0c-72fa-4fa3-be4a-d640f3532191', 'Health and Wellness Guide Vol 10', 'Maintaining proper health requires diligent action and persistent habit forming routines. This is a highly detailed post meant to fulfill the length requirement of the blog content field which must exceed one hundred characters consistently. Make sure to drink water.');

-- Message 1 (And Conversation if necessary)
IF NOT EXISTS (SELECT 1 FROM Conversations WHERE ConversationId = '086bdebe-794d-410b-b185-edbaf1a2a381')
BEGIN
  INSERT INTO Conversations (ConversationId, Id, CreatedAt, UpdatedAt) VALUES ('086bdebe-794d-410b-b185-edbaf1a2a381', NEWID(), GETUTCDATE(), GETUTCDATE());
END
INSERT INTO Messages (MessageId, Id, CreatedAt, UpdatedAt, ConversationId, SenderId, MessageText, IsRead, Type)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '086bdebe-794d-410b-b185-edbaf1a2a381', '03774116-678e-4d6c-9911-0c6fd4f2f6d6', 'Hello Doctor, this is patient message number 1. I need help with my scheduling.', 0, 0);

-- Message 2 (And Conversation if necessary)
IF NOT EXISTS (SELECT 1 FROM Conversations WHERE ConversationId = '81074781-db1f-46da-9aa4-c2e425c04cfb')
BEGIN
  INSERT INTO Conversations (ConversationId, Id, CreatedAt, UpdatedAt) VALUES ('81074781-db1f-46da-9aa4-c2e425c04cfb', NEWID(), GETUTCDATE(), GETUTCDATE());
END
INSERT INTO Messages (MessageId, Id, CreatedAt, UpdatedAt, ConversationId, SenderId, MessageText, IsRead, Type)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '81074781-db1f-46da-9aa4-c2e425c04cfb', 'aca7804e-aae8-4c1d-aafc-35506e0da94a', 'Hello Doctor, this is patient message number 2. I need help with my scheduling.', 0, 0);

-- Message 3 (And Conversation if necessary)
IF NOT EXISTS (SELECT 1 FROM Conversations WHERE ConversationId = 'c38c8dc2-8315-445d-97c7-c7d86f8f8cd2')
BEGIN
  INSERT INTO Conversations (ConversationId, Id, CreatedAt, UpdatedAt) VALUES ('c38c8dc2-8315-445d-97c7-c7d86f8f8cd2', NEWID(), GETUTCDATE(), GETUTCDATE());
END
INSERT INTO Messages (MessageId, Id, CreatedAt, UpdatedAt, ConversationId, SenderId, MessageText, IsRead, Type)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'c38c8dc2-8315-445d-97c7-c7d86f8f8cd2', 'b45d4cbb-cdbc-416f-a7b7-385b8d7f4eff', 'Hello Doctor, this is patient message number 3. I need help with my scheduling.', 0, 0);

-- Message 4 (And Conversation if necessary)
IF NOT EXISTS (SELECT 1 FROM Conversations WHERE ConversationId = 'b28b520e-b0a3-4a0e-8326-b9de0bdde9af')
BEGIN
  INSERT INTO Conversations (ConversationId, Id, CreatedAt, UpdatedAt) VALUES ('b28b520e-b0a3-4a0e-8326-b9de0bdde9af', NEWID(), GETUTCDATE(), GETUTCDATE());
END
INSERT INTO Messages (MessageId, Id, CreatedAt, UpdatedAt, ConversationId, SenderId, MessageText, IsRead, Type)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'b28b520e-b0a3-4a0e-8326-b9de0bdde9af', '9233ed4c-0e75-487c-8c2f-4ba160396b3f', 'Hello Doctor, this is patient message number 4. I need help with my scheduling.', 0, 0);

-- Message 5 (And Conversation if necessary)
IF NOT EXISTS (SELECT 1 FROM Conversations WHERE ConversationId = 'c4d296ef-317d-41c3-a042-10538266668a')
BEGIN
  INSERT INTO Conversations (ConversationId, Id, CreatedAt, UpdatedAt) VALUES ('c4d296ef-317d-41c3-a042-10538266668a', NEWID(), GETUTCDATE(), GETUTCDATE());
END
INSERT INTO Messages (MessageId, Id, CreatedAt, UpdatedAt, ConversationId, SenderId, MessageText, IsRead, Type)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'c4d296ef-317d-41c3-a042-10538266668a', '53fb65f7-64df-464d-a04e-58076250ab76', 'Hello Doctor, this is patient message number 5. I need help with my scheduling.', 0, 0);

-- Message 6 (And Conversation if necessary)
IF NOT EXISTS (SELECT 1 FROM Conversations WHERE ConversationId = '63836074-d134-4248-8539-f2df0d4e9b58')
BEGIN
  INSERT INTO Conversations (ConversationId, Id, CreatedAt, UpdatedAt) VALUES ('63836074-d134-4248-8539-f2df0d4e9b58', NEWID(), GETUTCDATE(), GETUTCDATE());
END
INSERT INTO Messages (MessageId, Id, CreatedAt, UpdatedAt, ConversationId, SenderId, MessageText, IsRead, Type)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '63836074-d134-4248-8539-f2df0d4e9b58', '43fcc33f-a672-4999-8cbe-e4525b0605ad', 'Hello Doctor, this is patient message number 6. I need help with my scheduling.', 0, 0);

-- Message 7 (And Conversation if necessary)
IF NOT EXISTS (SELECT 1 FROM Conversations WHERE ConversationId = '470e9032-b5fe-43e7-b255-50f96b6f0b4e')
BEGIN
  INSERT INTO Conversations (ConversationId, Id, CreatedAt, UpdatedAt) VALUES ('470e9032-b5fe-43e7-b255-50f96b6f0b4e', NEWID(), GETUTCDATE(), GETUTCDATE());
END
INSERT INTO Messages (MessageId, Id, CreatedAt, UpdatedAt, ConversationId, SenderId, MessageText, IsRead, Type)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '470e9032-b5fe-43e7-b255-50f96b6f0b4e', '31e82133-af1b-4032-8a57-e4a7525eb7f2', 'Hello Doctor, this is patient message number 7. I need help with my scheduling.', 0, 0);

-- Message 8 (And Conversation if necessary)
IF NOT EXISTS (SELECT 1 FROM Conversations WHERE ConversationId = 'ff8f458c-9a6b-428a-b011-2835d402185b')
BEGIN
  INSERT INTO Conversations (ConversationId, Id, CreatedAt, UpdatedAt) VALUES ('ff8f458c-9a6b-428a-b011-2835d402185b', NEWID(), GETUTCDATE(), GETUTCDATE());
END
INSERT INTO Messages (MessageId, Id, CreatedAt, UpdatedAt, ConversationId, SenderId, MessageText, IsRead, Type)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'ff8f458c-9a6b-428a-b011-2835d402185b', '85e300b8-d520-4617-865f-f221a4c408d8', 'Hello Doctor, this is patient message number 8. I need help with my scheduling.', 0, 0);

-- Message 9 (And Conversation if necessary)
IF NOT EXISTS (SELECT 1 FROM Conversations WHERE ConversationId = '67f30733-bcb9-411f-a50e-2ca09597e174')
BEGIN
  INSERT INTO Conversations (ConversationId, Id, CreatedAt, UpdatedAt) VALUES ('67f30733-bcb9-411f-a50e-2ca09597e174', NEWID(), GETUTCDATE(), GETUTCDATE());
END
INSERT INTO Messages (MessageId, Id, CreatedAt, UpdatedAt, ConversationId, SenderId, MessageText, IsRead, Type)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '67f30733-bcb9-411f-a50e-2ca09597e174', 'bf2483da-1d4c-47d6-ab45-f24df7c7a701', 'Hello Doctor, this is patient message number 9. I need help with my scheduling.', 0, 0);

-- Message 10 (And Conversation if necessary)
IF NOT EXISTS (SELECT 1 FROM Conversations WHERE ConversationId = '6d8ecc33-3918-4664-b370-98d2ee94dcac')
BEGIN
  INSERT INTO Conversations (ConversationId, Id, CreatedAt, UpdatedAt) VALUES ('6d8ecc33-3918-4664-b370-98d2ee94dcac', NEWID(), GETUTCDATE(), GETUTCDATE());
END
INSERT INTO Messages (MessageId, Id, CreatedAt, UpdatedAt, ConversationId, SenderId, MessageText, IsRead, Type)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '6d8ecc33-3918-4664-b370-98d2ee94dcac', 'b44be8f6-2d52-4d77-9e1c-fe88f8404686', 'Hello Doctor, this is patient message number 10. I need help with my scheduling.', 0, 0);

-- Blog Comment 1
INSERT INTO BlogComments (BlogCommentId, Id, CreatedAt, UpdatedAt, BlogId, SenderId, CommentText)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'f79b7529-8dec-4bb7-b473-5742d284cc57', '03774116-678e-4d6c-9911-0c6fd4f2f6d6', 'Great post! Very helpful advice for my current condition. (Comment 1)');

-- Blog Comment 2
INSERT INTO BlogComments (BlogCommentId, Id, CreatedAt, UpdatedAt, BlogId, SenderId, CommentText)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '53bc22ae-7890-48c7-a7c6-14dfa7dc4539', 'aca7804e-aae8-4c1d-aafc-35506e0da94a', 'Great post! Very helpful advice for my current condition. (Comment 2)');

-- Blog Comment 3
INSERT INTO BlogComments (BlogCommentId, Id, CreatedAt, UpdatedAt, BlogId, SenderId, CommentText)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'ff8e69c6-d5ca-40ea-b907-443678030f00', 'b45d4cbb-cdbc-416f-a7b7-385b8d7f4eff', 'Great post! Very helpful advice for my current condition. (Comment 3)');

-- Blog Comment 4
INSERT INTO BlogComments (BlogCommentId, Id, CreatedAt, UpdatedAt, BlogId, SenderId, CommentText)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'dd2caa51-e127-4f0f-95b0-da0b54ecfa14', '9233ed4c-0e75-487c-8c2f-4ba160396b3f', 'Great post! Very helpful advice for my current condition. (Comment 4)');

-- Blog Comment 5
INSERT INTO BlogComments (BlogCommentId, Id, CreatedAt, UpdatedAt, BlogId, SenderId, CommentText)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), 'bc12badf-a23f-4832-8fc8-35d8da3d4635', '53fb65f7-64df-464d-a04e-58076250ab76', 'Great post! Very helpful advice for my current condition. (Comment 5)');

-- Blog Comment 6
INSERT INTO BlogComments (BlogCommentId, Id, CreatedAt, UpdatedAt, BlogId, SenderId, CommentText)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '2e85ac58-6b2a-4de9-b54a-8388e779612f', '43fcc33f-a672-4999-8cbe-e4525b0605ad', 'Great post! Very helpful advice for my current condition. (Comment 6)');

-- Blog Comment 7
INSERT INTO BlogComments (BlogCommentId, Id, CreatedAt, UpdatedAt, BlogId, SenderId, CommentText)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '5f8b8b54-75da-472c-94f4-2c1bd720edc7', '31e82133-af1b-4032-8a57-e4a7525eb7f2', 'Great post! Very helpful advice for my current condition. (Comment 7)');

-- Blog Comment 8
INSERT INTO BlogComments (BlogCommentId, Id, CreatedAt, UpdatedAt, BlogId, SenderId, CommentText)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '3b2560a7-41a2-4265-893d-88d6b081adaf', '85e300b8-d520-4617-865f-f221a4c408d8', 'Great post! Very helpful advice for my current condition. (Comment 8)');

-- Blog Comment 9
INSERT INTO BlogComments (BlogCommentId, Id, CreatedAt, UpdatedAt, BlogId, SenderId, CommentText)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '3648f481-d70b-455a-a038-0a75907445f1', 'bf2483da-1d4c-47d6-ab45-f24df7c7a701', 'Great post! Very helpful advice for my current condition. (Comment 9)');

-- Blog Comment 10
INSERT INTO BlogComments (BlogCommentId, Id, CreatedAt, UpdatedAt, BlogId, SenderId, CommentText)
VALUES (NEWID(), NEWID(), GETUTCDATE(), GETUTCDATE(), '1fb37e05-79c2-48e7-baaa-a7c94546ae64', 'b44be8f6-2d52-4d77-9e1c-fe88f8404686', 'Great post! Very helpful advice for my current condition. (Comment 10)');

