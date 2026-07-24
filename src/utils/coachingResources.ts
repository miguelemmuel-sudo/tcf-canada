/**
 * GÉNÉRATEUR DE RESSOURCES DE COACHING & GUIDES TCF CANADA (GRIFFON D'OR)
 * Produit des documents HTML5 autonomes, magnifiquement structurés et formatés,
 * encodés en UTF-8 (zéro bug d'accent) avec option d'impression PDF intégrée.
 */

export function generateTcfGuideHtml(userName: string = "Candidat", userPlan: string = "VIP"): string {
  const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guide Officiel de Préparation TCF Canada — Griffon d'Or</title>
  <style>
    :root {
      --primary: #1e40af;
      --primary-light: #eff6ff;
      --secondary: #047857;
      --dark: #0f172a;
      --light: #f8fafc;
      --border: #e2e8f0;
      --gold: #d97706;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: var(--dark);
      background: var(--light);
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 50px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border: 1px solid var(--border);
    }
    .header {
      border-bottom: 3px solid var(--primary);
      padding-bottom: 30px;
      margin-bottom: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .badge {
      background: #fef3c7;
      color: var(--gold);
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 13px;
      text-transform: uppercase;
    }
    h1 { font-size: 28px; color: var(--primary); margin-bottom: 8px; font-weight: 900; }
    .subtitle { font-size: 15px; color: #64748b; }
    .meta-box {
      background: var(--primary-light);
      border-left: 4px solid var(--primary);
      padding: 15px 20px;
      margin-bottom: 40px;
      border-radius: 0 8px 8px 0;
      font-size: 14px;
    }
    h2 { font-size: 20px; color: var(--dark); margin: 35px 0 15px 0; border-bottom: 1px solid var(--border); padding-bottom: 8px; display: flex; align-items: center; gap: 10px; }
    h3 { font-size: 16px; color: var(--primary); margin: 20px 0 10px 0; }
    p, ul { margin-bottom: 15px; font-size: 15px; color: #334155; }
    ul { padding-left: 25px; }
    li { margin-bottom: 8px; }
    .tip-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      color: #065f46;
      font-size: 14px;
    }
    .tip-box strong { color: #047857; display: block; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    th, td { padding: 12px 15px; border: 1px solid var(--border); text-align: left; }
    th { background: var(--primary-light); color: var(--primary); font-weight: bold; }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
    }
    .print-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: var(--primary);
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 15px;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(30,64,175,0.3);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .print-btn:hover { transform: translateY(-2px); background: #1e3a8a; }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; border: none; padding: 0; max-width: 100%; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>Guide Stratégique Officiel TCF Canada</h1>
        <div class="subtitle">Méthodologie d'excellence pour atteindre le niveau NCLC 7 à NCLC 10</div>
      </div>
      <div class="badge">Pack ${userPlan.toUpperCase()}</div>
    </div>

    <div class="meta-box">
      <strong>👤 Candidat(e) :</strong> ${userName} &nbsp;|&nbsp; <strong>📅 Date d'édition :</strong> ${dateStr} &nbsp;|&nbsp; <strong>🎯 Objectif :</strong> NCLC 7+ (Résidence Permanente Canada)
    </div>

    <h2>1. 🎧 Compréhension Orale (CO) — 39 Questions • 35 Minutes</h2>
    <p>L'épreuve de compréhension orale évalue votre capacité à comprendre le français parlé dans des contextes canadiens réalistes (accents québécois, acadiens et standards). L'épreuve suit une progression de difficulté stricte (A1 vers C2).</p>
    
    <h3>Les 4 grandes séries de l'épreuve :</h3>
    <ul>
      <li><strong>Série 1 (A1-A2) — Photos & Illustrations :</strong> Identifiez l'action ou la situation décrite dans l'image. <em>Astuce : Observez les verbes d'action et les prépositions de lieu.</em></li>
      <li><strong>Série 2 (A2-B1) — Échanges du quotidien :</strong> Courtes conversations dans des commerces, au téléphone ou entre amis. <em>Astuce : Identifiez rapidement qui parle, à qui, où et pourquoi.</em></li>
      <li><strong>Série 3 (B1-B2) — Annonces & Messages professionnels :</strong> Messages sur répondeur, annonces en gare/aéroport ou réunions de travail. <em>Astuce : Notez les heures, dates et consignes d'action.</em></li>
      <li><strong>Série 4 (C1-C2) — Conférences & Débats radiophoniques :</strong> Extraits de Radio-Canada ou d'exposés scientifiques/sociaux. <em>Astuce : Distinguez les faits objectifs des opinions et nuances argumentatives.</em></li>
    </ul>

    <div class="tip-box">
      <strong>💡 Stratégie d'Or Griffon :</strong> L'écoute est unique ! Lisez les 4 options de réponse sur votre écran PENDANT les 5 secondes de silence qui précèdent l'audio. Ne traduisez jamais mot à mot : cherchez les synonymes et les paraphrases.
    </div>

    <h2>2. 📖 Compréhension Écrite (CE) — 39 Questions • 60 Minutes</h2>
    <p>Cette épreuve teste votre capacité à lire et analyser des documents écrits de la vie quotidienne, professionnelle et institutionnelle canadienne.</p>
    
    <h3>Méthodologie de lecture rapide en 3 étapes :</h3>
    <ol style="padding-left: 25px; margin-bottom: 15px; font-size: 15px; color: #334155;">
      <li><strong>Lecture de la question en premier :</strong> Sachez exactement quelle information vous cherchez (date, condition de remboursement, opinion de l'auteur) avant de lire le texte.</li>
      <li><strong>Écrémage (Skimming) :</strong> Parcourez les titres, sous-titres, mots en gras et débuts de paragraphes pour comprendre la structure du document.</li>
      <li><strong>Repérage (Scanning) :</strong> Ne lisez en détail que la phrase ou le paragraphe contenant le mot-clé de la question.</li>
    </ol>

    <h2>3. ✍️ Expression Écrite (EE) — 3 Tâches • 60 Minutes</h2>
    <p>L'épreuve d'expression écrite exige une gestion rigoureuse du temps et le strict respect du nombre de mots exigé. Tout hors-sujet ou décompte de mots insuffisant entraîne une pénalité sévère.</p>

    <table>
      <thead>
        <tr>
          <th>Tâche</th>
          <th>Objectif & Format</th>
          <th>Nombre de mots</th>
          <th>Temps conseillé</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tâche 1</strong></td>
          <td>Message court (courriel à un ami, invitation, remerciement)</td>
          <td>60 à 120 mots</td>
          <td>12 minutes</td>
        </tr>
        <tr>
          <td><strong>Tâche 2</strong></td>
          <td>Article de blog, compte-rendu d'expérience ou récit de voyage</td>
          <td>120 à 150 mots</td>
          <td>18 minutes</td>
        </tr>
        <tr>
          <td><strong>Tâche 3</strong></td>
          <td>Texte argumentatif comparant deux points de vue avec votre opinion</td>
          <td>180 à 250 mots</td>
          <td>30 minutes</td>
        </tr>
      </tbody>
    </table>

    <div class="tip-box">
      <strong>💡 Connecteurs logiques indispensables :</strong> Pour la Tâche 3, utilisez des structures valorisantes telles que <em>« En premier lieu »</em>, <em>« D'une part... d'autre part »</em>, <em>« Bien que + subjonctif »</em>, <em>« En revanche »</em>, et <em>« En définitive »</em>.
    </div>

    <h2>4. 🗣️ Expression Orale (EO) — 3 Tâches • 12 Minutes (Face à un examinateur)</h2>
    <p>L'épreuve individuelle se déroule sous forme d'entretien enregistré, évalué par un examinateur local puis par un second correcteur officiel à France Éducation international.</p>

    <ul>
      <li><strong>Tâche 1 (2 min - Sans préparation) : Entretien dirigé.</strong> Vous vous présentez, parlez de votre parcours, de vos loisirs et de votre projet canadien (Montréal, Toronto, Vancouver).</li>
      <li><strong>Tâche 2 (5 min - Avec préparation) : Exercice en interaction.</strong> Vous devez poser des questions à l'examinateur pour obtenir des informations sur une situation de la vie quotidienne (ex: louer un appartement sur Kijiji, s'inscrire à une salle de sport). <em>Posez au moins 5 à 6 questions variées !</em></li>
      <li><strong>Tâche 3 (4 min 30 - Sans préparation) : Expression d'un point de vue.</strong> Vous répondez à une question d'opinion de société (ex: le télétravail, l'écologie, l'intelligence artificielle). Structurez votre réponse : Thèse + Argument 1 (avec exemple canadien) + Argument 2 + Conclusion.</li>
    </ul>

    <h2>📊 Barème de conversion NCLC (Niveaux de Compétence Linguistique Canadiens)</h2>
    <table>
      <thead>
        <tr>
          <th>Niveau CECR</th>
          <th>Score TCF (sur 699)</th>
          <th>Équivalence NCLC</th>
          <th>Éligibilité Entrée Express</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #ecfdf5; font-weight: bold;">
          <td>C2 / C1 Supérieur</td>
          <td>541 – 699 pts</td>
          <td>NCLC 9 et 10</td>
          <td>⭐⭐⭐⭐⭐ Points maximum garantis</td>
        </tr>
        <tr style="background: #f0fdf4;">
          <td>C1 Standard</td>
          <td>500 – 540 pts</td>
          <td>NCLC 8</td>
          <td>⭐⭐⭐⭐ Très haut score immigration</td>
        </tr>
        <tr style="background: #fef9c3;">
          <td>B2 Avancé</td>
          <td>458 – 499 pts</td>
          <td>NCLC 7</td>
          <td>⭐⭐⭐ Seuil minimal requis pour Entrée Express</td>
        </tr>
        <tr>
          <td>B1 / B2 Intermédiaire</td>
          <td>300 – 457 pts</td>
          <td>NCLC 5 et 6</td>
          <td>⚠️ Insuffisant pour Entrée Express (Accepté pour certains PVT)</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      © ${new Date().getFullYear()} Griffon d'Or — Plateforme officielle de préparation au TCF Canada et NCLC.<br>
      Document généré dynamiquement et certifié conforme pour l'espace candidat de ${userName}.
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">
    🖨️ Imprimer en PDF / Télécharger
  </button>
</body>
</html>`;
}

export function generateGrammarExercisesHtml(userName: string = "Candidat"): string {
  const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cahier d'Exercices de Grammaire Avancée TCF — Griffon d'Or</title>
  <style>
    :root {
      --primary: #4f46e5;
      --primary-light: #eef2ff;
      --secondary: #059669;
      --dark: #1e293b;
      --light: #f8fafc;
      --border: #cbd5e1;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: var(--dark);
      background: var(--light);
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 50px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border: 1px solid var(--border);
    }
    .header {
      border-bottom: 3px solid var(--primary);
      padding-bottom: 30px;
      margin-bottom: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 { font-size: 28px; color: var(--primary); margin-bottom: 8px; font-weight: 900; }
    .subtitle { font-size: 15px; color: #64748b; }
    .meta-box {
      background: var(--primary-light);
      border-left: 4px solid var(--primary);
      padding: 15px 20px;
      margin-bottom: 40px;
      border-radius: 0 8px 8px 0;
      font-size: 14px;
    }
    h2 { font-size: 20px; color: var(--dark); margin: 40px 0 20px 0; border-bottom: 2px solid var(--primary-light); padding-bottom: 8px; }
    .exercise-card {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .exercise-title { font-weight: bold; color: var(--primary); font-size: 16px; margin-bottom: 12px; }
    .question-item { margin-bottom: 15px; font-size: 15px; }
    .question-item:last-child { margin-bottom: 0; }
    .blank {
      display: inline-block;
      min-width: 120px;
      border-bottom: 2px dashed #64748b;
      margin: 0 6px;
      text-align: center;
      color: #94a3b8;
    }
    .options-list { margin-top: 8px; display: flex; gap: 15px; font-size: 14px; color: #475569; }
    .correction-section {
      margin-top: 50px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 30px;
    }
    .correction-title { color: #166534; font-size: 22px; font-weight: bold; margin-bottom: 20px; border-bottom: 1px solid #86efac; padding-bottom: 10px; }
    .correction-item { margin-bottom: 12px; font-size: 14px; color: #15803d; }
    .correction-item strong { color: #14532d; }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
    }
    .print-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: var(--primary);
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 15px;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(79,70,229,0.3);
      transition: all 0.2s;
    }
    .print-btn:hover { transform: translateY(-2px); background: #4338ca; }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; border: none; padding: 0; max-width: 100%; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>Cahier d'Exercices de Grammaire Avancée</h1>
        <div class="subtitle">Maîtrise des structures complexes pour les niveaux B2, C1 et C2 (TCF Canada)</div>
      </div>
    </div>

    <div class="meta-box">
      <strong>👤 Candidat(e) :</strong> ${userName} &nbsp;|&nbsp; <strong>📅 Date de génération :</strong> ${dateStr} &nbsp;|&nbsp; <strong>⚡ Niveau visé :</strong> C1 / C2
    </div>

    <h2>📌 Module 1 : Le Subjonctif vs l'Indicatif</h2>
    <p style="margin-bottom: 15px; font-size: 14px; color: #64748b;">Complétez les phrases suivantes en conjuguant le verbe entre parenthèses au mode et au temps qui conviennent.</p>

    <div class="exercise-card">
      <div class="exercise-title">Exercice 1.1 — Déclaration et certitude vs Doute et volonté</div>
      <div class="question-item">1. Les autorités d'Immigration Canada confirment qu'il <span class="blank">(être)</span> nécessaire de soumettre le dossier avant vendredi.</div>
      <div class="question-item">2. Bien que le candidat <span class="blank">(obtenir)</span> un excellent score à l'oral, il souhaite repasser l'épreuve écrite.</div>
      <div class="question-item">3. Je ne pense pas que cette mesure administrative <span class="blank">(pouvoir)</span> s'appliquer aux résidents temporaires à Montréal.</div>
      <div class="question-item">4. Il est évident que vous <span class="blank">(réussir)</span> votre examen grâce à une pratique quotidienne régulière.</div>
      <div class="question-item">5. Nous cherchons un appartement à Québec qui <span class="blank">(avoir)</span> au moins deux chambres à coucher et un stationnement.</div>
    </div>

    <h2>📌 Module 2 : Les Connecteurs Logiques d'Opposition et de Concession</h2>
    <div class="exercise-card">
      <div class="exercise-title">Exercice 2.1 — Choisissez le connecteur logique approprié</div>
      <div class="question-item">
        1. <span class="blank">______</span> l'hiver québécois soit particulièrement rigoureux, la qualité de vie à Montréal attire des milliers d'immigrants chaque année.
        <div class="options-list"><span>A) Bien que</span><span>B) En revanche</span><span>C) Parce que</span></div>
      </div>
      <div class="question-item">
        2. Le réseau de transport en commun est très développé dans le centre-ville ; <span class="blank">______</span>, il est préférable d'avoir une voiture en banlieue éloignée.
        <div class="options-list"><span>A) de sorte que</span><span>B) en revanche</span><span>C) bien que</span></div>
      </div>
      <div class="question-item">
        3. Le candidat a validé sa déclaration d'intérêt <span class="blank">______</span> recevoir une invitation à soumettre une demande de résidence permanente.
        <div class="options-list"><span>A) afin de</span><span>B) bien que</span><span>C) malgré</span></div>
      </div>
    </div>

    <h2>📌 Module 3 : La Concordance des Temps et le Conditionnel</h2>
    <div class="exercise-card">
      <div class="exercise-title">Exercice 3.1 — Hypothèses et conditions (Si...)</div>
      <div class="question-item">1. Si vous aviez commencé votre préparation trois mois plus tôt, vous <span class="blank">(atteindre)</span> le niveau NCLC 8 sans difficulté.</div>
      <div class="question-item">2. Si le gouvernement provincial adoptait cette nouvelle loi, les démarches d'équivalence de diplôme <span class="blank">(devenir)</span> beaucoup plus rapides.</div>
      <div class="question-item">3. Les recruteurs vous appelleront en entrevue dès que vous <span class="blank">(mettre)</span> à jour votre curriculum vitae au format canadien.</div>
    </div>

    <!-- SECTION CORRECTION -->
    <div class="correction-section">
      <div class="correction-title">🔑 Clé des réponses & Explications pédagogiques</div>
      
      <p style="font-weight: bold; color: #166534; margin-bottom: 10px;">Module 1 : Subjonctif vs Indicatif</p>
      <div class="correction-item"><strong>1. est (Indicatif présent) :</strong> Le verbe <em>confirmer</em> exprime une certitude ou un fait avéré, il est donc suivi de l'indicatif.</div>
      <div class="correction-item"><strong>2. ait obtenu (ou obtienne) (Subjonctif) :</strong> La locution conjonctive <em>bien que</em> exige toujours le subjonctif pour exprimer la concession.</div>
      <div class="correction-item"><strong>3. puisse (Subjonctif présent) :</strong> <em>Penser que</em> à la forme négative (ou interrogative inversée) introduit le doute, requérant le subjonctif.</div>
      <div class="correction-item"><strong>4. réussirez (ou réussissez) (Indicatif) :</strong> <em>Il est évident que</em> exprime une certitude totale -> Indicatif.</div>
      <div class="correction-item"><strong>5. ait (Subjonctif présent) :</strong> La proposition relative dépend d'un antécédent recherché mais incertain (un appartement qui réponde à ces critères).</div>

      <p style="font-weight: bold; color: #166534; margin: 20px 0 10px 0;">Module 2 : Connecteurs Logiques</p>
      <div class="correction-item"><strong>1. A) Bien que :</strong> Suivi du subjonctif (soit), exprime une opposition concessive.</div>
      <div class="correction-item"><strong>2. B) en revanche :</strong> Exprime l'opposition ou le contraste logique entre deux réalités indépendantes à l'indicatif.</div>
      <div class="correction-item"><strong>3. A) afin de :</strong> Suivi d'un verbe à l'infinitif (recevoir), exprime le but ou l'objectif.</div>

      <p style="font-weight: bold; color: #166534; margin: 20px 0 10px 0;">Module 3 : Concordance des Temps</p>
      <div class="correction-item"><strong>1. auriez atteint (Conditionnel passé) :</strong> Règle de l'irréel du passé : <em>Si + Plus-que-parfait -> Conditionnel passé</em>.</div>
      <div class="correction-item"><strong>2. deviendraient (Conditionnel présent) :</strong> Règle du potentiel/irréel du présent : <em>Si + Imparfait -> Conditionnel présent</em>.</div>
      <div class="correction-item"><strong>3. aurez mis (Futur antérieur) :</strong> Après <em>dès que / lorsque</em> dans une projection future, l'action antérieure prend le futur antérieur.</div>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} Griffon d'Or — Tous droits réservés.<br>
      Document d'entraînement officiel pour l'excellence linguistique au TCF Canada.
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">
    🖨️ Imprimer en PDF / Télécharger
  </button>
</body>
</html>`;
}
