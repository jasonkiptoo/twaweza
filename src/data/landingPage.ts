export const landingPageContent = {
  brand: {
    name: "SaveSmart",
    description:
      "A clearer way for chama groups to organize membership, contributions, and group-managed credit.",
  },
  navigation: [
    { label: "About", section: "about" },
    { label: "Services", section: "services" },
    { label: "Packages", section: "packages" },
    { label: "Products", section: "products" },
    { label: "How it works", section: "how-it-works" },
    { label: "FAQ", section: "faq" },
    { label: "Contact", section: "contact" },
  ],
  hero: {
    eyebrow: "A better way to manage your chama",
    title: "Save together. Move forward together.",
    description:
      "Bring your group membership, contribution records, and available loan products into one clear, easy-to-use place.",
  },
  about: {
    description:
      "SaveSmart is built for people who make progress together. It gives chama members a shared place to keep track of group activity, while leaving contribution targets and financial terms in the hands of each group.",
    mission:
      "Make everyday group saving and financial administration easier to understand and manage.",
    vision:
      "Help more communities build steady financial habits through clear records and shared goals.",
    values: ["Transparency", "Unity", "Growth", "Trust"],
  },
  services: [
    {
      icon: "users",
      title: "Group membership",
      description:
        "Create a chama or join an existing one with its group code, then keep group information in one place.",
    },
    {
      icon: "wallet",
      title: "Contribution records",
      description:
        "Record and review contributions using the payment methods enabled by your group, including M-Pesa, bank, or cash.",
    },
    {
      icon: "handCoins",
      title: "Group-managed credit",
      description:
        "View loan products configured for your group and follow your application or repayment information.",
    },
    {
      icon: "chart",
      title: "Shared financial visibility",
      description:
        "Give members a clearer view of group contribution activity and available financial summaries.",
    },
  ],
  membershipPaths: [
    {
      name: "Join a chama",
      label: "For new members",
      description:
        "Create your account and join a group using its verified invitation code.",
      contribution: "Contribution terms are set by your group.",
      featured: false,
    },
    {
      name: "Start a chama",
      label: "For group organizers",
      description:
        "Create a group profile and enter a monthly savings target for your chama.",
      contribution: "Your group chooses its own target.",
      featured: true,
    },
    {
      name: "Grow with your group",
      label: "For chama members",
      description:
        "Use the contribution and credit tools your group has enabled for its members.",
      contribution: "Products and eligibility vary by group.",
      featured: false,
    },
  ],
  products: [
    {
      icon: "wallet",
      title: "Savings contributions",
      description:
        "Review contribution activity and record payments through methods enabled by your group.",
      detail: "M-Pesa, bank, or cash, when enabled",
    },
    {
      icon: "handCoins",
      title: "Group loan products",
      description:
        "Explore loan products configured by your group. Amounts, charges, and eligibility depend on each product's terms.",
      detail: "Availability depends on your group",
    },
    {
      icon: "chart",
      title: "Loan applications and tracking",
      description:
        "Submit an application and follow its status, then review repayment information for an approved loan.",
      detail: "For registered members",
    },
  ],
  steps: [
    {
      number: "01",
      title: "Create your profile",
      description:
        "Register with your details and verify your email to secure your account.",
    },
    {
      number: "02",
      title: "Join or create a group",
      description:
        "Enter a valid chama code, or create a group and set its monthly target.",
    },
    {
      number: "03",
      title: "Follow your group’s plan",
      description:
        "Check the contribution types and payment methods your group has enabled.",
    },
    {
      number: "04",
      title: "Track activity in one place",
      description:
        "Sign in to review group activity, contributions, and any available credit products.",
    },
  ],
  benefits: [
    {
      icon: "eye",
      title: "Clearer records",
      description:
        "Keep contribution and group activity easier to review.",
    },
    {
      icon: "target",
      title: "Goals set together",
      description:
        "Let your chama decide its own savings target and contribution rhythm.",
    },
    {
      icon: "shield",
      title: "Group-led terms",
      description:
        "Loan products and eligibility are configured by your group, not promised by a public rate card.",
    },
  ],
  faqs: [
    {
      question: "How do I join a chama?",
      answer:
        "Create an account, then choose the option to join a group. You will need a valid group code from that chama.",
    },
    {
      question: "Can I create a new chama?",
      answer:
        "Yes. The registration flow lets you create a group profile and enter a monthly savings target. Agree on the group rules with members before collecting contributions.",
    },
    {
      question: "How much do I need to contribute?",
      answer:
        "SaveSmart does not set a universal contribution amount. Confirm the amount, schedule, and any deadlines with your chama administrators.",
    },
    {
      question: "Can I contribute using M-Pesa?",
      answer:
        "M-Pesa is a supported contribution method, alongside bank and cash. The methods available to you depend on your group settings; confirm payment instructions with your chama.",
    },
    {
      question: "Are loans available to every member?",
      answer:
        "Loan products and eligibility rules are configured by each group. Sign in to see what your group offers and review its terms before applying.",
    },
    {
      question: "What interest, fees, or repayment rules apply?",
      answer:
        "These depend on the loan product configured by your group. Review the product and repayment details shown in your account, and ask your group administrators to confirm anything unclear.",
    },
    {
      question: "Can I withdraw my savings at any time?",
      answer:
        "Withdrawal rules are set by your chama. Please confirm its agreed policy with the group administrators before making a decision.",
    },
    {
      question: "What happens if a contribution is late?",
      answer:
        "Late-payment rules vary by group and are not set universally by SaveSmart. Check your chama's agreed rules with its administrators.",
    },
  ],
  contact: {
    phone: "",
    email: "",
    location: "",
    whatsappInternationalNumber: "",
    socialLinks: [] as { label: string; url: string }[],
    note: "Ask your chama administrator for verified contact details and group policies.",
  },
  seo: {
    title: "SaveSmart | Save together, move forward together",
    description:
      "SaveSmart helps chama groups organize membership, contribution records, and group-managed loan products in one clear place.",
  },
} as const;