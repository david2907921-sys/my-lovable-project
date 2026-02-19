
import { Recommendation } from './types';

export const GLOBAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'poi_pellegrini',
    title: {
      en: "Pellegrini",
      de: "Pellegrini",
      hr: "Pellegrini"
    },
    category: 'food',
    town: 'Šibenik',
    lat: 43.7365,
    lng: 15.8905,
    priceLevel: 4,
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
    description: {
      en: "Michelin-starred dining right next to the cathedral.",
      de: "Michelin-Sterne-Restaurant direkt neben der Kathedrale.",
      hr: "Restoran s Michelinovom zvjezdicom tik do katedrale."
    },
    hostTip: {
      en: "Book 2 weeks in advance. Try the tasting menu.",
      de: "2 Wochen im Voraus buchen. Probieren Sie das Degustationsmenü.",
      hr: "Rezervirajte 2 tjedna unaprijed. Probajte degustacijski meni."
    }
  },
  {
    id: 'poi_krka',
    title: {
      en: "Krka National Park",
      de: "Krka Nationalpark",
      hr: "Nacionalni park Krka"
    },
    category: 'activity',
    town: 'Lozovac',
    lat: 43.8042,
    lng: 15.9723,
    priceLevel: 3,
    image: "https://images.unsplash.com/photo-1518182170546-0766be6f5a56?auto=format&fit=crop&w=800&q=80",
    description: {
      en: "A stunning network of waterfalls and nature trails.",
      de: "Ein atemberaubendes Netzwerk aus Wasserfällen.",
      hr: "Prekrasna mreža slapova i prirodnih staza."
    },
    hostTip: {
      en: "Enter via Lozovac entrance for free parking.",
      de: "Eingang Lozovac für kostenlose Parkplätze nutzen.",
      hr: "Uđite na ulaz Lozovac za besplatan parking."
    }
  }
];
