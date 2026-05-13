const fs = require('fs');

const generateData = () => {
    const base64CV = "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQo+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDEyNSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDQKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjE3OAolJUVPRgo=";

    const doctors = Array.from({ length: 10 }).map((_, i) => ({
        firstName: `Doctor${i + 1}`,
        lastName: `Smith${i + 1}`,
        email: `doctor${i + 1}@example.com`,
        password: `Password123!`,
        phone: `+100000000${i.toString().padStart(2, '0')}`,
        gender: i % 2 === 0 ? "Male" : "Female",
        dateOfBirth: "1980-05-12",
        address: `${i + 1} Health Ave, Medical City`,
        role: "Doctor",
        medicalHistory: "None",
        emergencyContactName: `Relative${i + 1}`,
        emergencyContactPhone: `+100000001${i.toString().padStart(2, '0')}`,
        specialties: ["Cardiology", "Neurology"],
        availabilities: [
            {
                availableDay: "Monday",
                startTime: "09:00:00",
                endTime: "17:00:00"
            }
        ],
        qualifications: "MD, PhD",
        biography: `Experienced doctor ${i + 1}.`,
        doctorStatus: 1,
        cv: {
            mimeType: "application/pdf",
            fileDataBase64: base64CV,
            fileName: `cv_doctor${i + 1}.pdf`
        },
        onlineAppointmentFee: 50 + (i * 10),
        inPersonAppointmentFee: 100 + (i * 10),
        education: [
            {
                degree: "MD",
                institution: "State Medical University",
                graduationDate: "2010-05-12"
            }
        ],
        experience: [
            {
                institution: "City Hospital",
                position: "Resident",
                startDate: "2010-06-01",
                endDate: "2015-06-01",
                description: "Completed residency"
            }
        ]
    }));

    const patients = Array.from({ length: 10 }).map((_, i) => ({
        firstName: `Patient${i + 1}`,
        lastName: `Doe${i + 1}`,
        email: `patient${i + 1}@example.com`,
        password: `Password123!`,
        phone: `+200000000${i.toString().padStart(2, '0')}`,
        gender: i % 2 === 0 ? "Female" : "Male",
        dateOfBirth: "1995-10-20",
        address: `${i + 1} Main St, Hometown`,
        role: "Patient",
        medicalHistory: "Healthy",
        emergencyContactName: `EmergencyDoe${i + 1}`,
        emergencyContactPhone: `+200000001${i.toString().padStart(2, '0')}`,
        specialties: [],
        availabilities: [],
        qualifications: "",
        biography: "",
        doctorStatus: 0,
        cv: null,
        onlineAppointmentFee: 0,
        inPersonAppointmentFee: 0,
        education: [],
        experience: []
    }));

    const admins = Array.from({ length: 10 }).map((_, i) => ({
        firstName: `Admin${i + 1}`,
        lastName: `Super${i + 1}`,
        email: `admin${i + 1}@example.com`,
        password: `Password123!`,
        phone: `+300000000${i.toString().padStart(2, '0')}`,
        gender: "Other",
        dateOfBirth: "1988-03-15",
        address: `${i + 1} Admin Blvd, Tech City`,
        role: "Admin",
        medicalHistory: "None",
        emergencyContactName: `AdminBackup${i + 1}`,
        emergencyContactPhone: `+300000001${i.toString().padStart(2, '0')}`,
        specialties: [],
        availabilities: [],
        qualifications: "",
        biography: "",
        doctorStatus: 0,
        cv: null,
        onlineAppointmentFee: 0,
        inPersonAppointmentFee: 0,
        education: [],
        experience: []
    }));

    const allData = [...doctors, ...patients, ...admins];
    fs.writeFileSync('mock_users.json', JSON.stringify(allData, null, 2));
    console.log('Successfully generated mock_users.json with 22 users.');
};

generateData();
