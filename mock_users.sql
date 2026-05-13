-- Mock Data SQL Script for Med-Connect
USE [MedConnectDB]; -- Adjust if actual database name is different
GO


-- Inserting Doctor 1
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Doctor1', 'Smith1', 'doctor1@example.com', '+10000000000', 0, '1980-05-12', '1 Health Ave, Medical City', 2, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @DoctorId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileBaseId UNIQUEIDENTIFIER = NEWID();
    -- Files Table
    INSERT INTO Files (FileId, Id, CreatedAt, UpdatedAt, FileName, MimeType, FileData, Url)
    VALUES (@FileId, @FileBaseId, GETUTCDATE(), GETUTCDATE(), 'cv_doctor1.pdf', 'application/pdf', 0x, NULL);
    -- DoctorPreferences Table
    INSERT INTO DoctorPreferences (DoctorId, OnlineAppointmentFee, InPersonAppointmentFee)
    VALUES (@DoctorId, 50, 100);
    -- Doctors Table
    INSERT INTO Doctors (DoctorId, UserId, Qualifications, Biography, DoctorStatus, DoctorPreferenceId, CvId, IsVerified, Languages)
    VALUES (@DoctorId, @UserId, 'MD, PhD', 'Experienced doctor 1.', 1, @DoctorId, @FileId, 1, 'English');
    -- DoctorAvailabilities Table
    INSERT INTO DoctorAvailabilities (DoctorAvailabilityId, DoctorId, AvailableDay, StartTime, EndTime)
    VALUES (NEWID(), @DoctorId, 1, '09:00:00', '17:00:00');
    -- Educations Table
    INSERT INTO Educations (EducationId, DoctorId, Degree, Institution, GraduationDate)
    VALUES (NEWID(), @DoctorId, 'MD', 'State Medical University', '2010-05-12');
    -- Experiences Table
    INSERT INTO Experiences (ExperienceId, DoctorId, Institution, Position, StartDate, EndDate, Description)
    VALUES (NEWID(), @DoctorId, 'City Hospital', 'Resident', '2010-06-01', '2015-06-01', 'Completed residency');
END;
GO

-- Inserting Doctor 2
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Doctor2', 'Smith2', 'doctor2@example.com', '+10000000001', 1, '1980-05-12', '2 Health Ave, Medical City', 2, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @DoctorId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileBaseId UNIQUEIDENTIFIER = NEWID();
    -- Files Table
    INSERT INTO Files (FileId, Id, CreatedAt, UpdatedAt, FileName, MimeType, FileData, Url)
    VALUES (@FileId, @FileBaseId, GETUTCDATE(), GETUTCDATE(), 'cv_doctor2.pdf', 'application/pdf', 0x, NULL);
    -- DoctorPreferences Table
    INSERT INTO DoctorPreferences (DoctorId, OnlineAppointmentFee, InPersonAppointmentFee)
    VALUES (@DoctorId, 60, 110);
    -- Doctors Table
    INSERT INTO Doctors (DoctorId, UserId, Qualifications, Biography, DoctorStatus, DoctorPreferenceId, CvId, IsVerified, Languages)
    VALUES (@DoctorId, @UserId, 'MD, PhD', 'Experienced doctor 2.', 1, @DoctorId, @FileId, 1, 'English');
    -- DoctorAvailabilities Table
    INSERT INTO DoctorAvailabilities (DoctorAvailabilityId, DoctorId, AvailableDay, StartTime, EndTime)
    VALUES (NEWID(), @DoctorId, 1, '09:00:00', '17:00:00');
    -- Educations Table
    INSERT INTO Educations (EducationId, DoctorId, Degree, Institution, GraduationDate)
    VALUES (NEWID(), @DoctorId, 'MD', 'State Medical University', '2010-05-12');
    -- Experiences Table
    INSERT INTO Experiences (ExperienceId, DoctorId, Institution, Position, StartDate, EndDate, Description)
    VALUES (NEWID(), @DoctorId, 'City Hospital', 'Resident', '2010-06-01', '2015-06-01', 'Completed residency');
END;
GO

-- Inserting Doctor 3
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Doctor3', 'Smith3', 'doctor3@example.com', '+10000000002', 0, '1980-05-12', '3 Health Ave, Medical City', 2, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @DoctorId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileBaseId UNIQUEIDENTIFIER = NEWID();
    -- Files Table
    INSERT INTO Files (FileId, Id, CreatedAt, UpdatedAt, FileName, MimeType, FileData, Url)
    VALUES (@FileId, @FileBaseId, GETUTCDATE(), GETUTCDATE(), 'cv_doctor3.pdf', 'application/pdf', 0x, NULL);
    -- DoctorPreferences Table
    INSERT INTO DoctorPreferences (DoctorId, OnlineAppointmentFee, InPersonAppointmentFee)
    VALUES (@DoctorId, 70, 120);
    -- Doctors Table
    INSERT INTO Doctors (DoctorId, UserId, Qualifications, Biography, DoctorStatus, DoctorPreferenceId, CvId, IsVerified, Languages)
    VALUES (@DoctorId, @UserId, 'MD, PhD', 'Experienced doctor 3.', 1, @DoctorId, @FileId, 1, 'English');
    -- DoctorAvailabilities Table
    INSERT INTO DoctorAvailabilities (DoctorAvailabilityId, DoctorId, AvailableDay, StartTime, EndTime)
    VALUES (NEWID(), @DoctorId, 1, '09:00:00', '17:00:00');
    -- Educations Table
    INSERT INTO Educations (EducationId, DoctorId, Degree, Institution, GraduationDate)
    VALUES (NEWID(), @DoctorId, 'MD', 'State Medical University', '2010-05-12');
    -- Experiences Table
    INSERT INTO Experiences (ExperienceId, DoctorId, Institution, Position, StartDate, EndDate, Description)
    VALUES (NEWID(), @DoctorId, 'City Hospital', 'Resident', '2010-06-01', '2015-06-01', 'Completed residency');
END;
GO

-- Inserting Doctor 4
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Doctor4', 'Smith4', 'doctor4@example.com', '+10000000003', 1, '1980-05-12', '4 Health Ave, Medical City', 2, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @DoctorId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileBaseId UNIQUEIDENTIFIER = NEWID();
    -- Files Table
    INSERT INTO Files (FileId, Id, CreatedAt, UpdatedAt, FileName, MimeType, FileData, Url)
    VALUES (@FileId, @FileBaseId, GETUTCDATE(), GETUTCDATE(), 'cv_doctor4.pdf', 'application/pdf', 0x, NULL);
    -- DoctorPreferences Table
    INSERT INTO DoctorPreferences (DoctorId, OnlineAppointmentFee, InPersonAppointmentFee)
    VALUES (@DoctorId, 80, 130);
    -- Doctors Table
    INSERT INTO Doctors (DoctorId, UserId, Qualifications, Biography, DoctorStatus, DoctorPreferenceId, CvId, IsVerified, Languages)
    VALUES (@DoctorId, @UserId, 'MD, PhD', 'Experienced doctor 4.', 1, @DoctorId, @FileId, 1, 'English');
    -- DoctorAvailabilities Table
    INSERT INTO DoctorAvailabilities (DoctorAvailabilityId, DoctorId, AvailableDay, StartTime, EndTime)
    VALUES (NEWID(), @DoctorId, 1, '09:00:00', '17:00:00');
    -- Educations Table
    INSERT INTO Educations (EducationId, DoctorId, Degree, Institution, GraduationDate)
    VALUES (NEWID(), @DoctorId, 'MD', 'State Medical University', '2010-05-12');
    -- Experiences Table
    INSERT INTO Experiences (ExperienceId, DoctorId, Institution, Position, StartDate, EndDate, Description)
    VALUES (NEWID(), @DoctorId, 'City Hospital', 'Resident', '2010-06-01', '2015-06-01', 'Completed residency');
END;
GO

-- Inserting Doctor 5
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Doctor5', 'Smith5', 'doctor5@example.com', '+10000000004', 0, '1980-05-12', '5 Health Ave, Medical City', 2, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @DoctorId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileBaseId UNIQUEIDENTIFIER = NEWID();
    -- Files Table
    INSERT INTO Files (FileId, Id, CreatedAt, UpdatedAt, FileName, MimeType, FileData, Url)
    VALUES (@FileId, @FileBaseId, GETUTCDATE(), GETUTCDATE(), 'cv_doctor5.pdf', 'application/pdf', 0x, NULL);
    -- DoctorPreferences Table
    INSERT INTO DoctorPreferences (DoctorId, OnlineAppointmentFee, InPersonAppointmentFee)
    VALUES (@DoctorId, 90, 140);
    -- Doctors Table
    INSERT INTO Doctors (DoctorId, UserId, Qualifications, Biography, DoctorStatus, DoctorPreferenceId, CvId, IsVerified, Languages)
    VALUES (@DoctorId, @UserId, 'MD, PhD', 'Experienced doctor 5.', 1, @DoctorId, @FileId, 1, 'English');
    -- DoctorAvailabilities Table
    INSERT INTO DoctorAvailabilities (DoctorAvailabilityId, DoctorId, AvailableDay, StartTime, EndTime)
    VALUES (NEWID(), @DoctorId, 1, '09:00:00', '17:00:00');
    -- Educations Table
    INSERT INTO Educations (EducationId, DoctorId, Degree, Institution, GraduationDate)
    VALUES (NEWID(), @DoctorId, 'MD', 'State Medical University', '2010-05-12');
    -- Experiences Table
    INSERT INTO Experiences (ExperienceId, DoctorId, Institution, Position, StartDate, EndDate, Description)
    VALUES (NEWID(), @DoctorId, 'City Hospital', 'Resident', '2010-06-01', '2015-06-01', 'Completed residency');
END;
GO

-- Inserting Doctor 6
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Doctor6', 'Smith6', 'doctor6@example.com', '+10000000005', 1, '1980-05-12', '6 Health Ave, Medical City', 2, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @DoctorId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileBaseId UNIQUEIDENTIFIER = NEWID();
    -- Files Table
    INSERT INTO Files (FileId, Id, CreatedAt, UpdatedAt, FileName, MimeType, FileData, Url)
    VALUES (@FileId, @FileBaseId, GETUTCDATE(), GETUTCDATE(), 'cv_doctor6.pdf', 'application/pdf', 0x, NULL);
    -- DoctorPreferences Table
    INSERT INTO DoctorPreferences (DoctorId, OnlineAppointmentFee, InPersonAppointmentFee)
    VALUES (@DoctorId, 100, 150);
    -- Doctors Table
    INSERT INTO Doctors (DoctorId, UserId, Qualifications, Biography, DoctorStatus, DoctorPreferenceId, CvId, IsVerified, Languages)
    VALUES (@DoctorId, @UserId, 'MD, PhD', 'Experienced doctor 6.', 1, @DoctorId, @FileId, 1, 'English');
    -- DoctorAvailabilities Table
    INSERT INTO DoctorAvailabilities (DoctorAvailabilityId, DoctorId, AvailableDay, StartTime, EndTime)
    VALUES (NEWID(), @DoctorId, 1, '09:00:00', '17:00:00');
    -- Educations Table
    INSERT INTO Educations (EducationId, DoctorId, Degree, Institution, GraduationDate)
    VALUES (NEWID(), @DoctorId, 'MD', 'State Medical University', '2010-05-12');
    -- Experiences Table
    INSERT INTO Experiences (ExperienceId, DoctorId, Institution, Position, StartDate, EndDate, Description)
    VALUES (NEWID(), @DoctorId, 'City Hospital', 'Resident', '2010-06-01', '2015-06-01', 'Completed residency');
END;
GO

-- Inserting Doctor 7
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Doctor7', 'Smith7', 'doctor7@example.com', '+10000000006', 0, '1980-05-12', '7 Health Ave, Medical City', 2, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @DoctorId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileBaseId UNIQUEIDENTIFIER = NEWID();
    -- Files Table
    INSERT INTO Files (FileId, Id, CreatedAt, UpdatedAt, FileName, MimeType, FileData, Url)
    VALUES (@FileId, @FileBaseId, GETUTCDATE(), GETUTCDATE(), 'cv_doctor7.pdf', 'application/pdf', 0x, NULL);
    -- DoctorPreferences Table
    INSERT INTO DoctorPreferences (DoctorId, OnlineAppointmentFee, InPersonAppointmentFee)
    VALUES (@DoctorId, 110, 160);
    -- Doctors Table
    INSERT INTO Doctors (DoctorId, UserId, Qualifications, Biography, DoctorStatus, DoctorPreferenceId, CvId, IsVerified, Languages)
    VALUES (@DoctorId, @UserId, 'MD, PhD', 'Experienced doctor 7.', 1, @DoctorId, @FileId, 1, 'English');
    -- DoctorAvailabilities Table
    INSERT INTO DoctorAvailabilities (DoctorAvailabilityId, DoctorId, AvailableDay, StartTime, EndTime)
    VALUES (NEWID(), @DoctorId, 1, '09:00:00', '17:00:00');
    -- Educations Table
    INSERT INTO Educations (EducationId, DoctorId, Degree, Institution, GraduationDate)
    VALUES (NEWID(), @DoctorId, 'MD', 'State Medical University', '2010-05-12');
    -- Experiences Table
    INSERT INTO Experiences (ExperienceId, DoctorId, Institution, Position, StartDate, EndDate, Description)
    VALUES (NEWID(), @DoctorId, 'City Hospital', 'Resident', '2010-06-01', '2015-06-01', 'Completed residency');
END;
GO

-- Inserting Doctor 8
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Doctor8', 'Smith8', 'doctor8@example.com', '+10000000007', 1, '1980-05-12', '8 Health Ave, Medical City', 2, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @DoctorId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileBaseId UNIQUEIDENTIFIER = NEWID();
    -- Files Table
    INSERT INTO Files (FileId, Id, CreatedAt, UpdatedAt, FileName, MimeType, FileData, Url)
    VALUES (@FileId, @FileBaseId, GETUTCDATE(), GETUTCDATE(), 'cv_doctor8.pdf', 'application/pdf', 0x, NULL);
    -- DoctorPreferences Table
    INSERT INTO DoctorPreferences (DoctorId, OnlineAppointmentFee, InPersonAppointmentFee)
    VALUES (@DoctorId, 120, 170);
    -- Doctors Table
    INSERT INTO Doctors (DoctorId, UserId, Qualifications, Biography, DoctorStatus, DoctorPreferenceId, CvId, IsVerified, Languages)
    VALUES (@DoctorId, @UserId, 'MD, PhD', 'Experienced doctor 8.', 1, @DoctorId, @FileId, 1, 'English');
    -- DoctorAvailabilities Table
    INSERT INTO DoctorAvailabilities (DoctorAvailabilityId, DoctorId, AvailableDay, StartTime, EndTime)
    VALUES (NEWID(), @DoctorId, 1, '09:00:00', '17:00:00');
    -- Educations Table
    INSERT INTO Educations (EducationId, DoctorId, Degree, Institution, GraduationDate)
    VALUES (NEWID(), @DoctorId, 'MD', 'State Medical University', '2010-05-12');
    -- Experiences Table
    INSERT INTO Experiences (ExperienceId, DoctorId, Institution, Position, StartDate, EndDate, Description)
    VALUES (NEWID(), @DoctorId, 'City Hospital', 'Resident', '2010-06-01', '2015-06-01', 'Completed residency');
END;
GO

-- Inserting Doctor 9
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Doctor9', 'Smith9', 'doctor9@example.com', '+10000000008', 0, '1980-05-12', '9 Health Ave, Medical City', 2, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @DoctorId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileBaseId UNIQUEIDENTIFIER = NEWID();
    -- Files Table
    INSERT INTO Files (FileId, Id, CreatedAt, UpdatedAt, FileName, MimeType, FileData, Url)
    VALUES (@FileId, @FileBaseId, GETUTCDATE(), GETUTCDATE(), 'cv_doctor9.pdf', 'application/pdf', 0x, NULL);
    -- DoctorPreferences Table
    INSERT INTO DoctorPreferences (DoctorId, OnlineAppointmentFee, InPersonAppointmentFee)
    VALUES (@DoctorId, 130, 180);
    -- Doctors Table
    INSERT INTO Doctors (DoctorId, UserId, Qualifications, Biography, DoctorStatus, DoctorPreferenceId, CvId, IsVerified, Languages)
    VALUES (@DoctorId, @UserId, 'MD, PhD', 'Experienced doctor 9.', 1, @DoctorId, @FileId, 1, 'English');
    -- DoctorAvailabilities Table
    INSERT INTO DoctorAvailabilities (DoctorAvailabilityId, DoctorId, AvailableDay, StartTime, EndTime)
    VALUES (NEWID(), @DoctorId, 1, '09:00:00', '17:00:00');
    -- Educations Table
    INSERT INTO Educations (EducationId, DoctorId, Degree, Institution, GraduationDate)
    VALUES (NEWID(), @DoctorId, 'MD', 'State Medical University', '2010-05-12');
    -- Experiences Table
    INSERT INTO Experiences (ExperienceId, DoctorId, Institution, Position, StartDate, EndDate, Description)
    VALUES (NEWID(), @DoctorId, 'City Hospital', 'Resident', '2010-06-01', '2015-06-01', 'Completed residency');
END;
GO

-- Inserting Doctor 10
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Doctor10', 'Smith10', 'doctor10@example.com', '+10000000009', 1, '1980-05-12', '10 Health Ave, Medical City', 2, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @DoctorId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileId UNIQUEIDENTIFIER = NEWID();
    DECLARE @FileBaseId UNIQUEIDENTIFIER = NEWID();
    -- Files Table
    INSERT INTO Files (FileId, Id, CreatedAt, UpdatedAt, FileName, MimeType, FileData, Url)
    VALUES (@FileId, @FileBaseId, GETUTCDATE(), GETUTCDATE(), 'cv_doctor10.pdf', 'application/pdf', 0x, NULL);
    -- DoctorPreferences Table
    INSERT INTO DoctorPreferences (DoctorId, OnlineAppointmentFee, InPersonAppointmentFee)
    VALUES (@DoctorId, 140, 190);
    -- Doctors Table
    INSERT INTO Doctors (DoctorId, UserId, Qualifications, Biography, DoctorStatus, DoctorPreferenceId, CvId, IsVerified, Languages)
    VALUES (@DoctorId, @UserId, 'MD, PhD', 'Experienced doctor 10.', 1, @DoctorId, @FileId, 1, 'English');
    -- DoctorAvailabilities Table
    INSERT INTO DoctorAvailabilities (DoctorAvailabilityId, DoctorId, AvailableDay, StartTime, EndTime)
    VALUES (NEWID(), @DoctorId, 1, '09:00:00', '17:00:00');
    -- Educations Table
    INSERT INTO Educations (EducationId, DoctorId, Degree, Institution, GraduationDate)
    VALUES (NEWID(), @DoctorId, 'MD', 'State Medical University', '2010-05-12');
    -- Experiences Table
    INSERT INTO Experiences (ExperienceId, DoctorId, Institution, Position, StartDate, EndDate, Description)
    VALUES (NEWID(), @DoctorId, 'City Hospital', 'Resident', '2010-06-01', '2015-06-01', 'Completed residency');
END;
GO

-- Inserting Patient 11
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Patient1', 'Doe1', 'patient1@example.com', '+20000000000', 1, '1995-10-20', '1 Main St, Hometown', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @PatientId UNIQUEIDENTIFIER = NEWID();
    -- Patients Table
    INSERT INTO Patients (PatientId, UserId, MedicalHistory, EmergencyContactName, EmergencyContactPhone)
    VALUES (@PatientId, @UserId, 'Healthy', 'EmergencyDoe1', '+20000000100');
END;
GO

-- Inserting Patient 12
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Patient2', 'Doe2', 'patient2@example.com', '+20000000001', 0, '1995-10-20', '2 Main St, Hometown', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @PatientId UNIQUEIDENTIFIER = NEWID();
    -- Patients Table
    INSERT INTO Patients (PatientId, UserId, MedicalHistory, EmergencyContactName, EmergencyContactPhone)
    VALUES (@PatientId, @UserId, 'Healthy', 'EmergencyDoe2', '+20000000101');
END;
GO

-- Inserting Patient 13
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Patient3', 'Doe3', 'patient3@example.com', '+20000000002', 1, '1995-10-20', '3 Main St, Hometown', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @PatientId UNIQUEIDENTIFIER = NEWID();
    -- Patients Table
    INSERT INTO Patients (PatientId, UserId, MedicalHistory, EmergencyContactName, EmergencyContactPhone)
    VALUES (@PatientId, @UserId, 'Healthy', 'EmergencyDoe3', '+20000000102');
END;
GO

-- Inserting Patient 14
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Patient4', 'Doe4', 'patient4@example.com', '+20000000003', 0, '1995-10-20', '4 Main St, Hometown', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @PatientId UNIQUEIDENTIFIER = NEWID();
    -- Patients Table
    INSERT INTO Patients (PatientId, UserId, MedicalHistory, EmergencyContactName, EmergencyContactPhone)
    VALUES (@PatientId, @UserId, 'Healthy', 'EmergencyDoe4', '+20000000103');
END;
GO

-- Inserting Patient 15
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Patient5', 'Doe5', 'patient5@example.com', '+20000000004', 1, '1995-10-20', '5 Main St, Hometown', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @PatientId UNIQUEIDENTIFIER = NEWID();
    -- Patients Table
    INSERT INTO Patients (PatientId, UserId, MedicalHistory, EmergencyContactName, EmergencyContactPhone)
    VALUES (@PatientId, @UserId, 'Healthy', 'EmergencyDoe5', '+20000000104');
END;
GO

-- Inserting Patient 16
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Patient6', 'Doe6', 'patient6@example.com', '+20000000005', 0, '1995-10-20', '6 Main St, Hometown', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @PatientId UNIQUEIDENTIFIER = NEWID();
    -- Patients Table
    INSERT INTO Patients (PatientId, UserId, MedicalHistory, EmergencyContactName, EmergencyContactPhone)
    VALUES (@PatientId, @UserId, 'Healthy', 'EmergencyDoe6', '+20000000105');
END;
GO

-- Inserting Patient 17
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Patient7', 'Doe7', 'patient7@example.com', '+20000000006', 1, '1995-10-20', '7 Main St, Hometown', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @PatientId UNIQUEIDENTIFIER = NEWID();
    -- Patients Table
    INSERT INTO Patients (PatientId, UserId, MedicalHistory, EmergencyContactName, EmergencyContactPhone)
    VALUES (@PatientId, @UserId, 'Healthy', 'EmergencyDoe7', '+20000000106');
END;
GO

-- Inserting Patient 18
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Patient8', 'Doe8', 'patient8@example.com', '+20000000007', 0, '1995-10-20', '8 Main St, Hometown', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @PatientId UNIQUEIDENTIFIER = NEWID();
    -- Patients Table
    INSERT INTO Patients (PatientId, UserId, MedicalHistory, EmergencyContactName, EmergencyContactPhone)
    VALUES (@PatientId, @UserId, 'Healthy', 'EmergencyDoe8', '+20000000107');
END;
GO

-- Inserting Patient 19
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Patient9', 'Doe9', 'patient9@example.com', '+20000000008', 1, '1995-10-20', '9 Main St, Hometown', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @PatientId UNIQUEIDENTIFIER = NEWID();
    -- Patients Table
    INSERT INTO Patients (PatientId, UserId, MedicalHistory, EmergencyContactName, EmergencyContactPhone)
    VALUES (@PatientId, @UserId, 'Healthy', 'EmergencyDoe9', '+20000000108');
END;
GO

-- Inserting Patient 20
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Patient10', 'Doe10', 'patient10@example.com', '+20000000009', 0, '1995-10-20', '10 Main St, Hometown', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @PatientId UNIQUEIDENTIFIER = NEWID();
    -- Patients Table
    INSERT INTO Patients (PatientId, UserId, MedicalHistory, EmergencyContactName, EmergencyContactPhone)
    VALUES (@PatientId, @UserId, 'Healthy', 'EmergencyDoe10', '+20000000109');
END;
GO

-- Inserting Admin 21
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Admin1', 'Super1', 'admin1@example.com', '+30000000000', 2, '1988-03-15', '1 Admin Blvd, Tech City', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    -- Admins Table
    INSERT INTO Admins (AdminId, UserId)
    VALUES (@AdminId, @UserId);
END;
GO

-- Inserting Admin 22
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Admin2', 'Super2', 'admin2@example.com', '+30000000001', 2, '1988-03-15', '2 Admin Blvd, Tech City', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    -- Admins Table
    INSERT INTO Admins (AdminId, UserId)
    VALUES (@AdminId, @UserId);
END;
GO

-- Inserting Admin 23
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Admin3', 'Super3', 'admin3@example.com', '+30000000002', 2, '1988-03-15', '3 Admin Blvd, Tech City', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    -- Admins Table
    INSERT INTO Admins (AdminId, UserId)
    VALUES (@AdminId, @UserId);
END;
GO

-- Inserting Admin 24
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Admin4', 'Super4', 'admin4@example.com', '+30000000003', 2, '1988-03-15', '4 Admin Blvd, Tech City', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    -- Admins Table
    INSERT INTO Admins (AdminId, UserId)
    VALUES (@AdminId, @UserId);
END;
GO

-- Inserting Admin 25
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Admin5', 'Super5', 'admin5@example.com', '+30000000004', 2, '1988-03-15', '5 Admin Blvd, Tech City', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    -- Admins Table
    INSERT INTO Admins (AdminId, UserId)
    VALUES (@AdminId, @UserId);
END;
GO

-- Inserting Admin 26
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Admin6', 'Super6', 'admin6@example.com', '+30000000005', 2, '1988-03-15', '6 Admin Blvd, Tech City', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    -- Admins Table
    INSERT INTO Admins (AdminId, UserId)
    VALUES (@AdminId, @UserId);
END;
GO

-- Inserting Admin 27
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Admin7', 'Super7', 'admin7@example.com', '+30000000006', 2, '1988-03-15', '7 Admin Blvd, Tech City', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    -- Admins Table
    INSERT INTO Admins (AdminId, UserId)
    VALUES (@AdminId, @UserId);
END;
GO

-- Inserting Admin 28
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Admin8', 'Super8', 'admin8@example.com', '+30000000007', 2, '1988-03-15', '8 Admin Blvd, Tech City', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    -- Admins Table
    INSERT INTO Admins (AdminId, UserId)
    VALUES (@AdminId, @UserId);
END;
GO

-- Inserting Admin 29
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Admin9', 'Super9', 'admin9@example.com', '+30000000008', 2, '1988-03-15', '9 Admin Blvd, Tech City', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    -- Admins Table
    INSERT INTO Admins (AdminId, UserId)
    VALUES (@AdminId, @UserId);
END;
GO

-- Inserting Admin 30
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();
    -- Users Table
    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)
    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), 'Admin10', 'Super10', 'admin10@example.com', '+30000000009', 2, '1988-03-15', '10 Admin Blvd, Tech City', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL);

    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    -- Admins Table
    INSERT INTO Admins (AdminId, UserId)
    VALUES (@AdminId, @UserId);
END;
GO
