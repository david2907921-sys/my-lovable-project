
import { ManualItem, ManualCategory } from './types';

export interface ManualTemplate {
  id?: string;
  category: ManualCategory;
  icon: string;
  title: { en: string; de: string; hr: string };
  content: { en: string; de: string; hr: string };
}

export const GLOBAL_MANUAL_TEMPLATES: ManualTemplate[] = [
  // --- ARRIVAL (9 Items) ---
  { category: 'arrival', icon: 'Key', title: { en: "Self Check-in", de: "Selbst-Check-in", hr: "Samostalna prijava" }, content: { en: "The key box is next to the entrance. Code: 1234.", de: "Die Schlüsselbox ist am Eingang. Code: 1234.", hr: "Kutija za ključeve je kod ulaza. Šifra: 1234." } },
  { category: 'arrival', icon: 'Car', title: { en: "Parking", de: "Parken", hr: "Parking" }, content: { en: "Private parking space #4 is reserved for you.", de: "Privatparkplatz Nr. 4 ist für Sie reserviert.", hr: "Privatno parkirno mjesto br. 4 je rezervirano za vas." } },
  { category: 'arrival', icon: 'LogOut', title: { en: "Check-out", de: "Check-out", hr: "Odjava" }, content: { en: "Please leave by 10:00 AM and drop keys in the box.", de: "Bitte bis 10:00 Uhr auschecken und Schlüssel in die Box.", hr: "Molimo odjavite se do 10:00 i ostavite ključeve." } },
  { category: 'arrival', icon: 'MapPin', title: { en: "Gate Access", de: "Einfahrt", hr: "Ulazna vrata" }, content: { en: "The gate opens automatically via sensor.", de: "Das Tor öffnet automatisch per Sensor.", hr: "Vrata se otvaraju automatski putem senzora." } },
  { category: 'arrival', icon: 'Bus', title: { en: "Public Transport", de: "Öffentlicher Verkehr", hr: "Javni prijevoz" }, content: { en: "Bus stop 'Center' is 200m away.", de: "Bushaltestelle 'Zentrum' ist 200m entfernt.", hr: "Autobusna stanica 'Centar' je udaljena 200m." } },
  { category: 'arrival', icon: 'Info', title: { en: "Luggage Storage", de: "Gepäckaufbewahrung", hr: "Spremište prtljage" }, content: { en: "You can leave bags in the hallway after check-out.", de: "Taschen können nach dem Check-out im Flur bleiben.", hr: "Torbe možete ostaviti u hodniku nakon odjave." } },
  { category: 'arrival', icon: 'Key', title: { en: "Smart Lock App", de: "Smart Lock App", hr: "Smart Lock aplikacija" }, content: { en: "Download the Nuki app for keyless entry.", de: "Nutzen Sie die Nuki App für schlüssellosen Zugang.", hr: "Koristite aplikaciju Nuki za ulazak bez ključa." } },
  { category: 'arrival', icon: 'Car', title: { en: "EV Charging", de: "E-Auto laden", hr: "Punjenje E-vozila" }, content: { en: "Wallbox available in the garage. 11kW.", de: "Wallbox in der Garage verfügbar. 11kW.", hr: "Wallbox dostupan u garaži. 11kW." } },
  { category: 'arrival', icon: 'Info', title: { en: "Taxi Services", de: "Taxi-Ruf", hr: "Taxi služba" }, content: { en: "Call +385 91 123 for a local taxi.", de: "Taxi unter +385 91 123 rufen.", hr: "Nazovite +385 91 123 za lokalni taxi." } },

  // --- ESSENTIALS (6 Items) ---
  { category: 'essentials', icon: 'Wifi', title: { en: "High-Speed WiFi", de: "WLAN", hr: "Wi-Fi" }, content: { en: "SSID: Guest_Net. Password is in the app.", de: "WLAN: Guest_Net. Passwort steht in der App.", hr: "Mreža: Guest_Net. Lozinka je u aplikaciji." } },
  { category: 'essentials', icon: 'Trash2', title: { en: "Waste & Recycling", de: "Müll & Recycling", hr: "Otpad" }, content: { en: "Blue: Paper, Yellow: Plastic, Black: Rest.", de: "Blau: Papier, Gelb: Plastik, Schwarz: Restmüll.", hr: "Plavo: papir, žuto: plastika, crno: ostalo." } },
  { category: 'essentials', icon: 'Info', title: { en: "Drinking Water", de: "Trinkwasser", hr: "Voda za piće" }, content: { en: "Tap water is perfectly safe to drink.", de: "Das Leitungswasser ist trinkbar.", hr: "Voda iz slavine je sigurna za piće." } },
  { category: 'essentials', icon: 'Wind', title: { en: "Air Conditioning", de: "Klimaanlage", hr: "Klima uređaj" }, content: { en: "Keep windows closed when cooling.", de: "Fenster bei Kühlung bitte schließen.", hr: "Držite prozore zatvorenim dok hladi." } },
  { category: 'essentials', icon: 'Thermometer', title: { en: "Heating System", de: "Heizung", hr: "Grijanje" }, content: { en: "Floor heating takes 2h to react.", de: "Fußbodenheizung braucht 2h Vorlauf.", hr: "Podnom grijanju treba 2h da se zagrije." } },
  { category: 'essentials', icon: 'Info', title: { en: "Electricity / Fuses", de: "Sicherungen", hr: "Osigurači" }, content: { en: "Fuse box is located behind the entrance door.", de: "Sicherungskasten hinter der Eingangstür.", hr: "Kutija s osiguračima je iza ulaznih vrata." } },

  // --- KITCHEN (10 Items) ---
  { category: 'kitchen', icon: 'Coffee', title: { en: "Coffee Machine", de: "Kaffeemaschine", hr: "Aparat za kavu" }, content: { en: "Nespresso pods are provided in the tray.", de: "Nespresso Kapseln liegen bereit.", hr: "Nespresso kapsule su u ladici." } },
  { category: 'kitchen', icon: 'Utensils', title: { en: "Dishwasher", de: "Spülmaschine", hr: "Perilica posuđa" }, content: { en: "Use ECO mode to save water.", de: "ECO Modus spart Wasser.", hr: "Koristite ECO način rada." } },
  { category: 'kitchen', icon: 'Flame', title: { en: "Induction Hob", de: "Induktionsherd", hr: "Indukcijska ploča" }, content: { en: "Needs magnetic pots to work.", de: "Benötigt Magnet-Töpfe.", hr: "Potrebno magnetsko posuđe." } },
  { category: 'kitchen', icon: 'Info', title: { en: "Oven / Microwave", de: "Backofen", hr: "Pećnica" }, content: { en: "Digital timer must be set to start.", de: "Timer muss zum Starten eingestellt sein.", hr: "Timer mora biti postavljen za početak." } },
  { category: 'kitchen', icon: 'Info', title: { en: "Fridge & Freezer", de: "Kühlschrank", hr: "Hladnjak" }, content: { en: "Ice maker is on the front panel.", de: "Eiswürfelbereiter an der Front.", hr: "Ledomat je na prednjoj ploči." } },
  { category: 'kitchen', icon: 'Info', title: { en: "Kettle & Toaster", de: "Wasserkocher", hr: "Kuhalo i toster" }, content: { en: "Found in the lower cabinet left of the sink.", de: "Im Schrank links unter der Spüle.", hr: "U ormariću lijevo od sudopera." } },
  { category: 'kitchen', icon: 'Info', title: { en: "Wine Cooler", de: "Weinkühlschrank", hr: "Hladnjak za vino" }, content: { en: "Set to 12°C for local white wines.", de: "Auf 12°C für Weißwein eingestellt.", hr: "Postavljeno na 12°C za bijela vina." } },
  { category: 'kitchen', icon: 'Info', title: { en: "Spices & Oil", de: "Gewürze & Öl", hr: "Začini i ulje" }, content: { en: "Basic cooking supplies are in the pantry.", de: "Basis-Gewürze in der Speisekammer.", hr: "Osnovni začini su u ostavi." } },
  { category: 'kitchen', icon: 'Info', title: { en: "Barbecue / Grill", de: "Grill", hr: "Roštilj" }, content: { en: "Clean after use. Gas valve is behind.", de: "Nach Nutzung reinigen. Gasventil hinten.", hr: "Očistite nakon korištenja. Plin je straga." } },
  { category: 'kitchen', icon: 'Info', title: { en: "Blender", de: "Mixer", hr: "Blender" }, content: { en: "Perfect for smoothies. Stored in pantry.", de: "Ideal für Smoothies. In der Kammer.", hr: "Idealno za smoothie. U ostavi." } },

  // --- LIVING (6 Items) ---
  { category: 'living', icon: 'Tv', title: { en: "Smart TV", de: "Smart TV", hr: "Smart TV" }, content: { en: "Netflix is logged in as 'Guest'.", de: "Netflix als 'Guest' eingeloggt.", hr: "Netflix je prijavljen kao 'Guest'." } },
  { category: 'living', icon: 'Speaker', title: { en: "Audio System", de: "Soundsystem", hr: "Zvučni sustav" }, content: { en: "Bluetooth: 'Villa_Sound'. Enjoy!", de: "Bluetooth: 'Villa_Sound'. Viel Spaß!", hr: "Bluetooth: 'Villa_Sound'. Uživajte!" } },
  { category: 'living', icon: 'Info', title: { en: "Books & Games", de: "Bücher & Spiele", hr: "Knjige i igre" }, content: { en: "Check the shelf under the TV.", de: "Spiele im Regal unter dem TV.", hr: "Igre su na polici ispod TV-a." } },
  { category: 'living', icon: 'Flame', title: { en: "Fireplace", de: "Kamin", hr: "Kamin" }, content: { en: "Wood is stored on the terrace.", de: "Holz liegt auf der Terrasse bereit.", hr: "Drva su na terasi." } },
  { category: 'living', icon: 'Info', title: { en: "Workspace", de: "Arbeitsplatz", hr: "Radni stol" }, content: { en: "Desk with USB-C dock available.", de: "Schreibtisch mit USB-C Dock.", hr: "Radni stol s USB-C dockom." } },
  { category: 'living', icon: 'Info', title: { en: "Safe Box", de: "Safe", hr: "Sef" }, content: { en: "In the bedroom closet. Code: 0000.", de: "Im Schlafzimmerschrank. Code: 0000.", hr: "U ormaru spavaće sobe. Šifra: 0000." } },

  // --- WELLNESS (6 Items) ---
  { category: 'wellness', icon: 'Waves', title: { en: "Pool Heating", de: "Poolheizung", hr: "Grijanje bazena" }, content: { en: "Pool is automatically 28°C.", de: "Pool hat automatisch 28°C.", hr: "Bazen je automatski na 28°C." } },
  { category: 'wellness', icon: 'Info', title: { en: "Sauna", de: "Sauna", hr: "Sauna" }, content: { en: "Preheat 30 min. Max 15 min session.", de: "30 Min vorheizen. Max 15 Min.", hr: "Zagrijte 30 min. Max 15 min." } },
  { category: 'wellness', icon: 'Info', title: { en: "Beach Towels", de: "Strandtücher", hr: "Ručnici za plažu" }, content: { en: "Found in the laundry room basket.", de: "In der Waschküche im Korb.", hr: "U praonici, u košari." } },
  { category: 'wellness', icon: 'Info', title: { en: "Sunbeds", de: "Liegen", hr: "Ležaljke" }, content: { en: "Please fold umbrellas when windy.", de: "Schirme bei Wind bitte schließen.", hr: "Zatvorite suncobrane po vjetru." } },
  { category: 'wellness', icon: 'Waves', title: { en: "Jacuzzi", de: "Whirlpool", hr: "Jacuzzi" }, content: { en: "Keep lid closed when not in use.", de: "Deckel bei Nichtnutzung schließen.", hr: "Zatvorite poklopac nakon korištenja." } },
  { category: 'wellness', icon: 'Info', title: { en: "Gym Equipment", de: "Fitness", hr: "Teretana" }, content: { en: "Yoga mats and weights in the attic.", de: "Yogamatten und Gewichte im DG.", hr: "Yoga prostirke i utezi su u potkrovlju." } },

  // --- RULES (4 Items) ---
  { category: 'rules', icon: 'Moon', title: { en: "Quiet Hours", de: "Ruhezeiten", hr: "Noćni mir" }, content: { en: "Please be quiet between 22:00 - 08:00.", de: "Nachtruhe von 22:00 bis 08:00 Uhr.", hr: "Molimo za tišinu od 22:00 do 08:00." } },
  { category: 'rules', icon: 'CigaretteOff', title: { en: "Smoking Policy", de: "Rauchen", hr: "Pušenje" }, content: { en: "Strictly forbidden inside. Terrace only.", de: "Nur auf der Terrasse erlaubt.", hr: "Strogo zabranjeno unutra. Samo terasa." } },
  { category: 'rules', icon: 'Info', title: { en: "Extra Guests", de: "Gäste", hr: "Gosti" }, content: { en: "Day guests must be registered.", de: "Tagesgäste müssen angemeldet werden.", hr: "Dnevni gosti moraju biti prijavljeni." } },
  { category: 'rules', icon: 'Info', title: { en: "Parties", de: "Partys", hr: "Zabave" }, content: { en: "No parties or large gatherings allowed.", de: "Keine Partys oder großen Events.", hr: "Zabave nisu dopuštene." } },

  // --- EMERGENCY (4 Items) ---
  { category: 'emergency', icon: 'FireExtinguisher', title: { en: "Fire Safety", de: "Brandschutz", hr: "Protupožarna zaštita" }, content: { en: "Extinguisher is under the sink.", de: "Feuerlöscher unter der Spüle.", hr: "Aparat za gašenje je ispod sudopera." } },
  { category: 'emergency', icon: 'Stethoscope', title: { en: "First Aid", de: "Erste Hilfe", hr: "Prva pomoć" }, content: { en: "Found in the bathroom cabinet.", de: "Im Badezimmerschrank.", hr: "U ormariću u kupaonici." } },
  { category: 'emergency', icon: 'Info', title: { en: "Doctor / Hospital", de: "Arzt / Klinik", hr: "Liječnik / Bolnica" }, content: { en: "Nearest hospital: Šibenik Central.", de: "Nächstes KH: Šibenik Zentral.", hr: "Najbliža bolnica: Šibenik." } },
  { category: 'emergency', icon: 'Phone', title: { en: "Emergency Numbers", de: "Notrufnummern", hr: "Hitni brojevi" }, content: { en: "Call 112 for all emergencies.", de: "Notruf 112 wählen.", hr: "Nazovite 112 za hitne slučajeve." } }
];
