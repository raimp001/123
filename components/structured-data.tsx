export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SciFlow Labs",
    "alternateName": "SciFlow",
    "url": "https://sciflowlabs.com",
    "logo": "https://sciflowlabs.com/logo.png",
    "description": "Decentralized science platform connecting funders with verified research labs through milestone-based bounties with escrow-protected payments.",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/sciflowlabs",
      "https://github.com/sciflowlabs",
      "https://discord.gg/sciflowlabs"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": "https://sciflowlabs.com/help"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SciFlow",
    "alternateName": "SciFlow Labs",
    "url": "https://sciflowlabs.com",
    "description": "Fund breakthrough research with trust. Decentralized science platform for milestone-based research bounties.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://sciflowlabs.com/dashboard/bounties?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function SoftwareApplicationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SciFlow",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "description": "Decentralized science platform for funding research through milestone-based bounties with crypto and fiat payment options.",
    "featureList": [
      "Milestone-based research bounties",
      "Escrow-protected payments",
      "Crypto payments (Solana USDC, Base USDC)",
      "Fiat payments via Stripe",
      "Verified lab profiles",
      "Dispute resolution",
      "Proof of research evidence"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function FAQStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is SciFlow?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SciFlow is a decentralized science (DeSci) platform that connects research funders with verified laboratories through milestone-based bounties. It provides escrow-protected payments via both cryptocurrency (Solana USDC, Base USDC) and traditional fiat (Stripe)."
        }
      },
      {
        "@type": "Question",
        "name": "How do research bounties work on SciFlow?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Funders create research bounties with specific milestones and funding. Labs submit proposals, and once accepted, they work on the research. Payments are released as milestones are verified, ensuring accountability and protecting both parties."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods does SciFlow support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SciFlow supports hybrid payments: traditional fiat via Stripe credit cards, and cryptocurrency via Solana USDC and Base (Ethereum L2) USDC. All funds are held in escrow until milestones are completed."
        }
      },
      {
        "@type": "Question",
        "name": "How is research verified on SciFlow?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SciFlow uses a Proof of Research system where labs submit evidence for each milestone. Evidence is hashed and stored on IPFS for permanent, verifiable records. Funders review and approve milestone completions before payments are released."
        }
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
