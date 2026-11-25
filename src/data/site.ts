// All site content lives here. Edit this file and the site updates.

export interface ProjectImage {
  /** Short heading shown under the screenshot, e.g. "Admin view: Student matches". */
  title: string
  /** One short sentence (about 90 characters) describing what the screen shows. */
  caption: string
  src: string
  /** Describes the screenshot for screen readers. */
  alt: string
  thumb?: string
}

export interface Hosting {
  title: string
  note: string
}

export interface Project {
  title: string
  description: string
  tags: string[]
  year: string
  /**
   * Optional media. Put files in public/projects/. Add as many screenshots as you like:
   * the card keeps a fixed-size preview and opens a full-size viewer on click.
   * `thumb` is an optional smaller copy used in the card and the viewer strip.
   */
  images?: ProjectImage[]
  video?: string
  poster?: string
  repo?: string
  live?: string
  /** Optional highlighted note, e.g. where the project is deployed. */
  hosting?: Hosting
}

export interface Experience {
  title: string
  org: string
  place: string
  year: string
  points: string[]
}

/**
 * How this site is published. Shown in the footer's "How this site is deployed" panel.
 * `repo` is this portfolio's GitHub URL, used for the "View the workflow" and "Source" links.
 */
export const deployment = {
  repo: 'https://github.com/lesumora/portfolio',
  workflowPath: '.github/workflows/deploy.yaml',
}

export const site = {
  name: 'Jaden Mimura',
  handle: 'jaden mimura',
  role: 'Full-stack web developer and Cloud Enthusiast',
  photo: '/jaden.jpg',
  status: 'Open to entry-level roles',
  location: 'Bulacan, Philippines',
  intro:
    'Hi, I am an IT Graduate at Bulacan State University Main Campus. I build full-stack web apps with Laravel, React and PHP, and I had an AWS internship at Accenture Philippines.',
  email: 'mimurajaden@gmail.com',
  resume: '/Jaden-Mimura-Resume.pdf',
  about: [
    'I studied Information Technology at Bulacan State University (GWA 1.37, Dean’s Lister 2023–2024). Most of my project work is full-stack web development in PHP, Laravel and React.',
    'I also enjoy the cloud infrastructure side. In an AWS internship at Accenture I designed a secure multi-AZ network, and I am building more cloud projects. I am looking for a first role where I can keep learning on real systems.',
  ],
  skills: [
    { group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'PHP', 'Java', 'C++'] },
    { group: 'Web and data', items: ['Laravel', 'React', 'Bootstrap', 'MySQL'] },
    { group: 'Cloud and networking', items: ['AWS', 'VPC design', 'NAT and Internet Gateways', 'Multi-AZ', 'Cisco networking'] },
    { group: 'Tools', items: ['Git', 'GitHub', 'Composer', 'Browser DevTools'] },
  ],
  links: [
    { label: 'GitHub', href: 'https://github.com/bulsu-mimurajg' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jaden-m-b0a01b375/' },
  ],
}

export const experience: Experience[] = [
  {
    title: 'AWS Cloud Internship',
    org: 'Accenture Philippines',
    place: '',
    year: '2026',
    points: [
      'Learned the AWS ecosystem, the services it offers, and how applications are architected in the cloud.',
      'Designed a secure multi-AZ VPC with public and private subnets, using NAT and Internet Gateways to keep sensitive database workloads private.',
    ],
  },
  {
    title: 'Salesforce-Supported Virtual Internship',
    org: 'Salesforce-backed program, Philippines',
    place: '',
    year: '2025',
    points: [
      'Completed a Salesforce-backed program covering CRM, cloud technologies, and real-world industry use cases.',
      'Worked with teammates on structured projects that replicate real Salesforce use cases.',
    ],
  },
]

export const certifications = [
  {
    group: 'AWS Academy',
    items: ['Cloud Foundations', 'Generative AI Foundations', 'Cloud Architecting'],
  },
  {
    group: 'Cisco',
    items: [
      'Networking Essentials',
      'Cybersecurity Essentials',
      'IT Essentials',
      'Introduction to Packet Tracer',
      'Introduction to Cybersecurity',
    ],
  },
  {
    group: 'Salesforce Superbadges',
    items: [
      'Apex Specialist',
      'Authentication Governance',
      'Approval Process Management',
      'MFA and SSO Settings',
      'Screen Flow Fundamentals',
      'Security and Performance',
      'Object Relationships',
      'Configure Agentforce for Service',
    ],
  },
]

export const projects: Project[] = [
  {
    title: 'InternConnect',
    year: '2025',
    description:
      'A web system that matches BSIT students to host training establishments using a weighted scoring algorithm, and lets coordinators review, endorse and place them. I was the lead developer for the project, which was built with Laravel and React, and hosted on Hostinger.',
    tags: ['PHP Laravel', 'React', 'TypeScript', 'MySQL',],
    repo: 'https://github.com/bulsu-mimurajg/InternConnect-BulSU',
    live: 'https://d3qmylo2rrulmo.cloudfront.net',
    hosting: {
      title: 'Hosted on AWS (EC2)',
      note: 'The demo link is served over CloudFront, with the backend on an EC2 instance.',
    },
    images: [
      {
        title: 'Guest view: Home and login',
        caption: 'Visitors see the four-step process before they log in.',
        src: '/projects/internconnect-home.webp',
        thumb: '/projects/internconnect-home-thumb.webp',
        alt: 'InternConnect home page showing the four steps: assessment, matching, endorsement and placement.',
      },
      {
        title: 'Admin view: Student matches',
        caption: 'Admins review the best internship match for each student, with its compatibility score.',
        src: '/projects/internconnect-matches.webp',
        thumb: '/projects/internconnect-matches-thumb.webp',
        alt: 'InternConnect admin page listing students, their best internship match and compatibility score.',
      },
      {
        title: 'Host company view: Endorsements',
        caption: 'Host training establishments approve or decline students endorsed by the admin.',
        src: '/projects/internconnect-hte.webp',
        thumb: '/projects/internconnect-hte-thumb.webp',
        alt: 'InternConnect host company page with a table of endorsed students and approve and decline buttons.',
      },
      {
        title: 'Adviser view: Dashboard',
        caption: 'Advisers follow assessments and placements for their assigned section.',
        src: '/projects/internconnect-adviser.webp',
        thumb: '/projects/internconnect-adviser-thumb.webp',
        alt: 'InternConnect adviser dashboard with section totals, recent assessments and placement overview.',
      },
      {
        title: 'Student view: Dashboard',
        caption: 'Students see their assessment results and their top internship matches.',
        src: '/projects/internconnect-student.webp',
        thumb: '/projects/internconnect-student-thumb.webp',
        alt: 'InternConnect student dashboard with match status, performance breakdown and top internship matches.',
      },
    ],
  },
  {
    title: 'Bhengs',
    year: '2024',
    description:
      'An order management web app with sales charts, order creation, tracking, updating, and status management. Server side in PHP, front end in HTML, Bootstrap, and JavaScript.',
    tags: ['PHP', 'JavaScript', 'Bootstrap'],
  },
  {
    title: 'Multi-AZ VPC on AWS',
    year: '2026',
    description:
      'A secure network for sensitive database workloads: public and private subnets across availability zones, with NAT and Internet Gateways so private resources stay unreachable from the internet. Built during my AWS internship at Accenture.',
    tags: ['AWS', 'VPC', 'NAT Gateway', 'Multi-AZ'],
  },
]
