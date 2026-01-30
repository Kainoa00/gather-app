import { CareCircleMember, CalendarEvent, Vault, Incident, FeedPost, FamilyGift } from '@/types'

export const demoMembers: CareCircleMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '(555) 123-4567',
    role: 'admin',
    joinedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    phone: '(555) 234-5678',
    role: 'team',
    joinedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily@example.com',
    phone: '(555) 345-6789',
    role: 'team',
    joinedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'Robert Johnson Sr.',
    email: 'robert@example.com',
    role: 'viewer',
    joinedAt: new Date('2024-02-10'),
  },
]

const today = new Date()
const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
const inTwoDays = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
const inFourDays = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000)

export const demoEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Cardiology Checkup',
    description: 'Regular heart checkup with Dr. Williams',
    type: 'doctor_visit',
    date: inTwoDays,
    time: '10:00 AM',
    location: 'Heart Care Center, 123 Medical Dr',
    claimedBy: '1',
    claimedByName: 'Sarah',
    createdBy: '1',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Pick up Prescriptions',
    description: 'Monthly medication refill at CVS',
    type: 'medication_refill',
    date: inFourDays,
    time: '2:00 PM',
    location: 'CVS Pharmacy, 456 Main St',
    createdBy: '1',
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'Senior Center Bingo',
    description: 'Weekly bingo game with friends',
    type: 'social_activity',
    date: nextWeek,
    time: '1:00 PM',
    location: 'Sunrise Senior Center',
    claimedBy: '2',
    claimedByName: 'Michael',
    createdBy: '1',
    createdAt: new Date(),
  },
  {
    id: '4',
    title: 'Family Dinner',
    description: 'Monthly family get-together',
    type: 'family_visit',
    date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
    time: '5:00 PM',
    location: "Mom's House",
    createdBy: '1',
    createdAt: new Date(),
  },
]

export const demoVault: Vault = {
  insuranceCards: [
    {
      id: '1',
      name: 'Medicare Part A & B',
      memberId: '1EG4-TE5-MK72',
      groupNumber: 'N/A',
      notes: 'Primary insurance',
    },
    {
      id: '2',
      name: 'AARP Supplemental',
      memberId: 'SUP-789456123',
      groupNumber: 'AARP-2024',
      notes: 'Secondary coverage',
    },
  ],
  medications: [
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily, morning',
      prescribedBy: 'Dr. Williams',
      notes: 'For blood pressure',
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily with meals',
      prescribedBy: 'Dr. Chen',
      notes: 'For diabetes management',
    },
    {
      id: '3',
      name: 'Vitamin D3',
      dosage: '2000 IU',
      frequency: 'Once daily',
      notes: 'Supplement',
    },
  ],
  providers: [
    {
      id: '1',
      name: 'Dr. James Williams',
      specialty: 'Cardiologist',
      phone: '(555) 111-2222',
      address: 'Heart Care Center, 123 Medical Dr',
    },
    {
      id: '2',
      name: 'Dr. Lisa Chen',
      specialty: 'Primary Care',
      phone: '(555) 333-4444',
      address: 'Family Health Clinic, 789 Oak Ave',
    },
    {
      id: '3',
      name: 'Dr. Michael Brown',
      specialty: 'Endocrinologist',
      phone: '(555) 555-6666',
      address: 'Diabetes Center, 321 Pine St',
    },
  ],
  accessCodes: [
    {
      id: '1',
      label: 'Home WiFi',
      code: 'FamilyHome2024',
      type: 'wifi',
    },
    {
      id: '2',
      label: 'Front Door',
      code: '4589#',
      type: 'door',
    },
    {
      id: '3',
      label: 'Garage Door',
      code: '1234',
      type: 'door',
    },
    {
      id: '4',
      label: 'Alarm System',
      code: '7890*',
      type: 'alarm',
    },
  ],
}

export const demoIncidents: Incident[] = [
  {
    id: '1',
    title: 'Minor fall in bathroom',
    description: 'Mom slipped getting out of the tub. No visible bruises but she said her hip is a bit sore. Installed new grab bar today.',
    severity: 'warning',
    reportedBy: '1',
    reportedByName: 'Sarah',
    createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
    tags: ['fall', 'bathroom', 'safety'],
  },
  {
    id: '2',
    title: 'Blood pressure reading high',
    description: 'Morning BP was 158/92. Dr. Williams said to monitor for a few days. If it stays elevated, call the office.',
    severity: 'warning',
    reportedBy: '2',
    reportedByName: 'Michael',
    createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
    tags: ['blood pressure', 'monitoring'],
  },
  {
    id: '3',
    title: 'Good appetite today',
    description: 'Mom ate a full breakfast and lunch today. Seems to be in good spirits.',
    severity: 'info',
    reportedBy: '3',
    reportedByName: 'Emily',
    createdAt: new Date(today.getTime() - 0.5 * 24 * 60 * 60 * 1000),
    tags: ['nutrition', 'positive'],
  },
  {
    id: '4',
    title: 'Medication dosage change',
    description: 'Dr. Chen increased Metformin to 750mg twice daily. New prescription filled. Old bottles removed to avoid confusion.',
    severity: 'urgent',
    reportedBy: '1',
    reportedByName: 'Sarah',
    createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
    tags: ['medication', 'dosage change'],
  },
]

// Demo Feed Posts
export const demoPosts: FeedPost[] = [
  {
    id: '1',
    authorId: '1',
    authorName: 'Sarah Johnson',
    authorInitials: 'SJ',
    content: 'Mom enjoying her garden this morning! She spent two hours with her roses and came back glowing. These little moments mean everything. 🌹',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop' }
    ],
    location: "Mom's Garden",
    likes: ['2', '3', '4'],
    comments: [
      {
        id: 'c1',
        authorId: '2',
        authorName: 'Michael Johnson',
        content: 'She looks so happy! Love seeing her outside.',
        createdAt: new Date(today.getTime() - 1 * 60 * 60 * 1000)
      },
      {
        id: 'c2',
        authorId: '3',
        authorName: 'Emily Davis',
        content: 'Those roses are beautiful! 💕',
        createdAt: new Date(today.getTime() - 0.5 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    authorId: '2',
    authorName: 'Michael Johnson',
    authorInitials: 'MJ',
    content: 'Dad telling his famous fishing story again at dinner. Never gets old! 😂🎣 The one that got away keeps getting bigger every year...',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1545450660-3378a7f3a364?w=800&h=800&fit=crop' }
    ],
    likes: ['1', '3', '4'],
    comments: [
      {
        id: 'c3',
        authorId: '1',
        authorName: 'Sarah Johnson',
        content: 'That fish is now the size of a whale according to him! 😂',
        createdAt: new Date(today.getTime() - 20 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    authorId: '3',
    authorName: 'Emily Davis',
    authorInitials: 'ED',
    content: 'Sunday brunch with Mom & Dad! So grateful for these moments together. The pancakes were a hit! 🥞',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&h=800&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=800&fit=crop' }
    ],
    location: 'The Sunrise Cafe',
    taggedMembers: ['4'],
    likes: ['1', '2'],
    comments: [],
    createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    authorId: '1',
    authorName: 'Sarah Johnson',
    authorInitials: 'SJ',
    content: "Exciting news! I got us tickets to the Jazz game! 🏀 Can't wait to take Dad to his first game in years!",
    likes: ['2', '3', '4'],
    comments: [
      {
        id: 'c4',
        authorId: '2',
        authorName: 'Michael Johnson',
        content: "This is amazing! Dad is going to love it!",
        createdAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
    isPinned: true,
    linkedGiftId: 'g1'
  }
]

// Demo Family Gifts
export const demoGifts: FamilyGift[] = [
  {
    id: 'g1',
    type: 'sports',
    title: 'Jazz vs Lakers',
    description: "Can't wait to take Dad to his first game in years! Let's make it a family outing!",
    date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
    time: '7:00 PM',
    location: 'Delta Center, Salt Lake City',
    details: '4 tickets • Section 108, Row 12 • Parking pass included!',
    sharedBy: '1',
    sharedByName: 'Sarah Johnson',
    forMembers: ['all'],
    rsvps: ['1', '2', '4'],
    comments: [
      {
        id: 'gc1',
        authorId: '2',
        authorName: 'Michael Johnson',
        content: "This is going to be epic! Dad hasn't been to a game since 2019!",
        createdAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
    isFeatured: true
  },
  {
    id: 'g2',
    type: 'event',
    title: 'Hamilton - The Musical',
    description: "Girls night out! Mom has wanted to see this forever. 💃",
    date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
    time: '7:30 PM',
    location: 'Eccles Theater',
    details: '2 tickets • Orchestra, Row G',
    sharedBy: '1',
    sharedByName: 'Sarah Johnson',
    forMembers: ['3'],
    rsvps: ['3'],
    comments: [],
    createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'g3',
    type: 'dining',
    title: 'Family Dinner at The Roof',
    description: "Monthly family dinner! I made a reservation for all of us. My treat! 🍽️",
    date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000),
    time: '6:00 PM',
    location: 'The Roof Restaurant, 15 E South Temple, SLC',
    details: 'Party of 6 • Confirmation #: RF-2024-8847',
    sharedBy: '1',
    sharedByName: 'Sarah Johnson',
    forMembers: ['all'],
    rsvps: ['1', '2', '3', '4'],
    comments: [
      {
        id: 'gc2',
        authorId: '3',
        authorName: 'Emily Davis',
        content: "I've heard the view is amazing! Can't wait!",
        createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'g4',
    type: 'giftcard',
    title: 'Olive Garden Gift Card',
    description: 'Family dinner on me! Use this whenever you want to take Mom & Dad out. 🍝',
    value: 100,
    code: 'OG-7829-4456-1122',
    sharedBy: '1',
    sharedByName: 'Sarah Johnson',
    forMembers: ['all'],
    rsvps: [],
    comments: [],
    createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'g5',
    type: 'giftcard',
    title: 'Starbucks Gift Card',
    description: 'Coffee on me, Emily! Thanks for all your help this month. ☕',
    value: 25,
    code: 'SB-1234-5678-9012',
    sharedBy: '1',
    sharedByName: 'Sarah Johnson',
    forMembers: ['3'],
    rsvps: [],
    comments: [
      {
        id: 'gc3',
        authorId: '3',
        authorName: 'Emily Davis',
        content: 'Thank you so much Sarah! You didn\'t have to! 💕',
        createdAt: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
]
