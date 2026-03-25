export type ClientLogo = {
  name: string
  src: string
  href?: string
  /** keep original brand color (don't grayscale) */
  keepColor?: boolean
  /** visual tweak without re-exporting assets */
  scale?: number
}

export const CLIENT_LOGOS: ClientLogo[] = [
  // Companies & Institutions
  {
    name: "Tufts University Community Health Department",
    src: "/logos/tufts.jpeg",
    href: "https://as.tufts.edu/commhealth/",
    keepColor: true,
    scale: 1.2,
  },
  {
    name: "Value Aligners",
    src: "/logos/value-aligners.jpg",
    href: "https://www.valuealigners.com",
    keepColor: true,
    scale: 1.2,
  },
   {
    name: "AIP Publishing",
    src: "/logos/aip.jpeg",
    href: "https://pubs.aip.org/aip/acp/article-abstract/3258/1/020012/3345242/Enhancing-software-development-efficiency-A-study?redirectedFrom=fulltext",
    keepColor: true,
    scale: 1.0,
  },
     {
    name: "Product Collective",
    src: "/logos/prodx.png",
    href: "https://www.instagram.com/tufts_tpc_prodx/",
    keepColor: true,
    scale: 1.0,
  },
   {
    name: "Tufts University",
    src: "/logos/tufts-uni.jpg",
    href: "https://engineering.tufts.edu",
    keepColor: true,
    scale: 1.2,
  },
  {
    name: "JC Foundation",
    src: "/logos/jc-foundation.jpeg",
    href: "https://www.jarurat.care",
    keepColor: true,
    scale: 1.0,
  },
  {
    name: "NTPC Ltd",
    src: "/logos/ntpc.jpg",
    href: "https://www.ntpc.co.in",
    keepColor: true,
    scale: 1.2,
  },
  {
    name: "Scrollify",
    src: "/logos/scrollify.jpg",
    href: "https://app.scrollify.in/login",
    keepColor: true,
    scale: 1.2,
  },
  {
    name: "VinnovateIT",
    src: "/logos/vinnovateit.png",
    href: "https://vinnovateit.com",
    keepColor: true,
    scale: 1.2,
  },
  {
    name: "Vellore Institute of Technology",
    src: "/logos/vit.png",
    href: "https://vit.ac.in",
    keepColor: true,
    scale: 2.0,
  },
  // Certifications & Awards
  {
    name: "Certified Scrum Product Owner – Scrum Alliance",
    src: "/logos/scrum-alliance.png",
    href: "https://www.scrumalliance.org/get-certified/product-owner-track/certified-scrum-product-owner?utm_term=&utm_campaign=PMax_Scrum+Better+With+Kanban&utm_source=adwords&utm_medium=ppc&hsa_acc=8637613312&hsa_cam=23097528676&hsa_grp=&hsa_ad=&hsa_src=x&hsa_tgt=&hsa_kw=&hsa_mt=&hsa_net=adwords&hsa_ver=3&gad_source=1&gad_campaignid=23097531283&gclid=Cj0KCQjwj47OBhCmARIsAF5wUEH1Po-BacE_m1z9CIZvHb9HOL9hUB0AYv0cyX0dDFzDF4CHhEwYq30aAqFUEALw_wcB",
    keepColor: true,
    scale: 1.0,
  },
  {
    name: "Certified Ethical Hacker – EC-Council",
    src: "/logos/ec-council.png",
    href: "https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh-v13-north-america/",
    keepColor: true,
    scale: 1.0,
  },
  {
    name: "1st Runner-Up – National Civic-Tech Hackathon, IIM Ahmedabad",
    src: "/logos/iima.png",
    href: "https://www.iima.ac.in/faculty-research/centers/Centre-for-Innovation-Incubation-Entrepreneurship",
    keepColor: true,
    scale: 1.2,
  },
]