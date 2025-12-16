import { Candidate, Employee, ChartData } from './types';

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: "Elena Rodriguez",
    role: "Senior UX Designer",
    experience: 7,
    skills: ["Figma", "React", "User Research", "Prototyping"],
    location: "San Francisco, CA",
    avatar: "https://picsum.photos/id/1011/200/200",
    status: 'Screening',
    matchScore: 92,
    bio: "Award-winning designer with a focus on accessible interfaces. Previously led design at a fintech unicorn."
  },
  {
    id: 'c2',
    name: "James Chen",
    role: "Full Stack Engineer",
    experience: 4,
    skills: ["Node.js", "TypeScript", "PostgreSQL", "AWS"],
    location: "New York, NY",
    avatar: "https://picsum.photos/id/1012/200/200",
    status: 'New',
    matchScore: 85,
    bio: "Full stack developer passionate about scalable architecture. Contributor to several open source libraries."
  },
  {
    id: 'c3',
    name: "Sarah Johnson",
    role: "Product Manager",
    experience: 6,
    skills: ["Agile", "Strategy", "Data Analysis", "SQL"],
    location: "Austin, TX",
    avatar: "https://picsum.photos/id/1027/200/200",
    status: 'Interview',
    matchScore: 78,
    bio: "Product leader with a background in data science. Expert in driving product growth through metrics."
  },
  {
    id: 'c4',
    name: "Michael Chang",
    role: "DevOps Engineer",
    experience: 9,
    skills: ["Kubernetes", "Terraform", "CI/CD", "Python"],
    location: "Remote",
    avatar: "https://picsum.photos/id/1005/200/200",
    status: 'Offer',
    matchScore: 96,
    bio: "Senior DevOps specialist. Built infrastructure for high-traffic streaming services."
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    name: "Dr. Alistair Wright",
    role: "Chief Technology Officer",
    department: "Executive",
    location: "London, UK",
    avatar: "https://picsum.photos/id/100/200/200",
    performance: 98,
    flightRisk: 'Low'
  },
  {
    id: 'e2',
    name: "Martha Nielsen",
    role: "VP of Engineering",
    department: "Engineering",
    location: "Berlin, DE",
    avatar: "https://picsum.photos/id/101/200/200",
    reportsTo: 'e1',
    performance: 95,
    flightRisk: 'Low'
  },
  {
    id: 'e3',
    name: "Jonas Kahnwald",
    role: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    avatar: "https://picsum.photos/id/102/200/200",
    reportsTo: 'e2',
    performance: 88,
    flightRisk: 'Medium'
  },
  {
    id: 'e4',
    name: "Chloe Decker",
    role: "Product Lead",
    department: "Product",
    location: "Los Angeles, CA",
    avatar: "https://picsum.photos/id/103/200/200",
    reportsTo: 'e1',
    performance: 92,
    flightRisk: 'Low'
  },
  {
    id: 'e5',
    name: "Lucifer Morningstar",
    role: "HR Director",
    department: "People",
    location: "Los Angeles, CA",
    avatar: "https://picsum.photos/id/104/200/200",
    reportsTo: 'e1',
    performance: 99,
    flightRisk: 'Low'
  }
];

export const HIRING_DATA: ChartData[] = [
  { name: 'Jan', value: 4, value2: 2 },
  { name: 'Feb', value: 3, value2: 3 },
  { name: 'Mar', value: 2, value2: 4 },
  { name: 'Apr', value: 7, value2: 5 },
  { name: 'May', value: 5, value2: 6 },
  { name: 'Jun', value: 8, value2: 7 },
  { name: 'Jul', value: 6, value2: 5 },
];

export const ATTRITION_DATA: ChartData[] = [
  { name: 'Engineering', value: 12 },
  { name: 'Sales', value: 18 },
  { name: 'Product', value: 8 },
  { name: 'Marketing', value: 15 },
  { name: 'HR', value: 5 },
];
