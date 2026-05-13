const fs = require('fs');

const data = JSON.parse(fs.readFileSync('mock_users.json', 'utf8'));

let sql = `-- Mock Data SQL Script for Med-Connect\n`;
sql += `USE [MedConnectDB]; -- Adjust if actual database name is different\nGO\n\n`;

const getGender = (gender) => {
    if (gender === 'Male') return 0;
    if (gender === 'Female') return 1;
    return 2; // Other/Non-binary
};

const getRole = (role) => {
    if (role === 'Admin') return 0;
    if (role === 'Patient') return 1;
    if (role === 'Doctor') return 2;
    return 1;
};

const getDayOfWeek = (day) => {
    const days = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    return days[day] || 1;
};

data.forEach((user, index) => {
    sql += `\n-- Inserting ${user.role} ${index + 1}\n`;
    sql += `BEGIN\n`;
    sql += `    DECLARE @UserId UNIQUEIDENTIFIER = NEWID();\n`;
    sql += `    DECLARE @BaseId UNIQUEIDENTIFIER = NEWID();\n`;

    const genderVal = getGender(user.gender);
    const roleVal = getRole(user.role);

    sql += `    -- Users Table\n`;
    sql += `    INSERT INTO Users (UserId, Id, CreatedAt, UpdatedAt, FirstName, LastName, Email, Phone, Gender, DateOfBirth, Address, Role, IsEmailVerified, Auth0Id, Auth0AccessToken, Auth0RefreshToken, Otp, ProfilePicture, LastLogin)\n`;
    sql += `    VALUES (@UserId, @BaseId, GETUTCDATE(), GETUTCDATE(), '${user.firstName}', '${user.lastName}', '${user.email}', '${user.phone}', ${genderVal}, '${user.dateOfBirth}', '${user.address}', ${roleVal}, 1, NULL, NULL, NULL, NULL, NULL, NULL);\n`;

    if (user.role === 'Doctor') {
        sql += `\n    DECLARE @DoctorId UNIQUEIDENTIFIER = NEWID();\n`;
        sql += `    DECLARE @FileId UNIQUEIDENTIFIER = NEWID();\n`;
        sql += `    DECLARE @FileBaseId UNIQUEIDENTIFIER = NEWID();\n`;

        sql += `    -- Files Table\n`;
        sql += `    INSERT INTO Files (FileId, Id, CreatedAt, UpdatedAt, FileName, MimeType, FileData, Url)\n`;
        sql += `    VALUES (@FileId, @FileBaseId, GETUTCDATE(), GETUTCDATE(), '${user.cv.fileName}', '${user.cv.mimeType}', 0x, NULL);\n`;

        sql += `    -- DoctorPreferences Table\n`;
        sql += `    INSERT INTO DoctorPreferences (DoctorId, OnlineAppointmentFee, InPersonAppointmentFee)\n`;
        sql += `    VALUES (@DoctorId, ${user.onlineAppointmentFee}, ${user.inPersonAppointmentFee});\n`;

        sql += `    -- Doctors Table\n`;
        sql += `    INSERT INTO Doctors (DoctorId, UserId, Qualifications, Biography, DoctorStatus, DoctorPreferenceId, CvId, IsVerified, Languages)\n`;
        sql += `    VALUES (@DoctorId, @UserId, '${user.qualifications}', '${user.biography}', ${user.doctorStatus}, @DoctorId, @FileId, 1, 'English');\n`;

        if (user.availabilities) {
            user.availabilities.forEach(av => {
                sql += `    -- DoctorAvailabilities Table\n`;
                sql += `    INSERT INTO DoctorAvailabilities (DoctorAvailabilityId, DoctorId, AvailableDay, StartTime, EndTime)\n`;
                sql += `    VALUES (NEWID(), @DoctorId, ${getDayOfWeek(av.availableDay)}, '${av.startTime}', '${av.endTime}');\n`;
            });
        }

        if (user.education) {
            user.education.forEach(ed => {
                sql += `    -- Educations Table\n`;
                sql += `    INSERT INTO Educations (EducationId, DoctorId, Degree, Institution, GraduationDate)\n`;
                sql += `    VALUES (NEWID(), @DoctorId, '${ed.degree}', '${ed.institution}', '${ed.graduationDate}');\n`;
            });
        }

        if (user.experience) {
            user.experience.forEach(ex => {
                sql += `    -- Experiences Table\n`;
                sql += `    INSERT INTO Experiences (ExperienceId, DoctorId, Institution, Position, StartDate, EndDate, Description)\n`;
                sql += `    VALUES (NEWID(), @DoctorId, '${ex.institution}', '${ex.position}', '${ex.startDate}', '${ex.endDate}', '${ex.description}');\n`;
            });
        }
    } else if (user.role === 'Patient') {
        sql += `\n    DECLARE @PatientId UNIQUEIDENTIFIER = NEWID();\n`;
        sql += `    -- Patients Table\n`;
        sql += `    INSERT INTO Patients (PatientId, UserId, MedicalHistory, EmergencyContactName, EmergencyContactPhone)\n`;
        sql += `    VALUES (@PatientId, @UserId, '${user.medicalHistory}', '${user.emergencyContactName}', '${user.emergencyContactPhone}');\n`;
    } else if (user.role === 'Admin') {
        sql += `\n    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();\n`;
        sql += `    -- Admins Table\n`;
        sql += `    INSERT INTO Admins (AdminId, UserId)\n`;
        sql += `    VALUES (@AdminId, @UserId);\n`;
    }

    sql += `END;\nGO\n`;
});

fs.writeFileSync('mock_users.sql', sql);
console.log('Successfully generated mock_users.sql');
