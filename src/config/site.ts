// Single place to edit brand, founder and contact details.
export const site = {
  name: "OMNIA",
  tagline: "Complete Protection",
  description:
    "Unified identity, device, cloud & IoT protection. AI-driven threat detection for families and businesses.",
  founder: {
    name: "Aman Goswami",
    role: "Founder & CEO",
    tagline: "I build for the browser, and study what breaks it.",
    photo: "/founder.webp",
    bio: [
      "I'm a third-year Computer Science student at VIT-AP who likes owning the whole path: the interface, the network underneath it, and the write-up that explains both.",
      "I started OMNIA because security tools are either powerful and confusing, or simple and shallow. OMNIA is my answer: enterprise-grade protection — identity, devices, network and privacy — that anyone can understand in one glance.",
      "Most of what I build gets used by someone other than me: websites and consoles that two university labs run on, a client site for a solar lighting company, a browser-only PDF suite, a Mac app that lives in the notch, and Cantilever, a marketplace for architects. In between, I'm working through CCNA and Security+ with Packet Tracer labs and an isolated home lab.",
    ],
    facts: [
      ["Studying", "B.Tech CSE, 3rd year · VIT-AP"],
      ["Focus", "Front-end & network security"],
      ["Based in", "Amaravati & Silchar, India"],
      ["Certifying", "Cisco CCNA · CompTIA Security+"],
    ],
    certs: [
      { name: "Cisco CCNA 200-301", progress: 50, note: "3 of 6 domains done · Packet Tracer labs for each" },
      { name: "CompTIA Security+ SY0-701", progress: 25, note: "Threats, architecture and security operations" },
    ],
    skills: {
      "Web development": ["React", "TypeScript", "Tailwind CSS", "Supabase", "three.js", "GSAP", "Figma"],
      "Network security": ["TCP/IP & subnetting", "VLANs & trunking", "OSPF", "ACLs & port security", "Wireshark", "Nmap", "Kali Linux", "Burp Suite"],
      "Infra & self-hosting": ["Cloudflare", "Vercel", "NAT & firewalls", "WireGuard", "Nginx", "Docker"],
    },
    work: [
      { name: "PCBL lab website & console", kind: "Client · Assam University lab", url: "https://pcbl.net/" },
      { name: "PCBL inventory system", kind: "Lab software", url: "https://inventory.pcbl.net/" },
      { name: "Green Sun Technologies", kind: "Client · Solar lighting", url: "https://greensuntechnologies.com/" },
      { name: "Cantilever", kind: "Startup · Architecture marketplace", url: "https://cantilevertech.vercel.app/" },
      { name: "Nebula.pdf", kind: "Product · Browser-only PDF suite", url: "https://nebula-pdf.vercel.app/" },
      { name: "Notchie", kind: "Product · macOS notch app", url: "" },
    ],
    links: {
      portfolio: "https://aman-goswami.pages.dev",
      github: "https://github.com/ErinOP-gltich",
      email: "amanopp0690@gmail.com",
      linkedin: "",
    },
  },
  contact: {
    email: "amanopp0690@gmail.com",
    phone: "+91 80119 24517",
    phoneHours: "Mon–Sat, 10AM – 7PM IST",
    city: "Amaravati, India",
  },
};
