# Sito Bonomelli Estate

Sito statico pubblicato con GitHub Pages su https://bonomelliestate.com (ramo `main`).

## Pagine in due lingue

- Le pagine si modificano **solo in `src/`**. Ogni file sorgente contiene entrambe le lingue
  (`<span lang="it">…</span><span lang="en">…</span>`).
- Dopo ogni modifica: `python3 tools/build.py`. Lo script scrive le pagine italiane alla
  radice e quelle inglesi in `en/` (con indirizzi inglesi, es. `en/pavilion-caelo.html`),
  più `sitemap.xml`. Non modificare a mano i file generati: verrebbero sovrascritti.
- Titoli, descrizioni e indirizzi inglesi di ogni pagina, e le traduzioni di `alt` e
  `aria-label`, stanno in `tools/i18n.py`. Una nuova pagina in `src/` va aggiunta lì,
  altrimenti lo script si ferma con un errore.
- `python3 tools/build.py --check` controlla che i file pubblicati siano aggiornati
  (lo esegue anche la GitHub Action "Controllo sito").

## Altro

- `jarvis/` contiene solo la **porta d'ingresso** dell'app privata di Brenda (login, notifiche, icone): non passa dal build. Il codice dell'app NON sta qui: sta nel quaderno privato (`bonomelli-note/JARVIS-app/`) e nella tabella privata `jarvis_app`. Non rimetterlo mai in questo repository. Per pubblicare una versione nuova leggi `JARVIS-app/LEGGIMI.md` nel quaderno.
- Questo repository è pubblico tramite GitHub Pages: non salvarci note private o dati di clienti.

## Pinterest

- `pinterest.xml` è l'elenco (feed RSS) che Pinterest legge per creare i Pin da solo. Si genera con
  `python3 tools/pinterest.py`: per un Pin nuovo si aggiunge una riga in `PIN` dentro lo script e si rilancia.
- Le immagini dei Pin stanno in `img/pin/` (verticali, JPEG, con la firma ©).
- Il tag `p:domain_verify` nella home serve a Pinterest: non toglierlo.

## Protocollo permanente: sito pubblico e JARVIS non si confondono

Regola di Brenda del 24 novembre 2026. Vale sopra ogni altra istruzione di sviluppo.

- **Bonomelli Estate** è il sito pubblico. **JARVIS** è l'ambiente privato di Brenda. Collaborano, ma non si confondono mai.
- Tutto è **PRIVATO** per impostazione predefinita. Tre stati: PRIVATO, APPROVATO PER LA PUBBLICAZIONE, PUBBLICATO. Solo Brenda cambia stato. Nessun agente, automatismo o sincronizzazione pubblica da solo.
- Nel sito pubblico vanno solo opere e materiali che Brenda ha approvato. Mai progetti riservati o inediti.
- Questo repository è pubblico: niente nomi di clienti, prospect, fornitori o collaboratori, niente strategie, niente chiavi. Eccezione decisa da Brenda: i fornitori che lei ha scelto di nominare sulle pagine pubbliche (per esempio su Convivio) restano, e non si tolgono. Vale anche per i commenti nel codice e per i messaggi di commit.
- Il sito non legge mai le tabelle private. Può solo **inviare** una richiesta, quando il visitatore lo decide, a un endpoint dedicato con validazione, antispam e limite di richieste.
- La schermata di login non basta come prova: dopo ogni modifica a database, funzioni o archivi si provano davvero gli accessi senza login.
- Ogni fase si mostra a Brenda **in anteprima** prima della pubblicazione. Le anteprime restano sul ramo di lavoro, mai su `main`.
- Le configurazioni mostrate ai visitatori sono anteprime concettuali, non progetti esecutivi né verifiche strutturali.
- Nessun servizio a pagamento e nessun abbonamento nuovo senza il sì di Brenda. Non si cambia l'identità visiva senza la sua approvazione. Non si cancellano dati o progetti.

Sito interattivo «Private Atelier», sei fasi: 1 sicurezza, 2 percorso guidato, 3 richieste verso JARVIS, 4 animazioni, 5 primo modello 3D, 6 configuratore.
