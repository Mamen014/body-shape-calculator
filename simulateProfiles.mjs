// simulateProfiles.js
import axios from 'axios';
import { faker } from '@faker-js/faker';


async function simulateFormSubmissions(count = 20) {
  for (let i = 0; i < count; i++) {
    const payload = {
      fullName: faker.person.fullName(),
      birthdate: faker.date.birthdate({ mode: 'year', min: 1960, max: 2005 })
        .toISOString()
        .split('T')[0],
      location: faker.location.city(),
      phone: faker.phone.number('+62 8##########'),
      userId: faker.string.uuid(),
      userEmail: faker.internet.email(),
    };

    try {
      // Manual validation
      if (
        !payload.userId ||
        !payload.fullName ||
        !payload.birthdate ||
        !payload.location ||
        !payload.phone
      ) {
        throw new Error('Missing required fields');
      }

      const res = await axios.post('http://localhost:3000/api/profile', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log(`✅ Created: ${payload.fullName}`);
    } catch (error) {
      console.error('❌ Error creating profile:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
    }
  }
}

simulateFormSubmissions(30);
