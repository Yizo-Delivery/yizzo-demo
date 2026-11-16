import type { Story, StoryId, Trip } from './types';

// Every person, number and message here is invented for the demo.

export const DIASPORA: Story = {
  id: 'diaspora',
  title: 'Diaspora: Washington → Addis',
  subtitle: "A traveler flying home carries Selam's package to her mother in Addis.",
  currency: 'USD',
  sender: {
    id: 'selam',
    name: 'Selam Tesfaye',
    city: 'Washington, DC',
    email: 'selam@example.com',
    phoneMasked: '+251 9•• ••• 12',
  },
  phoneCode: '482913',
  packageDraft: {
    items: [
      { category: 'Electronics', description: 'Laptop', weightKg: 2.2 },
      { category: 'Other', description: 'Medicine', weightKg: 0.8 },
    ],
    origin: 'Washington, DC',
    destination: 'Addis Ababa',
    preferredDeparture: '2026-12-04',
    preferredArrival: '2026-12-05',
    reward: 60,
  },
  travelers: [
    {
      id: 'dawit',
      name: 'Dawit Bekele',
      city: 'Washington, DC',
      rating: 4.9,
      trips: 23,
      spareKg: 8,
      departure: '2026-12-04',
      arrival: '2026-12-05',
      dateDiffDays: 0,
    },
    {
      id: 'hirut',
      name: 'Hirut Alemu',
      city: 'Silver Spring, MD',
      rating: 4.6,
      trips: 9,
      spareKg: 5,
      departure: '2026-12-05',
      arrival: '2026-12-06',
      dateDiffDays: 1,
    },
    {
      id: 'yonas',
      name: 'Yonas Girma',
      city: 'Alexandria, VA',
      rating: 4.2,
      trips: 4,
      spareKg: 3.5,
      departure: '2026-12-07',
      arrival: '2026-12-08',
      dateDiffDays: 3,
    },
  ],
  travelerTrips: [
    {
      origin: 'Washington, DC',
      destination: 'Addis Ababa',
      departure: '2026-12-04',
      arrival: '2026-12-05',
      capacityKg: 10,
    },
  ],
  seededMessages: [
    // No dates or names of a particular trip: any traveler the offer goes to can say these
    { id: 'seed-1', from: 'traveler', text: 'Hi Selam! Happy to carry this for you.', at: '2026-11-28T15:02:00Z' },
    {
      id: 'seed-2',
      from: 'sender',
      text: 'Great. My mom can meet you near Bole when you land.',
      at: '2026-11-28T15:10:00Z',
    },
  ],
  cannedReply: "Sure, Bole works. I'll message when I land.",
};

export const DOMESTIC: Story = {
  id: 'domestic',
  title: 'Domestic: Addis → Hawassa',
  subtitle: "A traveler driving south carries Meron's package to her sister in Hawassa.",
  currency: 'ETB',
  sender: {
    id: 'meron',
    name: 'Meron Haile',
    city: 'Addis Ababa',
    email: 'meron@example.com',
    phoneMasked: '+251 9•• ••• 47',
  },
  phoneCode: '482913',
  packageDraft: {
    items: [
      { category: 'Documents', description: 'Contracts', weightKg: 0.5 },
      { category: 'Clothing', description: 'Dresses', weightKg: 1.5 },
    ],
    origin: 'Addis Ababa',
    destination: 'Hawassa',
    preferredDeparture: '2026-12-06',
    preferredArrival: '2026-12-06',
    reward: 600,
  },
  travelers: [
    {
      id: 'abebe',
      name: 'Abebe Tadesse',
      city: 'Addis Ababa',
      rating: 4.8,
      trips: 31,
      spareKg: 10,
      departure: '2026-12-06',
      arrival: '2026-12-06',
      dateDiffDays: 0,
    },
    {
      id: 'tigist',
      name: 'Tigist Mengistu',
      city: 'Addis Ababa',
      rating: 4.5,
      trips: 12,
      spareKg: 6,
      departure: '2026-12-07',
      arrival: '2026-12-07',
      dateDiffDays: 1,
    },
    {
      id: 'samuel',
      name: 'Samuel Kebede',
      city: 'Adama',
      rating: 4.1,
      trips: 5,
      spareKg: 4,
      departure: '2026-12-08',
      arrival: '2026-12-08',
      dateDiffDays: 2,
    },
  ],
  travelerTrips: [
    {
      origin: 'Addis Ababa',
      destination: 'Hawassa',
      departure: '2026-12-06',
      arrival: '2026-12-06',
      capacityKg: 12,
    },
  ],
  seededMessages: [
    {
      id: 'seed-1',
      from: 'traveler',
      text: 'Hi Meron! Happy to take this down to Hawassa.',
      at: '2026-11-30T07:40:00Z',
    },
    {
      id: 'seed-2',
      from: 'sender',
      text: 'Perfect. My sister can meet you at Piassa in Hawassa.',
      at: '2026-11-30T07:52:00Z',
    },
  ],
  cannedReply: "Great, I'll call her when I arrive.",
};

const STORIES: Record<StoryId, Story> = { diaspora: DIASPORA, domestic: DOMESTIC };

/**
 * The trips the traveler view shows for one traveler: the best match's are
 * written out above; anyone else's is their one trip on the package's route.
 */
export function tripsFor(story: Story, travelerId: string): Trip[] {
  const traveler = story.travelers.find((t) => t.id === travelerId);
  if (traveler === undefined || traveler.id === story.travelers[0].id) return [...story.travelerTrips];
  return [
    {
      origin: story.packageDraft.origin,
      destination: story.packageDraft.destination,
      departure: traveler.departure,
      arrival: traveler.arrival,
      capacityKg: traveler.spareKg,
    },
  ];
}

export function getStory(id: StoryId): Story {
  return STORIES[id];
}
