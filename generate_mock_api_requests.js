const fs = require('fs');

const usersResponse = {
    "data": [
        {
            "patientId": "a5f02243-7d65-4eb7-0ce6-08deb0758ed9",
            "userId": "03774116-678e-4d6c-9911-0c6fd4f2f6d6",
            "firstName": "Patient4",
            "role": "Patient"
        },
        {
            "doctorId": "79c82171-c750-47d5-aedc-add43f646c3b",
            "userId": "cefb9696-6526-490d-98fb-1172418e7029",
            "firstName": "Doctor4",
            "role": "Doctor"
        },
        {
            "doctorId": "0e4caad2-3286-4eb6-b08e-ea03013c7e84",
            "userId": "b7bbf1d3-a8e3-422c-959f-16d5e6477616",
            "firstName": "Doctor1",
            "role": "Doctor"
        },
        {
            "doctorId": "5064006d-840a-4bd8-b0fc-96a5193e6c04",
            "userId": "eee3fd0b-ebc7-4a27-8868-2a0e6df44e3a",
            "firstName": "Doctor3",
            "role": "Doctor"
        },
        {
            "patientId": "49edfe7b-c31e-4397-0ceb-08deb0758ed9",
            "userId": "aca7804e-aae8-4c1d-aafc-35506e0da94a",
            "firstName": "Patient9",
            "role": "Patient"
        },
        {
            "patientId": "08780d5f-170f-4b90-0ce7-08deb0758ed9",
            "userId": "b45d4cbb-cdbc-416f-a7b7-385b8d7f4eff",
            "firstName": "Patient5",
            "role": "Patient"
        },
        {
            "doctorId": "baba70c8-8725-45d2-b09e-2480b1e67812",
            "userId": "a74ca6ca-c18a-4c7f-9b63-3a59a9bf5e71",
            "firstName": "Doctor6",
            "role": "Doctor"
        },
        {
            "patientId": "0e304274-3320-4d1e-0cec-08deb0758ed9",
            "userId": "9233ed4c-0e75-487c-8c2f-4ba160396b3f",
            "firstName": "Patient10",
            "role": "Patient"
        },
        {
            "patientId": "c536db66-5102-44c1-0ce4-08deb0758ed9",
            "userId": "53fb65f7-64df-464d-a04e-58076250ab76",
            "firstName": "Patient2",
            "role": "Patient"
        },
        {
            "doctorId": "e3d85cd2-2ea1-4698-bd60-1e2cf25fc95f",
            "userId": "f77bec76-78f5-41dd-81db-638ef45b2d35",
            "firstName": "Doctor8",
            "role": "Doctor"
        },
        {
            "doctorId": "858035dd-0f63-4241-abcc-daccf8ec57a8",
            "userId": "1f818d7e-2e41-4695-9518-8e35dde2261f",
            "firstName": "Doctor2",
            "role": "Doctor"
        },
        {
            "doctorId": "acf9f3e5-7fb7-4050-bd3f-cff7e6458547",
            "userId": "dfaf3f61-ba6e-4396-be02-a84624d0ab78",
            "firstName": "Doctor5",
            "role": "Doctor"
        },
        {
            "doctorId": "1e8d517d-e7ed-4efa-818a-e86054a50332",
            "userId": "ecb92e9c-7fef-4715-be73-ba40ce8d5506",
            "firstName": "Doctor10",
            "role": "Doctor"
        },
        {
            "userId": "0be141a6-c58a-44da-bbe5-d2b890262aee",
            "firstName": "Admin5",
            "role": "Admin"
        },
        {
            "userId": "70043e0c-72fa-4fa3-be4a-d640f3532191",
            "firstName": "Admin6",
            "role": "Admin"
        },
        {
            "doctorId": "8d6543c3-1f71-482d-9248-e4e2998f8ed5",
            "userId": "126c51aa-f8df-4f01-bc76-e12338c098dd",
            "firstName": "Doctor9",
            "role": "Doctor"
        },
        {
            "patientId": "0ed889df-3708-4cde-0ce8-08deb0758ed9",
            "userId": "43fcc33f-a672-4999-8cbe-e4525b0605ad",
            "firstName": "Patient6",
            "role": "Patient"
        },
        {
            "patientId": "ce98f8c7-8ae4-4a0a-0cea-08deb0758ed9",
            "userId": "31e82133-af1b-4032-8a57-e4a7525eb7f2",
            "firstName": "Patient8",
            "role": "Patient"
        },
        {
            "patientId": "b8df9328-264d-4fdd-0ce5-08deb0758ed9",
            "userId": "85e300b8-d520-4617-865f-f221a4c408d8",
            "firstName": "Patient3",
            "role": "Patient"
        },
        {
            "patientId": "127c2166-cb2a-4698-0ce9-08deb0758ed9",
            "userId": "bf2483da-1d4c-47d6-ab45-f24df7c7a701",
            "firstName": "Patient7",
            "role": "Patient"
        },
        {
            "doctorId": "d1d167a5-ae78-4d24-acb5-cd885da07df8",
            "userId": "77aaf3e9-2c53-4050-9a06-fc108e8f4f45",
            "firstName": "Doctor7",
            "role": "Doctor"
        },
        {
            "patientId": "27ae8a64-3b83-4dd4-0ce3-08deb0758ed9",
            "userId": "b44be8f6-2d52-4d77-9e1c-fe88f8404686",
            "firstName": "Patient1",
            "role": "Patient"
        }
    ]
};

const users = usersResponse.data;
const doctors = users.filter(u => u.role === 'Doctor');
const patients = users.filter(u => u.role === 'Patient');
const admins = users.filter(u => u.role === 'Admin');

const getRandomGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const mockApis = {
    "appointments": Array.from({ length: 10 }).map((_, i) => ({
        doctorId: doctors[i % doctors.length].doctorId,
        patientId: patients[i % patients.length].patientId,
        appointmentDate: `2026-06-${(10 + i).toString()}`,
        appointmentTime: `10:30`,
        appointmentType: i % 2 === 0 ? "Online" : "In-Person"
    })),
    "reviews": Array.from({ length: 10 }).map((_, i) => ({
        doctorId: doctors[i % doctors.length].doctorId,
        patientId: patients[i % patients.length].patientId,
        starRating: 4 + (i % 2),
        reviewText: "This is a comprehensive review for the doctor highlighting their expertise. ".repeat(2)
    })),
    "blogs": Array.from({ length: 10 }).map((_, i) => ({
        authorId: (i % 2 === 0 ? doctors[i % doctors.length].userId : admins[i % admins.length].userId),
        title: `Health and Wellness Guide Vol ${i + 1}`,
        content: "Maintaining proper health requires diligent action and persistent habit forming routines. This is a highly detailed post meant to fulfill the length requirement of the blog content field which must exceed one hundred characters consistently. Make sure to drink water.",
        tags: ["Health", "Lifestyle", "Tips"]
    })),
    "messages": Array.from({ length: 10 }).map((_, i) => ({
        conversationId: getRandomGuid(),
        senderId: patients[i % patients.length].userId,
        targetUserId: doctors[i % doctors.length].userId,
        messageText: `Hello Doctor, this is patient message number ${i + 1}. I need help with my scheduling.`,
        type: 0
    })),
    "blogComments": Array.from({ length: 10 }).map((_, i) => ({
        blogId: getRandomGuid(),
        senderId: patients[i % patients.length].userId,
        commentText: `Great post! Very helpful advice for my current condition. (Comment ${i + 1})`
    })),
    "prescriptions": Array.from({ length: 10 }).map((_, i) => ({
        conversationId: getRandomGuid(),
        senderId: doctors[i % doctors.length].userId,
        targetUserId: patients[i % patients.length].userId,
        type: 3,
        prescriptionDetails: {
            medication: `Amoxicillin ${i * 10}mg`,
            dosage: "2 pills",
            frequency: "Twice daily",
            duration: "10 days"
        }
    }))
};

fs.writeFileSync('mock_api_endpoints.json', JSON.stringify(mockApis, null, 2));
console.log('Generated endpoint mocks successfully');
