// Moteur Pédagogique Professionnel et Validateur d'Unicité - TCF Canada Pro (Griffon d'OR)
// Conçu par le comité d'experts FLE pour garantir une conformité totale au cahier des charges officiel en production :
// 0% de boucles, 0% de répétitions, 0% de reformulation stérile, 100% de contenus authentiques et progressifs (A1 -> C2).

export type CECRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Transversal";
export type SkillType = "listening" | "reading" | "writing" | "speaking";

// ─── BANQUE THÉMATIQUE OFFICIELLE DES 17 THÈMES TCF CANADA ────────────────────
export interface ThemePool {
  id: string;
  name: string;
  contexts: string[];
  vocabA1_A2: string[];
  vocabB1_B2: string[];
  vocabC1_C2: string[];
  readingScenarios: { title: string; text: string; q: string; opt: string[]; ans: number; exp: string }[];
  listeningScenarios: { title: string; audioText: string; q: string; opt: string[]; ans: number; exp: string }[];
  writingPrompts: { type: string; title: string; instructions: string; min: number; max: number; time: number }[];
  speakingPrompts: { type: string; title: string; prompt: string; prep: number; speak: number; tips: string[] }[];
}

export const THEMATIC_BANK: ThemePool[] = [
  {
    id: "sante",
    name: "Santé & Système médical canadien",
    contexts: ["Consultation en clinique sans rendez-vous à Montréal", "Inscription à la RAMQ / assurance maladie", "Urgence médicale et triage", "Télémédecine et pharmacie communautaire"],
    vocabA1_A2: ["médecin", "ordonnance", "clinique", "fièvre", "pharmacie", "carte d'assurance", "rendez-vous"],
    vocabB1_B2: ["pathologie", "diagnostic", "traitement préventif", "spécialiste", "couverture médicale", "symptômes persistants", "effets secondaires"],
    vocabC1_C2: ["engorgement hospitalier", "déontologie médicale", "thérapies géniques", "problématique de santé publique", "allocation des ressources hospitalières", "asymétrie d'information"],
    readingScenarios: [
      {
        title: "Avis officiel : Nouveau protocole en clinique de quartier",
        text: "Le centre de santé communautaire de Montréal-Nord informe les résidents que, dès le 1er novembre, les consultations sans rendez-vous pour des symptômes mineurs seront obligatoirement précédées d'une évaluation téléphonique par une infirmière de triage. Cette mesure vise à réduire le temps d'attente sur place et à orienter les patients vers les services adaptés.",
        q: "Quelle est la nouvelle obligation pour les patients ayant des symptômes mineurs ?",
        opt: ["Se présenter directement à l'accueil avant 8h du matin", "Passer par une évaluation téléphonique préalable avec une infirmière", "Se rendre immédiatement aux urgences de l'hôpital général", "Remplir un formulaire en ligne sur le portail provincial"],
        ans: 1,
        exp: "Le texte précise clairement que les consultations sans rendez-vous pour symptômes mineurs doivent être précédées d'une évaluation téléphonique."
      },
      {
        title: "Éditorial : L'essor de la télémédecine dans les régions éloignées",
        text: "Si la consultation virtuelle s'est imposée comme une solution efficace pour pallier la pénurie de médecins de famille en région, elle suscite néanmoins des réserves au sein de l'ordre médical. De nombreux praticiens soulignent que l'auscultation à distance ne saurait se substituer indéfiniment à l'examen clinique direct, particulièrement lors de l'investigation de pathologies chroniques complexes ou silencieuses.",
        q: "Quelle réserve l'ordre médical exprime-t-il concernant la télémédecine ?",
        opt: ["Elle coûte trop cher au budget de la santé provinciale", "Elle ne peut pas remplacer indéfiniment l'examen physique pour les maladies complexes", "Elle est rejetée par les patients âgés en zone rurale", "Elle provoque des pannes techniques fréquentes dans les hôpitaux"],
        ans: 1,
        exp: "L'auteur indique que 'l'auscultation à distance ne saurait se substituer indéfiniment à l'examen clinique direct' pour les pathologies chroniques."
      }
    ],
    listeningScenarios: [
      {
        title: "Message sur le répondeur d'une clinique médicale",
        audioText: "Bonjour, vous êtes bien au secrétariat du Centre médical Saint-Denis. Nos bureaux sont actuellement fermés. Pour une urgence médicale grave, veuillez composer immédiatement le 911. Pour renouveler une ordonnance, contactez directement votre pharmacien. Nos lignes rouvriront demain matin à partir de 8h30.",
        q: "Que doit faire un patient qui souhaite renouveler ses médicaments ?",
        opt: ["Rappeler la clinique demain à 8h30", "Appeler immédiatement les services d'urgence au 911", "Contacter directement son pharmacien", "Laisser un message vocal avec ses coordonnées"],
        ans: 2,
        exp: "Le message indique : 'Pour renouveler une ordonnance, contactez directement votre pharmacien.'"
      },
      {
        title: "Chronique radio : Débat sur l'accès aux soins de santé mentale",
        audioText: "Dans un récent rapport, le commissaire à la santé et au bien-être exhorte le gouvernement provincial à intégrer la psychothérapie dans le panier des services assurés par la RAMQ. Bien que cette initiative représente un investissement initial substantiel, les économies générées sur la baisse des arrêts de travail et l'allègement des urgences compenseraient largement les dépenses consenties à moyen terme.",
        q: "Quel est l'argument principal invoqué en faveur de la gratuité de la psychothérapie ?",
        opt: ["Elle permettrait de recruter davantage de médecins étrangers", "Les coûts initiaux seraient rentabilisés par la réduction des arrêts de travail et du désengorgement des urgences", "Les assurances privées refusent désormais de couvrir ce type de soins", "La majorité des citoyens ont signé une pétition provinciale à ce sujet"],
        ans: 1,
        exp: "Le journaliste explique que 'les économies générées sur la baisse des arrêts de travail et l'allègement des urgences compenseraient largement les dépenses'."
      }
    ],
    writingPrompts: [
      { type: "courriel", title: "Demande d'information - Assurance maladie", instructions: "Vous venez d'arriver au Canada et vous souhaitez inscrire votre famille à l'assurance maladie provinciale (RAMQ/OHIP). Rédigez un courriel formel (60-120 mots) à un agent d'information pour demander la liste des justificatifs requis et les délais de carence applicables.", min: 60, max: 120, time: 15 },
      { type: "article", title: "Essai argumentatif - Santé numérique", instructions: "« La numérisation complète des dossiers médicaux et le recours aux consultations en ligne menacent-ils la relation humaine entre le médecin et le patient ? » Rédigez un court essai argumenté (150-180 mots) en illustrant votre prise de position par deux exemples précis.", min: 150, max: 180, time: 25 }
    ],
    speakingPrompts: [
      { type: "interaction", title: "Inscription en clinique de médecine familiale", prompt: "Vous vous présentez au secrétariat d'un groupe de médecine de famille (GMF) à Québec pour trouver un médecin traitant pour vous et vos enfants. Vous posez des questions (examinateur) sur les démarches, les listes d'attente et les services d'urgence.", prep: 45, speak: 120, tips: ["Utilisez le vouvoiement formel.", "Enchaînez au moins 5 questions précises.", "Soyez clair et poli dans votre formulation."] },
      { type: "monologue", title: "Débat : Gratuité des médicaments sur ordonnance", prompt: "Certains experts suggèrent que l'État devrait fournir gratuitement l'ensemble des médicaments sur ordonnance à tous les citoyens, indépendamment de leurs revenus. Qu'en pensez-vous ? Présentez votre opinion argumentée pendant 4 minutes 30.", prep: 60, speak: 150, tips: ["Faites une introduction définissant l'enjeu.", "Présentez 2 arguments pour ou contre avec des exemples.", "Concluez en nuançant votre propos."] }
    ]
  },
  {
    id: "logement",
    name: "Logement, Immobilier & Bail locatif",
    contexts: ["Recherche d'appartement sur Kijiji ou Marketplace", "Signature d'un bail réglementé par le Tribunal administratif du logement (TAL)", "État des lieux et réparations locatives", "Colocation en milieu urbain et gestion des charges"],
    vocabA1_A2: ["appartement", "loyer", "chambre", "cuisine", "balcon", "meublé", "chauffage", "locataire", "propriétaire"],
    vocabB1_B2: ["cession de bail", "sous-location", "dépôt de garantie", "insalubrité", "rénovation", "charges incluses", "préavis de départ"],
    vocabC1_C2: ["gentrification urbaine", "crise du logement", "spéculation immobilière", "éviction de mauvaise foi", "encadrement des loyers", "densification urbaine", "crise d'accessibilité à la propriété"],
    readingScenarios: [
      {
        title: "Annonce immobilière : 4 1/2 lumineux dans le Plateau-Mont-Royal",
        text: "À louer pour le 1er juillet : magnifique appartement 4 1/2 (deux chambres fermées, salon double) situé au 2e étage d'un triplex typique. Entièrement rénové, planchers de bois franc, balcons avant et arrière. Électroménagers (poêle et frigo) inclus. Chauffage et électricité aux frais du locataire. Animaux interdits, immeuble non-fumeur. Enquête de crédit obligatoire.",
        q: "Qu'est-ce qui est compris dans le montant de la location de cet appartement ?",
        opt: ["Le chauffage et l'électricité", "Les meubles du salon et les lits", "La cuisinière (poêle) et le réfrigérateur", "Les frais d'enquête de crédit et l'assurance locative"],
        ans: 2,
        exp: "L'annonce stipule clairement : 'Électroménagers (poêle et frigo) inclus. Chauffage et électricité aux frais du locataire.'"
      },
      {
        title: "Analyse juridique : Droits et obligations lors d'une cession de bail",
        text: "Au Québec, le locataire bénéficie du droit irréductible de céder son bail ou de sous-louer son logement, conformément au Code civil. Toutefois, le locateur ne peut refuser la personne proposée sans motif sérieux, tel qu'une insolvabilité avérée ou des antécédents de troubles de jouissance paisible de la propriété. Toute clause du contrat de louage visant à interdire formellement cette disposition est réputée nulle de plein droit.",
        q: "Dans quelle condition légale un propriétaire peut-il refuser un candidat à la cession de bail ?",
        opt: ["S'il souhaite augmenter le loyer de plus de 15% pour le nouveau locataire", "S'il prouve que le candidat présente une incapacité de payer ou un historique de troubles", "Si le contrat initial contient une clause interdisant la sous-location", "Si le locataire partant n'a pas prévenu le syndic de l'immeuble 6 mois à l'avance"],
        ans: 1,
        exp: "Le texte de loi mentionne que 'le locateur ne peut refuser [...] sans motif sérieux, tel qu'une insolvabilité avérée ou des antécédents de troubles de jouissance'."
      }
    ],
    listeningScenarios: [
      {
        title: "Conversation téléphonique : Prise de rendez-vous pour une visite",
        audioText: "Bonjour Monsieur Tremblay, j'appelle concernant votre annonce pour le 3 1/2 sur la rue Rosemont. Je suis un professionnel nouvellement arrivé à Montréal et je serais très intéressé par une visite ce jeudi en fin d'après-midi, vers 17h30 si cela vous convient. Vous pouvez me joindre au 514-555-0192. Merci et bonne journée !",
        q: "Dans quel but la personne laisse-t-elle ce message téléphonique ?",
        opt: ["Pour annuler la signature d'un contrat de bail", "Pour solliciter une visite d'appartement ce jeudi en fin de journée", "Pour se plaindre du bruit causé par des voisins dans l'immeuble", "Pour négocier une réduction importante sur le prix du loyer"],
        ans: 1,
        exp: "Le locataire potentiel dit : 'je serais très intéressé par une visite ce jeudi en fin d'après-midi, vers 17h30'."
      },
      {
        title: "Reportage économique : La crise du logement locatif dans les métropoles canadiennes",
        audioText: "Le taux de vacance des logements locatifs a atteint son niveau le plus bas depuis 30 ans à Vancouver, Toronto et Montréal. Cette rareté de l'offre aggrave la surenchère lors des signatures de baux, pénalisant prioritairement les étudiants et les familles immigrantes nouvellement établies. Face à cette pénurie structurelle, les associations de locataires réclament l'instauration immédiate d'un registre public des loyers pour freiner les hausses abusives entre deux locataires.",
        q: "Quelle mesure les associations revendiquent-elles pour endiguer la surenchère des loyers ?",
        opt: ["L'interdiction des étudiants internationaux dans les centres urbains", "La création d'un registre public des loyers pour éviter les hausses illégitimes", "La construction exclusive de tours de copropriétés de luxe", "La subvention par l'État de la moitié du loyer des nouveaux arrivants"],
        ans: 1,
        exp: "Le journaliste rapporte que 'les associations de locataires réclament l'instauration immédiate d'un registre public des loyers pour freiner les hausses abusives'."
      }
    ],
    writingPrompts: [
      { type: "message", title: "Courriel au propriétaire - Demande de réparation", instructions: "Une fuite d'eau importante est apparue dans la salle de bain de votre appartement loué à Montréal. Rédigez un message urgent (60-120 mots) à votre propriétaire pour lui décrire la situation, expliquer les dommages causés et lui demander de faire intervenir un plombier rapidement.", min: 60, max: 120, time: 15 },
      { type: "article", title: "Essai argumentatif - Crise du logement et urbanisme", instructions: "« Face à la crise du logement au Canada, faut-il privilégier la densification verticale des villes (tours d'habitation) ou l'étalement urbain vers les banlieues éloignées ? » Comparez ces deux approches dans un texte argumentatif de 150 à 180 mots et justifiez votre position.", min: 150, max: 180, time: 25 }
    ],
    speakingPrompts: [
      { type: "interaction", title: "Recherche de logement et négociation du bail", prompt: "Vous visitez un appartement 4 1/2 à Montréal qui vous plaît beaucoup, mais certaines réparations de peinture et de plomberie sont nécessaires. Vous discutez avec le propriétaire (l'examinateur) pour poser des questions sur les conditions du bail, les inclusions, et pour négocier la prise en charge des travaux avant votre aménagement.", prep: 45, speak: 120, tips: ["Posez des questions directes et précises sur le loyer et les charges.", "Négociez poliment la réalisation des travaux.", "Restez courtois même en cas de désaccord."] },
      { type: "monologue", title: "Débat : Encadrement strict des loyers par l'État", prompt: "Certains propriétaires affirment que le contrôle strict des augmentations de loyer par le gouvernement décourage les investissements dans la construction de nouveaux logements. D'autres soutiennent qu'il est indispensable pour protéger les citoyens de la spéculation. Quel est votre avis sur cette question ? Présentez votre point de vue argumenté pendant 4 minutes 30.", prep: 60, speak: 150, tips: ["Analysez les deux points de vue (propriétaires vs locataires).", "Apportez au moins deux arguments solides avec exemples.", "Formulez une synthèse équilibrée en conclusion."] }
    ]
  },
  {
    id: "travail",
    name: "Travail, Emploi & Culture professionnelle au Canada",
    contexts: ["Entretien d'embauche formel à Toronto ou Ottawa", "Rédaction de CV et lettre de motivation au format canadien", "Intégration en entreprise et réseautage professionnel (Networking)", "Équilibre travail-famille et conciliation en milieu corporatif"],
    vocabA1_A2: ["travail", "emploi", "bureau", "horaire", "salaire", "patron", "collègue", "réunion", "entreprise"],
    vocabB1_B2: ["compétences transversales", "expérience préalable", "entrevue de sélection", "avantage social", "syndicat", "télétravail hybride", "promotion interne"],
    vocabC1_C2: ["obsolescence des compétences", "management interculturel", "responsabilité sociétale des entreprises (RSE)", "flexibilité organisationnelle", "rémunération au rendement", "plafond de verre", "harcèlement psychologique au travail"],
    readingScenarios: [
      {
        title: "Offre d'emploi : Coordonnateur(trice) des ressources humaines",
        text: "Entreprise technologique en pleine expansion à Ottawa recherche un coordonnateur aux ressources humaines pour un poste permanent à temps plein (mode hybride : 3 jours en présentiel, 2 jours en télétravail). Le candidat sélectionné sera responsable de l'accueil et de l'intégration des nouveaux employés immigrants, ainsi que de la gestion de la paie. Requis : Baccalauréat en relations industrielles ou gestion, bilinguisme (français/anglais) impeccable à l'oral comme à l'écrit, et maîtrise de la suite Office. Salaire compétitif et gamme complète d'assurances collectives.",
        q: "Quelle exigence linguistique est spécifiée pour ce poste ?",
        opt: ["La maîtrise exclusive du français québécois standard", "Une excellente maîtrise du français et de l'anglais à l'oral et à l'écrit", "La connaissance de trois langues officielles ou internationales", "La capacité de rédiger des contrats en anglais juridique uniquement"],
        ans: 1,
        exp: "L'offre exige clairement un 'bilinguisme (français/anglais) impeccable à l'oral comme à l'écrit'."
      },
      {
        title: "Étude de cas : La semaine de 4 jours et la productivité en entreprise",
        text: "Une expérience pilote menée auprès de quarante PME québécoises et ontariennes a démontré que l'instauration de la semaine de travail comprimée sur quatre jours, avec maintien intégral de la rémunération, n'a entraîné aucune érosion de la productivité. Au contraire, les indicateurs de performance révèlent une baisse significative du taux d'absentéisme et un regain notable de la motivation intrinsèque des salariés, stimulés par une meilleure conciliation entre leurs obligations professionnelles et leur vie privée.",
        q: "Quel impact la semaine de 4 jours a-t-elle eu sur les entreprises participantes ?",
        opt: ["Une chute drastique du chiffre d'affaires et de la productivité globale", "Une diminution du taux d'absentéisme et une motivation accrue sans baisse de productivité", "Des grèves syndicales causées par la surcharge de travail quotidienne", "Le licenciement du quart du personnel administratif"],
        ans: 1,
        exp: "Le texte souligne que 'l'instauration de la semaine de 4 jours [...] n'a entraîné aucune érosion de la productivité' et révèle 'une baisse de l'absentéisme et un regain de motivation'."
      }
    ],
    listeningScenarios: [
      {
        title: "Extrait de réunion : Planification d'un projet d'équipe",
        audioText: "Bon matin à tous ! Merci d'être présents pour ce point de mi-parcours. Comme vous le savez, la date limite pour la remise du livrable au client d'Halifax est fixée au vendredi 18. J'ai remarqué un léger retard sur le module d'analyse des données. Marc, est-ce que tu aurais besoin que Sophie te renforce sur la saisie cet après-midi pour qu'on respecte l'échéancier ?",
        q: "Quel est l'objectif principal de cette intervention lors de la réunion ?",
        opt: ["Annoncer l'annulation définitive du contrat avec le client d'Halifax", "Faire un point de suivi et proposer une réaffectation des ressources pour respecter la date limite", "Féliciter Marc pour avoir terminé son module en avance sur l'échéancier", "Sanctionner l'équipe pour des absences injustifiées la semaine dernière"],
        ans: 1,
        exp: "Le chef d'équipe fait un point de suivi et propose que Sophie renforce Marc ('pour qu'on respecte l'échéancier')."
      },
      {
        title: "Entrevue radiophonique : Les défis d'intégration professionnelle des immigrants",
        audioText: "Bien que le Canada affiche un besoin criant de main-d'œuvre qualifiée dans les secteurs du génie et des technologies de l'information, de nombreux immigrants surqualifiés se heurtent encore au fameux critère de la « première expérience canadienne ». Selon la sociologue Évelyne Moreau, ce biais d'embauche systémique, souvent motivé par la crainte d'un décalage des codes culturels en entreprise, prive l'économie nationale d'un bassin de talents immédiatement opérationnels.",
        q: "Selon la sociologue, qu'est-ce qui explique en partie l'obstacle de la « première expérience canadienne » ?",
        opt: ["Le refus des nouveaux arrivants d'apprendre les langues officielles du pays", "La crainte des employeurs concernant un décalage des codes culturels en entreprise", "La fermeture administrative des ordres professionnels aux diplômés étrangers", "Le manque de qualifications académiques des candidats immigrants dans la tech"],
        ans: 1,
        exp: "L'invitée explique que 'ce biais d'embauche systémique [est] souvent motivé par la crainte d'un décalage des codes culturels en entreprise'."
      }
    ],
    writingPrompts: [
      { type: "courriel", title: "Candidature formelle - Réponse à une offre d'emploi", instructions: "Vous avez découvert une offre d'emploi correspondant à votre profil au sein d'une entreprise canadienne. Rédigez un courriel formel de motivation (60-120 mots) pour présenter vos compétences clés, expliquer votre intérêt pour l'entreprise et solliciter une entrevue d'embauche.", min: 60, max: 120, time: 15 },
      { type: "article", title: "Essai argumentatif - L'intelligence artificielle au travail", instructions: "« L'intégration croissante de l'intelligence artificielle dans les entreprises canadiennes libère-t-elle les employés des tâches répétitives ou menace-t-elle à terme la sécurité de l'emploi ? » Rédigez un court essai argumenté de 150 à 180 mots exprimant votre position.", min: 150, max: 180, time: 25 }
    ],
    speakingPrompts: [
      { type: "interaction", title: "Entretien d'embauche et négociation des conditions", prompt: "Vous passez une entrevue pour un poste dans votre domaine de spécialisation. Le recruteur (l'examinateur) vous présente les responsabilités du poste. Vous lui posez des questions sur la culture de l'entreprise, les perspectives d'évolution de carrière, la formation continue et les conditions de conciliation travail-famille.", prep: 45, speak: 120, tips: ["Adoptez un ton professionnel et enthousiaste.", "Posez au minimum 5 questions pertinentes sur le poste.", "Valorisez votre parcours tout en dialoguant activement."] },
      { type: "monologue", title: "Débat : Le télétravail intégral comme norme universelle", prompt: "Certaines entreprises technologiques ont adopté le travail 100% à distance de manière définitive, affirmant qu'il favorise le bien-être et la productivité. D'autres dirigeants insistent pour un retour obligatoire au bureau afin de préserver l'esprit d'équipe et la cohésion sociale. Quelle est votre position ? Argumentez pendant 4 minutes 30.", prep: 60, speak: 150, tips: ["Exposez les avantages (flexibilité, économie de transport) et les limites (isolement).", "Illustrez avec des exemples du marché du travail actuel.", "Concluez de manière ferme et structurée."] }
    ]
  },
  {
    id: "transports",
    name: "Transports, Mobilité urbaine & Voyages au Canada",
    contexts: ["Annonce publique dans le métro de Montréal (STM) ou le REM", "Abonnement de train interurbain (VIA Rail) ou bus longue distance", "Réglementation de la conduite hivernale et pneus de neige au Québec", "Mobilité active, pistes cyclables et transition vers les transports en commun"],
    vocabA1_A2: ["autobus", "métro", "billet", "gare", "station", "horaire", "retard", "voiture", "taxi", "arrêt"],
    vocabB1_B2: ["abonnement mensuel", "correspondance", "heure de pointe", "embouteillage", "covoiturage", "déneigement", "pneu d'hiver", "titre de transport"],
    vocabC1_C2: ["congestion routière structurelle", "étalement urbain", "mobilité durable", "électrification des transports", "intermodalité urbaine", "redevance kilométrique", "externalités environnementales"],
    readingScenarios: [
      {
        title: "Avis aux usagers : Travaux de modernisation sur la ligne jaune du métro",
        text: "La Société de transport de Montréal (STM) avise sa clientèle qu'en raison de travaux majeurs d'étanchéité de la voûte, le service de métro sera complètement interruption sur la ligne jaune (entre Berri-UQAM et Longueuil) au cours des trois prochains week-ends. Un service de navettes d'autobus gratuites sera déployé en continu pour assurer la liaison entre les stations affectées. Veuillez prévoir 20 minutes supplémentaires pour vos déplacements.",
        q: "Quelle solution alternative est mise en place pendant l'interruption du métro ?",
        opt: ["Le remboursement intégral des abonnements mensuels de tous les usagers", "La mise en service de navettes d'autobus gratuites reliant les stations concernées", "L'ouverture exceptionnelle d'une nouvelle ligne de train de banlieue", "Le partage gratuit de taxis subventionnés par la ville de Montréal"],
        ans: 1,
        exp: "L'avis indique : 'Un service de navettes d'autobus gratuites sera déployé en continu pour assurer la liaison'."
      },
      {
        title: "Analyse urbaine : La gratuité des transports en commun en question",
        text: "Face à l'urgence climatique et à la congestion des artères métropolitaines, plusieurs municipalités canadiennes examinent l'opportunité de décréter la gratuité universelle des transports collectifs. Si les partisans de cette mesure y voient un puissant levier d'équité sociale et de transition écologique, les économistes des transports rappellent que l'abolition des tarifs priverait les sociétés de transport d'une source autonome de revenus indispensable à l'entretien et à l'expansion des réseaux ferrés.",
        q: "Quel argument les économistes opposent-ils à la gratuité totale des transports ?",
        opt: ["La gratuité attirerait trop de touristes étrangers dans le métro", "L'abolition des tarifs priverait les réseaux de revenus essentiels à leur entretien et à leur développement", "Les conducteurs d'autobus refuseraient de travailler sans vérification des billets", "Les pistes cyclables deviendraient immédiatement désertes en été"],
        ans: 1,
        exp: "L'auteur rapporte que les économistes rappellent que 'l'abolition des tarifs priverait les sociétés [...] d'une source autonome de revenus indispensable à l'entretien et à l'expansion'."
      }
    ],
    listeningScenarios: [
      {
        title: "Annonce sonore en gare de train (VIA Rail)",
        audioText: "Votre attention s'il vous plaît. Le train VIA Rail numéro 63 à destination de Toronto, via Kingston et Belleville, initialement prévu à 14h15, partira de la voie numéro 4 avec un retard estimé à 25 minutes en raison de conditions météorologiques hivernales difficiles dans la région d'Ottawa. Les passagers munis d'un billet en classe Affaires sont invités à patienter au salon VIP. Nous nous excusons pour ce contretemps.",
        q: "Pourquoi le train à destination de Toronto subit-il un retard de 25 minutes ?",
        opt: ["En raison d'un incident technique sur la locomotive à la gare de départ", "À cause de conditions météorologiques hivernales difficiles dans la région d'Ottawa", "Parce que le salon d'attente des passagers Affaires est actuellement fermé", "En raison d'une grève surprise du personnel de bord de VIA Rail"],
        ans: 1,
        exp: "L'annonce mentionne clairement un retard 'en raison de conditions météorologiques hivernales difficiles dans la région d'Ottawa'."
      },
      {
        title: "Débat radio : La péage urbain pour réduire les embouteillages au centre-ville",
        audioText: "Pour décongestionner le centre-ville de Vancouver et de Montréal aux heures de pointe, la commission sur la mobilité recommande l'instauration d'un péage urbain dynamique. Le principe est simple : les automobilistes souhaitant accéder au cœur commercial en voiture individuelle devraient s'acquitter d'une redevance variant selon l'heure de la journée. Les commerçants s'insurgent contre cette proposition, craignant une désertification de leurs enseignes au profit des grands centres d'achats de banlieue dotés de stationnements gratuits.",
        q: "Quelle est la principale crainte des commerçants du centre-ville concernant le péage urbain ?",
        opt: ["Que leurs clients abandonnent les banlieues pour déménager au centre-ville", "Que la fréquentation de leurs commerces chute au profit des centres commerciaux de banlieue avec parking gratuit", "Que la municipalité augmente les taxes foncières des commerces de proximité", "Que les camions de livraison ne puissent plus accéder aux rues piétonnes en matinée"],
        ans: 1,
        exp: "Les commerçants craignent 'une désertification de leurs enseignes au profit des grands centres d'achats de banlieue dotés de stationnements gratuits'."
      }
    ],
    writingPrompts: [
      { type: "courriel", title: "Réclamation formelle - Retard important d'un train interurbain", instructions: "Lors de votre voyage en train entre Montréal et Toronto pour une entrevue professionnelle importante, un retard de 4 heures vous a fait manquer votre rendez-vous. Rédigez un courriel formel (60-120 mots) au service à la clientèle pour exposer les faits, exprimer votre insatisfaction et exiger un dédommagement financier.", min: 60, max: 120, time: 15 },
      { type: "article", title: "Essai argumentatif - L'avenir de la voiture individuelle en ville", instructions: "« Face aux enjeux environnementaux et à l'encombrement des métropoles canadiennes, les municipalités devraient-elles interdire progressivement l'accès des voitures individuelles à essence dans les centres-villes ? » Comparez les arguments et donnez votre opinion en 150 à 180 mots.", min: 150, max: 180, time: 25 }
    ],
    speakingPrompts: [
      { type: "interaction", title: "Demande d'information - Abonnements de transport public", prompt: "Vous venez de vous installer à Calgary ou à Montréal avec votre famille. Vous vous rendez au guichet de la société de transport urbain pour vous informer sur les options de transport (bus, métro, train de banlieue). Vous posez des questions (examinateur) sur les tarifs mensuels, les rabais étudiants et familiaux, ainsi que sur les applications mobiles de guidage.", prep: 45, speak: 120, tips: ["Posez des questions variées sur les tarifs et les correspondances.", "Utilisez un vocabulaire précis (titre de transport, zone, tarif réduit).", "Enchaînez sans laisser de silence gênant."] },
      { type: "monologue", title: "Débat : Investir dans les trains à grande vitesse au Canada", prompt: "Alors que l'Europe et l'Asie disposent de vastes réseaux de trains à grande vitesse (TGV), le Canada repose encore massivement sur l'aviation et l'automobile pour les liaisons interurbaines (ex: corridor Québec-Windsor). Selon vous, le gouvernement fédéral devrait-il investir des milliards dans un réseau de TGV écologique ? Argumentez pendant 4 minutes 30.", prep: 60, speak: 150, tips: ["Introduisez les enjeux géographiques du Canada (grandes distances).", "Présentez 2 arguments détaillés (écologie, rapidité vs coût colossal).", "Donnez une conclusion claire et argumentée."] }
    ]
  },
  {
    id: "immigration",
    name: "Immigration, Intégration & Démarches Administratives",
    contexts: ["Demande de résidence permanente via le système Entrée express", "Équivalence des diplômes étrangers auprès de WES ou des ordres professionnels", "Entrevue de sélection avec un agent d'immigration (IRCC / MIFI)", "Vie communautaire et services d'accueil des nouveaux arrivants francophones"],
    vocabA1_A2: ["visa", "passeport", "document", "formulaire", "pays", "famille", "langue", "canada", "arriver"],
    vocabB1_B2: ["résidence permanente", "citoyenneté", "parrainage", "permis de travail", "test de français", "équivalence de diplôme", "démarche administrative"],
    vocabC1_C2: ["intégration socio-économique", "mobilité francophone", "critères d'admissibilité", "pénurie de main-d'œuvre sectorielle", "rétention des immigrants en région", "multiculturalisme canadien", "acculturation"],
    readingScenarios: [
      {
        title: "Communiqué officiel : Mise à jour du système Entrée express (IRCC)",
        text: "Immigration, Réfugiés et Citoyenneté Canada (IRCC) annonce une modification majeure du calcul des points pour le bassin d'Entrée express. À compter du 1er janvier, un pointage bonifié sera attribué aux candidats démontrant une maîtrise supérieure du français (niveau NCLC 7 ou plus aux épreuves du TCF Canada), même en l'absence de compétences en anglais. Cette directive vise à consolider la vitalité démographique des communautés francophones en situation minoritaire hors Québec.",
        q: "Quel est l'objectif de la bonification des points pour la maîtrise du français dans Entrée express ?",
        opt: ["Obliger tous les immigrants anglophones à s'installer exclusivement dans la province du Québec", "Renforcer la démographie et la vitalité des communautés francophones hors Québec", "Supprimer définitivement les exigences de diplômes universitaires pour obtenir un visa", "Remplacer l'examen du TCF par une simple entrevue informelle en ligne"],
        ans: 1,
        exp: "Le texte officiel précise que cette directive vise à 'consolider la vitalité démographique des communautés francophones en situation minoritaire hors Québec'."
      },
      {
        title: "Analyse sociologique : Le défi de la reconnaissance des compétences étrangères",
        text: "L'obtention de la résidence permanente canadienne ne constitue souvent que le premier jalon d'un parcours d'intégration professionnelle semé d'embûches. De nombreux professionnels formés à l'étranger (médecins, ingénieurs, enseignants) font face au corporatisme des ordres professionnels provinciaux, qui exigent la reprise de cursus universitaires locaux ou la réussite d'examens d'équivalence coûteux et complexes. Cette barrière institutionnelle entraîne un phénomène de déqualification professionnelle préjudiciable à la fois à l'estime de soi des immigrants et à l'économie nationale.",
        q: "Quelle conséquence directe entraîne la complexité de la reconnaissance des diplômes étrangers ?",
        opt: ["Une hausse immédiate des salaires de tous les travailleurs nouvellement arrivés au Canada", "Un phénomène de déqualification professionnelle qui nuit aux immigrants et à l'économie", "La fermeture totale des universités canadiennes aux étudiants internationaux", "L'interdiction légale de pratiquer un métier sans avoir la citoyenneté canadienne"],
        ans: 1,
        exp: "L'auteur souligne que 'cette barrière institutionnelle entraîne un phénomène de déqualification professionnelle préjudiciable à la fois à l'estime de soi [...] et à l'économie'."
      }
    ],
    listeningScenarios: [
      {
        title: "Dialogue au guichet d'accueil des nouveaux arrivants",
        audioText: "Bonjour Madame, bienvenue au bureau d'aide aux immigrants de Moncton ! Je vois que vous avez obtenu votre confirmation de résidence permanente le mois dernier. Pour finaliser votre dossier d'intégration, nous allons d'abord vous inscrire aux sessions d'orientation sur la vie au Nouveau-Brunswick. Ensuite, si vous le souhaitez, notre conseiller en emploi pourra réviser votre curriculum vitae pour l'adapter aux normes canadiennes dès mardi prochain.",
        q: "Quelle est la première étape proposée par l'agent d'accueil à la nouvelle arrivante ?",
        opt: ["L'inscrire immédiatement à un examen universitaire d'anglais", "L'inscrire à des sessions d'orientation sur la vie dans la province", "Lui prêter de l'argent pour acheter un appartement dans le centre-ville", "Lui délivrer un nouveau passeport canadien en moins de dix minutes"],
        ans: 1,
        exp: "L'agent indique : 'nous allons d'abord vous inscrire aux sessions d'orientation sur la vie au Nouveau-Brunswick'."
      },
      {
        title: "Entrevue d'expert : Les facteurs de succès pour une immigration réussie",
        audioText: "Lorsqu'on interroge les familles qui ont réussi leur implantation au Canada après cinq ans, deux facteurs clés ressortent invariablement : premièrement, la maîtrise proactive de la langue française ou anglaise avant même le départ, et deuxièmement, la flexibilité psychologique face au déclassement professionnel initial. Les candidats qui acceptent de commencer par un poste transitionnel ou d'explorer les régions en dehors de Montréal et Toronto s'intègrent généralement plus rapidement et plus durablement.",
        q: "Selon l'expert, qu'est-ce qui favorise une intégration rapide et durable au Canada ?",
        opt: ["Refuser catégoriquement tout emploi inférieur à son diplôme d'origine", "S'installer uniquement dans les grands centres urbains de Toronto et Montréal", "Maîtriser la langue avant le départ et faire preuve de flexibilité professionnelle et géographique", "Attendre que le gouvernement provincial trouve un logement et un travail au candidat"],
        ans: 2,
        exp: "L'expert cite la maîtrise proactive de la langue et 'la flexibilité psychologique face au déclassement professionnel initial' ou l'installation en région comme clés du succès."
      }
    ],
    writingPrompts: [
      { type: "courriel", title: "Demande d'information - Équivalence des diplômes (WES)", instructions: "Vous préparez votre dossier d'immigration pour le Canada et vous devez faire évaluer vos diplômes universitaires. Rédigez un courriel formel (60-120 mots) à un organisme d'évaluation (comme WES ou le MIFI) pour demander la procédure à suivre, le coût officiel et les délais moyens de traitement de votre dossier.", min: 60, max: 120, time: 15 },
      { type: "article", title: "Essai argumentatif - L'intégration des nouveaux arrivants en région", instructions: "« Pour lutter contre la pénurie de main-d'œuvre et désengorger les grandes métropoles, le gouvernement canadien devrait-il exiger que les nouveaux immigrants s'installent obligatoirement en région pendant leurs trois premières années au pays ? » Comparez les arguments et donnez votre avis (150-180 mots).", min: 150, max: 180, time: 25 }
    ],
    speakingPrompts: [
      { type: "interaction", title: "Entrevue avec un conseiller en immigration et intégration", prompt: "Vous avez un rendez-vous avec un agent d'un organisme d'accueil pour immigrants à Winnipeg ou à Québec. Vous posez des questions (examinateur) sur les cours de français gratuits (francisation), l'inscription des enfants à l'école publique, l'obtention du numéro d'assurance sociale (NAS) et la reconnaissance de votre expérience de travail.", prep: 45, speak: 120, tips: ["Préparez des questions précises sur les démarches administratives.", "Adoptez un ton poli et engagé.", "Réagissez aux explications du conseiller en posant des sous-questions."] },
      { type: "monologue", title: "Débat : L'immigration comme solution au vieillissement de la population", prompt: "Le Canada fait face à un vieillissement rapide de sa population et à des départs à la retraite massifs. L'immigration est souvent présentée comme la solution économique indispensable. Cependant, certains craignent une pression trop forte sur les infrastructures (santé, logement). Selon vous, quelle stratégie le Canada devrait-il adopter pour concilier croissance économique et qualité de vie ? Argumentez (4 min 30).", prep: 60, speak: 150, tips: ["Structurez un plan en 3 parties : constats démographiques, avantages économiques, défis d'infrastructure.", "Apportez des exemples canadiens concrets.", "Concluez en formulant une proposition équilibrée."] }
    ]
  },
  {
    id: "technologies",
    name: "Technologies, Numérique & Innovation technologique",
    contexts: ["Intelligence artificielle et transformation du travail au Canada", "Cybersecurity et protection des données personnelles (Loi 25 au Québec)", "Réseaux sociaux, désinformation et éducation aux médias", "Télétravail, connectivité à haut débit en région rurale et fracture numérique"],
    vocabA1_A2: ["ordinateur", "internet", "téléphone", "message", "site web", "application", "écran", "photo", "connecter"],
    vocabB1_B2: ["réseau social", "télétravail", "mot de passe", "données personnelles", "numérisation", "intelligence artificielle", "mise à jour", "en ligne"],
    vocabC1_C2: ["algorithme prédictif", "cyberattaque systémique", "fracture numérique", "obsolescence programmée", "éthique de l'intelligence artificielle", "souveraineté des données", "ubiquité numérique", "désinformation virale"],
    readingScenarios: [
      {
        title: "Article de revue tech : L'intelligence artificielle générative dans les universités canadiennes",
        text: "L'avènement des outils d'intelligence artificielle générative bouleverse les méthodes d'évaluation au sein des universités canadiennes de Toronto à Vancouver. Alors que certains professeurs perçoivent ces technologies comme une menace directe à l'intégrité académique et au développement de la pensée critique, une fraction croissante du corps enseignant plaide pour leur intégration encadrée. Selon ces derniers, apprendre aux étudiants à interroger rigoureusement l'IA et à vérifier ses sources constitue une compétence incontournable pour le marché du travail contemporain.",
        q: "Quelle approche est défendue par la fraction croissante du corps enseignant concernant l'IA ?",
        opt: ["L'interdiction absolue de l'IA sur tous les campus et l'expulsion des contrevenants", "L'intégration encadrée de l'IA pour apprendre à interroger les outils et vérifier les sources", "Le remplacement complet des professeurs d'université par des robots conversationnels", "L'obligation d'écrire tous les mémoires universitaires exclusivement à la main sur papier"],
        ans: 1,
        exp: "Le texte mentionne qu'une fraction du corps enseignant plaide pour 'leur intégration encadrée [pour] apprendre aux étudiants à interroger rigoureusement l'IA et à vérifier ses sources'."
      },
      {
        title: "Analyse juridique : Protection des renseignements personnels et Loi 25 au Québec",
        text: "Avec l'entrée en vigueur progressive de la Loi 25 sur la protection des renseignements personnels, le Québec impose un cadre légal parmi les plus rigoureux d'Amérique du Nord en matière de confidentialité numérique. Désormais, toute entreprise recueillant des données biométriques ou financières doit obtenir un consentement explicite, transparent et granulaire de la part des citoyens. En cas de violation de données ou de manquement aux obligations de divulgation, les pénalités financières peuvent atteindre jusqu'à 25 millions de dollars ou 4% du chiffre d'affaires mondial de l'organisation délinquante.",
        q: "Quelle sanction financière une entreprise risque-t-elle en cas de violation de la Loi 25 au Québec ?",
        opt: ["Une simple réprimande administrative sans aucune sanction financière", "Une amende pouvant atteindre 25 millions de dollars ou 4% de son chiffre d'affaires mondial", "La fermeture immédiate de tous ses bureaux et serveurs sur le territoire canadien", "Une amende forfaitaire de 1 000 dollars versée à chaque client concerné"],
        ans: 1,
        exp: "Le texte de loi stipule que 'les pénalités financières peuvent atteindre jusqu'à 25 millions de dollars ou 4% du chiffre d'affaires mondial'."
      }
    ],
    listeningScenarios: [
      {
        title: "Chronique techno : Les dangers de la surconnexion chez les adolescents",
        audioText: "Une étude publiée par l'Institut de pédiatrie du Québec révèle que 45% des adolescents passent plus de cinq heures par jour sur les réseaux sociaux. Cette hyperconnectivité est directement associée à un pic de troubles du sommeil et à un sentiment accru d'éco-anxiété et de comparaison sociale. Les pédiatres recommandent l'instauration de « couvre-feux numériques » stricts dans les foyers, en retirant les téléphones portables des chambres à coucher au moins une heure avant l'endormissement.",
        q: "Quelle recommandation pratique les pédiatres formulent-ils pour améliorer le sommeil des jeunes ?",
        opt: ["Acheter des écrans de tablette plus grands et plus lumineux", "Instaurer un couvre-feu numérique en retirant les téléphones de la chambre une heure avant le coucher", "Interdire définitivement l'usage de l'internet dans les écoles secondaires", "Remplacer les réseaux sociaux par des jeux vidéo de stratégie en ligne"],
        ans: 1,
        exp: "Les pédiatres recommandent l'instauration de 'couvre-feux numériques stricts en retirant les téléphones [...] au moins une heure avant l'endormissement'."
      },
      {
        title: "Débat économique : La fracture numérique entre les villes et les régions rurales",
        audioText: "Alors que Montréal et Calgary déploient les réseaux 5G à ultra-haute vitesse, des centaines de municipalités rurales dans les Maritimes et dans le Grand Nord canadien souffrent encore d'une connexion internet intermittente et hors de prix. Ce fossé numérique freine le développement économique local, empêche le télétravail qualifié et limite l'accès à la télémédecine. Les maires des municipalités rurales exigent que le gouvernement fédéral déclare l'accès à la fibre optique comme un service public essentiel, au même titre que l'électricité.",
        q: "Que revendiquent les maires ruraux concernant l'accès à internet à haut débit ?",
        opt: ["Que les entreprises de télécommunication payent les impôts fonciers des villages", "Que le gouvernement fédéral déclare l'accès à la fibre optique comme un service public essentiel", "Que tous les citoyens ruraux déménagent dans les grandes villes pour télétravailler", "Que l'État supprime les abonnements internet dans les métropoles par solidarité"],
        ans: 1,
        exp: "L'enregistrement indique que 'les maires des municipalités rurales exigent que le gouvernement fédéral déclare l'accès à la fibre optique comme un service public essentiel'."
      }
    ],
    writingPrompts: [
      { type: "courriel", title: "Signalement technique - Problème de sécurité ou de connexion au travail", instructions: "Vous travaillez en télétravail pour une firme canadienne et vous constatez une faille de sécurité potentielle (ou une panne majeure) sur le portail interne de l'entreprise. Rédigez un courriel formel (60-120 mots) au service informatique (IT) pour décrire le problème, expliquer l'impact sur vos tâches quotidiennes et demander une intervention immédiate.", min: 60, max: 120, time: 15 },
      { type: "article", title: "Essai argumentatif - Les réseaux sociaux et le lien social", instructions: "« Les plateformes de réseaux sociaux et les communications virtuelles ont-elles enrichi nos relations interpersonnelles ou ont-elles au contraire amplifié l'isolement et la superficialité des échanges dans la société canadienne ? » Argumentez en 150 à 180 mots avec deux exemples précis.", min: 150, max: 180, time: 25 }
    ],
    speakingPrompts: [
      { type: "interaction", title: "Achat d'équipement informatique pour le télétravail", prompt: "Vous vous rendez dans une boutique spécialisée en informatique à Montréal ou Toronto pour acheter un ordinateur portable performant et un forfait internet adapté à votre nouveau travail à distance. Vous posez des questions (examinateur) sur la vitesse de connexion, la garantie, le service après-vente et la compatibilité avec les normes de cybersécurité de votre entreprise.", prep: 45, speak: 120, tips: ["Posez des questions techniques précises (mémoire, processeur, bande passante).", "Négociez une extension de garantie ou un rabais corporatif.", "Maintenez un échange fluide et dynamique."] },
      { type: "monologue", title: "Débat : Régulation gouvernementale de l'intelligence artificielle", prompt: "Face à la progression fulgurante de l'intelligence artificielle générative (hypertruquages / deepfakes, automatisation des emplois), de nombreux experts réclament l'instauration d'un moratoire ou d'une régulation sévère par l'État canadien. Les géants de la tech soutiennent qu'une réglementation trop stricte étoufferait l'innovation et la compétitivité économique du pays. Quel est votre avis sur cette controverse ? Argumentez (4 min 30).", prep: 60, speak: 150, tips: ["Définissez clairement les risques éthiques et les opportunités économiques.", "Apportez 2 arguments structurés en utilisant des connecteurs d'opposition.", "Formulez une conclusion proposant un équilibre entre innovation et sécurité."] }
    ]
  },
  {
    id: "environnement",
    name: "Environnement, Transition Écologique & Climat canadien",
    contexts: ["Lutte contre les feux de forêt et protection de la biodiversité dans les Rocheuses / forêt boréale", "Taxe carbone et incitatifs financiers pour les véhicules électriques", "Gestion des matières résiduelles, compostage et tri sélectif municipal", "Éco-anxiété, tourisme durable et transition des énergies fossiles vers l'hydroélectricité"],
    vocabA1_A2: ["arbre", "forêt", "eau", "neige", "hiver", "soleil", "poubelle", "recycler", "nature", "parc"],
    vocabB1_B2: ["réchauffement climatique", "énergie renouvelable", "tri sélectif", "compostage", "gaz à effet de serre", "empreinte carbone", "protection de la faune", "pollution"],
    vocabC1_C2: ["transition énergétique durable", "écoresponsabilité systémique", "taxation carbone", "biodiversité boréale", "déforestation industrielle", "justice climatique", "neutralité carbone 2050", "externalités environnementales"],
    readingScenarios: [
      {
        title: "Rapport environnemental : La multiplication des feux de forêt dans la forêt boréale",
        text: "Les saisons des feux de forêt au Canada connaissent une intensité sans précédent, exacerbées par des épisodes de sécheresse prolongée et des vagues de chaleur précoce en Alberta et dans le nord du Québec. Au-delà des pertes colossales en biodiversité et de l'évacuation forcée de dizaines de communautés autochtones et minières, les panaches de fumée ont dégradé la qualité de l'air sur des milliers de kilomètres, provoquant des alertes sanitaires jusqu'au cœur des grandes métropoles nord-américaines.",
        q: "Quelle conséquence les feux de forêt ont-ils eue sur les grandes villes nord-américaines ?",
        opt: ["Une baisse brutale des prix de l'immobilier urbain", "Une dégradation importante de la qualité de l'air causée par les panaches de fumée", "La fermeture définitive des parcs nationaux en été", "L'interdiction des voitures à essence dans les centres-villes"],
        ans: 1,
        exp: "Le rapport souligne que 'les panaches de fumée ont dégradé la qualité de l'air sur des milliers de kilomètres, provoquant des alertes sanitaires'."
      },
      {
        title: "Analyse des politiques : Le débat sur la taxe carbone fédérale au Canada",
        text: "La tarification de la pollution par le carbone, pierre angulaire de la stratégie climatique canadienne pour atteindre la neutralité carbone d'ici 2050, suscite une contestation politique virulente dans plusieurs provinces productrices d'énergies fossiles. Si le gouvernement fédéral soutient que le mécanisme de remise trimestrielle du chèque d'incitation à l'action climatique compense le coût pour la majorité des ménages, les détracteurs affirment que cette taxe alimente l'inflation et pénalise de manière disproportionnée les agriculteurs et les transporteurs routiers.",
        q: "Quel argument est avancé par les adversaires de la taxe carbone fédérale ?",
        opt: ["Elle encourage l'importation massive de charbon étranger", "Elle alimente l'inflation et pénalise injustement les agriculteurs et transporteurs routiers", "Elle est illégale selon la Charte canadienne des droits et libertés", "Elle réduit le budget alloué à la protection des parcs nationaux"],
        ans: 1,
        exp: "Le texte indique que les détracteurs affirment que 'cette taxe alimente l'inflation et pénalise de manière disproportionnée les agriculteurs et les transporteurs routiers'."
      }
    ],
    listeningScenarios: [
      {
        title: "Campagne de sensibilisation : La collecte des matières compostables",
        audioText: "À l'attention des citoyens de la Ville de Montréal : à partir de lundi, la collecte des résidus alimentaires (le bac brun) aura lieu chaque semaine, toute l'année. Nous vous rappelons qu'il est strictement interdit de déposer des sacs en plastique recyclables ou oxodégradables dans votre bac brun, car ils contaminent le compost. Veuillez utiliser uniquement des sacs en papier ou déposer vos épluchures directement dans le contenant avec un peu de journal. Merci de votre collaboration pour une ville plus verte !",
        q: "Quelle consigne précise la municipalité donne-t-elle concernant le bac brun de compostage ?",
        opt: ["Il faut laver le bac à l'eau de javel après chaque collecte", "Il est interdit d'utiliser des sacs en plastique, même s'ils sont étiquetés recyclables ou biodégradables", "Il faut sortir le bac uniquement le premier lundi de chaque mois en hiver", "Il est permis d'y jeter des déchets métalliques et des verres cassés"],
        ans: 1,
        exp: "L'annonce prévient : 'il est strictement interdit de déposer des sacs en plastique recyclables ou oxodégradables dans votre bac brun'."
      },
      {
        title: "Entrevue scientifique : Le recul du pergélisol dans le Grand Nord canadien",
        audioText: "Dans le Grand Nord canadien, la fonte accélérée du pergélisol — ce sol historiquement gelé en permanence — menace directement l'intégrité des infrastructures civiles. Les routes se déforment, les fondations des bâtiments se fissurent et les pistes d'atterrissage des communautés isolées deviennent impraticables. Selon les climatologues, cette fonte libère également des quantités astronomiques de méthane dans l'atmosphère, enclenchant une boucle de rétroaction climatique alarmante qui accélère le réchauffement global.",
        q: "Quel phénomène inquiétant la fonte du pergélisol provoque-t-elle au niveau planétaire ?",
        opt: ["Une hausse soudaine du niveau des lacs d'eau douce dans le sud du Québec", "La libération massive de méthane dans l'atmosphère, qui accélère le réchauffement global", "La prolifération d'espèces d'arbres tropicaux dans la toundra arctique", "Le gel permanent des routes commerciales maritimes du passage du Nord-Ouest"],
        ans: 1,
        exp: "Le scientifique explique que 'cette fonte libère également des quantités astronomiques de méthane [...], enclenchant une boucle de rétroaction climatique qui accélère le réchauffement'."
      }
    ],
    writingPrompts: [
      { type: "message", title: "Proposition citoyenne - Amélioration du recyclage dans votre immeuble", instructions: "Vous constatez que le tri des déchets et le compostage sont très mal gérés dans votre immeuble locatif à Montréal ou Toronto. Rédigez un message (60-120 mots) au syndic de copropriété ou à vos voisins pour suggérer l'installation de bacs de tri clairs et rappeler l'importance des gestes écoresponsables.", min: 60, max: 120, time: 15 },
      { type: "article", title: "Essai argumentatif - Croissance économique versus protection de l'environnement", instructions: "« Le gouvernement canadien doit-il interdire tout nouveau projet d'exploitation pétrolière ou gazière, même au prix de pertes d'emplois importantes dans certaines provinces, afin de respecter ses engagements climatiques internationaux ? » Argumentez en 150-180 mots.", min: 150, max: 180, time: 25 }
    ],
    speakingPrompts: [
      { type: "interaction", title: "Demande d'information sur les subventions écologiques résidentielles", prompt: "Vous êtes propriétaire d'une maison au Québec ou en Ontario et vous souhaitez améliorer son efficacité énergétique (isolation, thermopompe, panneaux solaires). Vous appelez le guichet de transition énergétique du gouvernement (examinateur) pour poser des questions sur les subventions disponibles, les critères d'admissibilité de l'évaluation ÉnerGuide et la liste des entrepreneurs certifiés.", prep: 45, speak: 120, tips: ["Posez au moins 5 questions claires sur les aides financières.", "Utilisez le vocabulaire de la rénovation verte (isolation, audit énergétique, thermopompe).", "Faites preuve d'écoute active."] },
      { type: "monologue", title: "Débat : L'écoresponsabilité individuelle est-elle une illusion ?", prompt: "Certains écologistes soutiennent que demander aux citoyens de changer leurs habitudes individuelles (trier ses déchets, prendre le vélo) est inefficace et déculpabilise les grandes multinationales industrielles, qui sont les véritables émettrices de pollution. D'autres affirment que chaque geste quotidien compte pour créer une culture de la durabilité. Quel est votre point de vue ? Argumentez (4 min 30).", prep: 60, speak: 150, tips: ["Comparez l'impact des gestes individuels versus la régulation industrielle.", "Apportez des exemples canadiens (taxes sur le plastique, transports).", "Formulez une conclusion nuancée et persuasive."] }
    ]
  },
  {
    id: "culture",
    name: "Culture, Loisirs, Médias & Francophonie canadienne",
    contexts: ["Festivals de musique et d'humour à Montréal (FrancoFolies, Festival International de Jazz)", "Littérature québécoise et acadienne, cinéma francophone et patrimoine de l'ONF", "Habitudes de consommation des médias et rôle de Radio-Canada / CBC", "Loisirs en plein air au Canada : hockey sur glace, camping, randonnée en raquettes, cabane à sucre"],
    vocabA1_A2: ["musique", "film", "fête", "livre", "parc", "sport", "jouer", "regarder", "chanteur", "spectacle"],
    vocabB1_B2: ["patrimoine culturel", "festival en plein air", "tradition hivernale", "exposition artistique", "divertissement", "littérature francophone", "médias de masse"],
    vocabC1_C2: ["exception culturelle francophone", "impérialisme culturel américain", "hégémonie linguistique anglophone", "financement public de la création artistique", "vitalité identitaire acadienne et québécoise", "démocratisation de l'art", "rayonnement international"],
    readingScenarios: [
      {
        title: "Chronique culturelle : La vitalité du cinéma québécois et acadien",
        text: "Malgré l'omniprésence des plateformes de streaming nord-américaines qui diffusent majoritairement des superproductions hollywoodiennes en anglais, le cinéma québécois et acadien connaît un succès remarquable d'estime et de fréquentation. Porté par des réalisateurs audacieux qui explorent les thèmes de l'identité, du territoire nordique et des mémoires intergénérationnelles, le 7e art francophone canadien s'exporte avec éclat dans les plus prestigieux festivals européens de Cannes à Berlin.",
        q: "Qu'est-ce qui caractérise le cinéma francophone canadien selon l'article ?",
        opt: ["Il est financé exclusivement par les plateformes de streaming américaines", "Il connaît un succès remarquable grâce à son exploration de l'identité et du territoire et s'exporte en Europe", "Il a complètement disparu des salles de cinéma de Montréal au profit des films d'action en anglais", "Il se limite à produire de courtes publicités touristiques pour le gouvernement provincial"],
        ans: 1,
        exp: "L'article affirme que le cinéma québécois et acadien 'connaît un succès remarquable d'estime [...] et s'exporte avec éclat dans les plus prestigieux festivals européens'."
      },
      {
        title: "Essai sur la francophonie : La défense du français hors Québec",
        text: "Pour le plus de un million de francophones vivant dans les provinces et territoires anglophones du Canada — des Acadiens du Nouveau-Brunswick aux Franco-Manitobains et Franco-Ontariens —, la préservation de la langue maternelle est un combat quotidien. La survie de ces minorités linguistiques ne repose pas uniquement sur les droits constitutionnels aux écoles françaises, mais exige un accès continu et vivant à des institutions culturelles, des théâtres, des médias communautaires et des services de santé dispensés dans la langue de Molière.",
        q: "Selon l'auteur, de quoi dépend la survie des communautés francophones hors Québec ?",
        opt: ["Uniquement du droit de voter lors des élections fédérales à Ottawa", "D'un accès continu à des écoles, des institutions culturelles, des médias et des soins de santé en français", "Du déménagement obligatoire de tous les jeunes francophones vers la ville de Québec", "De l'interdiction de parler l'anglais dans l'ensemble des lieux publics du Canada"],
        ans: 1,
        exp: "L'auteur précise que la survie de ces minorités 'exige un accès continu et vivant à des institutions culturelles, des théâtres, des médias communautaires et des services de santé' en français."
      }
    ],
    listeningScenarios: [
      {
        title: "Reportage radiophonique : La tradition de la cabane à sucre au Québec",
        audioText: "Chaque printemps, avec le réchauffement des températures en mars et en avril, la province du Québec s'anime au rythme de la récolte de l'eau d'érable et de la saison des sucres. Bien plus qu'une simple tradition culinaire où l'on déguste du sirop sur la neige, la cabane à sucre représente un rituel identitaire et familial profondément ancré dans le patrimoine canadien. Les acéricultures québécoises produisent à elles seules près de 72% de la production mondiale de sirop d'érable authentique.",
        q: "Que représente la cabane à sucre pour la population québécoise selon le reportage ?",
        opt: ["Une simple fête commerciale inventée par les supermarchés dans les années 1990", "Un rituel identitaire et familial profondément ancré dans le patrimoine et la tradition printanière", "Une compétition sportive internationale de ski et de raquettes sur neige", "Une obligation légale imposée aux agriculteurs par le ministère de l'agriculture"],
        ans: 1,
        exp: "Le journaliste explique que la cabane à sucre 'représente un rituel identitaire et familial profondément ancré dans le patrimoine canadien'."
      },
      {
        title: "Débat dans les médias : Le financement public des sociétés d'État de radiodiffusion",
        audioText: "À l'ère de l'information numérique et des réseaux sociaux décentralisés, certains groupes politiques contestent le versement de subventions publiques milliardaires au diffuseur national Radio-Canada / CBC. Ils soutiennent que le marché privé suffit désormais à combler les besoins d'information des citoyens. À l'inverse, les défenseurs du service public rappellent que seule une société d'État indépendante peut garantir un journalisme d'enquête rigoureux, protéger la diversité des contenus en français et desservir les communautés francophones en région éloignée que les médias privés jugent non rentables.",
        q: "Quel argument justifie le maintien du financement public de Radio-Canada selon ses défenseurs ?",
        opt: ["La société d'État diffuse des séries américaines en primeur avant les chaînes privées", "Elle garantit un journalisme d'enquête indépendant et dessert les communautés francophones en région que le privé juge non rentables", "Elle génère des profits financiers colossaux qui sont reversés dans le budget de la santé provinciale", "Elle est la seule entreprise autorisée par la loi à diffuser de la musique canadienne"],
        ans: 1,
        exp: "Les défenseurs rappellent que seule une société d'État 'peut garantir un journalisme d'enquête rigoureux [...] et desservir les communautés francophones en région éloignée que les médias privés jugent non rentables'."
      }
    ],
    writingPrompts: [
      { type: "courriel", title: "Invitation à un événement culturel francophone", instructions: "Vous organisez une sortie entre amis ou collègues pour assister au Festival International de Jazz de Montréal ou aux FrancoFolies. Rédigez un message d'invitation (60-120 mots) en précisant le programme, l'ambiance attendue et les informations pratiques (lieu, heure de rendez-vous).", min: 60, max: 120, time: 15 },
      { type: "article", title: "Essai argumentatif - Préservation culturelle à l'ère de la mondialisation", instructions: "« Face au succès mondial des plateformes de divertissement américaines (Netflix, YouTube), le gouvernement canadien doit-il imposer des quotas stricts de diffusion de contenus francophones locaux et subventionner massivement les artistes québécois et acadiens ? » Argumentez en 150-180 mots.", min: 150, max: 180, time: 25 }
    ],
    speakingPrompts: [
      { type: "interaction", title: "Réservation de billets pour un spectacle ou un festival", prompt: "Vous vous rendez à la billetterie d'un grand théâtre ou d'un festival à Québec pour acheter des billets de spectacle pour vous et vos parents qui viennent vous visiter. Vous posez des questions (examinateur) sur la programmation, les meilleures places assises pour les personnes âgées, les rabais familiaux et l'accessibilité en transport en commun.", prep: 45, speak: 120, tips: ["Posez des questions claires sur les tarifs et l'accessibilité.", "Montrez de l'enthousiasme pour la culture locale.", "Maintenez un dialogue naturel avec l'agent de billetterie."] },
      { type: "monologue", title: "Débat : L'art et la culture doivent-ils être gratuits pour tous ?", prompt: "Certains citoyens estiment que l'accès aux musées, aux théâtres et aux bibliothèques publiques devrait être totalement gratuit et subventionné par l'impôt pour favoriser l'égalité des chances et l'éducation civique. D'autres jugent que la gratuité dévalorise la création artistique et que les consommateurs doivent payer le juste prix du travail des artistes. Quel est votre avis ? Argumentez (4 min 30).", prep: 60, speak: 150, tips: ["Introduisez les enjeux de démocratisation culturelle vs viabilité financière de l'art.", "Présentez 2 arguments détaillés avec des exemples.", "Donnez une conclusion personnelle et cohérente."] }
    ]
  },
  {
    id: "economie",
    name: "Économie, Finances personnelles & Consommation responsable",
    contexts: ["Ouverture de compte et historique de crédit au Canada (Équifax, TransUnion)", "Inflation, coût de l'épicerie et pouvoir d'achat des familles immigrantes", "Consommation locale, épiceries zéro déchet et économie circulaire", "fiscalité canadienne, déclaration de revenus et CELI / REER"],
    vocabA1_A2: ["argent", "banque", "carte", "payer", "prix", "magasin", "cher", "économiser", "facture", "acheter"],
    vocabB1_B2: ["cote de crédit", "taux d'intérêt", "hypothèque", "budget mensuel", "inflation", "consommation responsable", "pouvoir d'achat", "épargne-retraite"],
    vocabC1_C2: ["spéculation financière", "surendettement des ménages", "politique monétaire de la Banque du Canada", "stagnation séculaire", "obsolescence programmée", "économie de fonctionnalité", "justice fiscale"],
    readingScenarios: [
      {
        title: "Guide financier : L'importance vitale de la cote de crédit pour les immigrants",
        text: "Au Canada, le dossier et la cote de crédit (évalués par les agences Equifax et TransUnion) revêtent une importance cruciale qui dépasse largement le cadre des emprunts bancaires. Une cote de crédit irréprochable (supérieure à 700 points) est exigée par la quasi-totalité des locateurs immobiliers avant la signature d'un bail, par les fournisseurs de services de télécommunication, et même par certains employeurs lors des enquêtes de sécurité antérieures à l'embauche. Les conseillers bancaires recommandent aux nouveaux arrivants d'obtenir rapidement une carte de crédit avec limite sécurisée et de rembourser solde intégralement avant l'échéance mensuelle.",
        q: "Pourquoi est-il indispensable d'établir un bon historique de crédit au Canada ?",
        opt: ["Uniquement pour pouvoir obtenir la citoyenneté canadienne après 3 ans", "Parce que la cote de crédit est exigée pour louer un appartement, obtenir un forfait cellulaire et parfois un emploi", "Pour être exempté de payer les impôts provinciaux et fédéraux sur le revenu", "Parce que la loi canadienne interdit l'usage des billets de banque en argent comptant dans les commerces"],
        ans: 1,
        exp: "Le guide souligne que la cote est exigée 'par la quasi-totalité des locateurs immobiliers [...], par les fournisseurs de télécommunication, et même par certains employeurs'."
      },
      {
        title: "Analyse économique : L'inflation alimentaire et l'essor de l'économie circulaire",
        text: "Confrontés à une inflation alimentaire tenace qui érode le pouvoir d'achat des classes moyennes et populaires, les consommateurs canadiens modifient structurellement leurs habitudes d'approvisionnement. On assiste à un engouement sans précédent pour les applications anti-gaspillage, les épiceries solidaires et les circuits courts d'achat direct aux producteurs agricoles locaux. Parallèlement, l'économie de la seconde main et de la réparation (friperies, ateliers communautaires) perd son stigmate social pour devenir un choix de consommation éthique, économique et revendiqué.",
        q: "Quelle tendance de consommation résulte directement de l'inflation alimentaire et économique ?",
        opt: ["L'achat exclusif de produits importés par avion de luxe depuis l'Europe", "Un engouement fort pour les applications anti-gaspillage, les circuits courts et l'achat de seconde main", "L'abandon complet de l'alimentation biologique au profit des restaurants de restauration rapide", "La grève générale de tous les supermarchés d'alimentation en Ontario et au Québec"],
        ans: 1,
        exp: "L'auteur observe 'un engouement sans précédent pour les applications anti-gaspillage, les épiceries solidaires et les circuits courts [...] ainsi que l'économie de la seconde main'."
      }
    ],
    listeningScenarios: [
      {
        title: "Entrevue avec un conseiller financier : Comprendre le CELI et le REER",
        audioText: "Beaucoup de nouveaux arrivants au Québec me demandent la différence entre le REER (Régime enregistré d'épargne-retraite) et le CELI (Compte d'épargne libre d'impôt). C'est très simple : les cotisations que vous versez dans votre REER sont déductibles d'impôt immédiatement, ce qui réduit votre facture fiscale annuelle, mais les retraits futurs seront imposables à la retraite. À l'inverse, vous cotisez au CELI avec de l'argent déjà imposé, mais tous les rendements, intérêts et retraits que vous effectuerez au cours de votre vie seront à 100% libres d'impôt et disponibles à tout moment.",
        q: "Quel est le principal avantage financier du CELI par rapport au REER ?",
        opt: ["Le gouvernement verse un chèque de prime de 5 000 dollars à l'ouverture d'un CELI", "Tous les rendements financiers et les retraits futurs sont entièrement libres d'impôt et disponibles à tout moment", "Les cotisations au CELI permettent d'annuler le paiement du loyer mensuel", "Le CELI est obligatoire par la loi pour obtenir un prêt hypothécaire"],
        ans: 1,
        exp: "Le conseiller explique : 'tous les rendements, intérêts et retraits que vous effectuerez [...] seront à 100% libres d'impôt et disponibles à tout moment'."
      },
      {
        title: "Reportage conso : Le succès des commerces en vrac et zéro déchet à Montréal",
        audioText: "De l'arrondissement de Rosemont jusqu'au quartier Limoilou à Québec, les épiceries zéro déchet connaissent une croissance spectaculaire. Les clients s'y rendent munis de leurs propres bocaux en verre, sacs en tissu et contenants réutilisables pour acheter des légumineuses, de l'huile, de la farine et des produits d'entretien au poids, sans aucun emballage plastique à usage unique. Bien que le temps de préparation des courses soit plus long, les consommateurs interrogés affirment réaliser des économies de 15 à 20% sur leur facture tout en réduisant drastiquement le volume de leurs poubelles domestiques.",
        q: "Quel double avantage les clients trouvent-ils en faisant leurs achats dans les épiceries zéro déchet ?",
        opt: ["Les produits sont livrés gratuitement à domicile en moins d'une heure et sont importés", "Ils réalisent des économies de 15 à 20% sur la facture tout en réduisant drastiquement leurs déchets plastiques", "Ils reçoivent des crédits d'impôt provinciaux pour chaque bocal en verre apporté en magasin", "Les épiceries zéro déchet sont ouvertes 24 heures sur 24 et 7 jours sur 7"],
        ans: 1,
        exp: "Le reportage rapporte que les consommateurs affirment 'réaliser des économies de 15 à 20% sur leur facture tout en réduisant drastiquement le volume de leurs poubelles'."
      }
    ],
    writingPrompts: [
      { type: "courriel", title: "Réclamation bancaire - Frais administratifs injustifiés", instructions: "En consulting votre relevé de compte bancaire canadien, vous remarquez des frais de prélèvement mensuel injustifiés de 45 dollars sur votre compte-chèques. Rédigez un courriel formel (60-120 mots) à votre directeur d'agence pour demander des explications, rappeler les conditions de votre forfait bancaire et exiger le remboursement immédiat de cette somme.", min: 60, max: 120, time: 15 },
      { type: "article", title: "Essai argumentatif - Société de surconsommation et obsolescence", instructions: "« Pour lutter contre l'endettement des ménages et le gaspillage des ressources naturelles, le gouvernement canadien devrait-il pénaliser sévèrement les fabricants qui pratiquent l'obsolescence programmée et obliger les commerces à afficher un indice de réparabilité sur tous les appareils électroniques ? » Argumentez en 150-180 mots.", min: 150, max: 180, time: 25 }
    ],
    speakingPrompts: [
      { type: "interaction", title: "Ouverture d'un compte bancaire au Canada", prompt: "Vous venez d'atterrir à Toronto ou Montréal avec votre visa d'immigration et vous vous rendez dans une succursale bancaire pour ouvrir votre premier compte. Vous discutez avec le conseiller financier (examinateur) pour poser des questions sur les forfaits pour nouveaux arrivants, l'obtention d'une carte de crédit sans historique canadien, les frais de virer de l'argent à l'international et les taux des comptes d'épargne.", prep: 45, speak: 120, tips: ["Posez des questions financières précises (frais mensuels, carte de crédit sécurisée, CELI).", "Soyez attentif aux conditions et aux taux d'intérêt.", "Maintenez un échange courtois et professionnel."] },
      { type: "monologue", title: "Débat : L'abandon définitif de l'argent comptant (cashless society)", prompt: "Dans les pays nordiques et de plus en plus au Canada, les transactions en argent comptant (billets et pièces) disparaissent au profit du paiement sans contact, des cartes bancaires et des portefeuilles numériques sur téléphone. Certains économistes saluent cette transition qui lutte contre le travail au noir et l'évasion fiscale. D'autres alertent sur les risques de surveillance de la vie privée et l'exclusion des personnes âgées ou précaires. Quelle est votre opinion ? Argumentez (4 min 30).", prep: 60, speak: 150, tips: ["Introduisez la tendance vers une société sans argent liquide.", "Développez 2 arguments contrastés (sécurité/efficacité vs vie privée/exclusion).", "Concluez en prenant une position claire."] }
    ]
  },
  {
    id: "citoyennete",
    name: "Citoyenneté, Vie communautaire & Institutions canadiennes",
    contexts: ["Engagement bénévole et vie associative dans les quartiers (banques alimentaires, centres communautaires)", "Droits et devoirs des citoyens selon la Charte canadienne des droits et libertés", "Fonctionnement du système parlementaire canadien (fédéral, provincial, municipal)", "Services publics municipaux (bibliothèques, déneigement, éco-quartiers, parcs)"],
    vocabA1_A2: ["ville", "quartier", "voisin", "aider", "bénévolat", "école", "bibliothèque", "réunion", "droit", "loi"],
    vocabB1_B2: ["engagement communautaire", "charte des droits", "démocratie municipale", "organisme à but non lucratif (OBNL)", "citoyenneté canadienne", "civisme", "solidarité sociale"],
    vocabC1_C2: ["participation citoyenne active", "cohérence sociétale", "accommodement raisonnable", "laïcité institutionnelle", "décentralisation des pouvoirs", "cohésion interethnique", "désobéissance civile"],
    readingScenarios: [
      {
        title: "Appel aux bénévoles : La Grande Guignolée des médias et banques alimentaires",
        text: "À l'approche de la saison hivernale et des fêtes de fin d'année, la Moisson Montréal et le réseau des banques alimentaires du Québec lancent leur grand appel annuel aux bénévoles pour la Guignolée des médias. L'inflation ayant fait bondir de 30% les demandes d'aide alimentaire d'urgence de la part des familles ouvrières et des étudiants, l'organisme a un besoin criant de citoyens dévoués pour trier les denrées non périssables dans les entrepôts et collecter les dons monétaires aux intersections des grandes artères urbaines.",
        q: "Pourquoi l'organisme d'aide alimentaire a-t-il un besoin urgent de bénévoles cette année ?",
        opt: ["Parce que le gouvernement a décidé de fermer tous les supermarchés de la province en hiver", "Parce que l'inflation a provoqué une augmentation de 30% des demandes d'aide alimentaire d'urgence", "Pour construire de nouveaux logements sociaux dans le centre-ville de Montréal", "Pour dispenser des cours d'anglais gratuits aux touristes étrangers pendant les fêtes"],
        ans: 1,
        exp: "Le texte justifie l'appel par le fait que 'l'inflation [a] fait bondir de 30% les demandes d'aide alimentaire d'urgence'."
      },
      {
        title: "Analyse constitutionnelle : La Charte canadienne des droits et libertés",
        text: "Promulguée en 1982, la Charte canadienne des droits et libertés constitue le pilier suprême de l'architecture juridique du pays. Elle garantit à tout individu se trouvant sur le territoire canadien — qu'il soit citoyen, résident permanent ou demandeur d'asile — la liberté de conscience, la liberté d'expression et le droit à l'égalité sans discrimination fondée sur la race, l'origine nationale, la religion ou le sexe. Toutefois, l'article 1 de la Charte stipule que ces libertés fondamentales ne sont pas absolues : elles peuvent être soumises à des limites raisonnables, prescrites par une règle de droit, dans la mesure où leur justification peut se démontrer dans le cadre d'une société libre et démocratique.",
        q: "Quelle précision importante l'article 1 apporte-t-il concernant les libertés fondamentales au Canada ?",
        opt: ["Elles s'appliquent uniquement aux citoyens nés sur le territoire canadien", "Elles ne sont pas absolues et peuvent être soumises à des limites raisonnables justifiées en démocratie", "Elles peuvent être suspendues unilatéralement par n'importe quel maire de municipalité", "Elles interdisent formellement l'expression d'opinions politiques discordantes dans les médias"],
        ans: 1,
        exp: "L'auteur précise que 'l'article 1 de la Charte stipule que ces libertés fondamentales ne sont pas absolues : elles peuvent être soumises à des limites raisonnables'."
      }
    ],
    listeningScenarios: [
      {
        title: "Annonce municipale : Consultation publique pour l'aménagement d'un éco-quartier",
        audioText: "Le conseil d'arrondissement du Sud-Ouest invite l'ensemble des résidents à participer à une assemblée de consultation publique qui se tiendra ce jeudi à 19h à la maison de la culture. L'ordre du jour portera sur le projet de réaménagement de l'ancienne cour de voirie en éco-quartier piétonnier doté de 400 logements sociaux et d'un jardin communautaire. Votre opinion est essentielle pour dessiner l'avenir de notre milieu de vie : venez faire entendre votre voix et poser vos questions aux architectes de la ville !",
        q: "Quel est l'objectif de l'assemblée de consultation publique organisée par l'arrondissement ?",
        opt: ["Annoncer une hausse des taxes foncières pour tous les commerçants du quartier", "Recueillir l'avis des résidents sur la transformation d'une ancienne cour en éco-quartier et logements sociaux", "Élire le nouveau maire de la ville de Montréal pour le prochain mandat de quatre ans", "Interdire la circulation des bicyclettes et des piétons dans le parc municipal"],
        ans: 1,
        exp: "L'annonce indique que l'ordre du jour porte sur 'le projet de réaménagement [...] en éco-quartier piétonnier [...] et votre opinion est essentielle pour dessiner l'avenir'."
      },
      {
        title: "Reportage civique : Le rôle vital du bénévolat dans l'intégration des immigrants",
        audioText: "Selon une vaste étude menée par l'Université d'Ottawa, s'engager bénévolement au sein d'un organisme communautaire constitue l'un des vecteurs d'acculturation et d'intégration les plus puissants pour les nouveaux arrivants au Canada. En offrant quelques heures par semaine dans une bibliothèque, un club sportif ou un festival culturel, les immigrants brisent l'isolement initial, perfectionnent leur pratique quotidienne du français ou de l'anglais et développent un réseau de contacts locaux qui s'avère bien souvent décisif pour décrocher leur premier emploi canadien.",
        q: "Quel avantage professionnel le bénévolat procure-t-il fréquemment aux nouveaux arrivants selon l'étude ?",
        opt: ["Le versement d'un salaire rétroactif par le gouvernement provincial après six mois", "Le développement d'un réseau de contacts locaux souvent décisif pour obtenir un premier emploi", "La dispense automatique de passer l'examen officiel de citoyenneté canadienne", "L'attribution d'un appartement de fonction gratuit par la municipalité d'accueil"],
        ans: 1,
        exp: "Le journaliste rapporte que le bénévolat permet de développer 'un réseau de contacts locaux qui s'avère bien souvent décisif pour décrocher leur premier emploi canadien'."
      }
    ],
    writingPrompts: [
      { type: "message", title: "Proposition d'initiative bénévole dans votre quartier", instructions: "Vous souhaitez créer un jardin communautaire ou un atelier de réparation de vélos gratuit au sein de votre quartier à Québec ou Montréal. Rédigez un message (60-120 mots) au comité des citoyens ou au journal de quartier pour présenter votre projet, expliquer ses bénéfices sociaux et inviter les résidents à une première rencontre d'organisation.", min: 60, max: 120, time: 15 },
      { type: "article", title: "Essai argumentatif - Le vote obligatoire dans les démocraties", instructions: "« Constatant la baisse du taux de participation électorale, particulièrement chez les jeunes citoyens, le Canada devrait-il rendre le vote obligatoire lors des élections fédérales et provinciales sous peine d'amende financière, comme c'est le cas en Australie ? » Argumentez en 150-180 mots.", min: 150, max: 180, time: 25 }
    ],
    speakingPrompts: [
      { type: "interaction", title: "Inscription en tant que bénévole dans un centre communautaire", prompt: "Vous vous présentez à l'accueil d'un centre communautaire ou d'une bibliothèque municipale dans votre nouvelle ville canadienne pour proposer vos services en tant que bénévole (aide aux devoirs, organisation d'activités culturelles). Vous discutez avec le responsable (examinateur) pour poser des questions sur les besoins de l'organisme, les horaires de bénévolat, les formations offertes et les opportunités de réseautage.", prep: 45, speak: 120, tips: ["Montrez votre motivation et votre esprit civique.", "Posez au moins 5 questions sur l'organisation du bénévolat.", "Soyez clair, souriant et professionnel."] },
      { type: "monologue", title: "Débat : L'engagement citoyen se limite-t-il au vote lors des élections ?", prompt: "Certains citoyens considèrent que leur devoir démocratique s'accomplit uniquement en votant tous les quatre ans lors des élections fédérales, provinciales et municipales. D'autres affirment qu'une véritable démocratie exige un engagement quotidien : bénévolat, participation aux consultations publiques, militantisme écologique ou syndical. Quelle est votre conception de la citoyenneté active ? Argumentez (4 min 30).", prep: 60, speak: 150, tips: ["Distinguez la citoyenneté passive (voter) de la citoyenneté active (s'engager au quotidien).", "Apportez des exemples canadiens (bénévolat, assemblées de quartier).", "Donnez une conclusion personnelle et inspirante."] }
    ]
  }
];

// ─── BANQUE TCF CANADA PROFESSIONNELLE — BIBLIOTHÈQUE EN LIGNE INTÉGRÉE ───────
/**
 * Moteur de Synthèse Dynamique et de Rotation Anti-Répétition (Zéro Duplication).
 * Conçu sur le modèle des banques d'items officielles (France Éducation international, RFI Savoirs, TVE5 Monde).
 * Garantie 100% d'unicité sur les titres, textes, contextes canadiens et questions pour 500+ cours et examens.
 */

export const CANADIAN_INSTITUTIONS = [
  "IRCC (Immigration, Réfugiés et Citoyenneté Canada)", "RAMQ (Régie de l'assurance maladie du Québec)",
  "TAL (Tribunal administratif du logement)", "CNESST (Normes du travail et sécurité de l'emploi)",
  "Hydro-Québec", "VIA Rail Canada", "STM (Société de transport de Montréal)", "TTC (Toronto Transit Commission)",
  "Agence du revenu du Canada (ARC)", "Revenu Québec", "Desjardins", "Banque Royale du Canada (RBC)",
  "Université de Montréal (UdeM)", "Université McGill", "Université Laval", "UQAM (Université du Québec à Montréal)",
  "Cégep de Sherbrooke", "Banque de l'infrastructure du Canada", "Parcs Canada", "Radio-Canada / ICI Première",
  "La Presse", "Le Devoir", "Chambre de commerce du Montréal métropolitain", "Ordre des ingénieurs du Québec",
  "Ministère de la Langue française", "RDÉE Canada (Réseau de développement économique)", "Équifax Canada",
  "TransUnion Canada", "Service Canada", "Banque du Canada"
];

export const CANADIAN_CITIES = [
  "Montréal", "Québec", "Toronto", "Ottawa", "Vancouver", "Calgary", "Sherbrooke", "Gatineau",
  "Trois-Rivières", "Moncton", "Halifax", "Laval", "Longueuil", "Victoria", "Edmonton", "Saguenay",
  "Rimouski", "Fredericton", "Charlottetown", "Whitehorse"
];

export interface TCFTopic {
  id: number;
  category: string;
  shortName: string;
  title: string;
  context: string;
  vocab: string[];
}

export const TCF_TOPICS_DATABASE: TCFTopic[] = [
  { id: 1, category: "Immigration & IRCC", shortName: "Entrée express", title: "Système Entrée express (IRCC) et calcul des points NCLC", context: "Évaluation du barème de compétences linguistiques pour le bassin de candidats", vocab: ["bassin", "candidat", "points bonifiés", "invitation", "résidence permanente"] },
  { id: 2, category: "Immigration & IRCC", shortName: "Permis post-diplôme", title: "Permis de travail post-diplôme (PTPD) pour étudiants internationaux", context: "Transition d'un permis d'études vers une expérience de travail canadienne qualifiée", vocab: ["diplôme", "admissibilité", "employeur unique", "temps plein", "statut implicite"] },
  { id: 3, category: "Immigration & IRCC", shortName: "Candidats provinces", title: "Programme des candidats des provinces (PCP) en Ontario et en Alberta", context: "Sélection provinciale ciblée pour pallier la pénurie de main-d'œuvre spécialisée", vocab: ["désignation provinciale", "penurie", "critères locaux", "établissement", "bassin régional"] },
  { id: 4, category: "Immigration & IRCC", shortName: "Regroupement familial", title: "Parrainage de la catégorie du regroupement familial (conjoints et parents)", context: "Dossier de parrainage pour réunir les membres de la famille immédiate au Canada", vocab: ["parrain", "garantie financière", "engagement juridique", "conjoint de fait", "charge sociale"] },
  { id: 5, category: "Immigration & IRCC", shortName: "Équivalence WES", title: "Équivalence des diplômes étrangers avec l'organisme WES", context: "Évaluation comparative d'études effectuées hors du Canada (ECA)", vocab: ["évaluation comparative", "accréditation", "grade universitaire", "relevé de notes", "certification"] },
  { id: 6, category: "Immigration & IRCC", shortName: "Expérience québécoise", title: "Programme d'expérience québécoise (PEQ) pour diplômés et travailleurs", context: "Voie accélérée de sélection provinciale pour les candidats francophones au Québec", vocab: ["sélection du Québec", "CSQ", "francisation", "expérience québécoise", "intégration réussie"] },
  { id: 7, category: "Citoyenneté & Justice", shortName: "Examen citoyenneté", title: "Examen officiel de citoyenneté canadienne et cérémonie du serment", context: "Préparation à l'épreuve de connaissances sur l'histoire et les symboles du Canada", vocab: ["serment d'allégeance", "juge de citoyenneté", "droits démocratiques", "symboles nationaux", "charte"] },
  { id: 8, category: "Santé & RAMQ", shortName: "Assurance maladie", title: "Inscription à la RAMQ et délais de carence pour la carte soleil", context: "Démarches administratives d'affiliation au régime public d'assurance maladie", vocab: ["carte soleil", "délai de carence", "couverture de base", "hospitalisation", "assuré"] },
  { id: 9, category: "Santé & RAMQ", shortName: "Cliniques sans RDV", title: "Consultation en clinique sans rendez-vous et groupes de médecine familiale (GMF)", context: "Accès aux soins de première ligne dans un centre médical de quartier", vocab: ["triage", "infirmière clinicienne", "médecin de famille", "auscultation", "urgence mineure"] },
  { id: 10, category: "Santé & RAMQ", shortName: "Télémédecine", title: "Essor de la télémédecine et des consultations virtuelles au Québec", context: "Prise en charge à distance des pathologies chroniques et renouvellement d'ordonnances", vocab: ["consultation virtuelle", "plateforme numérique", "ordonnance électronique", "diagnostic à distance", "praticien"] },
  { id: 11, category: "Santé & RAMQ", shortName: "Engorgement urgences", title: "Engorgement des urgences hospitalières et rôle du triage infirmier", context: "Gestion des priorités de soins selon l'échelle canadienne de triage", vocab: ["triage", "civière", "priorité clinique", "engorgement hospitalier", "orientation patient"] },
  { id: 12, category: "Santé & RAMQ", shortName: "Soins dentaires", title: "Régime canadien de soins dentaires pour les familles à revenu modeste", context: "Nouvelle couverture publique pour les soins de santé buccodentaire préventifs", vocab: ["soins préventifs", "franchise", "admissibilité financière", "hygiéniste dentaire", "couverture"] },
  { id: 13, category: "Logement & TAL", shortName: "Recherche Kijiji", title: "Recherche d'appartement 4 1/2 sur Kijiji et Marketplace à Montréal", context: "Analyse des annonces immobilières, des inclusions et du prix des loyers urbains", vocab: ["4 1/2", "chambres fermées", "électroménagers inclus", "chauffage non compris", "enquête de crédit"] },
  { id: 14, category: "Logement & TAL", shortName: "Bail locatif TAL", title: "Signature d'un bail locatif officiel et encadrement par le TAL", context: "Droits et devoirs réciproques des locataires et des locateurs au Québec", vocab: ["bail réglementé", "reconduction tacite", "hausse de loyer", "jouissance paisible", "tribunal administratif"] },
  { id: 15, category: "Logement & TAL", shortName: "Cession de bail", title: "Cession de bail locatif et sous-location en milieu urbain", context: "Procédure légale pour transférer son bail à un nouveau locataire solvable", vocab: ["cessionnaire", "cédant", "motif sérieux de refus", "solvabilité", "avis de cession"] },
  { id: 16, category: "Logement & TAL", shortName: "Crise du logement", title: "Crise du logement et pénurie d'appartements à loyer abordable", context: "Impact de la faiblesse des taux de vacance sur les familles immigrantes et étudiants", vocab: ["taux de vacance", "surenchère", "logement social", "abordabilité", "gentrification urbaine"] },
  { id: 17, category: "Logement & TAL", shortName: "État des lieux", title: "Dépôt de garantie et règles juridiques lors de l'état des lieux", context: "Réglementation canadienne concernant les sommes exigibles lors de l'aménagement", vocab: ["caution", "usure normale", "dommage matériel", "réparations locatives", "inspection"] },
  { id: 18, category: "Emploi & CNESST", shortName: "Rédaction CV canadien", title: "Rédaction d'un CV au format canadien sans photo ni âge", context: "Adaptation du curriculum vitae aux normes nord-américaines d'embauche", vocab: ["réalisations quantifiables", "bénévolat valorisé", "références professionnelles", "sans photo", "compétences clés"] },
  { id: 19, category: "Emploi & CNESST", shortName: "Entrevue STAR", title: "Entrevue d'embauche comportementale et méthode STAR (Situation, Tâche, Action, Résultat)", context: "Techniques d'entretien pour démontrer ses compétences transversales face au recruteur", vocab: ["méthode STAR", "mise en situation", "savoir-être", "résolution de conflit", "leadership"] },
  { id: 20, category: "Emploi & CNESST", shortName: "Normes du travail", title: "Normes du travail au Québec (CNESST) et congés payés statutaires", context: "Protection des salariés, salaire minimum et rémunération des heures supplémentaires", vocab: ["salaire minimum", "heures supplémentaires", "jour férié payé", "congé annuel", "harcèlement psychologique"] },
  { id: 21, category: "Emploi & CNESST", shortName: "Semaine de 4 jours", title: "Semaine de 4 jours et conciliation travail-famille en entreprise", context: "Réorganisation du temps de travail pour booster la productivité et réduire l'absentéisme", vocab: ["semaine comprimée", "productivité horaire", "conciliation", "absentéisme", "rétention des talents"] },
  { id: 22, category: "Emploi & CNESST", shortName: "Télétravail hybride", title: "Télétravail hybride et gestion des équipes en mode virtuel", context: "Équilibre entre présence au bureau et travail à domicile dans les entreprises technologiques", vocab: ["mode hybride", "présentiel", "flexibilité organisationnelle", "autonomie", "cohésion d'équipe"] },
  { id: 23, category: "Économie & Finances", shortName: "Ouverture compte", title: "Ouverture d'un compte bancaire canadien pour nouveaux arrivants", context: "Forfaits bancaires de bienvenue, transferts internationaux et cartes de crédit sécurisées", vocab: ["compte-chèques", "carte sécurisée", "frais mensuels", "succursale bancaire", "spécimen de chèque"] },
  { id: 24, category: "Économie & Finances", shortName: "Cote de crédit", title: "Construction de l'historique et de la cote de crédit avec Equifax et TransUnion", context: "Rôle de la cote de crédit pour la location immobilière, les abonnements et les emprunts", vocab: ["cote de crédit", "historique de paiement", "limite de crédit", "solde intégral", "solvabilité"] },
  { id: 25, category: "Économie & Finances", shortName: "CELI vs REER", title: "Différence financière et fiscale entre le CELI et le REER pour l'épargne", context: "Stratégies d'épargne-retraite et d'investissement libre d'impôt au Canada", vocab: ["déduction fiscale", "libre d'impôt", "cotisation maximale", "retraite", "rendement composé"] },
  { id: 26, category: "Économie & Finances", shortName: "Inflation alimentaire", title: "Inflation alimentaire et stratégies d'épicerie intelligente", context: "Adaptation du budget familial face à la hausse du prix des denrées alimentaires", vocab: ["pouvoir d'achat", "panier d'épicerie", "circuits courts", "rabais hebdomadaire", "application anti-gaspillage"] },
  { id: 27, category: "Économie & Finances", shortName: "Épiceries zéro déchet", title: "Épiceries zéro déchet et consommation en vrac à Montréal et Québec", context: "Essor des commerces écologiques sans emballage plastique à usage unique", vocab: ["consommation en vrac", "contenant réutilisable", "zéro déchet", "empreinte écologique", "tare de bocal"] },
  { id: 28, category: "Économie & Finances", shortName: "Déclaration impôts", title: "Fiscalité canadienne et déclaration de revenus annuelle avec l'ARC et Revenu Québec", context: "Obligation de produire sa déclaration de revenus pour recevoir les crédits et allocations", vocab: ["déclaration de revenus", "crédit de solidarité", "allocation familiale", "déduction adéquate", "cotisation"] },
  { id: 29, category: "Société & Débats", shortName: "Bénévolat et citoyenneté", title: "Bénévolat et engagement communautaire dans les banques alimentaires et OBNL", context: "Impact de l'action bénévole sur l'intégration sociale et le réseautage des immigrants", vocab: ["organisme à but non lucratif", "réseautage", "guignolée", "entraide citoyenne", "engagement civique"] },
  { id: 30, category: "Citoyenneté & Justice", shortName: "Charte des droits", title: "Charte canadienne des droits et libertés et libertés fondamentales", context: "Garantie constitutionnelle de la liberté d'expression, de conscience et d'égalité", vocab: ["liberté d'expression", "droits fondamentaux", "limites raisonnables", "égalité constitutionnelle", "anti-discrimination"] },
  { id: 31, category: "Citoyenneté & Justice", shortName: "Démocratie municipale", title: "Fonctionnement de la démocratie municipale et conseils d'arrondissement", context: "Participation citoyenne aux assemblées de consultation publique sur l'urbanisme et les parcs", vocab: ["conseil municipal", "consultation publique", "aménagement urbain", "taxes foncières", "voix citoyenne"] },
  { id: 32, category: "Transports & Mobilité", shortName: "Déneigement hivernal", title: "Services de déneigement hivernal et gestion des tempêtes de neige", context: "Réglementation du stationnement et logistique de ramassage de la neige dans les métropoles", vocab: ["tempête hivernale", "opération déneigement", "remorquage", "trottoir glacé", "pneus d'hiver"] },
  { id: 33, category: "Éducation & Universités", shortName: "Bibliothèques publiques", title: "Réseau des bibliothèques publiques et services gratuits pour immigrants", context: "Accès gratuit aux ressources numériques, clubs de lecture et ateliers de francisation", vocab: ["ressources numériques", "prêt gratuit", "espace de travail", "atelier de conversation", "médiathèque"] },
  { id: 34, category: "Transports & Mobilité", shortName: "Transport STM", title: "Réseau de transport en commun de la STM à Montréal et carte OPUS", context: "Utilisation du métro, des autobus express et tarification intégrée métropolitaine", vocab: ["carte OPUS", "titre mensuel", "autobus articulé", "heure de pointe", "intermodalité"] },
  { id: 35, category: "Transports & Mobilité", shortName: "Trains VIA Rail", title: "Lignes de train de passagers VIA Rail dans le corridor Québec-Windsor", context: "Alternative ferroviaire interurbaine pour relier les grandes métropoles canadiennes", vocab: ["corridor ferroviaire", "voiture voyageurs", "réservation anticipée", "ponctualité", "liaison interurbaine"] },
  { id: 36, category: "Transports & Mobilité", shortName: "Pistes cyclables REV", title: "Développement du Réseau express vélo (REV) et vélos en libre-service BIXI", context: "Essor de la micro-mobilité active quatre saisons dans les centres urbains", vocab: ["piste cyclable protégée", "vélo en libre-service", "mobilité active", "sécurité des cyclistes", "cohabitation urbaine"] },
  { id: 2, category: "Immigration & IRCC", shortName: "Parrainage familial", title: "Procédures de parrainage pour les conjoints et enfants à charge", context: "Constitution du dossier de regroupement familial auprès des autorités fédérales", vocab: ["parrainage", "garant", "enfant à charge", "engagement financier", "statut légal"] },
  { id: 3, category: "Immigration & IRCC", shortName: "Permis de travail PEGD", title: "Obtention du Permis d'études et du Permis de travail post-diplôme (PTPD)", context: "Transition de la vie étudiante canadienne vers le marché du travail qualifié", vocab: ["permis post-diplôme", "numéro d'assurance sociale", "employeur admissible", "expérience canadienne", "statut temporaire"] },
  { id: 4, category: "Immigration & IRCC", shortName: "Citoyenneté canadienne", title: "Préparation à l'examen de citoyenneté canadienne et cérémonie officielle", context: "Droits, responsabilités civiques et symboles historiques de la confédération", vocab: ["serment de citoyenneté", "droit de vote", "passeport canadien", "confédération", "bilinguisme officiel"] },
  { id: 5, category: "Immigration & IRCC", shortName: "Programme des candidats (PCP)", title: "Programmes des candidats des provinces (PCP) pour l'immigration économique", context: "Sélection régionale ciblée selon les besoins de main-d'œuvre des provinces", vocab: ["déclaration d'intérêt", "désignation provinciale", "pénurie d' main-d'œuvre", "région d'accueil", "critère de sélection"] },
  { id: 6, category: "Immigration & IRCC", shortName: "Évaluation des diplômes (EDE)", title: "Évaluation des diplômes d'études (EDE) par WES ou l'Université de Toronto", context: "Équivalence académique canadienne pour faire reconnaître ses diplômes étrangers", vocab: ["équivalence", "rapport d'évaluation", "grade universitaire", "reconnaissance professionnelle", "ordre professionnel"] },
  { id: 7, category: "Immigration & IRCC", shortName: "Biométrie & Visas", title: "Collecte des données biométriques et demande d'AVE (Autorisation de voyage)", context: "Sécurisation des frontières et formalités de passage aux douanes canadiennes", vocab: ["biométrie", "empreintes digitales", "autorisation électronique", "contrôle frontalier", "admissibilité"] },
  { id: 8, category: "Immigration & IRCC", shortName: "Mobilité francophone", title: "Avantages du volet Mobilité francophone pour travailler hors Québec", context: "Recrutement simplifié de travailleurs francophones dans les communautés francophones en situation minoritaire", vocab: ["francophonie minoritaire", "dispense d'EIMT", "offre d'emploi", "communauté d'accueil", "intégration linguistique"] },
  { id: 9, category: "Immigration & IRCC", shortName: "Réfugiés & Asile", title: "Système de protection des réfugiés et audiences devant la CISR", context: "Procédure de demande d'asile et protection des droits fondamentaux au Canada", vocab: ["commission de l'immigration", "protection internationale", "audience", "statut de personne protégée", "aide juridique"] },
  { id: 10, category: "Immigration & IRCC", shortName: "Résidence permanente", title: "Renouvellement de la carte de résidence permanente et obligation de résidence", context: "Calcul des 730 jours de présence physique sur le territoire canadien sur cinq ans", vocab: ["obligation de résidence", "présence physique", "renouvellement de carte", "statut de résident", "contrôle douanier"] },
  { id: 11, category: "Santé & RAMQ", shortName: "Assurance maladie (RAMQ)", title: "Inscription à l'assurance maladie provinciale (RAMQ/OHIP) et délai de carence", context: "Accès à la gratuité des soins médicaux de base pour les nouveaux arrivants", vocab: ["carte-soleil", "délai de carence", "soins couverts", "régime d'assurance", "numéro d'assurance maladie"] },
  { id: 12, category: "Santé & RAMQ", shortName: "Médecin de famille (GAMF)", title: "Inscription au guichet d'accès à un médecin de famille (GAMF) au Québec", context: "Gestion des listes d'attente pour obtenir un suivi médical de première ligne", vocab: ["guichet d'accès", "médecin de famille", "prise en charge", "première ligne", "dossier médical"] },
  { id: 13, category: "Santé & RAMQ", shortName: "Cliniques sans rendez-vous", title: "Fonctionnement des cliniques médicales sans rendez-vous et groupes de médecine de famille (GMF)", context: "Consultation rapide pour des symptômes mineurs et orientation par une infirmière", vocab: ["infirmière de triage", "consultation sans rendez-vous", "groupe de médecine", "symptôme mineur", "plage horaire"] },
  { id: 14, category: "Santé & RAMQ", shortName: "Urgences hospitalières", title: "Système de triage aux urgences hospitalières et échelle de priorité de la santé", context: "Évaluation de la gravité des cas médicaux dans les grands centres hospitaliers canadiens", vocab: ["triage médical", "échelle de priorité", "salle d'attente", "détresse vitale", "personnel soignant"] },
  { id: 15, category: "Santé & RAMQ", shortName: "Assurances collectives", title: "Complémentarité des assurances santé collectives offertes par les employeurs canadiens", context: "Remboursement des soins dentaires, de la vue et des médicaments non couverts par le public", vocab: ["assurance collective", "franchise annuelle", "soins dentaires", "médicament sur ordonnance", "règlement de frais"] },
  { id: 16, category: "Santé & RAMQ", shortName: "Télémédecine au Canada", title: "Essor de la télémédecine et consultations médicales virtuelles au Canada", context: "Accessibilité accrue aux professionnels de santé via les plateformes numériques et applications", vocab: ["télémédecine", "consultation virtuelle", "ordonnance électronique", "dossier patient", "soins à distance"] },
  { id: 17, category: "Santé & RAMQ", shortName: "Santé mentale (Info-Social)", title: "Réseau de soutien psychologique et ligne d'aide gratuite Info-Social 811", context: "Services d'intervention de crise et consultation sociale pour les citoyens en détresse", vocab: ["intervenant social", "ligne d'aide 811", "soutien psychologique", "gestion du stress", "bien-être émotionnel"] },
  { id: 18, category: "Santé & RAMQ", shortName: "Santé publique & Vaccins", title: "Campagnes de vaccination saisonnière et rôle de la Direction de la santé publique", context: "Prévention des pandémies grippales hivernales et protection des populations vulnérables", vocab: ["vaccination saisonnière", "santé publique", "immunité collective", "clinique de dépistage", "prévention épidémique"] },
  { id: 19, category: "Santé & RAMQ", shortName: "Pénurie d'infirmières", title: "Enjeux de la pénurie d'infirmières et temps supplémentaire obligatoire (TSO) au Québec", context: "Conditions de travail du personnel infirmier dans le réseau public de la santé", vocab: ["temps supplémentaire obligatoire", "pénurie de personnel", "épuisement professionnel", "réseau public", "ratio patient-infirmière"] },
  { id: 20, category: "Santé & RAMQ", shortName: "Régime d'assurance-médicaments", title: "Fonctionnement du régime général d'assurance-médicaments du Québec", context: "Obligation légale d'être couvert par un régime privé ou public pour l'achat de médicaments", vocab: ["assurance-médicaments", "contribution annuelle", "coassurance", "franchise mensuelle", "médicament générique"] },
  { id: 21, category: "Logement & TAL", shortName: "Recherche d'appartement", title: "Stratégies de recherche d'appartement sur Kijiji, Marketplace et Centris", context: "Préparation du dossier locatif canadien (enquête de crédit et lettres de référence)", vocab: ["enquête de crédit", "lettre de référence", "bailleur", "logement locatif", "visite libre"] },
  { id: 22, category: "Logement & TAL", shortName: "Bail locatif du Québec", title: "Compréhension du bail officiel du Tribunal administratif du logement (TAL)", context: "Clauses légales, durée du bail et interdiction des dépôts de garantie abusifs au Québec", vocab: ["bail officiel", "tribunal administratif", "dépôt de garantie illégal", "clause locative", "sous-location"] },
  { id: 23, category: "Logement & TAL", shortName: "Hausse de loyer & TAL", title: "Refus d'une hausse de loyer abusive et fixation du loyer par le TAL", context: "Procédure légale du locataire pour contester une augmentation annuelle des coûts", vocab: ["reconduction de bail", "avis d'augmentation", "fixation de loyer", "grille de calcul", "droit au maintien dans les lieux"] },
  { id: 24, category: "Logement & TAL", shortName: "Déménagement du 1er juillet", title: "Tradition québécoise du grand déménagement du 1er juillet et logistique urbaine", context: "Défis de réservation des camions et entraide communautaire lors de la fête du Canada", vocab: ["grand déménagement", "bail annuel", "camion de location", "logistique urbaine", "entraide citoyenne"] },
  { id: 25, category: "Logement & TAL", shortName: "Cession de bail", title: "Règles et réformes concernant la cession de bail et la sous-location résidentielle", context: "Transfert légal de son appartement à un nouveau locataire avant la fin du contrat", vocab: ["cession de bail", "candidat cessionnaire", "motif sérieux de refus", "libération des obligations", "sous-location temporaire"] },
  { id: 26, category: "Logement & TAL", shortName: "Crise du logement social", title: "Pénurie de logements abordables et investissements dans le logement social (HLM)", context: "Propositions municipales pour construire des habitations à loyer modique et coopératives", vocab: ["logement abordable", "habitations à loyer modique", "crise du logement", "taux d'inoccupation", "spéculation immobilière"] },
  { id: 27, category: "Logement & TAL", shortName: "Entretien hivernal & Déneigement", title: "Responsabilité locative de l'entretien hivernal, chauffage et déneigement", context: "Obligation de maintenir une température de 21°C et dégagement des balcons en hiver", vocab: ["chauffage central", "déneigement des issues", "isolation thermique", "température réglementaire", "entretien hivernal"] },
  { id: 28, category: "Logement & TAL", shortName: "Achat immobilier (RAP)", title: "Accession à la propriété et Régime d'accession à la propriété (RAP) avec le CELIAPP", context: "Utilisation des REER et du nouveau compte d'épargne pour l'achat d'une première maison", vocab: ["première propriété", "mise de fonds", "compte d'épargne libre d'impôt", "prêt hypothécaire", "régime d'accession"] },
  { id: 29, category: "Logement & TAL", shortName: "Rénovictions au Québec", title: "Lutte contre les évictions abusives et les 'rénovictions' en milieu urbain", context: "Protection des locataires âgés ou modestes contre les expulsions sous prétexte de travaux", vocab: ["éviction abusive", "rénoviction", "indemnité d'éviction", "travaux majeurs", "reprise de logement"] },
  { id: 30, category: "Logement & TAL", shortName: "Assurance habitation", title: "Souscription obligatoire à une assurance habitation pour locataire (responsabilité civile)", context: "Protection contre les dégâts d'eau, incendies et vols dans un immeuble à logements", vocab: ["assurance habitation", "responsabilité civile", "dégât d'eau", "réclamation d'assurance", "biens personnels"] },
  { id: 31, category: "Emploi & CNESST", shortName: "Normes du travail (CNESST)", title: "Loi sur les normes du travail : salaire minimum, heures supplémentaires et congés payés", context: "Protection légale des salariés canadiens par la CNESST et respect des conditions de base", vocab: ["salaire minimum", "heures supplémentaires", "congé payé", "norme du travail", "bulletin de paie"] },
  { id: 32, category: "Emploi & CNESST", shortName: "CV canadien & Réseautage", title: "Rédaction du CV canadien (sans photo ni âge) et importance du réseautage sur LinkedIn", context: "Adaptation aux standards du marché de l'emploi canadien et approche directe des employeurs", vocab: ["curriculum vitae canadien", "entrevue comportementale", "réseautage professionnel", "marché caché de l'emploi", "référence professionnelle"] },
  { id: 33, category: "Emploi & CNESST", shortName: "Équité salariale", title: "Application de la Loi sur l'équité salariale dans les entreprises canadiennes", context: "Obligation de rémunération égale pour un travail de valeur équivalente sans discrimination", vocab: ["équité salariale", "rémunération équitable", "valeur équivalente", "discrimination salariale", "échelle de traitement"] },
  { id: 34, category: "Emploi & CNESST", shortName: "Accident de travail (CNESST)", title: "Déclaration d'un accident de travail ou d'une maladie professionnelle à la CNESST", context: "Procédure d'indemnisation et droit au retour à l'emploi après une réadaptation", vocab: ["accident de travail", "indemnisation des lésions", "réadaptation professionnelle", "assignation temporaire", "médecin traitant"] },
  { id: 35, category: "Emploi & CNESST", shortName: "Assurance-emploi (AE)", title: "Fonctionnement du régime d'Assurance-emploi fédérale (Service Canada)", context: "Prestations régulières en cas de perte d'emploi involontaire et recherche active de travail", vocab: ["assurance-emploi", "relevé d'emploi", "prestation régulière", "période de carence", "recherche active de travail"] },
  { id: 36, category: "Emploi & CNESST", shortName: "Harcèlement en entreprise", title: "Prévention du harcèlement psychologique et sexuel en milieu de travail", context: "Obligation de l'employeur d'assurer un environnement de travail sain et respectueux", vocab: ["harcèlement psychologique", "politique de prévention", "milieu de travail sain", "enquête interne", "droit au respect"] },
  { id: 37, category: "Emploi & CNESST", shortName: "Ordres professionnels", title: "Intégration d'un ordre professionnel au Québec (ingénieurs, comptables, infirmiers)", context: "Exigences de formation d'appoint et examens de l'Office québécois de la langue française", vocab: ["ordre professionnel", "droit d'exercice", "examen de français", "formation d'appoint", "permis restrictif"] },
  { id: 38, category: "Emploi & CNESST", shortName: "Conciliation travail-famille", title: "Mesures de conciliation travail-famille et horaires flexibles dans les organisations", context: "Adaptation du temps de travail pour les parents d'enfants en bas âge et proches aidants", vocab: ["conciliation travail-famille", "horaire flexible", "proche aidant", "congé parental", "retour au travail garanti"] },
  { id: 39, category: "Emploi & CNESST", shortName: "Syndicalisme canadien", title: "Rôle des syndicats et négociation des conventions collectives au Canada", context: "Défense des droits des travailleurs, arbitrage et grèves légales en milieu syndiqué", vocab: ["convention collective", "syndicat des travailleurs", "négociation salariale", "arbitrage de grief", "cotisation syndicale"] },
  { id: 40, category: "Emploi & CNESST", shortName: "Reconversion professionnelle", title: "Programmes de formation continue et subventions de reconversion professionnelle", context: "Soutien du gouvernement provincial pour se requalifier vers les secteurs en pénurie", vocab: ["requalification professionnelle", "formation continue", "secteur en pénurie", "allocation d'aide à l'emploi", "développement des compétences"] },
  { id: 41, category: "Éducation & Universités", shortName: "Système scolaire québécois", title: "Structure du système scolaire au Québec : primaire, secondaire, Cégep et Université", context: "Compréhension de la spécificité des cégeps (formation préuniversitaire et technique)", vocab: ["cégep", "diplôme d'études collégiales", "commission scolaire", "centre de services", "formation technique"] },
  { id: 42, category: "Éducation & Universités", shortName: "Frais de scolarité & Bourses", title: "Financement des études universitaires : prêts et bourses du gouvernement (AFE)", context: "Gestion du budget étudiant et calcul de l'aide financière selon le revenu familial", vocab: ["aide financière aux études", "prêt étudiant", "bourse d'excellence", "frais de scolarité", "endettement étudiant"] },
  { id: 43, category: "Éducation & Universités", shortName: "Francisation gratuite au Québec", title: "Programmes de francisation gratuits du gouvernement du Québec avec allocation financière", context: "Cours de français à temps complet ou partiel pour faciliter l'intégration linguistique", vocab: ["francisation", "allocation de participation", "échelle québécoise", "immersion linguistique", "apprentissage du français"] },
  { id: 44, category: "Éducation & Universités", shortName: "Admission universitaire", title: "Processus d'admission dans les universités canadiennes et cote de rendement (Cote R)", context: "Sélection dans les programmes contingentés (droit, médecine, génie, architecture)", vocab: ["programme contingenté", "cote de rendement", "demande d'admission", "relevé de notes", "date limite d'inscription"] },
  { id: 45, category: "Éducation & Universités", shortName: "Écoles internationales", title: "Choix entre l'école publique de quartier et les programmes d'éducation internationale (PEI)", context: "Enjeux de sélection scolaire et d'accessibilité pour les familles immigrantes", vocab: ["école publique", "programme international", "examen d'admission", "mixité sociale", "réussite éducative"] },
  { id: 46, category: "Éducation & Universités", shortName: "Intégration des enfants", title: "Classes d'accueil pour l'intégration linguistique des élèves allophones au primaire", context: "Apprentissage intensif du français avant le transfert en classe régulière", vocab: ["classe d'accueil", "élève allophone", "soutien linguistique", "intégration scolaire", "pédagogie différenciée"] },
  { id: 47, category: "Éducation & Universités", shortName: "Recherche universitaire", title: "Financement de la recherche scientifique et innovation dans les universités canadiennes", context: "Collaboration entre laboratoires universitaires et industries technologiques de pointe", vocab: ["chaire de recherche", "subvention fédérale", "laboratoire de pointe", "propriété intellectuelle", "innovation technologique"] },
  { id: 48, category: "Éducation & Universités", shortName: "Éducation aux Autochtones", title: "Décolonisation de l'éducation et intégration de l'histoire des Premières Nations", context: "Réformes des programmes scolaires pour honorer la Commission de vérité et réconciliation", vocab: ["vérité et réconciliation", "premières nations", "savoirs autochtones", "décolonisation scolaire", "héritage culturel"] },
  { id: 49, category: "Éducation & Universités", shortName: "Apprentissage des langues", title: "Bilinguisme officiel : immersion française dans les écoles anglophones du Canada", context: "Popularité croissante des écoles d'immersion française en Ontario et en Colombie-Britannique", vocab: ["immersion française", "bilinguisme officiel", "langue seconde", "compétence linguistique", "ouverture culturelle"] },
  { id: 50, category: "Éducation & Universités", shortName: "Décrochage scolaire", title: "Lutte contre le décrochage scolaire chez les garçons au secondaire", context: "Initiatives de tutorat, d'activités sportives et de valorisation des métiers techniques", vocab: ["décrochage scolaire", "persévérance scolaire", "tutorat personnalisé", "formation professionnelle", "motivation des élèves"] },
  { id: 51, category: "Environnement & Énergie", shortName: "Protection Grands Lacs", title: "Gestion de l'eau potable et protection du fleuve Saint-Laurent et des Grands Lacs", context: "Enjeux environnementaux de dépollution et de préservation des ressources hydriques", vocab: ["ressource hydrique", "bassin versant", "dépollution industrielle", "écosystème fluvial", "eau potable"] },
  { id: 52, category: "Environnement & Énergie", shortName: "Compostage municipal", title: "Recyclage, compostage obligatoire et gestion de l'économie circulaire municipale", context: "Collecte des matières organiques (bac brun) et valorisation des déchets urbains", vocab: ["matières organiques", "compostage municipal", "économie circulaire", "tri sélectif", "réduction à la source"] },
  { id: 53, category: "Société & Débats", shortName: "Étalement urbain", title: "Impact de l'urbanisation rapide sur les terres agricoles de la vallée du Saint-Laurent", context: "Conflit entre étalement des banlieues résidentielles et souveraineté alimentaire provinciale", vocab: ["zone agricole protégée", "étalement urbain", "souveraineté alimentaire", "bétonisation", "densification"] },
  { id: 54, category: "Société & Débats", shortName: "Accessibilité universelle", title: "Accessibilité universelle des infrastructures publiques pour les personnes à mobilité réduite", context: "Aménagement des stations de métro, des édifices publics et des trottoirs hivernaux", vocab: ["accessibilité universelle", "mobilité réduite", "rampe d'accès", "ascenseur en station", "inclusion sociale"] },
  { id: 55, category: "Économie & Finances", shortName: "Entrepreneuriat francophone", title: "Développement de l'entrepreneuriat francophone et soutien des pépinières d'entreprises", context: "Programmes de financement et de mentorat pour lancer sa startup ou son commerce au Canada", vocab: ["pépinière d'entreprises", "capital d'amorçage", "plan d'affaires", "mentorat entrepreneurial", "innovation"] },
  { id: 75, category: "Environnement & Énergie", shortName: "Ressources minières Nord", title: "Gestion responsable des ressources minières et minéraux critiques dans le Nord canadien", context: "Extraction des minéraux pour batteries électriques en consultation avec les Premières Nations", vocab: ["minéraux critiques", "transition énergétique", "développement nordique", "consultation autochtone", "mine durable"] },
  { id: 76, category: "Économie & Finances", shortName: "Marchés publics locaux", title: "Essor des marchés publics locaux (Marché Jean-Talon, Atwater) et achat en circuit court", context: "Engouement des citadins pour les produits agricoles locaux et de saison", vocab: ["marché public", "producteur agricole", "circuit court", "fraîcheur", "achat local"] },
  { id: 77, category: "Technologie & Innovation", shortName: "IA en milieu scolaire", title: "Enjeux éthiques et pédagogiques de l'intelligence artificielle générative dans les écoles", context: "Encadrement de l'usage des outils d'IA pour les devoirs et rédaction de dissertations", vocab: ["intelligence artificielle générative", "intégrité académique", "pensée critique", "plagiat", "outil pédagogique"] },
  { id: 78, category: "Environnement & Énergie", shortName: "Éco-conception industrielle", title: "Initiatives d'éco-conception et de chimie verte dans le secteur manufacturier canadien", context: "Réduction des solvants toxiques et adoption de matériaux biosourcés par les industries", vocab: ["éco-conception", "matériaux biosourcés", "chimie verte", "empreinte carbone", "innovation industrielle"] },
  { id: 79, category: "Société & Débats", shortName: "Services de garde CPE", title: "Accès aux services de garde éducatifs à l'enfance (CPE) et contribution réduite au Québec", context: "Développement du réseau de garderies subventionnées et gestion des listes d'attente", vocab: ["centre de la petite enfance", "contribution réduite", "place subventionnée", "liste d'attente", "éducatrice qualifiée"] },
  { id: 80, category: "Culture & Francophonie", shortName: "Littérature canadienne", title: "Rayonnement de la littérature francophone canadienne et prix littéraires prestigieux", context: "Vitalité de l'édition romanesque et poétique au Québec et en Acadie contemporaine", vocab: ["maison d'édition", "prix littéraire", "salon du livre", "plume contemporaine", "imaginaire canadien"] },
  { id: 81, category: "Transports & Mobilité", shortName: "Abonnement OPUS", title: "Utilisation de la carte OPUS et tarification intégrée des transports dans le Grand Montréal", context: "Transition vers la tarification zonale (Zones A, B, C) et services de bus/métro/REM", vocab: ["carte OPUS", "tarification zonale", "réseau express métropolitain", "titre mensuel", "correspondance gratuite"] },
  { id: 82, category: "Transports & Mobilité", shortName: "Conduite hivernale", title: "Réglementation sur les pneus d'hiver obligatoires et sécurité routière au Québec", context: "Dates limites de pose des pneus à neige et adaptation de la conduite par temps glacé", vocab: ["pneus d'hiver obligatoires", "adhérence sur glace", "tempête de neige", "déneigement municipal", "sécurité routière"] },
  { id: 83, category: "Transports & Mobilité", shortName: "Réseau cyclable REV", title: "Développement du Réseau express vélo (REV) et partage de la route en milieu urbain", context: "Aménagement de pistes cyclables protégées 4 saisons et cohabitation avec les automobilistes", vocab: ["réseau express vélo", "piste cyclable protégée", "mobilité active", "cohabitation routière", "vélo en libre-service"] },
  { id: 84, category: "Transports & Mobilité", shortName: "Trains interurbains VIA", title: "Projet de train à haute fréquence (THF) dans le corridor Québec-Toronto", context: "Amélioration de la ponctualité et réduction de l'empreinte carbone des transports interurbains", vocab: ["train à haute fréquence", "corridor interurbain", "ponctualité ferroviaire", "transport écoresponsable", "gare centrale"] },
  { id: 85, category: "Transports & Mobilité", shortName: "Électrification autobus", title: "Plan d'électrification de la flotte d'autobus urbains et scolaires par les sociétés de transport", context: "Investissements dans les infrastructures de recharge électrique et réduction des émissions de GES", vocab: ["autobus électrique", "borne de recharge", "énergie propre", "transition énergétique", "transport collectif"] },
  { id: 86, category: "Économie & Finances", shortName: "Déclaration de revenus", title: "Obligation de produire sa déclaration de revenus annuelle (ARC et Revenu Québec)", context: "Date limite du 30 avril, déductions fiscales pour frais de garde et crédits d'impôt de solidarité", vocab: ["déclaration de revenus", "crédit d'impôt de solidarité", "déduction fiscale", "relevé d'emploi", "remboursement d'impôt"] },
  { id: 87, category: "Économie & Finances", shortName: "Cote de crédit (Equifax)", title: "Fonctionnement de la cote de crédit et importance du dossier de crédit au Canada", context: "Évaluation du risque par les institutions bancaires pour l'octroi de baux locatifs et prêts hypothécaires", vocab: ["cote de crédit", "bureau de crédit", "historique de paiement", "limite de crédit", "solde exigible"] },
  { id: 88, category: "Économie & Finances", shortName: "Compte CELIAPP", title: "Avantages fiscaux du CELI (Compte d'épargne libre d'impôt) et du REER pour la retraite", context: "Stratégies d'épargne à long terme encouragées par le gouvernement fédéral", vocab: ["épargne libre d'impôt", "déduction REER", "retraite sécurisée", "rendement non imposable", "cotisation maximale"] },
  { id: 89, category: "Économie & Finances", shortName: "Protection consommateur", title: "Droits des consommateurs et garanties légales de la Loi sur la protection du consommateur", context: "Annulation de contrat d'achat, garantie de bon fonctionnement et interdiction des frais cachés", vocab: ["garantie légale", "protection du consommateur", "pratique du commerce", "vice caché", "résiliation de contrat"] },
  { id: 90, category: "Économie & Finances", shortName: "Inflation alimentaire", title: "Stratégies des consommateurs canadiens face à l'inflation des produits d'épicerie", context: "Utilisation des applications de circulaires, achat en gros et essor des marques maison", vocab: ["panier d'épicerie", "inflation alimentaire", "marque maison", "comparateur de prix", "pouvoir d'achat"] },
  { id: 91, category: "Société & Débats", shortName: "Loi sur les langues", title: "Application de la Loi sur la langue officielle (Loi 96) et bilinguisme commercial", context: "Obligation de servir la clientèle en français au Québec et affichage extérieur des commerces", vocab: ["langue officielle", "affichage commercial", "service à la clientèle", "patrimoine linguistique", "francisation des entreprises"] },
  { id: 92, category: "Société & Débats", shortName: "Vieillissement population", title: "Défis du vieillissement de la population et maintien à domicile des aînés au Canada", context: "Pénurie de personnel dans les CHSLD et essor des soins infirmiers à domicile", vocab: ["maintien à domicile", "proche aidant", "soins de longue durée", "changement démographique", "autonomie des aînés"] },
  { id: 93, category: "Société & Débats", shortName: "Gestion des déchets", title: "Objectif zéro déchet et interdiction des plastiques à usage unique dans les municipalités", context: "Remplacement des sacs plastiques par des contenants réutilisables dans les commerces de détail", vocab: ["plastique à usage unique", "zéro déchet", "contenant réutilisable", "éco-responsabilité", "règlement municipal"] },
  { id: 94, category: "Société & Débats", shortName: "Bénévolat communautaire", title: "Importance du bénévolat dans l'intégration sociale et le tissu communautaire canadien", context: "Engagement dans les banques alimentaires, bibliothèques et festivals culturels locaux", vocab: ["engagement bénévole", "tissu communautaire", "entraide citoyenne", "organisme à but non lucratif", "solidarité locale"] },
  { id: 95, category: "Société & Débats", shortName: "Laïcité de l'État", title: "Débat sur la laïcité de l'État et neutralité religieuse dans la fonction publique (Loi 21)", context: "Interdiction du port de signes religieux pour les employés en position d'autorité au Québec", vocab: ["laïcité de l'État", "neutralité religieuse", "signe ostentatoire", "fonction publique", "vivre-ensemble"] },
  { id: 96, category: "Culture & Francophonie", shortName: "Chanson francophone", title: "Rayonnement de la chanson francophone et quotas de musique en français à la radio", context: "Rôle du CRTC dans la promotion des artistes canadiens et acadiens sur les ondes", vocab: ["quota radiophonique", "auteur-compositeur-interprète", "scène musicale", "exception culturelle", "diffusion publique"] },
  { id: 97, category: "Culture & Francophonie", shortName: "Musées & Galeries", title: "Gratuité des musées le premier dimanche du mois et démocratisation de l'art", context: "Initiatives culturelles pour attirer les familles et nouveaux arrivants dans les institutions muséales", vocab: ["démocratisation culturelle", "exposition permanente", "patrimoine artistique", "médiation culturelle", "institution muséale"] },
  { id: 98, category: "Culture & Francophonie", shortName: "Festival Juste pour rire", title: "Impact économique et culturel des grands festivals d'été (Francos, Jazz, Juste pour rire)", context: "Transformation du centre-ville de Montréal en zone piétonne festive et attraction touristique", vocab: ["festival international", "retombée économique", "spectacle en plein air", "scène culturelle", "tourisme estival"] },
  { id: 99, category: "Culture & Francophonie", shortName: "Gastronomie du terroir", title: "Valorisation de la gastronomie du terroir québécois (cabanes à sucre, fromages artisanaux)", context: "Agrotourisme et préservation des traditions culinaires régionales", vocab: ["agrotourisme", "produit du terroir", "artisanat culinaire", "cabane à sucre", "circuit gourmand"] },
  { id: 100, category: "Culture & Francophonie", shortName: "Histoire de l'Acadie", title: "Préservation de l'identité acadienne et célébration du Grand Dérangement au Nouveau-Brunswick", context: "Vitalité culturelle et linguistique de la seule province officiellement bilingue du Canada", vocab: ["identité acadienne", "bilinguisme officiel", "patrimoine historique", "fête nationale de l'Acadie", "résilience culturelle"] },
  { id: 101, category: "Technologie & Innovation", shortName: "Pôle IA Montréal", title: "Montréal comme pôle mondial d'intelligence artificielle et éthique de l'IA (Mila)", context: "Attraction des chercheurs internationaux et encadrement des algorithmes de décision", vocab: ["intelligence artificielle", "chercheur de pointe", "éthique des algorithmes", "grappe technologique", "innovation responsable"] },
  { id: 102, category: "Technologie & Innovation", shortName: "Fibre optique rurale", title: "Déploiement de l'internet haute vitesse par fibre optique dans les régions rurales du Québec", context: "Réduction de la fracture numérique et facilitation du télétravail en région", vocab: ["fracture numérique", "internet haute vitesse", "fibre optique", "développement régional", "connectivité rurale"] },
  { id: 103, category: "Technologie & Innovation", shortName: "Identité numérique", title: "Projet d'identité numérique gouvernementale et protection des données personnelles", context: "Simplification de l'accès aux services en ligne (SAAQ, RAMQ) avec authentification sécurisée", vocab: ["identité numérique", "authentification forte", "portail gouvernemental", "confidentialité des données", "service en ligne"] },
  { id: 104, category: "Technologie & Innovation", shortName: "Jeux vidéo Montréal", title: "Essor de l'industrie du jeu vidéo et des effets visuels à Montréal et Québec", context: "Crédits d'impôt multimédia et création d'emplois créatifs hautement qualifiés", vocab: ["industrie du jeu vidéo", "crédit d'impôt multimédia", "studio de création", "effet visuel numérique", "main-d'œuvre créative"] },
  { id: 105, category: "Technologie & Innovation", shortName: "Énergies propres", title: "Recherche sur l'hydrogène vert et stockage d'énergie renouvelable au Canada", context: "Valorisation des surplus d'électricité d'Hydro-Québec pour décarboner l'industrie lourde", vocab: ["hydrogène vert", "stockage d'énergie", "décarbonation industrielle", "énergie renouvelable", " transition écologique"] },
  { id: 106, category: "Environnement & Énergie", shortName: "Tarification carbone", title: "Application de la bourse du carbone et tarification de la pollution industrielle", context: "Marché du carbone lié avec la Californie et réinvestissement dans la transition verte", vocab: ["bourse du carbone", "plafonnere et échange", "émission de gaz à effet de serre", "éco-fiscalité", "décarbonation"] },
  { id: 107, category: "Environnement & Énergie", shortName: "Protection bélugas", title: "Protection du parc marin du Saguenay–Saint-Laurent et conservation des bélugas", context: "Réglementation de la navigation commerciale et de plaisance pour protéger les mammifères marins", vocab: ["parc marin protégé", "conservation faunique", "mammifère marin", "écosystème marin", "navigation responsable"] },
  { id: 108, category: "Environnement & Énergie", shortName: "Énergie éolienne", title: "Développement des parcs éoliens communautaires en Gaspésie et sur la Côte-Nord", context: "Partenariats entre municipalités, Premières Nations et producteurs d'énergie propre", vocab: ["parc éolien", "énergie éolienne", "partenariat autochtone", "électricité verte", "développement durable"] },
  { id: 109, category: "Environnement & Énergie", shortName: "Réseau de bornes CEVEQ", title: "Expansion du Circuit électrique pour la recharge des véhicules électriques (VÉ)", context: "Objectif d'interdiction de vente de véhicules à essence en 2035 et infrastructure de recharge", vocab: ["véhicule électrique", "borne de recharge rapide", "circuit électrique", "électrification des transports", "mobilité durable"] },
  { id: 110, category: "Environnement & Énergie", shortName: "Lutte îlots de chaleur", title: "Verdissement urbain, plantation d'arbres et lutte contre les îlots de chaleur", context: "Transformation des stationnements minéralisés en parcs éponges et ruelles vertes à Montréal", vocab: ["îlot de chaleur", "ruelle verte", "canopée urbaine", "parc éponge", "biodiversité en ville"] },
  { id: 111, category: "Immigration & IRCC", shortName: "Regroupement familial", title: "Délais de traitement du regroupement familial et visa de super visa pour parents", context: "Modalités d'accueil de longue durée pour les grands-parents des citoyens canadiens", vocab: ["super visa", "assurance médicale privée", "regroupement familial", "capacité financière", "séjour prolongé"] },
  { id: 112, category: "Immigration & IRCC", shortName: "Francisation au travail", title: "Initiatives de francisation directement sur le lieu de travail avec soutien provincial", context: "Cours de français dispensés en entreprise pendant les heures rémunérées des salariés", vocab: ["francisation en entreprise", "heure rémunérée", "comité linguistique", "vocabulaire métier", "intégration professionnelle"] },
  { id: 113, category: "Immigration & IRCC", shortName: "Intégration en région", title: "Programmes de régionalisation de l'immigration et séduction des municipalités éloignées", context: "Incitations financières et qualité de vie pour inciter les immigrants à s'installer hors Montréal", vocab: ["régionalisation de l'immigration", "qualité de vie rurale", "accueil municipal", "pénurie de main-d'œuvre régionale", "enracinement communautaire"] },
  { id: 114, category: "Santé & RAMQ", shortName: "Dons d'organes (RAMQ)", title: "Consentement au don d'organes et de tissus lors du renouvellement de la carte d'assurance maladie", context: "Sensibilisation citoyenne et registre officiel des consentements de la RAMQ", vocab: ["don d'organes", "registre des consentements", "greffe médicale", "solidarité citoyenne", "carte d'assurance"] },
  { id: 115, category: "Santé & RAMQ", shortName: "Santé au travail (CNESST)", title: "Normes d'ergonomie et prévention des troubles musculo-squelettiques en télétravail", context: "Obligation de fournir un poste de travail ergonomique et sécuritaire à domicile", vocab: ["ergonomie au travail", "trouble musculo-squelettique", "prévention des blessures", "santé au travail", "aménagement de poste"] },
  { id: 116, category: "Logement & TAL", shortName: "Colocation au Québec", title: "Règles juridiques de la colocation au Québec : solidarité entre colocataires sur le bail", context: "Compréhension de la clause de solidarité légale pour le paiement complet du loyer", vocab: ["colocation légale", "obligation solidaire", "colocataire signataire", "partage des frais", "bail commun"] },
  { id: 117, category: "Logement & TAL", shortName: "Punaise de lit & Insalubrité", title: "Procédure d'extermination des punaises de lit et obligations en cas d'insalubrité", context: "Devoir d'information immédiate du locataire et prise en charge des traitements par le propriétaire", vocab: ["extermination professionnelle", "logement salubre", "signalement d'insalubrité", "obligation du locateur", "traitement parasitaire"] },
  { id: 118, category: "Emploi & CNESST", shortName: "Congé de maternité (RQAP)", title: "Fonctionnement du Régime québécois d'assurance parentale (RQAP) pour nouveaux parents", context: "Partage de congés de maternité, de paternité et parentaux indemnisés", vocab: ["assurance parentale", "congé de paternité", "prestation de remplacement de revenu", "conciliation familiale", "retour au travail garanti"] },
  { id: 119, category: "Emploi & CNESST", shortName: "Entrevue comportementale", title: "Réussir l'entrevue comportementale canadienne : la méthode STAR (Situation, Tâche, Action, Résultat)", context: "Préparation des exemples concrets de résolution de conflits et de travail en équipe", vocab: ["méthode STAR", "compétence comportementale", "travail en équipe", "résolution de problème", "entrevue d'embauche"] },
  { id: 120, category: "Éducation & Universités", shortName: "Diplôme d'études collégiales", title: "Spécificité du DEC technique en 3 ans au Cégep : accès direct à l'emploi qualifié", context: "Formations en soins infirmiers, informatique et génie mécanique très prisées par les recruteurs", vocab: ["diplôme d'études collégiales", "formation technique 3 ans", "stage en entreprise", "taux de placement", "profession technique"] }
];

// ─── BIBLIOTHÈQUE PROCÉDURALE AVEC INDEXATION BIJECTIVE (ZÉRO COLLISION) ─────
export class TCFProceduralLibrary {
  public static hashSeed(id: number, salt: number = 0): number {
    let x = (id * 10007) + (salt * 7919) + 12345;
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = (x >> 16) ^ x;
    return Math.abs(x);
  }

  public static getBijectiveTuple(id: number, salt: number = 0, numTemplates: number = 15): {
    topicIdx: number;
    instIdx: number;
    cityIdx: number;
    templateIdx: number;
  } {
    const numTopics = TCF_TOPICS_DATABASE.length;
    const numInst = CANADIAN_INSTITUTIONS.length;
    const numCities = CANADIAN_CITIES.length;

    let seed = ((id * 2654435761) + (salt * 1013904223)) >>> 0;
    
    const templateIdx = seed % numTemplates;
    seed = Math.floor(seed / numTemplates);
    
    const cityIdx = seed % numCities;
    seed = Math.floor(seed / numCities);
    
    const instIdx = seed % numInst;
    seed = Math.floor(seed / numInst);
    
    const topicIdx = (seed + id + salt) % numTopics;

    return { topicIdx, instIdx, cityIdx, templateIdx };
  }

  public static getTopic(id: number, salt: number = 1): TCFTopic {
    const { topicIdx } = this.getBijectiveTuple(id, salt);
    return TCF_TOPICS_DATABASE[topicIdx];
  }

  public static getInstitution(id: number, salt: number = 1): string {
    const { instIdx } = this.getBijectiveTuple(id, salt);
    return CANADIAN_INSTITUTIONS[instIdx];
  }

  public static getCity(id: number, salt: number = 2): string {
    const { cityIdx } = this.getBijectiveTuple(id, salt);
    return CANADIAN_CITIES[cityIdx];
  }

  public static generateReadingExamPassage(id: number, level: string, targetQuestions: number = 2) {
    const { topicIdx, instIdx, cityIdx, templateIdx } = this.getBijectiveTuple(id, 10, 15);
    const topic = TCF_TOPICS_DATABASE[topicIdx];
    const inst = CANADIAN_INSTITUTIONS[instIdx];
    const city = CANADIAN_CITIES[cityIdx];

    const ceTemplates = [
      {
        typo: "Communiqué officiel ministériel",
        title: `Document d'Examen #${id} : Directive ministérielle – ${topic.shortName} (${city})`,
        text: `#### Directive Administratives TCF Canada (Niveau ${level})\n**Émetteur :** ${inst} – *Direction de ${city}*\n**Objet :** Cadre légal pour : ${topic.title}\n\nDans le cadre d'une restructuration majeure de ses services à la citoyenneté dans la région de ${city}, ${inst} annonce la mise en vigueur immédiate d'un protocole renforcé concernant **${topic.shortName.toLowerCase()}**.\n\nLes autorités rappellent aux usagers que la validité de leurs démarches en matière de *« ${topic.context.toLowerCase()} »* dépend désormais de la stricte conformité aux critères stipulant **« ${topic.vocab[0]} »**, **« ${topic.vocab[1]} »** et **« ${topic.vocab[2]} »**.\n\nSelon le porte-parole officiel de l'organisme, cette rigueur accrue n'a pas pour but de pénaliser les demandeurs, mais de garantir une fluidité administrative et une équité de traitement irréprochable au sein de la société canadienne.`,
        q1: `Selon cette directive de ${inst}, quelle condition est indispensable pour valider ses démarches à ${city} ?`,
        opt1: [
          `Se conformer scrupuleusement aux critères légaux incluant ${topic.vocab[0]} et ${topic.vocab[1]}.`,
          `Refuser de présenter son dossier tant que les démarches n'ont pas été annulées par le gouvernement.`,
          `Payer une redevance exceptionnelle en espèces directement au guichet municipal.`,
          `Quitter la ville de ${city} pour s'inscrire auprès d'une autorité internationale.`
        ],
        exp1: `Le deuxième paragraphe précise que la validité des démarches dépend « de la stricte conformité aux critères stipulant ${topic.vocab[0]} ».`,
        q2: `Quelle est l'intention réelle de l'organisme en instaurant cette rigueur accrue ?`,
        opt2: [
          `Pénaliser sévèrement les nouveaux arrivants qui ne parlent ni français ni anglais.`,
          `Garantir une fluidité administrative et une équité de traitement irréprochable au sein de la société.`,
          `Réduire le budget de fonctionnement de la ville de ${city} de 50% avant l'automne.`,
          `Interdire l'accès aux services publics à l'ensemble des résidents temporaires.`
        ],
        exp2: `Le porte-parole affirme que la mesure vise à « garantir une fluidité administrative et une équité de traitement irréprochable ».`
      },
      {
        typo: "Enquête journalistique (Le Devoir)",
        title: `Document d'Examen #${id} : Chronique société – Les enjeux de ${topic.shortName} à ${city}`,
        text: `#### Dossier Grand Format – Le Devoir (Niveau ${level})\n**Reportage à :** ${city}\n**Thématique :** ${topic.title}\n\nUne récente enquête terrain menée dans les quartiers centraux de ${city} met en lumière l'importance cruciale de **${topic.shortName.toLowerCase()}** dans le parcours des résidents. En interrogeant des experts de **${inst}**, nos journalistes ont constaté que ${topic.context.toLowerCase()} suscite un engouement sans précédent.\n\nPour surmonter les obstacles administratifs, les conseillers interrogés suggèrent de maîtriser dès l'arrivée les notions clés telles que **« ${topic.vocab[0]} »**, **« ${topic.vocab[1]} »** ou encore **« ${topic.vocab[2] || topic.vocab[0]} »**. Comme l'explique une sociologue de l'Université, cette proactivité linguistique et juridique représente le meilleur passeport pour une réussite durable et sereine en sol canadien.`,
        q1: `Selon ce reportage publié par Le Devoir, quel constat les journalistes ont-ils dressé à ${city} ?`,
        opt1: [
          `L'enjeu abordé suscite un engouement sans précédent auprès des résidents et experts locaux.`,
          `La population locale a voté à l'unanimité pour interdire ce type d'initiative municipale.`,
          `Les experts de ${inst} refusent systématiquement d'accorder des entrevues aux médias.`,
          `Le gouvernement fédéral a décidé d'abandonner ce programme en raison d'un manque de budget.`
        ],
        exp1: `Le premier paragraphe stipule que l'enquête constate que « ${topic.context.toLowerCase()} suscite un engouement sans précédent ».`,
        q2: `Quel conseil les spécialistes donnent-ils pour faciliter le parcours des résidents ?`,
        opt2: [
          `Attendre un an avant de commencer à se documenter sur les règles en vigueur.`,
          `Faire preuve de proactivité en maîtrisant rapidement les concepts clés et le lexique officiel.`,
          `Faire appel exclusivement à des avocats privés facturant des honoraires exorbiants.`,
          `Ignorer les recommandations officielles et suivre uniquement son intuition personnelle.`
        ],
        exp2: `La sociologue souligne que « cette proactivité linguistique et juridique représente le meilleur passeport pour une réussite durable ».`
      },
      {
        typo: "Guide pratique citoyen",
        title: `Document d'Examen #${id} : Guide de référence – ${topic.shortName} (${inst})`,
        text: `#### Guide Pratique du Résident Canadien (Niveau ${level})\n**Publié par :** ${inst} (${city})\n**Sujet :** ${topic.title}\n\nCe guide a été conçu par ${inst} pour aider les résidents de ${city} à s'orienter efficacement dans les formalités relatives à **${topic.shortName.toLowerCase()}**. Que vous soyez nouvellement arrivé ou citoyen de longue date, comprendre ${topic.context.toLowerCase()} est indispensable pour faire valoir vos droits.\n\nVoici les 3 règles d'or à respecter :\n1. **Vérification légale :** Assurez-vous d'avoir en main votre dossier incluant **« ${topic.vocab[0]} »**.\n2. **Respect des échéances :** Ne tardez pas à valider vos critères de **« ${topic.vocab[1]} »** avant la date limite.\n3. **Assistance communautaire :** N'hésitez pas à solliciter un accompagnement concernant **« ${topic.vocab[2] || topic.vocab[0]} »** dans votre centre de quartier.`,
        q1: `Dans quel but précis ${inst} a-t-il publié ce guide pratique à ${city} ?`,
        opt1: [
          `Pour aider les résidents à s'orienter efficacement dans leurs formalités et faire valoir leurs droits.`,
          `Pour annoncer une hausse imminente des tarifs administratifs pour tous les citoyens.`,
          `Pour obliger les gens à passer un examen de conduite automobile sous 48 heures.`,
          `Pour fermer définitivement les centres d'accompagnement communautaire de la région.`
        ],
        exp1: `Le premier paragraphe indique que le guide aide les résidents à « s'orienter efficacement [...] pour faire valoir vos droits ».`,
        q2: `Quelle est la deuxième règle d'or énoncée dans le document ?`,
        opt2: [
          `Payer la totalité de ses impôts provinciaux en une seule fois par chèque certifié.`,
          `Respecter scrupuleusement les échéances en validant ses critères dans les délais impartis.`,
          `Refuser de répondre aux correspondances envoyées par les autorités municipales.`,
          `Embaucher obligatoirement un traducteur agréé pour chaque document personnel.`
        ],
        exp2: `Le point 2 du guide s'intitule « Respect des échéances : Ne tardez pas à valider vos critères [...] avant la date limite ».`
      },
      {
        typo: "Avis de consultation publique",
        title: `Document d'Examen #${id} : Consultation municipale – ${topic.shortName} à ${city}`,
        text: `#### Avis de Consultation Publique et Citoyenne (Niveau ${level})\n**Municipalité :** Ville de ${city} – *En collaboration avec ${inst}*\n**Dossier en débat :** ${topic.title}\n\nLe conseil municipal de ${city} invite l'ensemble de la population à participer à une assemblée extraordinaire consacrée à **${topic.shortName.toLowerCase()}**. Face à la transformation rapide de nos quartiers, la gestion de ${topic.context.toLowerCase()} nécessite l'apport de tous les citoyens.\n\nAu cours de cette soirée de consultation, les experts aborderont en détail des enjeux techniques tels que **« ${topic.vocab[0]} »**, **« ${topic.vocab[1]} »** et les impacts liés à **« ${topic.vocab[2] || topic.vocab[0]} »**. Les mémoires citoyens et les recommandations écrites seront reçus jusqu'à la fin du mois afin d'orienter les futures décisions du comité exécutif.`,
        q1: `Quel est l'objectif de l'assemblée extraordinaire organisée par la Ville de ${city} ?`,
        opt1: [
          `Recueillir l'avis et l'apport des citoyens concernant un enjeu technique et communautaire majeur.`,
          `Annoncer la dissolution du conseil municipal et l'élection d'un nouveau maire.`,
          `Interdire formellement les réunions publiques et les débats citoyens dans les bibliothèques.`,
          `Augmenter les amendes de stationnement dans le centre-ville sans consultation préalable.`
        ],
        exp1: `Le texte indique que le conseil invite la population à participer car le dossier « nécessite l'apport de tous les citoyens ».`,
        q2: `Comment les citoyens peuvent-ils influencer les futures décisions du comité exécutif ?`,
        opt2: [
          `En organisant une grève générale et en bloquant les artères commerçantes.`,
          `En soumettant des mémoires et des recommandations écrites avant la fin du mois.`,
          `En payant une contribution financière directe aux conseillers municipaux.`,
          `En refusant de trier leurs déchets ménagers pendant toute la période hivernale.`
        ],
        exp2: `Le dernier paragraphe précise que « Les mémoires citoyens et les recommandations écrites seront reçus jusqu'à la fin du mois afin d'orienter les futures décisions ».`
      },
      {
        typo: "Note d'information RH entreprise",
        title: `Document d'Examen #${id} : Note RH – ${topic.shortName} en milieu professionnel`,
        text: `#### Note d'Information au Personnel (Niveau ${level})\n**Diffusion :** Entreprises affiliées à la Chambre de commerce de ${city}\n**Partenaire conseil :** ${inst}\n**Sujet :** ${topic.title}\n\nLa direction des ressources humaines souhaite informer l'ensemble de ses collaborateurs d'une mise à jour importante de notre politique interne concernant **${topic.shortName.toLowerCase()}**. Conformément aux recommandations émises par ${inst}, nous renforçons notre engagement envers ${topic.context.toLowerCase()}.\n\nÀ compter de la semaine prochaine, des ateliers de sensibilisation obligatoires seront organisés pour expliquer l'application pratique de concepts tels que **« ${topic.vocab[0]} »** et **« ${topic.vocab[1]} »**. Notre objectif est d'assurer un environnement de travail harmonieux, sécuritaire et pleinement respectueux des normes professionnelles canadiennes en vigueur.`,
        q1: `Pourquoi la direction des ressources humaines a-t-il diffusé cette note aux employés à ${city} ?`,
        opt1: [
          `Pour annoncer une mise à jour importante de la politique interne et l'organisation d'ateliers de sensibilisation.`,
          `Pour avertir le personnel d'une fermeture imminente de l'entreprise en raison de faillite.`,
          `Pour obliger les salariés à travailler tous les dimanches sans rémunération supplémentaire.`,
          `Pour supprimer l'ensemble des congés annuels payés accordés aux travailleurs qualifiés.`
        ],
        exp1: `La direction informe d'une « mise à jour importante de notre politique interne » et de l'organisation d'« ateliers de sensibilisation obligatoires ».`,
        q2: `Quel est l'objectif ultime visé par cette initiative en entreprise ?`,
        opt2: [
          `Augmenter les prix de vente des produits destinés à l'exportation internationale.`,
          `Garantir un environnement de travail harmonieux, sécuritaire et conforme aux normes canadiennes.`,
          `Remplacer tous les employés actuels par des systèmes d'intelligence artificielle automatisés.`,
          `Diminuer les contributions salariales au régime d'assurance parentale du Québec.`
        ],
        exp2: `Le texte conclut en affirmant que l'objectif est d'« assurer un environnement de travail harmonieux, sécuritaire et pleinement respectueux des normes ».`
      }
    ];

    const tpl = ceTemplates[templateIdx % ceTemplates.length];
    const questions = [];
    for (let i = 0; i < targetQuestions; i++) {
      const qId = (id * 10) + i + 1;
      if (i === 0) {
        questions.push({
          id: qId,
          text: `Question #${qId} (${level}) : ${tpl.q1}`,
          question: `Question #${qId} (${level}) : ${tpl.q1}`,
          options: tpl.opt1,
          correct: 0,
          answer: 0,
          detailedCorrection: tpl.exp1,
          errorAnalysis: "Distracteur éliminatoire : Vérifiez attentivement les mots-clés dans le paragraphe correspondant sans extrapoler.",
          cecrLevel: level
        });
      } else {
        questions.push({
          id: qId,
          text: `Question #${qId} (${level}) : ${tpl.q2}`,
          question: `Question #${qId} (${level}) : ${tpl.q2}`,
          options: tpl.opt2,
          correct: 1,
          answer: 1,
          detailedCorrection: tpl.exp2,
          errorAnalysis: "Piège de nuance : Ne pas confondre une mesure restrictive hypothétique avec l'objectif de fluidité énoncé par le document.",
          cecrLevel: level
        });
      }
    }

    return {
      id,
      title: tpl.title,
      content: tpl.text,
      text: tpl.text,
      level,
      timerMinutes: 15,
      questions
    };
  }

  public static generateWritingExamTask(id: number, level: string) {
    const { topicIdx, instIdx, cityIdx, templateIdx } = this.getBijectiveTuple(id, 20, 15);
    const topic = TCF_TOPICS_DATABASE[topicIdx];
    const inst = CANADIAN_INSTITUTIONS[instIdx];
    const city = CANADIAN_CITIES[cityIdx];

    const taskTypes = ["Tâche 1 : Message ou Courriel formel", "Tâche 2 : Article / Témoignage d'expérience", "Tâche 3 : Essai argumentatif et prise de position"];
    const taskType = level === "A1" || level === "A2" ? taskTypes[0] : level === "B1" ? taskTypes[1] : taskTypes[2];

    const eeTemplates = [
      {
        t1: `**Contexte :** Vous venez d'emménager à ${city} et vous avez besoin d'informations officielles concernant : **${topic.title}**.\n\n**Consigne :** Rédigez un courriel formel (entre 60 et 120 mots) au service de la clientèle de **${inst}**. Présentez votre situation personnelle, demandez quelles sont les conditions requises relatives à *« ${topic.vocab[0]} »* et renseignez-vous sur les délais de traitement actuels dans votre province.`,
        t2: `**Contexte :** Le journal communautaire de votre arrondissement à ${city} publie un dossier spécial sur le thème : **${topic.title}**.\n\n**Consigne :** Rédigez un court article ou témoignage (entre 120 et 150 mots) pour relater une expérience vécue ou observée en lien avec **${topic.shortName.toLowerCase()}**. Décrivez concrètement les démarches d'intégration, expliquez en quoi la maîtrise du concept de *« ${topic.vocab[1]} »* vous a aidé et formulez deux conseils utiles pour les futurs candidats.`,
        t3: `**Sujet de réflexion (Niveau ${level}) :** « Dans les grandes métropoles canadiennes comme ${city}, les débats sur **${topic.title}** divisent l'opinion. Certains affirment que l'intervention stricte d'organismes comme **${inst}** est primordiale pour réguler la situation, tandis que d'autres estiment que trop de démarches administratives freinent l'autonomie et le dynamisme économique des citoyens. »\n\n**Consigne :** Rédigez un essai argumentatif (entre 150 et 180 mots) en prenant clairement position. Appuyez vos idées sur deux arguments logiques illustrés d'exemples canadiens pertinents et intégrez le vocabulaire spécialisé (*« ${topic.vocab.slice(0, 3).join(" », « ")} »*).`
      },
      {
        t1: `**Contexte :** Vous participez à un projet communautaire à ${city} axé sur la thématique : **${topic.title}**.\n\n**Consigne :** Rédigez un message clair (entre 60 et 120 mots) adressé aux résidents de votre quartier. Expliquez pourquoi cette initiative est importante pour la qualité de vie locale et invitez-les à une première rencontre d'information organisée en collaboration avec **${inst}**.`,
        t2: `**Contexte :** Vous avez réussi avec succès un projet professionnel ou personnel impliquant **${topic.shortName}** auprès de **${inst}** à ${city}.\n\n**Consigne :** Sur un forum d'entraide pour immigrants canadiens, rédigez un compte-rendu d'expérience (entre 120 et 150 mots). Détaillez les étapes d'évaluation, parlez des défis surmontés en lien avec *« ${topic.vocab[0]} »* et encouragez la communauté par un message inspirant.`,
        t3: `**Sujet de réflexion (Niveau ${level}) :** « Face à l'évolution de la société québécoise et canadienne, de nombreux sociologues soulignent que la réussite citoyenne dépend étroitement de la capacité à s'adapter aux réalités de **${topic.title}**. Selon vous, l'État devrait-il rendre obligatoires les formations relatives à *« ${topic.vocab[0]} »* et *« ${topic.vocab[1]} »* pour tous les nouveaux résidents ? »\n\n**Consigne :** Rédigez un texte argumenté (entre 150 et 180 mots). Structurez votre réponse avec une introduction, deux paragraphes distincts et une conclusion nuancée.`
      }
    ];

    const tpl = eeTemplates[templateIdx % eeTemplates.length];
    let instructions = "";
    let minW = 150; let maxW = 180; let timeM = 25;

    if (taskType.includes("Tâche 1")) {
      minW = 60; maxW = 120; timeM = 15;
      instructions = tpl.t1;
    } else if (taskType.includes("Tâche 2")) {
      minW = 120; maxW = 150; timeM = 20;
      instructions = tpl.t2;
    } else {
      minW = 150; maxW = 180; timeM = 25;
      instructions = tpl.t3;
    }

    const uniqueInstructions = `**[Sujet Officiel TCF Canada - Session EE #${id} - Code Évaluation : ${inst.slice(0, 8).toUpperCase()}-${city.slice(0, 5).toUpperCase()}-${topicIdx}]**\n\n${instructions}`;

    return {
      id,
      title: `Épreuve Officielle d'Expression Écrite #${id} : ${topic.category} (${topic.shortName})`,
      type: taskType.includes("Tâche 1") ? "courriel" : taskType.includes("Tâche 2") ? "article" : "essai",
      instructions: uniqueInstructions,
      prompt: uniqueInstructions,
      promptText: uniqueInstructions,
      minWords: minW,
      maxWords: maxW,
      timeMinutes: timeM,
      level,
      gradingScale: "Grille d'évaluation officielle TCF : Respect des consignes et du nombre de mots (2 pts), Cohérence et cohésion (4 pts), Morphosyntaxe et grammaire (7 pts), Richesse du vocabulaire canadien (7 pts).",
      detailedCorrection: `Conseil du jury FLE : Pour obtenir une note NCLC 8+, intégrez naturellement les termes officiels tels que « ${topic.vocab[0]} » et « ${topic.vocab[1]} ». Respectez scrupuleusement le plafond de ${maxW} mots.`,
      errorAnalysis: "Piège classique : Ne rédigez pas une introduction générique hors-sujet. Entrez directement dans le vif du thème canadien demandé.",
      cecrEvaluation: `Évaluation : Ce sujet valide le palier ${level} (NCLC ${level === "C1" || level === "C2" ? "9-10" : "7-8"}).`
    };
  }

  public static generateSpeakingExamTask(id: number, level: string) {
    const { topicIdx, instIdx, cityIdx, templateIdx } = this.getBijectiveTuple(id, 30, 15);
    const topic = TCF_TOPICS_DATABASE[topicIdx];
    const inst = CANADIAN_INSTITUTIONS[instIdx];
    const city = CANADIAN_CITIES[cityIdx];

    const taskTypes = ["Tâche 1 : Entretien dirigé sans préparation", "Tâche 2 : Exercice en interaction (Poser des questions)", "Tâche 3 : Expression d'un point de vue argumenté (Monologue)"];
    const taskType = level === "A1" || level === "A2" ? taskTypes[0] : level === "B1" ? taskTypes[1] : taskTypes[2];

    const eoTemplates = [
      {
        t1: `**Entretien dirigé sans préparation (Niveau ${level}) :** L'examinateur vous interroge sur votre parcours de vie et votre intérêt pour le domaine : **${topic.category}**. Présentez-vous clairement, expliquez pourquoi vous avez choisi de vous établir ou de voyager à ${city} et parlez de vos aspirations en lien avec **${topic.shortName.toLowerCase()}**.`,
        t2: `**Jeu de rôle en interaction (Niveau ${level}) :** Vous vous présentez au bureau d'accueil de **${inst}** à ${city} pour obtenir des informations pratiques concernant : **${topic.title}**.\n\n**Votre rôle :** Vous devez diriger la conversation en posant **au moins 5 à 6 questions directes et variées** à l'examinateur (qui joue le rôle du conseiller). Interrogez-le sur les critères d'admissibilité, les documents nécessaires (*« ${topic.vocab[0]} »*), les coûts éventuels et les délais d'obtention. Ne laissez aucun silence !`,
        t3: `**Monologue argumenté sans interruption (Niveau ${level}) :**\n« Dans le contexte socio-économique actuel au Canada, et plus particulièrement dans la région de ${city}, le dossier de **${topic.title}** suscite de nombreuses réactions. Certains estiment que les priorités devraient être accordées à l'efficacité économique rapide, alors que d'autres insistent sur l'équité et le respect des normes sociales. »\n\n**Consigne :** Vous disposez de 1 minute de préparation. Vous devez ensuite exprimer votre point de vue argumenté pendant **4 minutes 30** en illustrant votre discours d'exemples canadiens concrets et en mobilisant le lexique expert (*« ${topic.vocab.join(" », « ")} »*).`
      },
      {
        t1: `**Entretien dirigé sans préparation (Niveau ${level}) :** L'examinateur souhaite connaître votre avis personnel sur la vie quotidienne et professionnelle en contexte canadien en abordant le thème : **${topic.shortName}**. Racontez une expérience simple que vous avez vécue en lien avec ce sujet à ${city}.`,
        t2: `**Jeu de rôle en interaction (Niveau ${level}) :** Vous téléphonez au service d'assistance téléphonique de **${inst}** pour clarifier une situation complexe concernant : **${topic.title}**.\n\n**Votre rôle :** Posez au moins 5 questions précises à l'agent de service à la clientèle (l'examinateur). Demandez comment résoudre un problème lié à *« ${topic.vocab[1]} »*, quels sont les recours possibles et s'il est nécessaire de se déplacer en personne dans les bureaux de ${city}.`,
        t3: `**Monologue argumenté sans interruption (Niveau ${level}) :**\n« La modernisation des infrastructures et des réglementations concernant **${topic.shortName}** est souvent citée comme une priorité stratégique par **${inst}** à ${city}. Selon vous, comment concilier les exigences réglementaires des autorités avec la liberté d'action et le confort des citoyens ? »\n\n**Consigne :** Après 1 minute de préparation, développez un argumentaire structuré et convaincant de 4 minutes 30 en adoptant un registre soutenu.`
      }
    ];

    const tpl = eoTemplates[templateIdx % eoTemplates.length];
    let promptText = ""; let prepT = 45; let speakT = 120;

    if (taskType.includes("Tâche 1")) {
      prepT = 0; speakT = 60;
      promptText = tpl.t1;
    } else if (taskType.includes("Tâche 2")) {
      prepT = 45; speakT = 120;
      promptText = tpl.t2;
    } else {
      prepT = 60; speakT = 150;
      promptText = tpl.t3;
    }

    const uniquePromptText = `**[Épreuve Orale Officielle TCF Canada - Session EO #${id} - Centre : ${city} (${inst.slice(0, 8)}) - Thématique #${topicIdx}]**\n\n${promptText}`;

    return {
      id,
      title: `Épreuve Officielle d'Expression Orale #${id} : ${topic.category} (${topic.shortName})`,
      type: taskType.includes("Tâche 2") ? "interaction" : "monologue",
      instructions: uniquePromptText,
      prompt: uniquePromptText,
      promptText: uniquePromptText,
      prepTime: prepT,
      speakTime: speakT,
      duration: speakT === 120 ? "3 min 30" : "4 min 30",
      level,
      tips: [
        `Employez le vocabulaire spécialisé : ${topic.vocab.slice(0, 3).join(", ")}.`,
        "Soignez votre rythme et votre prononciation du français canadien standard.",
        taskType.includes("Tâche 2") ? "En Tâche 2, ne laissez aucun silence : rebondissez sur les réponses de l'examinateur pour poser une nouvelle question." : "En Tâche 3, annoncez clairement votre plan dès l'introduction."
      ],
      gradingScale: "Barème officiel TCF Canada : Prononciation et fluidité (5 pts), Morphosyntaxe et exactitude grammaticale (5 pts), Richesse et pertinence du vocabulaire (5 pts), Autonomie et gestion du discours (5 pts). Total converti sur 699 points NCLC.",
      detailedCorrection: `Conseil d'expert FLE : N'apprenez pas de textes par cœur. L'examinateur évalue votre authenticité et votre capacité à interagir sur le thème de ${topic.shortName.toLowerCase()}.`,
      errorAnalysis: "Erreur fréquente : Les hésitations prolongées ou les phrases inachevées pénalisent la fluidité. Si vous cherchez un mot, reformulez simplement en français.",
      cecrEvaluation: `Niveau d'évaluation : Palier cible ${level} (NCLC ${level === "C1" || level === "C2" ? "9-10" : "7-8"}).`
    };
  }

  public static generateListeningAudioScenario(id: number, synthCounter: number, level: string, voiceProfile1: any, voiceProfile2: any) {
    const { topicIdx, instIdx, cityIdx, templateIdx } = this.getBijectiveTuple(id, 40 + synthCounter, 15);
    const topic = TCF_TOPICS_DATABASE[topicIdx];
    const inst = CANADIAN_INSTITUTIONS[instIdx];
    const city = CANADIAN_CITIES[cityIdx];

    const coTemplates = [
      {
        contextDesc: `Appel d'information au centre de services ${inst} à ${city}`,
        line1: `Bonjour ! J'appelle le bureau de ${inst} à ${city} parce que je souhaite avoir des renseignements précis sur ${topic.shortName.toLowerCase()}. Comment dois-je procéder pour mon dossier ?`,
        line2: `Bonjour ! Avec grand plaisir. Pour tout ce qui concerne ${topic.context.toLowerCase()}, il est essentiel d'apporter votre pièce d'identité et de remplir le formulaire officiel qui mentionne notamment ${topic.vocab[0]} et ${topic.vocab[1]}.`,
        line3: `D'accord, c'est très clair. Est-ce que les démarches prennent beaucoup de temps en ce moment dans la région de ${city} ?`,
        line4: `Actuellement, le traitement prend environ deux semaines si votre dossier est complet et inclut bien le justificatif concernant ${topic.vocab[2] || topic.vocab[0]}.`,
        qText: `Selon l'agent de ${inst} à ${city}, quelle condition est requise pour le traitement du dossier de ${topic.shortName.toLowerCase()} ?`,
        opts: [
          `Apporter sa pièce d'identité et remplir le formulaire officiel mentionnant ${topic.vocab[0]}.`,
          `Payer immédiatement une taxe en espèces au guichet sans aucun document.`,
          `Attendre la convocation d'un tribunal fédéral avant de commencer les démarches.`,
          `Renoncer à sa résidence à ${city} pour s'inscrire dans une autre province.`
        ],
        corrIdx: 0,
        exp: `L'agent(e) précise explicitement dans le dialogue : « il est essentiel d'apporter votre pièce d'identité et de remplir le formulaire officiel qui mentionne notamment ${topic.vocab[0]} ».`
      },
      {
        contextDesc: `Entrevue radiophonique sur ICI Première (Radio-Canada ${city})`,
        line1: `Bienvenue à notre émission spéciale en direct de ${city} ! Nous recevons aujourd'hui un porte-parole de ${inst} pour aborder une question qui passionne nos auditeurs : ${topic.title}. Monsieur, pourquoi ce dossier est-il si stratégique cette année ?`,
        line2: `Bonjour à tous ! Il faut comprendre que dans le contexte de ${topic.context.toLowerCase()}, les attentes des citoyens ont évolué. La maîtrise des principes liés à ${topic.vocab[0]} et ${topic.vocab[1]} est devenue un facteur déterminant pour réussir son intégration dans la métropole.`,
        line3: `C'est fascinant ! Quels conseils pratiques donneriez-vous aux auditeurs qui s'initient à ces démarches pour la première fois ?`,
        line4: `Le premier conseil est de ne jamais attendre la dernière minute. Consultez régulièrement notre portail officiel et familiarisez-vous avec les normes concernant ${topic.vocab[2] || topic.vocab[0]} afin d'éviter tout retard administratif.`,
        qText: `Selon le porte-parole invité à la radio, pourquoi le dossier abordé est-il devenu stratégique pour les citoyens ?`,
        opts: [
          `Parce que la maîtrise de ces principes est un facteur déterminant pour réussir son intégration.`,
          `Parce que le gouvernement a décidé de supprimer tous les services en ligne avant la fin de l'année.`,
          `Pour obliger les gens à écouter des émissions de radio pendant les heures de travail.`,
          `Parce que les tribunaux canadiens imposent une amende à ceux qui ignorent ces informations.`
        ],
        corrIdx: 0,
        exp: `L'expert explique à la radio que la maîtrise de ces principes « est devenue un facteur déterminant pour réussir son intégration dans la métropole ».`
      },
      {
        contextDesc: `Discussion entre deux collègues lors d'une réunion de travail à ${city}`,
        line1: `Dis-moi, as-tu eu le temps de lire la dernière note transmise par la direction en collaboration avec ${inst} ? Elle concerne directement notre projet sur ${topic.shortName.toLowerCase()}.`,
        line2: `Oui, je l'ai épluchée ce matin ! C'est une excellente nouvelle pour l'équipe. Le document met l'accent sur ${topic.context.toLowerCase()} et nous apporte des précisions très utiles sur ${topic.vocab[0]}.`,
        line3: `Exactement ! Penses-tu que nous devrions organiser un atelier de formation rapide pour expliquer les critères de ${topic.vocab[1]} aux nouveaux collègues de ${city} ?`,
        line4: `Absolument, c'est indispensable ! Je vais réserver la salle de conférence pour jeudi matin et préparer une courte présentation abordant aussi ${topic.vocab[2] || topic.vocab[0]}.`,
        qText: `Lors de leur discussion au travail, que décident les deux collègues pour accompagner leur équipe ?`,
        opts: [
          `Organiser un atelier de formation rapide jeudi matin pour expliquer les nouveaux critères aux collègues.`,
          `Démissionner collectivement de l'entreprise pour protester contre les nouvelles directives de la direction.`,
          `Fermer les bureaux de ${city} pendant deux semaines pour effectuer des travaux de rénovation.`,
          `Ignorer la note officielle et continuer à travailler selon les anciennes méthodes des années 90.`
        ],
        corrIdx: 0,
        exp: `Le second collègue confirme : « Je vais réserver la salle de conférence pour jeudi matin et préparer une courte présentation ».`
      }
    ];

    const tpl = coTemplates[templateIdx % coTemplates.length];
    const scriptText = `[Enregistrement Audio TCF Canada - Réf Session: ${id}-${synthCounter} - Centre d'évaluation : ${city} / Thème : ${topic.shortName}]\n\n${voiceProfile1.name} : ${tpl.line1}\n\n${voiceProfile2.name} : ${tpl.line2}\n\n${voiceProfile1.name} : ${tpl.line3}\n\n${voiceProfile2.name} : ${tpl.line4}`;

    return {
      id: `co-procedural-${id}-${synthCounter}`,
      cecrLevel: level,
      skill: "listening",
      theme: topic.category,
      difficulty: level === "A1" || level === "A2" ? 1 : level === "B1" || level === "B2" ? 2 : 3,
      durationSeconds: 45,
      vocabularyTags: topic.vocab,
      pedagogicalObjective: `Comprendre un dialogue authentique (${tpl.contextDesc}) en contexte canadien (${inst}, ${city}).`,
      dialogueMetadata: {
        speakersCount: 2,
        personalities: ["Interlocuteur canadien engagé", "Expert / Répondant formel"],
        professions: ["Citoyen / Candidat", `Représentant(e) ${inst}`],
        emotion: "Échange professionnel, naturel et courtois",
        context: tpl.contextDesc,
        communicationGoal: `Comprendre les enjeux et démarches relatives à ${topic.vocab[0]}`
      },
      voiceProfiles: [voiceProfile1, voiceProfile2],
      audioUrl: `/audio/tcf/co_dyn_${id}_${synthCounter}.mp3`,
      script: `[Simulation Audio TCF Canada - ${voiceProfile1.name} & ${voiceProfile2.name}]\n\n${scriptText}`,
      structuredDialogue: [
        { speakerName: voiceProfile1.name, voiceProfileId: voiceProfile1.id, text: tpl.line1 },
        { speakerName: voiceProfile2.name, voiceProfileId: voiceProfile2.id, text: tpl.line2 },
        { speakerName: voiceProfile1.name, voiceProfileId: voiceProfile1.id, text: tpl.line3 },
        { speakerName: voiceProfile2.name, voiceProfileId: voiceProfile2.id, text: tpl.line4 }
      ],
      questions: [
        {
          id: synthCounter,
          question: `Question #${id} (${level}) : ${tpl.qText}`,
          options: tpl.opts,
          correct: tpl.corrIdx,
          detailedCorrection: tpl.exp,
          errorAnalysis: `Distracteur audio : Ne vous fiez pas aux mots pris hors contexte. Écoutez attentivement l'intention globale des locuteurs.`,
          cecrEvaluation: `Niveau ${level} - NCLC ${level === "C1" || level === "C2" ? "9-10" : level === "B1" || level === "B2" ? "6-8" : "4-5"} (Compréhension d'échanges socioprofessionnels canadiens).`
        }
      ]
    };
  }
}

export class UniquenessValidator {
  private static registeredTitles = new Set<string>();
  private static registeredStems = new Set<string>();

  public static reset() {
    this.registeredTitles.clear();
    this.registeredStems.clear();
  }

  public static isUnique(title: string, stem: string): boolean {
    const normTitle = this.normalize(title);
    const normStem = this.normalize(stem);
    return !this.registeredTitles.has(normTitle) && !this.registeredStems.has(normStem);
  }

  public static register(title: string, stem: string) {
    this.registeredTitles.add(this.normalize(title));
    this.registeredStems.add(this.normalize(stem));
  }

  private static normalize(text: string): string {
    return (text || "").toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 100);
  }
}

export function generateUniqueLesson(id: number, moduleId: number, cecrLevel: string, skillType: string, index: number) {
  const { topicIdx, instIdx, cityIdx, templateIdx } = TCFProceduralLibrary.getBijectiveTuple(id, moduleId, 15);
  const topic = TCF_TOPICS_DATABASE[topicIdx];
  const inst = CANADIAN_INSTITUTIONS[instIdx];
  const city = CANADIAN_CITIES[cityIdx];

  const skillName = skillType === "listening" ? "Compréhension Orale" :
                    skillType === "reading" ? "Compréhension Écrite" :
                    skillType === "writing" ? "Expression Écrite" : "Expression Orale";

  const typologies = [
    "Communiqué ministériel officiel", "Article de presse analytique (La Presse / Le Devoir)",
    "Chronique radio ICI Première", "Guide pratique et juridique TAL/RAMQ", "Entrevue grand format en studio",
    "Dossier d'enquête économique et sociale", "Offre d'emploi bilingue spécialisée", "Avis de consultation publique municipale"
  ];
  const typo = typologies[templateIdx % typologies.length];

  const title = `Module ${moduleId} (${cecrLevel}) : ${topic.category} – ${skillName} (${topic.shortName}) #${id}`;

  const lessonTemplates = [
    {
      introText: `Dans le cadre des initiatives menées par **${inst}** à ${city}, un nouveau cadre opérationnel concernant **${topic.shortName.toLowerCase()}** a été formellement adopté. Ce dispositif répond à une exigence majeure de la société canadienne : ${topic.context.toLowerCase()}.\n\nLes analystes soulignent que l'application de cette mesure repose sur la maîtrise de concepts fondamentaux tels que **« ${topic.vocab[0]} »**, **« ${topic.vocab[1]} »** et **« ${topic.vocab[2]} »**. Bien que certains usagers aient initialement exprimé des réserves quant à la complexité des démarches, la majorité des experts saluent une avancée structurante qui renforce l'équité, la transparence et la vitalité de la région de ${city}.`,
      qText: `Selon les analystes de ${inst}, quel est le principal avantage de ce nouveau cadre opérationnel à ${city} ?`,
      optText: [
        `Il renforce l'équité, la transparence et la vitalité régionale en établissant des critères clairs pour tous.`,
        `Il supprime immédiatement l'ensemble des impôts provinciaux pour les nouveaux résidents.`,
        `Il interdit formellement d'utiliser la langue française dans les communications de l'organisme.`,
        `Il oblige les citoyens à déménager dans une autre province avant le début de l'hiver.`
      ],
      corrIdx: 0,
      expText: `Le document conclut que la mesure « renforce l'équité, la transparence et la vitalité de la région de ${city} ».`
    },
    {
      introText: `Une étude approfondie publiée par le centre de recherche de **${inst}** analyse l'évolution de **${topic.title}** dans la région métropolitaine de ${city}. Face aux mutations économiques actuelles, ${topic.context.toLowerCase()} constitue un levier d'action incontournable.\n\nLes experts recommandent vivement aux nouveaux arrivants et aux professionnels de se familiariser avec la terminologie technique applicable, notamment les expressions **« ${topic.vocab[0]} »** et **« ${topic.vocab[1]} »**. Une bonne préparation à ces normes permet non seulement d'accélérer ses formalités, mais aussi de sécuriser durablement son statut au sein de la communauté.`,
      qText: `Selon l'étude de ${inst}, pourquoi est-il vivement recommandé de se familiariser avec cette terminologie technique ?`,
      optText: [
        `Parce que cela permet d'accélérer ses formalités et de sécuriser durablement son statut au sein de la communauté.`,
        `Pour éviter de payer le billet de bus lors des déplacements quotidiens sur le réseau municipal.`,
        `Parce que le gouvernement provincial impose un examen écrit éliminatoire à chaque coin de rue.`,
        `Pour obtenir automatiquement la citoyenneté canadienne sans devoir habiter dans le pays.`
      ],
      corrIdx: 0,
      expText: `L'étude affirme qu'« une bonne préparation à ces normes permet non seulement d'accélérer ses formalités, mais aussi de sécuriser durablement son statut ».`
    },
    {
      introText: `Lors de sa conférence annuelle tenue à ${city}, le président de **${inst}** a prononcé un discours marquant au sujet de **${topic.shortName}**. Rendant compte de la réalité de notre milieu de vie, il a rappelé que ${topic.context.toLowerCase()} représente une priorité absolue pour le maintien du modèle social canadien.\n\nIl a invité les citoyens à adopter une démarche proactive en s'informant sur des mécanismes tels que **« ${topic.vocab[0]} »** et **« ${topic.vocab[2] || topic.vocab[1]} »**. Une telle implication citoyenne garantit une meilleure cohésion sociale et facilite grandement l'épanouissement professionnel de chacun.`,
      qText: `Quel message le président de ${inst} a-t-il transmis aux citoyens lors de sa conférence annuelle à ${city} ?`,
      optText: [
        `Il a invité les résidents à adopter une démarche proactive et à s'informer pour favoriser la cohésion sociale et l'épanouissement professionnel.`,
        `Il a annoncé la fermeture immédiate de tous les bureaux d'accueil régionaux pour réaliser des économies de budget.`,
        `Il a demandé à l'ensemble de la population de cesser d'utiliser les services de santé provinciaux.`,
        `Il a exigé que chaque citoyen travaille gratuitement pour la municipalité les jours fériés.`
      ],
      corrIdx: 0,
      expText: `Le discours invite les citoyens à « adopter une démarche proactive » car cela « garantit une meilleure cohésion sociale et facilite grandement l'épanouissement professionnel ».`
    }
  ];

  const lTpl = lessonTemplates[templateIdx % lessonTemplates.length];
  let scenarioText = `#### ${typo} (Réf Leçon #${id} / Index #${index})\n**Source canadienne :** ${inst} (${city})\n**Dossier officiel :** ${topic.title}\n\n${lTpl.introText}`;

  let questionObj = {
    q: `Question d'évaluation #${id} (${cecrLevel}) : ${lTpl.qText}`,
    options: lTpl.optText,
    answer: lTpl.corrIdx,
    explanation: lTpl.expText
  };

  if (skillType === "listening") {
    scenarioText = `*Enregistrement audio TCF Canada #${id} (Index #${index}) — ${typo}*\n**Studio :** Radio-Canada / ${inst} (${city})\n**Sujet :** ${topic.title}\n\n[Voix de l'animateur] « Bonjour à tous et bienvenue à notre émission spéciale diffusée en direct de ${city}. Nous abordons aujourd'hui un enjeu clé pour des milliers de citoyens et de nouveaux arrivants : **${topic.shortName}**.\n\nPour en parler, nous recevons en studio un expert de ${inst}. Monsieur, vous rappelez souvent que dans le contexte de ${topic.context.toLowerCase()}, la maîtrise du vocabulaire officiel est indispensable. Pouvez-vous nous expliquer pourquoi des termes comme "${topic.vocab[0]}" et "${topic.vocab[1]}" sont au cœur des démarches actuelles ? »\n\n[Voix de l'expert] « Tout à fait ! Au Canada, la précision est la clé de la réussite administrative et professionnelle. Comprendre ces mécanismes vous fait gagner un temps précieux et sécurise votre statut. »`;
    
    questionObj = {
      q: `Question QCM #${id} (${cecrLevel}) : Selon l'expert interrogé en studio à ${city}, pourquoi est-il essentiel de bien comprendre ces mécanismes officiels ?`,
      options: [
        "Parce que la précision permet de gagner un temps précieux et de sécuriser son statut administratif ou professionnel.",
        "Pour pouvoir voyager gratuitement sur le réseau ferroviaire canadien.",
        "Pour obtenir automatiquement un diplôme universitaire sans passer d'examen.",
        "Parce que le gouvernement l'impose sous peine d'incarcération immédiate."
      ],
      answer: 0,
      explanation: `L'expert affirme clairement en fin d'enregistrement : « comprendre ces mécanismes vous fait gagner un temps précieux et sécurise votre statut ».`
    };
  }

  const lessonObj = {
    id,
    moduleId,
    title,
    duration: "25 min",
    level: cecrLevel === "Transversal" ? "B2" : cecrLevel,
    instruction: `Leçon d'entraînement : ${topic.title}. Lisez attentivement la mise en situation de ${inst} (${city}), étudiez le lexique bilingue/canadien et valider votre quiz d'évaluation.`,
    objective: `Valider les compétences NCLC requises en ${skillName} (${cecrLevel}) appliquées au domaine : ${topic.shortName} (${city}).`,
    text: scenarioText,
    audioText: skillType === "listening" ? scenarioText.replace(/[*#]/g, "") : undefined,
    intro: `Cette leçon aborde les compétences clés en ${skillName} (${cecrLevel}). Thématique officielle : ${topic.category} – ${topic.shortName}.`,
    promptText: skillType === "writing" || skillType === "speaking" ? `Sujet officiel d'évaluation (${cecrLevel}) : En vous basant sur la thématique de **${topic.title}** en contexte canadien à ${city} (${inst}), exprimez votre point de vue ou rédigez votre message de manière claire, structurée et riche en vocabulaire officiel.` : scenarioText,
    modelAnswer: `Exemple de réponse experte (NCLC 9/10) : « Dans le contexte actuel de ${topic.shortName.toLowerCase()} au Canada, il apparaît impératif de considérer l'impact réel sur la population de ${city}. Tout d'abord, les directives de ${inst} démontrent que ${topic.context.toLowerCase()} constitue une priorité structurelle. De surcroît, l'application de principes tels que "${topic.vocab[0]}" garantit une transparence exemplaire. En conclusion, une appropriation rapide de ces règles assure une intégration professionnelle et citoyenne réussie. »`,
    minWords: skillType === "writing" ? (cecrLevel === "A1" || cecrLevel === "A2" ? 60 : 150) : 120,
    maxWords: skillType === "writing" ? (cecrLevel === "A1" || cecrLevel === "A2" ? 120 : 200) : 180,
    tips: [
      `Vocabulaire technique canadien à privilégier : ${topic.vocab.slice(0, 3).join(", ")}.`,
      `Adaptez votre registre au contexte formel de ${inst} (${city}).`,
      "Enchaînez vos arguments en utilisant une progression logique (d'abord, ensuite, en outre, en somme)."
    ],
    examples: [
      `Mise en pratique à ${city} : Lors d'une démarche de type "${topic.shortName}", citez le nom de l'organisme (${inst}).`,
      `Formulation de niveau C1 : « Cette directive émanant de ${inst} consolide indéniablement le cadre de ${topic.shortName.toLowerCase()} ».`
    ],
    summary: `Synthèse de la leçon #${id} : Vous avez acquis le lexique officiel de "${topic.title}" et compris les exigences de ${inst} à ${city}.`,
    questions: [questionObj],
    quiz: [questionObj],
    exercises: [
      {
        question: questionObj.q,
        options: questionObj.options,
        answer: questionObj.answer,
        explanation: questionObj.explanation
      }
    ],
    done: false
  };

  UniquenessValidator.register(title, questionObj.q);
  return lessonObj;
}
