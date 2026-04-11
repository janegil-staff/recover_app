/**
 * questionnaire_intro_keys.js
 * Adds intro screen translation keys to src/translations/index.js
 * Usage: node questionnaire_intro_keys.js
 */
const fs   = require('fs');
const path = require('path');
const FILE = path.join(process.cwd(), 'src', 'translations', 'index.js');

const KEYS = {
  en: {
    introWhatIsIt:    'What is it?',
    introWhyMatters:  'Why does it matter?',
    introHowWorks:    'How does it work?',
    introQuestions:   'questions',
    introAbout1Min:   '~1 min',
    introAbout2Min:   '~2 min',
    introAbout3Min:   '~3 min',
    introAbout5Min:   '~5 min',
    introValidated:   'Clinically validated',
    introStartBtn:    'Start questionnaire',
    introImagePlaceholder: 'Illustration coming soon',
    introDisclaimer:  'This questionnaire is for informational purposes only and does not constitute a clinical diagnosis. Always discuss results with your healthcare provider.',
    gad7IntroWhat:    'The GAD-7 is a 7-item questionnaire developed to screen for Generalised Anxiety Disorder and measure its severity.',
    gad7IntroWhy:     'Anxiety often goes unrecognised. Regular tracking helps you and your clinician see patterns and measure whether treatment is working.',
    gad7IntroHow:     'Answer 7 questions about how often you have experienced anxiety symptoms over the last 2 weeks. Each answer is scored 0–3.',
    phq9IntroWhat:    'The PHQ-9 is a 9-item questionnaire used to screen for depression and monitor its severity over time.',
    phq9IntroWhy:     'Depression is one of the most common mental health conditions in recovery. Tracking your PHQ-9 score over time reveals whether things are improving.',
    phq9IntroHow:     'Answer 9 questions about symptoms experienced over the last 2 weeks. Scores range from 0 (none) to 27 (severe).',
    auditIntroWhat:   'The AUDIT is a 10-item tool developed by the WHO to screen for hazardous and harmful alcohol use.',
    auditIntroWhy:    'Understanding your relationship with alcohol is a key part of recovery. The AUDIT gives you and your clinician a clear, evidence-based picture.',
    auditIntroHow:    'Answer 10 questions about your drinking habits. The first 3 cover frequency and quantity; the remaining 7 cover dependence symptoms and consequences.',
    dast10IntroWhat:  'The DAST-10 is a 10-item yes/no questionnaire that screens for problematic drug use over the past 12 months.',
    dast10IntroWhy:   'Honest reflection on substance use patterns is a powerful step in recovery. The DAST-10 helps identify the level of support you may need.',
    dast10IntroHow:   'Answer 10 yes/no questions about your drug use in the last 12 months. One question is reverse-scored. Results range from 0 (no problem) to 10 (severe).',
    cageIntroWhat:    'The CAGE is a brief 4-question screening tool for alcohol dependence. Each letter stands for a key sign: Cut down, Annoyed, Guilty, Eye-opener.',
    cageIntroWhy:     'A score of 2 or more suggests a possible alcohol problem and is a prompt to discuss further with your clinician.',
    cageIntroHow:     'Answer 4 simple yes/no questions. Takes less than a minute. Quick to complete and easy to track over time.',
    readinessIntroWhat: 'The Readiness to Change questionnaire measures your motivation and confidence to make changes to your substance use.',
    readinessIntroWhy:  'Motivation is one of the strongest predictors of recovery success. Tracking your readiness over time shows your progress and helps your clinician tailor support.',
    readinessIntroHow:  'Rate your agreement with 6 statements on a scale from Strongly Disagree to Strongly Agree. No right or wrong answers — just honest reflection.',
  },
  no: {
    introWhatIsIt:    'Hva er det?',
    introWhyMatters:  'Hvorfor er det viktig?',
    introHowWorks:    'Hvordan fungerer det?',
    introQuestions:   'spørsmål',
    introAbout1Min:   '~1 min',
    introAbout2Min:   '~2 min',
    introAbout3Min:   '~3 min',
    introAbout5Min:   '~5 min',
    introValidated:   'Klinisk validert',
    introStartBtn:    'Start spørreskjema',
    introImagePlaceholder: 'Illustrasjon kommer snart',
    introDisclaimer:  'Dette spørreskjemaet er kun til informasjonsformål og er ikke en klinisk diagnose. Diskuter alltid resultatene med din behandler.',
    gad7IntroWhat:    'GAD-7 er et 7-spørsmåls skjema utviklet for å screene for generalisert angstlidelse og måle alvorlighetsgraden.',
    gad7IntroWhy:     'Angst går ofte uoppdaget. Regelmessig sporing hjelper deg og behandleren din å se mønstre og måle om behandlingen virker.',
    gad7IntroHow:     'Svar på 7 spørsmål om hvor ofte du har opplevd angstsymptomer de siste 2 ukene. Hvert svar gis poeng fra 0–3.',
    phq9IntroWhat:    'PHQ-9 er et 9-spørsmåls skjema brukt til å screene for depresjon og overvåke alvorlighetsgraden over tid.',
    phq9IntroWhy:     'Depresjon er en av de vanligste psykiske helseutfordringene i bedring. Å spore PHQ-9-scoren din over tid viser om ting forbedrer seg.',
    phq9IntroHow:     'Svar på 9 spørsmål om symptomer de siste 2 ukene. Poengsum fra 0 (ingen) til 27 (alvorlig).',
    auditIntroWhat:   'AUDIT er et 10-spørsmåls verktøy utviklet av WHO for å screene for risikofylt og skadelig alkoholbruk.',
    auditIntroWhy:    'Å forstå forholdet ditt til alkohol er en viktig del av bedringen. AUDIT gir deg og behandleren et klart, kunnskapsbasert bilde.',
    auditIntroHow:    'Svar på 10 spørsmål om drikkevaner. De 3 første dekker frekvens og mengde; de resterende 7 dekker avhengighetssymptomer og konsekvenser.',
    dast10IntroWhat:  'DAST-10 er et 10-spørsmåls ja/nei-skjema som screener for problematisk rusbruk de siste 12 månedene.',
    dast10IntroWhy:   'Ærlig refleksjon over rusmønstre er et kraftfullt skritt i bedringen. DAST-10 hjelper med å identifisere støttebehovet ditt.',
    dast10IntroHow:   'Svar på 10 ja/nei-spørsmål om rusbruk de siste 12 månedene. Ett spørsmål er reversskåret. Resultater fra 0 (intet problem) til 10 (alvorlig).',
    cageIntroWhat:    'CAGE er et kort 4-spørsmåls screeningverktøy for alkoholavhengighet. Hver bokstav står for et nøkkeltegn: Cut down, Annoyed, Guilty, Eye-opener.',
    cageIntroWhy:     'En score på 2 eller mer tyder på et mulig alkoholproblem og er en oppfordring til videre samtale med behandleren.',
    cageIntroHow:     'Svar på 4 enkle ja/nei-spørsmål. Tar under ett minutt. Raskt å fylle ut og enkelt å følge over tid.',
    readinessIntroWhat: 'Endringsviljeskilemaet måler motivasjonen og selvtilliten din til å gjøre endringer i rusbruken.',
    readinessIntroWhy:  'Motivasjon er en av de sterkeste prediktorene for vellykket bedring. Å spore endringsviljen over tid viser fremgangen din.',
    readinessIntroHow:  'Vurder enigheten din med 6 påstander på en skala fra Sterkt uenig til Sterkt enig. Ingen riktige eller gale svar — bare ærlig refleksjon.',
  },
  de: {
    introWhatIsIt: 'Was ist das?', introWhyMatters: 'Warum ist es wichtig?', introHowWorks: 'Wie funktioniert es?',
    introQuestions: 'Fragen', introAbout1Min: '~1 Min', introAbout2Min: '~2 Min', introAbout3Min: '~3 Min', introAbout5Min: '~5 Min',
    introValidated: 'Klinisch validiert', introStartBtn: 'Fragebogen starten', introImagePlaceholder: 'Illustration folgt bald',
    introDisclaimer: 'Dieser Fragebogen dient nur zu Informationszwecken und stellt keine klinische Diagnose dar. Bespreche die Ergebnisse immer mit deinem Arzt.',
    gad7IntroWhat: 'Der GAD-7 ist ein 7-Punkte-Fragebogen zur Erkennung und Messung von Generalisierter Angststörung.', gad7IntroWhy: 'Angst wird oft nicht erkannt. Regelmäßiges Tracking hilft dir und deinem Arzt, Muster zu erkennen.', gad7IntroHow: 'Beantworte 7 Fragen darüber, wie oft du in den letzten 2 Wochen Angstsymptome hattest. Jede Antwort wird mit 0–3 bewertet.',
    phq9IntroWhat: 'Der PHQ-9 ist ein 9-Punkte-Fragebogen zur Erkennung und Überwachung von Depressionen.', phq9IntroWhy: 'Depression ist eine der häufigsten psychischen Erkrankungen in der Genesung. Das Tracking zeigt, ob sich die Dinge verbessern.', phq9IntroHow: 'Beantworte 9 Fragen zu Symptomen der letzten 2 Wochen. Punktzahlen von 0 (keine) bis 27 (schwer).',
    auditIntroWhat: 'Der AUDIT ist ein 10-Punkte-Tool der WHO zur Erkennung von riskantem und schädlichem Alkoholkonsum.', auditIntroWhy: 'Das Verständnis deines Verhältnisses zu Alkohol ist entscheidend. Der AUDIT gibt dir ein klares Bild.', auditIntroHow: 'Beantworte 10 Fragen zu deinen Trinkgewohnheiten.',
    dast10IntroWhat: 'Der DAST-10 ist ein 10-Punkte-Ja/Nein-Fragebogen zur Erkennung von problematischem Drogenkonsum.', dast10IntroWhy: 'Ehrliche Reflexion über Konsummuster ist ein mächtiger Schritt in der Genesung.', dast10IntroHow: 'Beantworte 10 Ja/Nein-Fragen zu deinem Drogenkonsum in den letzten 12 Monaten.',
    cageIntroWhat: 'Der CAGE ist ein kurzes 4-Fragen-Screening-Tool für Alkoholabhängigkeit.', cageIntroWhy: 'Ein Score von 2 oder mehr deutet auf ein mögliches Alkoholproblem hin.', cageIntroHow: 'Beantworte 4 einfache Ja/Nein-Fragen. Dauert weniger als eine Minute.',
    readinessIntroWhat: 'Der Fragebogen zur Veränderungsbereitschaft misst deine Motivation und Zuversicht.', readinessIntroWhy: 'Motivation ist einer der stärksten Prädiktoren für den Genesungserfolg.', readinessIntroHow: 'Bewerte deine Zustimmung zu 6 Aussagen auf einer Skala von Stimme nicht zu bis Stimme zu.',
  },
  da: {
    introWhatIsIt: 'Hvad er det?', introWhyMatters: 'Hvorfor er det vigtigt?', introHowWorks: 'Hvordan fungerer det?',
    introQuestions: 'spørgsmål', introAbout1Min: '~1 min', introAbout2Min: '~2 min', introAbout3Min: '~3 min', introAbout5Min: '~5 min',
    introValidated: 'Klinisk valideret', introStartBtn: 'Start spørgeskema', introImagePlaceholder: 'Illustration kommer snart',
    introDisclaimer: 'Dette spørgeskema er kun til informationsformål og udgør ikke en klinisk diagnose. Drøft altid resultaterne med din behandler.',
    gad7IntroWhat: 'GAD-7 er et 7-spørgsmåls skema til at screene for generaliseret angstlidelse.', gad7IntroWhy: 'Angst går ofte ubemærket hen. Regelmæssig sporing hjælper dig og din behandler.', gad7IntroHow: 'Besvar 7 spørgsmål om angstsymptomer de seneste 2 uger. Hvert svar scores 0–3.',
    phq9IntroWhat: 'PHQ-9 er et 9-spørgsmåls skema til at screene for depression.', phq9IntroWhy: 'Depression er en af de hyppigste psykiske lidelser i bedring.', phq9IntroHow: 'Besvar 9 spørgsmål om symptomer de seneste 2 uger. Scores fra 0 til 27.',
    auditIntroWhat: 'AUDIT er et 10-spørgsmåls WHO-værktøj til at screene for risikabelt alkoholforbrug.', auditIntroWhy: 'At forstå dit forhold til alkohol er afgørende i bedringen.', auditIntroHow: 'Besvar 10 spørgsmål om dine drikkevaner.',
    dast10IntroWhat: 'DAST-10 er et 10-spørgsmåls ja/nej-skema til at screene for problematisk stofbrug.', dast10IntroWhy: 'Ærlig refleksion over forbrugsmønstre er et stærkt skridt i bedringen.', dast10IntroHow: 'Besvar 10 ja/nej-spørgsmål om dit stofbrug de seneste 12 måneder.',
    cageIntroWhat: 'CAGE er et kort 4-spørgsmåls screeningsværktøj for alkoholafhængighed.', cageIntroWhy: 'En score på 2 eller mere tyder på et muligt alkoholproblem.', cageIntroHow: 'Besvar 4 enkle ja/nej-spørgsmål. Tager under et minut.',
    readinessIntroWhat: 'Parathedsskemaet måler din motivation og selvtillid til at ændre dit stofbrug.', readinessIntroWhy: 'Motivation er en af de stærkeste forudsigere for succesfuld bedring.', readinessIntroHow: 'Vurder din enighed med 6 udsagn på en skala fra Meget uenig til Meget enig.',
  },
  sv: {
    introWhatIsIt: 'Vad är det?', introWhyMatters: 'Varför är det viktigt?', introHowWorks: 'Hur fungerar det?',
    introQuestions: 'frågor', introAbout1Min: '~1 min', introAbout2Min: '~2 min', introAbout3Min: '~3 min', introAbout5Min: '~5 min',
    introValidated: 'Kliniskt validerat', introStartBtn: 'Starta formuläret', introImagePlaceholder: 'Illustration kommer snart',
    introDisclaimer: 'Detta formulär är endast för informationsändamål och utgör inte en klinisk diagnos. Diskutera alltid resultaten med din vårdgivare.',
    gad7IntroWhat: 'GAD-7 är ett 7-frågeformulär för att screena för generaliserat ångestsyndrom.', gad7IntroWhy: 'Ångest går ofta obemärkt. Regelbunden spårning hjälper dig och din läkare.', gad7IntroHow: 'Svara på 7 frågor om angstsymptom de senaste 2 veckorna. Varje svar poängsätts 0–3.',
    phq9IntroWhat: 'PHQ-9 är ett 9-frågeformulär för att screena för depression.', phq9IntroWhy: 'Depression är ett av de vanligaste psykiska hälsotillstånden i tillfrisknande.', phq9IntroHow: 'Svara på 9 frågor om symptom de senaste 2 veckorna. Poäng 0–27.',
    auditIntroWhat: 'AUDIT är ett 10-frågeverktyg från WHO för att screena för riskabelt alkoholbruk.', auditIntroWhy: 'Att förstå ditt förhållande till alkohol är avgörande i tillfrisknandet.', auditIntroHow: 'Svara på 10 frågor om dina dryckesvanor.',
    dast10IntroWhat: 'DAST-10 är ett 10-frågeformulär (ja/nej) för att screena för problematiskt drogbruk.', dast10IntroWhy: 'Ärlig reflektion över konsumtionsmönster är ett kraftfullt steg i tillfrisknandet.', dast10IntroHow: 'Svara på 10 ja/nej-frågor om ditt drogbruk de senaste 12 månaderna.',
    cageIntroWhat: 'CAGE är ett kort 4-frågesreeningverktyg för alkoholberoende.', cageIntroWhy: 'En poäng på 2 eller mer tyder på ett möjligt alkoholproblem.', cageIntroHow: 'Svara på 4 enkla ja/nej-frågor. Tar under en minut.',
    readinessIntroWhat: 'Förändringsberedness formuläret mäter din motivation och självförtroende.', readinessIntroWhy: 'Motivation är en av de starkaste prediktorerna för framgångsrikt tillfrisknande.', readinessIntroHow: 'Betygsätt din enighet med 6 påståenden på en skala från Instämmer inte alls till Instämmer helt.',
  },
  fi: {
    introWhatIsIt: 'Mikä se on?', introWhyMatters: 'Miksi se on tärkeää?', introHowWorks: 'Miten se toimii?',
    introQuestions: 'kysymystä', introAbout1Min: '~1 min', introAbout2Min: '~2 min', introAbout3Min: '~3 min', introAbout5Min: '~5 min',
    introValidated: 'Kliinisesti validoitu', introStartBtn: 'Aloita kysely', introImagePlaceholder: 'Kuva tulossa pian',
    introDisclaimer: 'Tämä kysely on vain tiedottamista varten eikä muodosta kliinistä diagnoosia. Keskustele aina tuloksista terveydenhuollon ammattilaisen kanssa.',
    gad7IntroWhat: 'GAD-7 on 7-kohtainen kysely yleistyneen ahdistuneisuushäiriön seulontaan.', gad7IntroWhy: 'Ahdistus jää usein tunnistamatta. Säännöllinen seuranta auttaa sinua ja lääkäriäsi.', gad7IntroHow: 'Vastaa 7 kysymykseen ahdistusoireista viimeisten 2 viikon ajalta. Jokainen vastaus pisteytetään 0–3.',
    phq9IntroWhat: 'PHQ-9 on 9-kohtainen kysely masennuksen seulontaan.', phq9IntroWhy: 'Masennus on yksi yleisimmistä mielenterveysongelmista toipumisessa.', phq9IntroHow: 'Vastaa 9 kysymykseen oireista viimeisten 2 viikon ajalta. Pisteet 0–27.',
    auditIntroWhat: 'AUDIT on WHO:n kehittämä 10-kohtainen työkalu riskialttiin alkoholinkäytön seulontaan.', auditIntroWhy: 'Alkoholisuhteesi ymmärtäminen on keskeinen osa toipumista.', auditIntroHow: 'Vastaa 10 kysymykseen juomistottumuksistasi.',
    dast10IntroWhat: 'DAST-10 on 10-kohtainen kyllä/ei-kysely ongelmallisen huumeidenkäytön seulontaan.', dast10IntroWhy: 'Rehellinen pohdiskelu käyttötottumuksista on voimakas askel toipumisessa.', dast10IntroHow: 'Vastaa 10 kyllä/ei-kysymykseen huumeidenkäytöstä viimeisten 12 kuukauden aikana.',
    cageIntroWhat: 'CAGE on lyhyt 4-kysymyksen seulontatyökalu alkoholiriippuvuuden tunnistamiseen.', cageIntroWhy: 'Pisteet 2 tai enemmän viittaavat mahdolliseen alkoholiongelmaan.', cageIntroHow: 'Vastaa 4 yksinkertaiseen kyllä/ei-kysymykseen. Kestää alle minuutin.',
    readinessIntroWhat: 'Muutosvalmiuskysely mittaa motivaatiotasi ja luottamustasi aineidenkäytön muuttamiseen.', readinessIntroWhy: 'Motivaatio on yksi vahvimmista toipumisen ennustajista.', readinessIntroHow: 'Arvioi sopimisesi 6 väittämään asteikolla Täysin eri mieltä – Täysin samaa mieltä.',
  },
  fr: {
    introWhatIsIt: 'Qu\'est-ce que c\'est ?', introWhyMatters: 'Pourquoi est-ce important ?', introHowWorks: 'Comment ça marche ?',
    introQuestions: 'questions', introAbout1Min: '~1 min', introAbout2Min: '~2 min', introAbout3Min: '~3 min', introAbout5Min: '~5 min',
    introValidated: 'Cliniquement validé', introStartBtn: 'Commencer le questionnaire', introImagePlaceholder: 'Illustration à venir',
    introDisclaimer: 'Ce questionnaire est uniquement à titre informatif et ne constitue pas un diagnostic clinique. Discutez toujours des résultats avec votre professionnel de santé.',
    gad7IntroWhat: 'Le GAD-7 est un questionnaire de 7 items pour dépister le trouble anxieux généralisé.', gad7IntroWhy: 'L\'anxiété passe souvent inaperçue. Un suivi régulier aide à repérer les tendances.', gad7IntroHow: 'Répondez à 7 questions sur vos symptômes d\'anxiété des 2 dernières semaines. Chaque réponse est notée 0–3.',
    phq9IntroWhat: 'Le PHQ-9 est un questionnaire de 9 items pour dépister la dépression.', phq9IntroWhy: 'La dépression est l\'un des troubles mentaux les plus fréquents en rétablissement.', phq9IntroHow: 'Répondez à 9 questions sur les symptômes des 2 dernières semaines. Scores de 0 à 27.',
    auditIntroWhat: 'L\'AUDIT est un outil de 10 items développé par l\'OMS pour dépister la consommation d\'alcool.', auditIntroWhy: 'Comprendre votre relation à l\'alcool est essentiel dans le rétablissement.', auditIntroHow: 'Répondez à 10 questions sur vos habitudes de consommation.',
    dast10IntroWhat: 'Le DAST-10 est un questionnaire oui/non de 10 items pour dépister la consommation problématique de drogues.', dast10IntroWhy: 'Une réflexion honnête sur vos habitudes est une étape puissante.', dast10IntroHow: 'Répondez à 10 questions oui/non sur votre consommation des 12 derniers mois.',
    cageIntroWhat: 'Le CAGE est un court outil de 4 questions pour dépister la dépendance à l\'alcool.', cageIntroWhy: 'Un score de 2 ou plus suggère un problème d\'alcool possible.', cageIntroHow: 'Répondez à 4 questions oui/non. Prend moins d\'une minute.',
    readinessIntroWhat: 'Le questionnaire de disposition au changement mesure votre motivation.', readinessIntroWhy: 'La motivation est l\'un des meilleurs prédicteurs du rétablissement.', readinessIntroHow: 'Évaluez votre accord avec 6 affirmations sur une échelle de Fortement en désaccord à Fortement d\'accord.',
  },
  es: {
    introWhatIsIt: '¿Qué es?', introWhyMatters: '¿Por qué importa?', introHowWorks: '¿Cómo funciona?',
    introQuestions: 'preguntas', introAbout1Min: '~1 min', introAbout2Min: '~2 min', introAbout3Min: '~3 min', introAbout5Min: '~5 min',
    introValidated: 'Clínicamente validado', introStartBtn: 'Iniciar cuestionario', introImagePlaceholder: 'Ilustración próximamente',
    introDisclaimer: 'Este cuestionario es solo informativo y no constituye un diagnóstico clínico. Discute siempre los resultados con tu profesional de salud.',
    gad7IntroWhat: 'El GAD-7 es un cuestionario de 7 preguntas para detectar el trastorno de ansiedad generalizada.', gad7IntroWhy: 'La ansiedad a menudo pasa desapercibida. El seguimiento regular ayuda a detectar patrones.', gad7IntroHow: 'Responde 7 preguntas sobre síntomas de ansiedad de las últimas 2 semanas. Cada respuesta se puntúa 0–3.',
    phq9IntroWhat: 'El PHQ-9 es un cuestionario de 9 preguntas para detectar la depresión.', phq9IntroWhy: 'La depresión es uno de los trastornos más comunes en la recuperación.', phq9IntroHow: 'Responde 9 preguntas sobre síntomas de las últimas 2 semanas. Puntuaciones de 0 a 27.',
    auditIntroWhat: 'El AUDIT es una herramienta de 10 preguntas de la OMS para detectar el consumo de alcohol.', auditIntroWhy: 'Entender tu relación con el alcohol es clave en la recuperación.', auditIntroHow: 'Responde 10 preguntas sobre tus hábitos de consumo.',
    dast10IntroWhat: 'El DAST-10 es un cuestionario sí/no de 10 preguntas para detectar el consumo problemático de drogas.', dast10IntroWhy: 'La reflexión honesta sobre el consumo es un paso poderoso.', dast10IntroHow: 'Responde 10 preguntas sí/no sobre tu consumo en los últimos 12 meses.',
    cageIntroWhat: 'El CAGE es una herramienta de 4 preguntas para detectar la dependencia del alcohol.', cageIntroWhy: 'Una puntuación de 2 o más sugiere un posible problema con el alcohol.', cageIntroHow: 'Responde 4 preguntas sí/no simples. Tarda menos de un minuto.',
    readinessIntroWhat: 'El cuestionario de disposición al cambio mide tu motivación.', readinessIntroWhy: 'La motivación es uno de los predictores más fuertes del éxito en la recuperación.', readinessIntroHow: 'Valora tu acuerdo con 6 afirmaciones en una escala de Totalmente en desacuerdo a Totalmente de acuerdo.',
  },
  it: {
    introWhatIsIt: 'Cos\'è?', introWhyMatters: 'Perché è importante?', introHowWorks: 'Come funziona?',
    introQuestions: 'domande', introAbout1Min: '~1 min', introAbout2Min: '~2 min', introAbout3Min: '~3 min', introAbout5Min: '~5 min',
    introValidated: 'Clinicamente validato', introStartBtn: 'Inizia il questionario', introImagePlaceholder: 'Illustrazione in arrivo',
    introDisclaimer: 'Questo questionario è solo a scopo informativo e non costituisce una diagnosi clinica. Discuti sempre i risultati con il tuo professionista sanitario.',
    gad7IntroWhat: 'Il GAD-7 è un questionario di 7 voci per lo screening del disturbo d\'ansia generalizzato.', gad7IntroWhy: 'L\'ansia spesso non viene riconosciuta. Il monitoraggio regolare aiuta a rilevare i pattern.', gad7IntroHow: 'Rispondi a 7 domande sui sintomi d\'ansia delle ultime 2 settimane. Ogni risposta viene valutata 0–3.',
    phq9IntroWhat: 'Il PHQ-9 è un questionario di 9 voci per lo screening della depressione.', phq9IntroWhy: 'La depressione è una delle condizioni più comuni nel percorso di guarigione.', phq9IntroHow: 'Rispondi a 9 domande sui sintomi delle ultime 2 settimane. Punteggi da 0 a 27.',
    auditIntroWhat: 'L\'AUDIT è uno strumento di 10 voci sviluppato dall\'OMS per lo screening del consumo di alcol.', auditIntroWhy: 'Comprendere il tuo rapporto con l\'alcol è fondamentale nel percorso di guarigione.', auditIntroHow: 'Rispondi a 10 domande sulle tue abitudini di consumo.',
    dast10IntroWhat: 'Il DAST-10 è un questionario sì/no di 10 voci per lo screening dell\'uso problematico di droghe.', dast10IntroWhy: 'La riflessione onesta sui modelli di consumo è un passo potente.', dast10IntroHow: 'Rispondi a 10 domande sì/no sull\'uso di droghe negli ultimi 12 mesi.',
    cageIntroWhat: 'Il CAGE è un breve strumento di 4 domande per lo screening della dipendenza da alcol.', cageIntroWhy: 'Un punteggio di 2 o più suggerisce un possibile problema con l\'alcol.', cageIntroHow: 'Rispondi a 4 semplici domande sì/no. Richiede meno di un minuto.',
    readinessIntroWhat: 'Il questionario sulla disponibilità al cambiamento misura la tua motivazione.', readinessIntroWhy: 'La motivazione è uno dei predittori più forti del successo nel recupero.', readinessIntroHow: 'Valuta il tuo accordo con 6 affermazioni su una scala da Fortemente in disaccordo a Fortemente d\'accordo.',
  },
  nl: {
    introWhatIsIt: 'Wat is het?', introWhyMatters: 'Waarom is het belangrijk?', introHowWorks: 'Hoe werkt het?',
    introQuestions: 'vragen', introAbout1Min: '~1 min', introAbout2Min: '~2 min', introAbout3Min: '~3 min', introAbout5Min: '~5 min',
    introValidated: 'Klinisch gevalideerd', introStartBtn: 'Vragenlijst starten', introImagePlaceholder: 'Illustratie komt binnenkort',
    introDisclaimer: 'Deze vragenlijst is alleen voor informatieve doeleinden en vormt geen klinische diagnose. Bespreek resultaten altijd met je zorgverlener.',
    gad7IntroWhat: 'De GAD-7 is een 7-item vragenlijst voor screening op gegeneraliseerde angststoornis.', gad7IntroWhy: 'Angst wordt vaak niet herkend. Regelmatige tracking helpt patronen te herkennen.', gad7IntroHow: 'Beantwoord 7 vragen over angstsymptomen de afgelopen 2 weken. Elke score: 0–3.',
    phq9IntroWhat: 'De PHQ-9 is een 9-item vragenlijst voor screening op depressie.', phq9IntroWhy: 'Depressie is een van de meest voorkomende psychische aandoeningen bij herstel.', phq9IntroHow: 'Beantwoord 9 vragen over symptomen de afgelopen 2 weken. Scores van 0 tot 27.',
    auditIntroWhat: 'De AUDIT is een 10-item WHO-tool voor screening op riskant alcoholgebruik.', auditIntroWhy: 'Je relatie met alcohol begrijpen is essentieel in herstel.', auditIntroHow: 'Beantwoord 10 vragen over je drinkgewoonten.',
    dast10IntroWhat: 'De DAST-10 is een 10-item ja/nee-vragenlijst voor screening op problematisch drugsgebruik.', dast10IntroWhy: 'Eerlijke reflectie op gebruikspatronen is een krachtige stap.', dast10IntroHow: 'Beantwoord 10 ja/nee-vragen over je drugsgebruik in de afgelopen 12 maanden.',
    cageIntroWhat: 'De CAGE is een korte 4-vragen screener voor alcoholafhankelijkheid.', cageIntroWhy: 'Een score van 2 of hoger wijst op een mogelijk alcoholprobleem.', cageIntroHow: 'Beantwoord 4 eenvoudige ja/nee-vragen. Duurt minder dan een minuut.',
    readinessIntroWhat: 'De veranderingsbereidheids­vragenlijst meet je motivatie en zelfvertrouwen.', readinessIntroWhy: 'Motivatie is een van de sterkste voorspellers van succesvol herstel.', readinessIntroHow: 'Beoordeel je akkoord met 6 stellingen op een schaal van Sterk oneens tot Sterk eens.',
  },
  pl: {
    introWhatIsIt: 'Co to jest?', introWhyMatters: 'Dlaczego to ważne?', introHowWorks: 'Jak to działa?',
    introQuestions: 'pytań', introAbout1Min: '~1 min', introAbout2Min: '~2 min', introAbout3Min: '~3 min', introAbout5Min: '~5 min',
    introValidated: 'Klinicznie zwalidowany', introStartBtn: 'Rozpocznij kwestionariusz', introImagePlaceholder: 'Ilustracja wkrótce',
    introDisclaimer: 'Ten kwestionariusz służy wyłącznie celom informacyjnym i nie stanowi diagnozy klinicznej. Zawsze omawiaj wyniki z pracownikiem ochrony zdrowia.',
    gad7IntroWhat: 'GAD-7 to 7-punktowy kwestionariusz do przesiewowego badania zaburzenia lękowego uogólnionego.', gad7IntroWhy: 'Lęk często pozostaje nierozpoznany. Regularne śledzenie pomaga wykryć wzorce.', gad7IntroHow: 'Odpowiedz na 7 pytań dotyczących objawów lęku w ciągu ostatnich 2 tygodni. Każda odpowiedź punktowana 0–3.',
    phq9IntroWhat: 'PHQ-9 to 9-punktowy kwestionariusz do przesiewowego badania depresji.', phq9IntroWhy: 'Depresja jest jednym z najczęstszych zaburzeń w trakcie zdrowienia.', phq9IntroHow: 'Odpowiedz na 9 pytań dotyczących objawów z ostatnich 2 tygodni. Wyniki od 0 do 27.',
    auditIntroWhat: 'AUDIT to 10-punktowe narzędzie WHO do wykrywania ryzykownego spożycia alkoholu.', auditIntroWhy: 'Zrozumienie swojego stosunku do alkoholu jest kluczowe w zdrowieniu.', auditIntroHow: 'Odpowiedz na 10 pytań dotyczących nawyków picia.',
    dast10IntroWhat: 'DAST-10 to 10-punktowy kwestionariusz tak/nie do wykrywania problematycznego używania narkotyków.', dast10IntroWhy: 'Uczciwa refleksja nad wzorcami używania to silny krok w zdrowieniu.', dast10IntroHow: 'Odpowiedz na 10 pytań tak/nie dotyczących używania narkotyków w ciągu ostatnich 12 miesięcy.',
    cageIntroWhat: 'CAGE to krótkie narzędzie przesiewowe z 4 pytaniami dotyczącymi zależności od alkoholu.', cageIntroWhy: 'Wynik 2 lub więcej sugeruje możliwy problem z alkoholem.', cageIntroHow: 'Odpowiedz na 4 proste pytania tak/nie. Zajmuje mniej niż minutę.',
    readinessIntroWhat: 'Kwestionariusz gotowości do zmiany mierzy Twoją motywację.', readinessIntroWhy: 'Motywacja jest jednym z najsilniejszych predyktorów sukcesu w zdrowieniu.', readinessIntroHow: 'Oceń zgodność z 6 stwierdzeniami na skali od Zdecydowanie nie zgadzam się do Zdecydowanie zgadzam się.',
  },
  pt: {
    introWhatIsIt: 'O que é?', introWhyMatters: 'Por que importa?', introHowWorks: 'Como funciona?',
    introQuestions: 'perguntas', introAbout1Min: '~1 min', introAbout2Min: '~2 min', introAbout3Min: '~3 min', introAbout5Min: '~5 min',
    introValidated: 'Clinicamente validado', introStartBtn: 'Iniciar questionário', introImagePlaceholder: 'Ilustração em breve',
    introDisclaimer: 'Este questionário é apenas para fins informativos e não constitui um diagnóstico clínico. Discuta sempre os resultados com seu profissional de saúde.',
    gad7IntroWhat: 'O GAD-7 é um questionário de 7 itens para rastrear o transtorno de ansiedade generalizada.', gad7IntroWhy: 'A ansiedade muitas vezes passa despercebida. O rastreamento regular ajuda a identificar padrões.', gad7IntroHow: 'Responda 7 perguntas sobre sintomas de ansiedade nas últimas 2 semanas. Cada resposta é pontuada de 0 a 3.',
    phq9IntroWhat: 'O PHQ-9 é um questionário de 9 itens para rastrear a depressão.', phq9IntroWhy: 'A depressão é uma das condições mais comuns na recuperação.', phq9IntroHow: 'Responda 9 perguntas sobre sintomas das últimas 2 semanas. Pontuações de 0 a 27.',
    auditIntroWhat: 'O AUDIT é uma ferramenta de 10 itens da OMS para rastrear o uso de álcool.', auditIntroWhy: 'Compreender sua relação com o álcool é essencial na recuperação.', auditIntroHow: 'Responda 10 perguntas sobre seus hábitos de consumo.',
    dast10IntroWhat: 'O DAST-10 é um questionário sim/não de 10 itens para rastrear o uso problemático de drogas.', dast10IntroWhy: 'A reflexão honesta sobre padrões de uso é um passo poderoso.', dast10IntroHow: 'Responda 10 perguntas sim/não sobre uso de drogas nos últimos 12 meses.',
    cageIntroWhat: 'O CAGE é uma breve ferramenta de 4 perguntas para rastrear dependência de álcool.', cageIntroWhy: 'Uma pontuação de 2 ou mais sugere um possível problema com álcool.', cageIntroHow: 'Responda 4 perguntas simples sim/não. Leva menos de um minuto.',
    readinessIntroWhat: 'O questionário de disposição para mudança mede sua motivação.', readinessIntroWhy: 'Motivação é um dos preditores mais fortes do sucesso na recuperação.', readinessIntroHow: 'Avalie sua concordância com 6 afirmações numa escala de Discordo totalmente a Concordo totalmente.',
  },
};

let src = fs.readFileSync(FILE, 'utf8');
let injected = 0;

for (const [lang, keys] of Object.entries(KEYS)) {
  const langMarker = `\nconst ${lang} = {`;
  const markerIdx  = src.indexOf(langMarker);
  if (markerIdx === -1) { console.warn(`[warn] "${lang}" not found`); continue; }

  let depth = 0, i = markerIdx + langMarker.length, closeIdx = -1;
  while (i < src.length) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { if (depth === 0) { closeIdx = i; break; } depth--; }
    i++;
  }
  if (closeIdx === -1) { console.warn(`[warn] no closing brace for "${lang}"`); continue; }

  const blockSrc = src.slice(markerIdx, closeIdx);
  const newKeys  = Object.entries(keys).filter(([k]) => !blockSrc.includes(`${k}:`));
  if (newKeys.length === 0) { console.log(`[skip] ${lang} — all keys present`); continue; }

  const insertion = '\n  // Questionnaire intro screens\n' +
    newKeys.map(([k, v]) => `  ${k}: ${JSON.stringify(v)},`).join('\n') + '\n';

  src = src.slice(0, closeIdx) + insertion + src.slice(closeIdx);
  injected++;
  console.log(`[ok]  ${lang} — added ${newKeys.length} keys`);
}

fs.writeFileSync(FILE, src, 'utf8');
console.log(`\nDone. Updated ${injected} language(s).`);
