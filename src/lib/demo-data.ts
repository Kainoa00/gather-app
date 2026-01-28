import { CareCircleMember, CalendarEvent, Vault, Incident } from '@/types'

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
