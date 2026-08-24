# 2Gym — Project Brief & Build Plan για Claude Code

Αντιγράψε αυτό ολόκληρο σαν πρώτο μήνυμα σε Claude Code (ή βάλτο ως `CLAUDE.md` στη ρίζα του repo). Είναι γραμμένο ώστε να δουλεύουν **2 άτομα ταυτόχρονα** χωρίς να πατάνε ο ένας πάνω στον άλλον.

---

## 0. Ρόλοι ομάδας

- **Petros** — advanced, αναλαμβάνει backend (Laravel API, DB schema, auth, business logic, deployment) + τα πιο σύνθετα frontend κομμάτια (search/map, partner dashboard, admin panel logic).
- **Sozos** — λιγότερο advanced, αναλαμβάνει **αυτοτελή, καλά καθορισμένα UI κομμάτια** στο React Native πάνω σε API που θα έχει ήδη οριστεί από τον Petros (π.χ. static/list/detail screens, components, styling). Δεν αγγίζει backend ούτε αρχιτεκτονικές αποφάσεις.

Η βασική αρχή που κρατάει το project χωρίς conflicts: **κανείς δεν δουλεύει σε κομμάτι που εξαρτάται από κάτι που δεν υπάρχει ακόμα.** Ο Petros πάντα προηγείται κατά ένα βήμα (schema/API/contract πρώτα), ο Sozos ακολουθεί με UI που καταναλώνει έτοιμο, σταθερό contract.

---

## 1. Tech stack (αποφασισμένο, μη το αλλάξεις)

- **Backend:** Laravel (τελευταία LTS), MariaDB, Laravel Sanctum για auth (API tokens, mobile-friendly)
- **Admin/Partner panel:** Laravel Filament (γλιτώνει βδομάδες σε σχέση με custom build)
- **Mobile app:** React Native (Expo, όχι bare workflow — πιο γρήγορο setup, ok για MVP)
- **Push notifications:** Firebase Cloud Messaging (FCM) — **μόνο** για push delivery, όχι Firebase DB/Auth/Storage
- **Maps:** Google Maps API
- **Repo:** ένα monorepo με δύο φακέλους (`/backend`, `/mobile`) ή δύο ξεχωριστά repos κάτω από τον ίδιο οργανισμό — απόφασέ το στο βήμα 2 (πρόταση: monorepo, πιο εύκολο για coordination με 2 άτομα)

---

## 2. Βήμα 1 — Αρχικό scaffold (το κάνει ΜΟΝΟ ο Petros, πριν μπει ο Sozos)

Ζήτα από τον Claude Code να κάνει, με αυτή τη σειρά, σε ένα καθαρό repo:

1. Δημιουργία repo structure:
   ```
   /backend   (Laravel API)
   /mobile    (React Native/Expo app)
   /docs      (API contract, ERD, sprint tracking)
   README.md
   .gitignore
   ```
2. `git init`, πρώτο commit "chore: initial monorepo structure"
3. Laravel install μέσα στο `/backend`, σύνδεση με MariaDB (local dev), βασικό `.env.example`
4. Πλήρες **DB schema migration** για όλους τους πίνακες που περιγράφονται στην ιδέα: `users`, `gyms`, `trainers`, `shops`, `offers`, `reviews`, `categories`, `discount_codes`, `notifications`, `statistics`, `subscription_plans` — με σωστά relationships/foreign keys (πολλά από αυτά είναι polymorphic: gym/trainer/shop μπορούν όλα να έχουν offers, reviews, subscription plan — σκέψου polymorphic relations στο Laravel αντί για ξεχωριστά join tables παντού)
5. Expo React Native app scaffold μέσα στο `/mobile`, με navigation (React Navigation) skeleton και folder structure: `/screens`, `/components`, `/api`, `/navigation`
6. Ένα αρχείο `/docs/api-contract.md` — άδειο ακόμα, θα γεμίζει σταδιακά σε κάθε sprint με τα endpoints που φτιάχνει ο Petros, ΠΡΙΝ ο Sozos ξεκινήσει να τα καταναλώνει
7. Δημιουργία branches: `main` (protected, μόνο μέσω PR), `develop` (integration branch)
8. Commit + push, tag `v0.1-scaffold`

**Κανόνας:** ο Sozos δεν κάνει `git clone` πριν ολοκληρωθεί και mergαριστεί αυτό το βήμα στο `develop`.

---

## 3. Git workflow για όλα τα sprints (και οι δύο το ακολουθούν)

- Branch naming: `sprint{N}-{feature}-{name}` π.χ. `sprint2-search-petros`, `sprint2-profile-ui-sozos`
- Κάθε άτομο δουλεύει ΜΟΝΟ σε φακέλους/αρχεία που του ανήκουν σε αυτό το sprint (λίστα παρακάτω ανά sprint) — αυτό είναι που αποτρέπει merge conflicts, όχι το git από μόνο του
- Commit μικρά και συχνά, με conventional commits (`feat:`, `fix:`, `chore:`)
- Πριν ανοίξεις νέο branch: `git pull origin develop` πρώτα
- PR προς `develop`, όχι απευθείας commit σε `develop` ή `main`
- Ο Petros κάνει review σε ΟΛΑ τα PR του Sozos πριν merge (είναι ο πιο advanced — μαθαίνει επίσης τον Sozos στη διαδικασία)
- Merge σε `main` μόνο στο τέλος κάθε sprint, όταν και τα δύο κομμάτια του sprint έχουν ολοκληρωθεί και δουλεύουν μαζί

---

## 4. Sprints — ανάθεση εργασιών, με σειρά εξάρτησης

### Sprint 1: Login/Register
- **Petros:** Laravel Sanctum auth API (register, login, logout, token refresh, password reset), migrations για `users` table (ρόλοι: user/gym_owner/trainer/shop/admin), γράφει το contract στο `/docs/api-contract.md`
- **Sozos:** React Native screens: Login screen UI, Register screen UI, form validation (client-side μόνο), σύνδεση με τα endpoints ΑΦΟΥ τα δώσει ο Petros (θα του δώσεις έτοιμα Postman/curl examples)
- Εξάρτηση: Sozos ξεκινά UI του **αφού** το contract είναι γραμμένο (μπορεί να φτιάξει static screens παράλληλα με mock data, μετά συνδέει το πραγματικό API)

### Sprint 2: Home, Search, Categories
- **Petros:** Search API (filters, location-based query με lat/lng), Categories API (CRUD), map integration logic
- **Sozos:** Home screen UI, Categories list UI (static components, chips/grid), search bar UI component (χωρίς τη λογική filtering — απλά καλεί το API endpoint που θα του δώσει ο Petros)

### Sprint 3: Profiles (Gym/Trainer/Shop)
- **Petros:** Profile API endpoints (GET gym/:id, GET trainer/:id, GET shop/:id), image upload handling (Laravel storage)
- **Sozos:** Profile screen UI (ίδιο layout template και για τα 3 — gym/trainer/shop, με μικρές παραλλαγές), gallery/photo component

### Sprint 4: Offers & QR Codes
- **Petros:** Offers API (CRUD, expiry logic), QR/discount code generation (backend library, π.χ. `simplesoftwareio/simple-qrcode`), redemption/validation endpoint
- **Sozos:** Offers list UI, Offer detail screen, "Saved Deals" screen (favorites — απλό local/API toggle)

### Sprint 5: Partner Dashboard
- **Petros:** ΟΛΟΚΛΗΡΟ αυτό το sprint — Filament panel για gym/trainer/shop owners (δημιουργία προφίλ, upload φωτο, δημιουργία προσφορών/QR, βασικά στατιστικά). Πολύ σύνθετο για τον Sozos σε αυτή τη φάση.
- **Sozos:** αν έχει χωρήσει, βοηθάει με μικρά fixes/polish σε προηγούμενα sprints (bugs, UI tweaks) ενώ ο Petros δουλεύει μόνος του εδώ.

### Sprint 6: Admin Panel
- **Petros:** Filament admin panel (approval queue για νέες εγγραφές, moderation)
- **Sozos:** ίδιο όπως sprint 5 — πολύ σύνθετο, μένει εκτός. Μπορεί να αναλάβει copy/content/testing.

### Sprint 7: Testing
- **Και οι δύο:** manual QA σε όλο το app, ο Sozos καταγράφει bugs σε issues, ο Petros διορθώνει τα πιο σύνθετα, ο Sozos μπορεί να πιάσει απλά UI fixes

---

## 5. Οδηγία προς Claude Code — πώς να δουλεύει σε κάθε sprint

Σε κάθε νέο sprint, δώσε στο Claude Code:
1. Ποιο sprint είναι
2. Ποιος από τους δύο δουλεύει (Petros ή Sozos) — έτσι ξέρει το scope/complexity που να στοχεύσει
3. Παράθεσε το τρέχον `/docs/api-contract.md` σαν context αν είναι το frontend κομμάτι
4. Ζήτα ρητά: "μην αγγίξεις αρχεία εκτός του scope αυτού του sprint/ατόμου"
5. Στο τέλος του sprint, ζήτα να ενημερωθεί το `/docs/api-contract.md` με ό,τι νέο endpoint προστέθηκε, ώστε το επόμενο sprint να ξεκινά με σωστό context

---

## 6. Δεν κόβουμε features από το MVP

Το MVP παραμένει όπως στο αρχικό doc: Login/Register, Search, Categories, Map, Profiles (Gym/Trainer), Προσφορές, QR Codes, Reviews, Admin Panel. Χωρίς Online Payments / Bookings / Membership Management σε αυτή τη φάση (έρχονται σε επόμενη έκδοση).