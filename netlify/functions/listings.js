/**
 * Netlify Function : API Listings (Connexion sécurisée avec Airtable)
 * Récupère les offres depuis Airtable et les fusionne intelligemment avec le catalogue officiel.
 * Cache CDN de 60 secondes pour une vitesse optimale et zéro dépassement de quota.
 */

const DEFAULT_LISTINGS = [
  {
    ref: 'CA-V01', title: 'Villa contemporaine R+1 avec terrasses', cat: ['vente'], status: 'exclu',
    img: 'villa-moderne', w: 640, h: 807, pos: '50% 35%', alt: 'Villa contemporaine blanche à deux niveaux avec grandes baies vitrées',
    area: 'Foundiougne', loc: 'Foundiougne',
    desc: 'Lignes épurées, larges baies vitrées et terrasses ouvertes sur un jardin paysager.',
    feats: [['maximize', '280 m² bâtis'], ['bed', '4 chambres'], ['sun', 'Terrasses']],
    priceLabel: 'Prix de vente', price: 'Sur demande',
  },
  {
    ref: 'CA-T02', title: 'Terrain résidentiel à bâtir', cat: ['terrain', 'vente'], status: 'dispo',
    img: 'terrain', w: 640, h: 776, pos: '50% 60%', alt: 'Parcelle de terrain délimitée entourée d’arbres',
    area: 'Département de Foundiougne', loc: 'Foundiougne & environs',
    desc: 'Parcelles en zone résidentielle, avec accompagnement juridique jusqu’à la signature.',
    feats: [['maximize', '150 à 500 m²'], ['shield', 'Vérif. juridique'], ['map', 'Zone résidentielle']],
    priceLabel: 'Prix de vente', price: 'Sur demande',
  },
  {
    ref: 'CA-A03', title: 'Villa R+1 conçue sur plan 3D', cat: ['architecture'], status: 'plan',
    img: 'maquette-3d', w: 664, h: 500, pos: '50% 45%', alt: 'Maquette 3D d’une villa posée sur des plans d’architecte',
    area: 'Partout au Sénégal', loc: 'Sur votre terrain, partout au Sénégal',
    desc: 'Conception personnalisée, plans 2D/3D et dossier d’autorisation de construire.',
    feats: [['layers', 'Plans 2D & 3D'], ['file', 'Autorisation'], ['hardhat', 'Suivi chantier']],
    priceLabel: 'Étude', price: 'Sur devis',
  },
  {
    ref: 'CA-S04', title: 'Résidence de charme au bord du Saloum', cat: ['tourisme'], status: 'dispo',
    img: 'lodge-saloum', w: 640, h: 537, pos: '50% 50%', alt: 'Résidence fleurie avec transats sous les palmiers',
    area: 'Foundiougne', loc: 'Foundiougne · bord du fleuve',
    desc: 'Hébergement partenaire au calme, jardin fleuri et transats à l’ombre des palmiers.',
    feats: [['bed', 'Hébergement'], ['sun', 'Jardin & transats'], ['waves', 'Bord du fleuve']],
    priceLabel: 'Séjour', price: 'Sur consultation',
  },
  {
    ref: 'CA-L05', title: 'Maison familiale avec cour', cat: ['location'], status: 'location',
    img: 'maison', w: 640, h: 784, pos: '50% 55%', alt: 'Maison moderne blanche entourée de palmiers',
    area: 'Foundiougne', loc: 'Foundiougne',
    desc: 'Maison lumineuse dans un quartier calme, idéale pour une famille.',
    feats: [['bed', '3 chambres'], ['home', 'Salon + cuisine'], ['sun', 'Cour privée']],
    priceLabel: 'Loyer mensuel', price: 'Sur demande',
  },
  {
    ref: 'CA-T06', title: 'Foncier en bord de Saloum pour projet touristique', cat: ['terrain', 'vente'], status: 'vente',
    img: 'pirogue-pont', w: 944, h: 393, pos: '60% 50%', alt: 'Rive du Saloum avec pirogue colorée et pont de Foundiougne',
    area: 'Département de Foundiougne', loc: 'Département de Foundiougne',
    desc: 'Opportunité pour campement, lodge ou résidence, avec étude de faisabilité possible.',
    feats: [['maximize', 'Grande surface'], ['waves', 'Bord du Saloum'], ['shield', 'Vérif. juridique']],
    priceLabel: 'Prix de vente', price: 'Sur consultation',
  },
  {
    ref: 'CA-A07', title: 'Aménagement intérieur clé en main', cat: ['architecture'], status: 'devis',
    img: 'salon-design', w: 1460, h: 545, pos: '45% 50%', alt: 'Salon contemporain aménagé avec canapé d’angle et éclairage chaleureux',
    area: 'Partout au Sénégal', loc: 'Maisons, appartements, hôtels',
    desc: 'Design d’espace, plan d’aménagement, choix des couleurs et matières, mobilier sur mesure.',
    feats: [['sofa', 'Aménagement'], ['palette', 'Couleurs & matières'], ['sparkles', 'Déco sur mesure']],
    priceLabel: 'Projet', price: 'Sur devis',
  },
  {
    ref: 'CA-S08', title: 'Balade en pirogue au coucher du soleil', cat: ['tourisme'], status: 'dispo',
    img: 'coucher-saloum', w: 640, h: 568, pos: '50% 60%', alt: 'Pirogue sur le Saloum au coucher du soleil',
    area: 'Îles du Saloum', loc: 'Delta du Saloum',
    desc: 'Mangroves, bolongs et îles du Saloum avec un guide local partenaire.',
    feats: [['sailboat', 'Pirogue'], ['clock', 'Fin de journée'], ['users', 'Guide local']],
    priceLabel: 'Excursion', price: 'Sur consultation',
  },
  {
    ref: 'CA-L09', title: 'Gestion locative de votre bien', cat: ['location'], status: 'location',
    img: 'juridique', w: 640, h: 552, pos: '50% 45%', alt: 'Balance de la justice et ouvrages de droit immobilier, notariat et contrats',
    area: 'Département de Foundiougne', loc: 'Département de Foundiougne',
    desc: 'Mise en location, rédaction et suivi des contrats, encaissements et état des lieux.',
    feats: [['key', 'Mise en location'], ['file', 'Contrats'], ['check', 'Suivi complet']],
    priceLabel: 'Mandat', price: 'Sur consultation',
  },
  {
    ref: 'CA-P10', title: 'Impression textile & sérigraphie (t-shirts, polos, casquettes)', cat: ['serigraphie'], status: 'devis',
    img: 'impression', w: 640, h: 243, pos: '50% 50%', alt: 'T-shirts, polos et casquettes personnalisés en sérigraphie dans l’atelier',
    area: 'Département de Foundiougne', loc: 'Atelier Foundiougne · expédition partout',
    desc: 'Personnalisation textile pour entreprises, clubs sportifs, associations et événements familiaux.',
    feats: [['shirt', 'T-shirts & polos'], ['sparkles', 'Haute tenue'], ['printer', 'Sérigraphie & flocage']],
    priceLabel: 'Tarif', price: 'Sur devis',
  },
  {
    ref: 'CA-P11', title: 'Supports de communication & goodies publicitaires', cat: ['serigraphie'], status: 'devis',
    img: 'impression', w: 640, h: 243, pos: '50% 50%', alt: 'Bannières, flyers, cartes et objets promotionnels imprimés',
    area: 'Partout au Sénégal', loc: 'Atelier Foundiougne & tout le Sénégal',
    desc: 'Flyers, bâches, enseignes, stylos et goodies pour valoriser votre marque avec élégance.',
    feats: [['printer', 'Numérique'], ['gift', 'Goodies & objets'], ['file', 'Bannières & flyers']],
    priceLabel: 'Tarif', price: 'Sur devis',
  },
];

const parseCat = (raw) => {
  if (!raw) return ['vente'];
  if (Array.isArray(raw)) return raw.map(c => String(c).toLowerCase().trim());
  const str = String(raw).toLowerCase().trim();
  if (str.includes('terrain') || str.includes('foncier')) return ['terrain', 'vente'];
  if (str.includes('archi') || str.includes('plan') || str.includes('design')) return ['architecture'];
  if (str.includes('tour') || str.includes('hotel') || str.includes('lodge') || str.includes('saloum')) return ['tourisme'];
  if (str.includes('locat') || str.includes('louer')) return ['location'];
  if (str.includes('seri') || str.includes('impri') || str.includes('textile')) return ['serigraphie'];
  return str.split(/[,;\/]+/).map(c => c.trim()).filter(Boolean);
};

const parseStatus = (raw) => {
  if (!raw) return 'dispo';
  const s = String(raw).toLowerCase().trim();
  if (s.includes('exclu')) return 'exclu';
  if (s.includes('plan')) return 'plan';
  if (s.includes('locat')) return 'location';
  if (s.includes('devis')) return 'devis';
  if (s.includes('vent')) return 'vente';
  return 'dispo';
};

const parseFeats = (raw) => {
  if (!raw) return [['shield', 'Accompagnement pro']];
  if (Array.isArray(raw)) return raw;
  return String(raw).split(/\r?\n|,/).map(item => {
    const trimmed = item.trim();
    if (!trimmed) return null;
    const parts = trimmed.split(':');
    if (parts.length > 1) {
      return [parts[0].trim(), parts.slice(1).join(':').trim()];
    }
    return ['check', trimmed];
  }).filter(Boolean);
};

export default async (req) => {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Biens';

  // Si Airtable n'est pas encore configuré, renvoie les 11 annonces complètes
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return new Response(JSON.stringify({ source: 'default', listings: DEFAULT_LISTINGS }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      },
    });

    if (!res.ok) {
      console.warn('Airtable API non disponible, utilisation du catalogue par défaut');
      return new Response(JSON.stringify({ source: 'fallback', listings: DEFAULT_LISTINGS }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await res.json();
    const records = data.records || [];

    // Filtre uniquement les lignes valides qui ont un vrai titre (ignore les 3 lignes vides par défaut d'Airtable)
    const validAirtableListings = records
      .map((r, idx) => {
        const f = r.fields || {};
        const title = (f['Titre'] || f['titre'] || f['Nom'] || f['nom'] || f['Name'] || f['name'] || '').trim();
        
        // Ignore les lignes vides ou sans titre
        if (!title || title.toLowerCase() === 'bien immobilier') return null;

        // Respecte la case "En ligne" si elle existe
        if (f['En ligne'] === false || f['En Ligne'] === false || f['Active'] === false) return null;

        const photos = f['Photos'] || f['Photo'] || f['Images'] || f['Image'] || f['Attachments'] || [];
        const photoUrl = photos.length > 0 ? (photos[0].thumbnails?.large?.url || photos[0].url) : 'villa-moderne';

        return {
          ref: f['Référence'] || f['Reference'] || f['Ref'] || `CA-AIR-${idx + 1}`,
          title: title,
          cat: parseCat(f['Catégorie'] || f['Categorie'] || f['Category']),
          status: parseStatus(f['Statut'] || f['Status']),
          img: photoUrl,
          w: 640,
          h: 640,
          pos: '50% 50%',
          alt: title,
          area: f['Zone'] || f['Région'] || f['Region'] || 'Foundiougne',
          loc: f['Localisation'] || f['Location'] || 'Foundiougne',
          desc: f['Description'] || f['Desc'] || '',
          feats: parseFeats(f['Caractéristiques'] || f['Caracteristiques'] || f['Features']),
          priceLabel: f['Label Prix'] || (f['Statut'] === 'location' ? 'Loyer mensuel' : 'Prix de vente'),
          price: f['Prix'] || f['Price'] || 'Sur demande',
        };
      })
      .filter(Boolean);

    // Stratégie de fusion intelligente :
    // Si aucune ligne valide n'a encore été saisie dans Airtable, garder tout le catalogue d'origine
    let finalList = [...DEFAULT_LISTINGS];

    if (validAirtableListings.length > 0) {
      // Les biens ajoutés dans Airtable sont placés en priorité au début du catalogue
      // et écrasent les biens de démonstration si la même référence est utilisée
      const airtableRefs = new Set(validAirtableListings.map(it => it.ref));
      const remainingDefaults = DEFAULT_LISTINGS.filter(it => !airtableRefs.has(it.ref));
      finalList = [...validAirtableListings, ...remainingDefaults];
    }

    return new Response(JSON.stringify({ source: 'airtable', listings: finalList }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Erreur Netlify Function listings:', err);
    return new Response(JSON.stringify({ source: 'fallback', listings: DEFAULT_LISTINGS }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
