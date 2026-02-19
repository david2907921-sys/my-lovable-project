
import { AppConfig, Event } from './types';
import { GLOBAL_TRANSLATIONS } from './translations';
import { GLOBAL_RECOMMENDATIONS } from './recommendations';

export const TRANSLATIONS = GLOBAL_TRANSLATIONS;

export const APP_CONFIG: AppConfig = {
  propertyName: "Villa Serenity",
  heroTitle: {
    en: "Experience the essence of the Mediterranean.",
    de: "Erleben Sie die Essenz des Mittelmeers.",
    hr: "Doživite bit Mediterana."
  },
  heroSubtitle: {
    en: "Your private sanctuary in the heart of Šibenik.",
    de: "Ihr privates Refugium im Herzen von Šibenik.",
    hr: "Vaše privatno utočište u srcu Šibenika."
  },
  hostName: "Marko",
  hostPhone: "+385912345678",
  wifiSsid: "VillaSerenity_Guest",
  wifiPass: "AdriaticBlue2024",
  themeColors: {
    primary: '#0a2472',
    secondary: '#c5a028'
  },
  validBookings: [
    { surname: "Smith", phoneLast5: "12345" },
    { surname: "Muller", phoneLast5: "54321" }
  ],
  coordinates: { lat: 43.7350, lng: 15.8952 },
  
  recommendations: GLOBAL_RECOMMENDATIONS, 
  
  gazette: [
    {
      id: 'note-1',
      type: 'editorial',
      // Added missing category property
      category: 'EDITORIAL',
      tag: { en: "Host's Note", de: "Vom Gastgeber", hr: "Poruka domaćina" },
      title: { en: "Morning Harvest", de: "Morgendliche Ernte", hr: "Jutarnja berba" },
      content: { 
        en: "Fresh figs from our garden are waiting for you in the kitchen.",
        de: "Frische Feigen aus unserem Garten warten in der Küche auf Sie.",
        hr: "Svježe smokve iz našeg vrta čekaju vas u kuhinji."
      },
      longContent: {
        en: "We believe in the slow morning. Help yourself to the fresh figs and some local honey we left for you.",
        de: "Wir glauben an einen entspannten Morgen. Bedienen Sie sich an den frischen Feigen und dem lokalen Honig.",
        hr: "Vjerujemo u polagano jutro. Poslužite se svježim smokvama i domaćim medom koji smo vam ostavili."
      }
    },
    {
      id: 'highlight-1',
      type: 'highlight',
      // Added missing category property
      category: 'LOCAL_DISCOVERY',
      tag: { en: "Nature Alert", de: "Natur-Tipp", hr: "Savjet o prirodi" },
      title: { en: "Perfect for Krka", de: "Perfekt für Krka", hr: "Idealno za Krku" },
      content: { 
        en: "Sunny conditions today for a boat trip to the waterfalls.",
        de: "Heute herrschen sonnige Bedingungen für einen Bootsausflug zu den Wasserfällen.",
        hr: "Danas su sunčani uvjeti za izlet brodom do slapova."
      },
      image: "https://images.unsplash.com/photo-1518182170546-0766be6f5a56?auto=format&fit=crop&w=800&q=80"
    }
  ],

  checkInGuide: [
    {
      id: 'door-code',
      category: 'arrival',
      icon: 'Key',
      title: { en: "Door Code & Key", de: "Türcode & Schlüssel", hr: "Šifra Vrata i Ključ" },
      content: {
        en: "Your personal door code is: 1234 #",
        de: "Ihr persönlicher Türcode ist: 1234 #",
        hr: "Vaša osobna šifra za vrata je: 1234 #"
      }
    }
  ],
  
  manual: [
    {
      id: 'parking',
      category: 'arrival',
      icon: 'Car',
      title: { en: "Parking & Garage", de: "Parken & Garage", hr: "Parking i Garaža" },
      content: { 
        en: "Private parking is available behind the villa.", 
        de: "Private Parkplätze stehen hinter der Villa zur Verfügung.", 
        hr: "Privatni parking dostupan je iza vile." 
      }
    },
    {
      id: 'coffee',
      category: 'kitchen',
      icon: 'Coffee',
      title: { en: "Coffee Machine", de: "Kaffeemaschine", hr: "Aparat za Kavu" },
      content: { 
        en: "The Nespresso machine is located in the main kitchen area.", 
        de: "Die Nespresso-Maschine befindet sich im Hauptküchenbereich.", 
        hr: "Nespresso aparat nalazi se u glavnom kuhinjskom dijelu." 
      },
      videoUrl: "https://v1.pinimg.com/videos/iht/540/4e/c7/2b/4ec72b4f910404457e55959325946110.mp4"
    }
  ],
  
  guestTips: [
    {
      id: 't2',
      author: 'Marko (Host)',
      date: 'July 2024',
      content: 'For the best sunset view, go to the Barone fortress.',
      category: 'hidden-gem',
      upvotes: 156,
      isHostVerified: true
    }
  ],
  // Fix: Added missing logistics property to satisfy AppConfig type requirement
  logistics: {}
};

export const MOCK_EVENTS: Event[] = [];
