// This utility file contains sample data to populate the database
// Run this once to add sample tours and videos

import { supabase } from "@/integrations/supabase/client";

export const sampleTours = [
  {
    title: "Serengeti Safari Adventure",
    description: "Experience the wonder of African wildlife on this thrilling 3-day safari through Tanzania's most famous national park. Witness the Great Migration and see the Big Five in their natural habitat.",
    location_name: "Serengeti National Park, Tanzania",
    location_lat: -2.3333,
    location_lng: 34.8333,
    price_per_person: 850,
    duration_hours: 72,
    max_participants: 8,
    difficulty_level: "moderate",
    languages: ["English", "Swahili"],
    included_items: ["Safari vehicle", "Professional guide", "Meals", "Park fees"],
    images: ["/assets/tour-safari.jpg"]
  },
  {
    title: "Historic Prague Walking Tour",
    description: "Discover the magic of Prague's medieval old town with our expert local guide. Visit Prague Castle, Charles Bridge, and hidden gems only locals know about.",
    location_name: "Prague, Czech Republic",
    location_lat: 50.0875,
    location_lng: 14.4213,
    price_per_person: 45,
    duration_hours: 4,
    max_participants: 15,
    difficulty_level: "easy",
    languages: ["English", "Czech", "German"],
    included_items: ["Walking tour", "Expert guide", "Historical insights"],
    images: ["/assets/tour-city.jpg"]
  },
  {
    title: "Great Barrier Reef Diving",
    description: "Dive into the world's largest coral reef system. Explore vibrant marine life, colorful corals, and crystal-clear waters in this unforgettable underwater adventure.",
    location_name: "Great Barrier Reef, Australia",
    location_lat: -18.2871,
    location_lng: 147.6992,
    price_per_person: 280,
    duration_hours: 8,
    max_participants: 10,
    difficulty_level: "moderate",
    languages: ["English"],
    included_items: ["Diving equipment", "Boat transport", "Lunch", "Certified instructor"],
    images: ["/assets/tour-diving.jpg"]
  },
  {
    title: "Himalayan Mountain Trek",
    description: "Challenge yourself with this breathtaking 5-day trek through the Himalayas. Experience stunning mountain vistas, local Sherpa culture, and the adventure of a lifetime.",
    location_name: "Annapurna Region, Nepal",
    location_lat: 28.5969,
    location_lng: 83.8202,
    price_per_person: 650,
    duration_hours: 120,
    max_participants: 12,
    difficulty_level: "challenging",
    languages: ["English", "Nepali"],
    included_items: ["Guide", "Porter service", "Accommodation", "Meals", "Permits"],
    images: ["/assets/tour-hiking.jpg"]
  },
  {
    title: "Bangkok Street Food Night Tour",
    description: "Taste your way through Bangkok's vibrant night markets with a local foodie guide. Sample authentic Thai dishes, learn cooking secrets, and experience local culture.",
    location_name: "Bangkok, Thailand",
    location_lat: 13.7563,
    location_lng: 100.5018,
    price_per_person: 55,
    duration_hours: 4,
    max_participants: 10,
    difficulty_level: "easy",
    languages: ["English", "Thai"],
    included_items: ["Food samples", "Local guide", "Market visits", "Cooking tips"],
    images: ["/assets/tour-food.jpg"]
  },
  {
    title: "Philippine Island Hopping",
    description: "Explore the stunning islands of Palawan with crystal-clear lagoons, white sand beaches, and incredible snorkeling spots. A tropical paradise awaits!",
    location_name: "El Nido, Palawan, Philippines",
    location_lat: 11.1949,
    location_lng: 119.4013,
    price_per_person: 95,
    duration_hours: 8,
    max_participants: 20,
    difficulty_level: "easy",
    languages: ["English", "Tagalog"],
    included_items: ["Boat transport", "Snorkeling gear", "Lunch", "Island fees"],
    images: ["/assets/tour-beach.jpg"]
  }
];

export const sampleVideos = [
  {
    title: "Safari Sunset in Serengeti",
    description: "Watch elephants gathering at the waterhole during golden hour. Nature's most beautiful moment captured!",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    title: "Prague Castle at Dawn",
    description: "Experience the magic of Prague's iconic castle complex as the morning sun illuminates its Gothic towers.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    title: "Underwater Paradise",
    description: "Dive into the Great Barrier Reef and swim alongside colorful marine life in crystal-clear waters.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  },
  {
    title: "Mountain Peak Sunrise",
    description: "Reach the summit of a Himalayan peak and witness the breathtaking sunrise over the world's highest mountains.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
  },
  {
    title: "Bangkok Night Market",
    description: "Experience the vibrant energy of Bangkok's street food scene with sizzling woks and aromatic dishes.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
  },
  {
    title: "Island Paradise Aerial View",
    description: "Soar above the turquoise waters and stunning islands of Palawan. Pure tropical beauty!",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
  }
];
