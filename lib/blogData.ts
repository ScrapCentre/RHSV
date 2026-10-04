export interface BlogPost {
  id: string
  slug: string
  metaTitle?: string
  metaDescription?: string
  title: string
  subtitle: string
  excerpt: string
  image: string
  author: string
  date: string
  readTime: string
  category: string
  keyHighlights: string[]
  content: {
    intro: string[]
    whatIsCod?: {
      title: string
      paragraphs: string[]
    }
    whatIsScrapping?: {
      title: string
      paragraphs: string[]
    }
    whenToConsider?: {
      title: string
      intro: string
      points: { title: string; desc: string }[]
      closingNote: string
    }
    howToGet?: {
      title: string
      intro: string
      steps: { number: number; title: string; desc: string }[]
      summaryNote: string
    }
    howItWorks?: {
      title: string
      intro: string
      steps: { number: number; title: string; desc: string }[]
    }
    validity?: {
      title: string
      intro: string
      points: { label: string; text: string }[]
    }
    codBenefits?: {
      title: string
      intro: string
      points: { label: string; text: string }[]
      closingNote: string
    }
    roadTaxRebate?: {
      title: string
      paragraphs: string[]
      nationalTable: { category: string; concession: string }[]
      details: string[]
    }
    upConcession?: {
      title: string
      paragraphs: string[]
      cretaExample: {
        title: string
        intro: string
        table: { item: string; amount: string }[]
        notes: string[]
      }
    }
    otherBenefits?: {
      title: string
      points: { name: string; desc: string }[]
    }
    comparison?: {
      title: string
      intro: string
      table: { type: string; purpose: string }[]
      explanation: string[]
    }
    comparisonTable?: {
      title: string
      intro: string
      columns: string[]
      rows: {
        feature: string
        scrapping: string
        junkyard: string
        donating: string
      }[]
      closingNote: string
    }
    rvsfVsKabadi?: {
      title: string
      paragraphs: string[]
    }
    scrapWithUs?: {
      title: string
      paragraphs: string[]
    }
    callToAction?: {
      title: string
      paragraphs: string[]
      phone: string
      whatsapp: string
    }
    faqs: {
      english: { q: string; a: string }[]
      hinglish: { q: string; a: string }[]
    }
  }
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "cod-road-tax-rebate",
    slug: "certificate-of-deposit-for-vehicle-scrapping",
    title: "Certificate of Deposit for Vehicle Scrapping: How the Road-Tax Rebate Works",
    subtitle: "Everything you need to know about CoD validity, UP state concessions, and saving up to ₹48,000+ on a new car.",
    excerpt:
      "A Certificate of Deposit (CoD) is issued by a Registered Vehicle Scrapping Facility when you hand over your old vehicle for scrapping. It serves as proof of legal scrapping and can help you claim applicable benefits, including a road-tax concession when registering a new vehicle.",
    image: "/blog1.png",
    author: "ScrapCentre Editorial",
    date: "September 30, 2026",
    readTime: "7 min read",
    category: "Vehicle Scrapping Guide",
    keyHighlights: [
      "A Certificate of Deposit (CoD) is issued by a Registered Vehicle Scrapping Facility (RVSF) when a vehicle is deposited for scrapping.",
      "A CoD is valid for 2 years from the date of issuance and can be electronically transferred if you do not plan to buy a new vehicle.",
      "Under the national framework, road-tax concession is up to 25% for private vehicles and up to 15% for commercial vehicles, subject to state rules.",
      "In Uttar Pradesh, the applicable concession is up to 15% for private vehicles and up to 10% for commercial vehicles.",
      "The road-tax concession applies to the new vehicle, not as a refund of road tax paid on the old vehicle.",
      "Once a CoD is used to claim a benefit, it is marked 'Cancelled' and cannot be used again.",
    ],
    content: {
      intro: [
        "If you have recently scrapped an old car, you may be wondering: Can I get a road tax rebate after scrapping my car? The answer depends on the state rules and the new vehicle you plan to register. This is where your Certificate of Deposit (CoD) becomes important.",
        "A CoD is issued when you hand over your vehicle to a Registered Vehicle Scrapping Facility (RVSF). It proves the vehicle has been legally deposited for scrapping and can help you claim benefits when you register another vehicle. Understanding how the CoD works, how long it remains valid, and how the road-tax concession is applied can help you make an informed decision after scrapping your old vehicle.",
        "To understand how these benefits work, let's look at what a Certificate of Deposit for [vehicle scrapping](https://www.scrapcentre.com/vehicle-scrapping-services) is and why it matters.",
      ],
      whatIsCod: {
        title: "What Is a Certificate of Deposit for Vehicle Scrapping?",
        paragraphs: [
          "A Certificate of Deposit (CoD) is an official document issued by a Registered Vehicle Scrapping Facility (RVSF) when you hand over your vehicle for scrapping. It records details such as your vehicle registration number, the date it was deposited, and the RVSF's credentials.",
          "The CoD acts as your proof that the vehicle has been legally deposited for scrapping. It is also important if you want to claim government benefits when registering a new vehicle. The certificate is valid for 2 years from the date of issue, so you have time to decide what you want to do next.",
          "ScrapCentre, as an authorised RVSF, issues the CoD when a vehicle is scrapped through its facility. This means the process comes with the documentation needed to support the benefits linked to vehicle scrapping.",
          "In simple terms, the CoD connects your old vehicle's scrapping record with the benefits you may be able to claim on a new vehicle.",
        ],
      },
      howToGet: {
        title: "How to Get a Certificate of Deposit for a Scrapped Car?",
        intro:
          "If you're wondering how to get a Certificate of Deposit for a scrapped car, the process starts with choosing an RVSF. The CoD is issued when the vehicle is deposited with the facility, before the actual scrapping takes place.",
        steps: [
          {
            number: 1,
            title: "Submit your vehicle to an RVSF",
            desc: "Hand over your old vehicle to a registered facility along with the required vehicle and ownership details.",
          },
          {
            number: 2,
            title: "Complete vehicle verification",
            desc: "The facility verifies the vehicle details and completes the necessary formalities before accepting the vehicle for scrapping.",
          },
          {
            number: 3,
            title: "Receive your Certificate of Deposit",
            desc: "Once the vehicle is formally deposited with the RVSF, the CoD is issued with the relevant vehicle and facility details.",
          },
          {
            number: 4,
            title: "Vehicle is scrapped",
            desc: "After the CoD is issued, the vehicle goes through the prescribed scrapping process. The required de-registration and RC cancellation formalities are then completed, and the Certificate of Vehicle Scrapping is issued.",
          },
        ],
        summaryNote:
          "So, if you're searching gaadi scrap certificate kaise milega, the process starts with submitting your vehicle to an RVSF and completing the required verification and documentation.",
      },
      validity: {
        title: "How Long Is a Certificate of Deposit Valid?",
        intro:
          "A Certificate of Deposit is valid for 2 years from the date of issuance. So, you don't have to rush into buying another vehicle immediately after scrapping your old one.",
        points: [
          {
            label: "Validity",
            text: "2 years from the date it is issued.",
          },
          {
            label: "Transfer",
            text: "If you don't plan to buy a new vehicle, the CoD can be electronically sold or transferred to another person who may want to use it.",
          },
          {
            label: "One-time use",
            text: "Once the CoD is used to claim a benefit, it is marked 'Cancelled' in the VAHAN database and cannot be used again.",
          },
        ],
      },
      roadTaxRebate: {
        title: "Can I Get a Road Tax Rebate After Scrapping My Car?",
        paragraphs: [
          "Yes, you can get a road tax rebate after scrapping your car, provided you meet the applicable requirements and register a new vehicle against a valid Certificate of Deposit. The concession applies to the road tax payable on the new vehicle, rather than being a refund of the road tax paid on your old car.",
          "Under the national framework set by MoRTH notification GSR 720(E), dated 5 October 2021, the motor-vehicle-tax concession is:",
        ],
        nationalTable: [
          { category: "Non-transport / private vehicle", concession: "Up to 25%" },
          { category: "Transport / commercial vehicle", concession: "Up to 15%" },
        ],
        details: [
          "The concession is available for up to 15 years from the date of first registration of the new vehicle for non-transport vehicles and up to 8 years from the date of first registration for transport vehicles. These are national limits, not a flat rate for every vehicle owner. Since road tax is a state subject, each state or Union Territory decides the applicable concession within the national framework.",
          "The registration-certificate fee is also waived when a new vehicle is registered against a valid CoD. This is a separate benefit provided under GSR 714(E), dated 4 October 2021.",
        ],
      },
      upConcession: {
        title: "How Much Road-Tax Concession Is Available in Uttar Pradesh?",
        paragraphs: [
          "In Uttar Pradesh, the applicable concession is up to 15% for private vehicles and up to 10% for commercial vehicles on the road tax payable for a new vehicle against a valid CoD. The UP government order provides this concession for one year from the date of the CoD.",
          "The vehicle-scrapping policy has also seen significant adoption in the state. As of 30 June 2026, Uttar Pradesh had scrapped more than 1.95 lakh vehicles. The state had 101 registered Vehicle Scrapping Facilities, with around 50 operational at the time.",
          "The UP notification does not require the new vehicle to be from the same category or class as the scrapped vehicle.",
        ],
        cretaExample: {
          title: "Example: How Much Can You Save When Buying a Hyundai Creta?",
          intro:
            "Suppose you scrap your old car through an RVSF and use the CoD to register a new Hyundai Creta E petrol manual in Uttar Pradesh. Here is an illustrative breakdown based on the listed vehicle price and UP's maximum 15% private-vehicle road-tax concession:",
          table: [
            { item: "Listed road tax on the new Creta", amount: "₹1,19,977" },
            { item: "Road-tax concession at 15%", amount: "₹17,997" },
            { item: "Registration-certificate fee waiver (listed registration fee)", amount: "₹600" },
            { item: "Total estimated savings on new-car charges", amount: "₹18,597" },
            { item: "Example scrap-value payout, assuming ScrapCentre quotes ₹30,000 for the old car", amount: "₹30,000" },
            { item: "Combined value of savings and assumed scrap payout", amount: "₹48,597" },
          ],
          notes: [
            "The scrap payout of ₹30,000 is only an illustration, not a ScrapCentre quote or guaranteed amount. The actual payment depends on the old vehicle's condition, weight and valuation. Any manufacturer discount is excluded because offers vary.",
            "This example uses the maximum 15% concession; the actual amount depends on the applicable UP rules and eligibility. Vehicle prices and registration charges may also change.",
          ],
        },
      },
      otherBenefits: {
        title: "What Other Benefits Can You Get With a Certificate of Deposit?",
        points: [
          {
            name: "Road-tax concession",
            desc: "You may receive the applicable motor-vehicle-tax concession on the new vehicle.",
          },
          {
            name: "Registration fee waiver",
            desc: "The registration-certificate fee is waived when the new vehicle is registered against an eligible CoD.",
          },
          {
            name: "Manufacturer discounts",
            desc: "Some manufacturers offer additional discounts against a CoD. These schemes can change, so it is best to check the current offer before buying a new vehicle.",
          },
          {
            name: "Transferability",
            desc: "If you do not plan to buy a vehicle yourself, your CoD can be electronically transferred or sold to another person, subject to the prescribed process.",
          },
        ],
      },
      comparison: {
        title: "Certificate of Deposit vs Certificate of Vehicle Scrapping: What's the Difference?",
        intro:
          "The Certificate of Deposit (CoD) and Certificate of Vehicle Scrapping are related to the same scrapping process, but they serve different purposes.",
        table: [
          {
            type: "Certificate of Deposit (CoD)",
            purpose:
              "Confirms that the vehicle has been deposited with an RVSF for scrapping and can be used to claim scrapping-linked benefits.",
          },
          {
            type: "Certificate of Vehicle Scrapping",
            purpose: "Confirms that the vehicle has gone through the required scrapping process.",
          },
        ],
        explanation: [
          "The CoD is particularly important for vehicle owners who want to use the benefits linked to scrapping their old vehicle. It is valid for 2 years from the date of issuance, while the Certificate of Vehicle Scrapping serves as a record that the vehicle has completed the scrapping process.",
        ],
      },
      rvsfVsKabadi: {
        title: "RVSF vs Local Scrap Dealer (Kabadi) & Environmental Rules",
        paragraphs: [
          "When you scrap an old vehicle, simply selling it to a local scrap dealer is not the same as completing the formal scrapping process. An RVSF can carry out the required process and issue the Certificate of Deposit (CoD).",
          "A kabadi or local scrap dealer cannot issue the government-recognised CoD. Without a valid CoD, you cannot claim the scrapping-linked benefits available when registering a new vehicle.",
          "The Environment Protection (End-of-Life Vehicles) Rules, 2025, which came into force on 1 April 2025, provide the environmental framework for handling and scrapping end-of-life vehicles. The rules cover registered owners, RVSFs and other entities involved in the handling, processing and scrapping of such vehicles, making formal and authorised scrapping an important part of the process.",
          "Choosing an RVSF also helps ensure that your vehicle goes through the proper scrapping and de-registration process, with the required records maintained through the authorised system.",
        ],
      },
      callToAction: {
        title: "Scrap Your Old Vehicle Through an RVSF",
        paragraphs: [
          "If your old vehicle has reached the end of its useful life, getting it scrapped through an RVSF helps you complete the process through the proper channel. Once the vehicle is accepted for scrapping, you receive a Certificate of Deposit that can be used to claim eligible benefits when registering a new vehicle.",
          "[ScrapCentre](https://www.scrapcentre.com/) is an RVSF registered by the State Transport Department under the Motor Vehicles (Registration and Functions of Vehicle Scrapping Facility) Rules, 2021, framed by the Ministry of Road Transport and Highways (MoRTH). Its authorisation can be verified through the VAHAN vehicle-scrapping system.",
          "If you're thinking about scrapping your old vehicle, you can start by checking its estimated value through ScrapCentre's Instant Valuation service.",
        ],
        phone: "+91-9839447733",
        whatsapp: "+91-9839447733",
      },
      faqs: {
        english: [
          {
            q: "What is a Certificate of Deposit for vehicle scrapping?",
            a: "A Certificate of Deposit for vehicle scrapping is proof that your vehicle has been deposited with an RVSF for scrapping. It contains key vehicle and facility details and can be used to claim benefits when registering a new vehicle.",
          },
          {
            q: "How long is a Certificate of Deposit valid?",
            a: "A Certificate of Deposit is valid for 2 years from the date of issuance. If you plan to buy a new vehicle later, make sure you use the CoD within this validity period.",
          },
          {
            q: "How to get a Certificate of Deposit for a scrapped car?",
            a: "To get a Certificate of Deposit for a scrapped car, you need to submit the vehicle to a Registered Vehicle Scrapping Facility (RVSF). After the vehicle is verified and accepted for scrapping, the CoD is issued through the authorised system.",
          },
          {
            q: "Can I use my Certificate of Deposit more than once?",
            a: "No. A CoD can be used only once for a benefit. Once the benefit is claimed, the CoD is marked 'Cancelled' in the VAHAN database and cannot be used again.",
          },
          {
            q: "Can I get a road tax rebate after scrapping my car?",
            a: "Yes, you can get a road tax rebate after scrapping your car when you register a new vehicle against a valid CoD, subject to the applicable state rules. The concession is applied to the road tax of the new vehicle, not refunded from the old vehicle.",
          },
        ],
        hinglish: [
          {
            q: "Purani gaadi scrap karne ke baad kya milta hai?",
            a: "Purani gaadi ko RVSF ke through scrap karwane par aapko gaadi ki scrap value ka payment milta hai aur Certificate of Deposit (CoD) bhi milta hai. Scrap value gaadi ki condition, weight aur metal ke rate par depend karti hai. CoD ko sambhal kar rakhein, kyunki new gaadi register karwate waqt iske basis par road tax concession jaise benefits mil sakte hain.",
          },
          {
            q: "CoD se new gaadi lene par kya fayda milta hai?",
            a: "Valid CoD ke basis par new vehicle register karne par road tax par concession mil sakta hai. Kitna concession milega, yeh aapke state ke rules par depend karta hai. Registration fee waiver bhi mil sakta hai.",
          },
          {
            q: "Gaadi scrap certificate kaise milega?",
            a: "Aapko apni purani gaadi ek RVSF mein scrap karwani होती hai. Vehicle verification aur zaroori formalities complete hone ke baad, CoD issue किया jaata hai.",
          },
          {
            q: "Purani gaadi scrap karne ke baad CoD kitne din tak valid hota hai?",
            a: "CoD issue hone ki date se 2 saal tak valid hota hai. Agar aap abhi new vehicle nahi lena chahte, to valid CoD ko prescribed process ke through electronically transfer ya sell bhi kiya ja sakta hai.",
          },
        ],
      },
    },
  },
  {
    id: "car-scrapping-guide-india",
    slug: "car-scrapping-guide-india",
    metaTitle: "What Is Car Scrapping? Process, Benefits & CoD Guide (2026)",
    metaDescription: "Car scrapping means sending an old car to an authorized RVSF for dismantling and recycling. Learn the process, CoD benefits and how to scrap your car.",
    title: "What Is Car Scrapping? Complete Guide for Indian Car Owners (2026)",
    subtitle: "Car scrapping is the process of sending an old, damaged or unusable car to an authorised scrapping facility, where it is dismantled and its usable parts and recyclable materials are recovered.",
    excerpt: "Car scrapping means sending an old car to an authorized RVSF for dismantling and recycling. Learn the process, CoD benefits and how to scrap your car.",
    image: "/blog2.png",
    author: "ScrapCentre Editorial",
    date: "October 4, 2026",
    readTime: "6 min read",
    category: "Car Scrapping Guide",
    keyHighlights: [
      "Understand what car scrapping means and when you should consider it.",
      "Learn how the car scrapping process works at an authorised RVSF.",
      "Compare car scrapping with selling an old car to a local junkyard or donating it.",
      "Know where you can scrap your car and what to expect from the process.",
      "Learn how ScrapCentre helps with old car scrapping, including online valuation and free doorstep pickup.",
    ],
    content: {
      intro: [
        "Keeping an old car can become difficult. It may need frequent repairs, become expensive to maintain, or no longer feel reliable on the road. In such cases, car scrapping can be an option.",
        "But what happens when you scrap a car? How does the process work, and what are your other options? This guide explains car scrapping in simple terms and covers what Indian car owners need to know before scrapping, selling or donating an old vehicle.",
      ],
      whatIsScrapping: {
        title: "What Is Car Scrapping?",
        paragraphs: [
          "Car scrapping is the process of getting rid of an old, damaged or unusable car by sending it to an authorised scrapping facility. The vehicle is dismantled, and its usable parts and recyclable materials are separated for recovery. This makes car scrapping different from simply abandoning an old car or selling it as scrap.",
          "A car may reach a point where keeping it on the road is no longer practical. It may have major damage, need frequent repairs, or no longer be suitable for regular use. In such cases, old car scrapping can be an option for disposing of the vehicle in a more organised way.",
          "Car scrapping also supports car recycling by allowing materials from old vehicles to be recovered and used again. Instead of letting an unwanted car sit unused, owners can choose a formal car disposal option through an authorised facility. Owners can opt for authorised [vehicle scrapping services](https://www.scrapcentre.com/vehicle-scrapping-services) to ensure responsible car disposal while supporting car recycling and material recovery.",
        ],
      },
      whenToConsider: {
        title: "When Should You Consider Scrapping Your Old Car?",
        intro: "Not every old car needs to be scrapped. If your car is still safe, reliable and affordable to maintain, you may continue using it. However, some signs can tell you that old car scrapping may be worth considering.",
        points: [
          {
            title: "Frequent repairs and breakdowns:",
            desc: "If your car needs repairs often or keeps breaking down, maintaining it can become difficult. Frequent problems may also make the car less reliable for everyday use.",
          },
          {
            title: "Repair costs are too high:",
            desc: "When you keep spending money on repairs, the cost may no longer seem reasonable for the car. If major repairs are needed again and again, it may be time to consider car disposal.",
          },
          {
            title: "Safety and reliability concerns:",
            desc: "An old or damaged car may not feel safe or dependable on the road. If you are no longer comfortable driving it or cannot rely on it for regular travel, scrapping can be one option to consider.",
          },
          {
            title: "Registration or roadworthiness issues:",
            desc: "Problems with the vehicle’s registration or roadworthiness may affect your ability to continue using it. If the car cannot meet the required conditions for use, you may need to consider other options, including scrapping.",
          },
        ],
        closingNote: "The decision does not depend on the car’s age alone. Its condition, repair needs, safety, usability and applicable requirements should all be considered before deciding whether to keep it or opt for car scrapping.",
      },
      howItWorks: {
        title: "How Does the Car Scrapping Process Work with an Authorised RVSF?",
        intro: "Scrapping a car through an authorised RVSF gives you a clear way to hand over your old vehicle and complete the required formalities. The car scrapping process can be broken down into a few simple steps:",
        steps: [
          {
            number: 1,
            title: "Check your car’s value",
            desc: "Start by checking how much your old car may be worth. ScrapCentre offers an [instant online valuation](https://www.scrapcentre.com/know-your-valuation), so you can enter your vehicle details and get an estimated value before moving ahead.",
          },
          {
            number: 2,
            title: "Arrange doorstep pickup",
            desc: "Once you decide to scrap the car, you can arrange for it to be collected from your location. ScrapCentre offers free doorstep pickup, making it easier to hand over your vehicle without having to arrange separate transportation.",
          },
          {
            number: 3,
            title: "Complete the required formalities",
            desc: "The vehicle is handed over to the authorised facility, where its details and ownership are checked. The required documentation and other formalities are completed as part of the scrapping process.",
          },
          {
            number: 4,
            title: "The car is dismantled and recycled",
            desc: "After the required checks are completed, the vehicle is taken through the scrapping process at the RVSF. The car is dismantled, and reusable parts and recyclable materials are separated for further use or processing.",
          },
          {
            number: 5,
            title: "Receive the relevant documents and payment",
            desc: "Once the vehicle is accepted for scrapping, the Certificate of Deposit (CoD) is issued through the authorised system. The CoD serves as a record of the vehicle being deposited for scrapping and can be useful for claiming eligible scrapping-related benefits. You also receive the payment based on the agreed valuation of your vehicle.",
          },
        ],
      },
      codBenefits: {
        title: "What Are the Benefits of a Certificate of Deposit (CoD)?",
        intro: "A Certificate of Deposit (CoD) is an important document issued when you deposit your vehicle at an authorised Registered Vehicle Scrapping Facility (RVSF). It serves as proof that your vehicle has been deposited for scrapping and may help you access eligible benefits when purchasing a new vehicle, subject to applicable rules.\n\nHere are the key benefits of a CoD:",
        points: [
          {
            label: "Proof of vehicle scrapping",
            text: "The CoD provides an official record that your vehicle has been deposited at an authorised scrapping facility.",
          },
          {
            label: "Access to eligible benefits",
            text: "Depending on the applicable rules and eligibility conditions, the CoD may help you claim scrapping-related benefits when purchasing a new vehicle.",
          },
          {
            label: "Useful when replacing your old car",
            text: "If you plan to buy another vehicle after scrapping your old one, the CoD can be useful for checking and claiming any applicable benefits.",
          },
          {
            label: "A record to keep for your records",
            text: "The CoD gives you documented proof of the vehicle’s deposit for scrapping and can be kept for future reference.",
          },
        ],
        closingNote: "When you scrap your car through ScrapCentre, you receive the CoD as part of the process. You can keep it for your records and check your eligibility for applicable benefits when purchasing your next vehicle.",
      },
      comparisonTable: {
        title: "Car Scrapping vs Selling to a Local Junkyard vs Donating",
        intro: "When you no longer want to keep an old car, scrapping is not the only option. You may also think about selling it to a local junkyard or donating it. Each option works differently, so it is useful to understand what happens to the vehicle and what you can expect from the process.",
        columns: ["Feature / Aspect", "Car Scrapping", "Selling to a Local Junkyard", "Donating"],
        rows: [
          {
            feature: "What happens to the car?",
            scrapping: "The vehicle is dismantled, and usable parts and recyclable materials are separated.",
            junkyard: "The vehicle may be dismantled, reused or sold for parts, depending on the buyer.",
            donating: "The vehicle may be used, repaired or sold by the organisation receiving it.",
          },
          {
            feature: "Payment",
            scrapping: "You may receive payment based on the vehicle’s scrap value.",
            junkyard: "You may receive a price agreed with the buyer.",
            donating: "Usually, there is no direct payment to the owner.",
          },
          {
            feature: "Documentation",
            scrapping: "The vehicle goes through the required formalities with an authorised facility.",
            junkyard: "Documentation depends on the buyer and the transaction.",
            donating: "The documents and transfer process depend on the organisation.",
          },
          {
            feature: "Best suited for",
            scrapping: "Cars that are old, damaged or no longer practical to use.",
            junkyard: "Owners looking for a direct sale to a local scrap buyer.",
            donating: "Vehicles that are still usable and suitable for donation.",
          },
        ],
        closingNote: "The right choice depends on the condition of your car and what you want to do with it. If the vehicle is no longer practical to use, car scrapping through an authorised facility can provide a more formal way to handle its disposal and recycling.",
      },
      scrapWithUs: {
        title: "Scrap Your Car with ScrapCentre",
        paragraphs: [
          "Choosing the right way to dispose of an old car can make the process simpler and more organised. If you are considering car scrapping, ScrapCentre helps you get started with an instant online valuation and free doorstep pickup.",
          "As an authorised RVSF, [ScrapCentre](https://www.scrapcentre.com/) manages the required car scrapping process and provides the Certificate of Deposit (CoD) as part of the process. You can check your car’s value online and connect with the ScrapCentre team to understand the next steps.",
        ],
      },
      faqs: {
        english: [
          {
            q: "Is car scrapping mandatory?",
            a: "No, car scrapping is not mandatory for every old car. It may be considered when a vehicle is no longer safe, usable or practical to maintain.",
          },
          {
            q: "Where can I scrap my car?",
            a: "You can scrap your car at an authorised car scrapping company or Registered Vehicle Scrapping Facility (RVSF) that follows the required car scrapping process and provides the necessary documentation.",
          },
          {
            q: "Is scrapping a car free?",
            a: "Car scrapping is not always free. However, ScrapCentre offers free doorstep pickup for eligible vehicles, while the vehicle’s scrap value and other terms depend on the arrangement.",
          },
        ],
        hinglish: [
          {
            q: "Kya car scrapping zaroori (mandatory) hai?",
            a: "Nahi, car scrapping har purani car ke liye mandatory nahi hai. Yeh tab consider kiya ja sakta hai jab gaadi safe, usable ya maintain karne ke liye practical na rahe.",
          },
          {
            q: "Main apni car kahan scrap kar sakta hoon?",
            a: "Aap apni car ek authorised car scrapping company ya Registered Vehicle Scrapping Facility (RVSF) mein scrap kar sakte hain jo zaroori process follow karti hai aur documentation provide karti hai.",
          },
          {
            q: "Kya car scrap karna free hai?",
            a: "Car scrapping hamesha free nahi hoti. Lekin, ScrapCentre eligible vehicles ke liye free doorstep pickup offer karta hai, jabki vehicle ki scrap value aur baaki terms arrangement par depend karti hain.",
          },
        ],
      },
    },
  },
]

