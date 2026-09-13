# Turning on real data collection (Firebase setup)

**Status: already done for this project.** The `life-path-financial-rpg`
Firebase project exists, Firestore is created (Standard edition, production
mode, `nam5`), the security rules below are published, a web app is
registered, and `.env.local` in this folder already has the config filled
in. This doc is here so you know how it's wired and can redo any of it
(new machine, rotated config, a second Firebase project, etc.).

Right now every play session lives only in that player's own browser
(localStorage) — the app has no way to add up "how many people played" or
"how much did knowledge scores improve" across real players. This wires up
a free Firestore backend so it can. Takes about 10 minutes, no credit card
required (Spark/free plan is plenty for this).

Nothing about this changes gameplay if you skip it — with no config
present, the app just keeps working exactly as it does today, logging only
to localStorage.

## 1. Create the Firebase project

1. Go to https://console.firebase.google.com and sign in with a Google account.
2. Click **Add project**, name it something like `life-path-financial-rpg`, and finish the wizard (you can decline Google Analytics — not needed here).

## 2. Create a Firestore database

1. In the left sidebar, click **Build -> Firestore Database**.
2. Click **Create database**.
3. Pick a location close to your users (any US region is fine) and start in **production mode** (the app ships its own `firestore.rules` — don't use "test mode," which leaves the database wide open).

## 3. Register a web app and get your config

1. In **Project settings** (gear icon, top left) -> **General** tab, scroll to "Your apps" and click the **</>** (web) icon.
2. Give it a nickname (e.g. "life-path-web"), skip Firebase Hosting for now, and click **Register app**.
3. You'll see a `firebaseConfig` object like:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "life-path-financial-rpg.firebaseapp.com",
     projectId: "life-path-financial-rpg",
     storageBucket: "life-path-financial-rpg.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
   };
   ```
4. Copy `.env.example` to `.env.local` in the project root and fill in each value from that object:
   ```
   cp .env.example .env.local
   ```
5. Restart `npm run dev` if it was already running (Vite only reads env files at startup).

## 4. Deploy the security rules

The rules in `firestore.rules` let the game **create** decision/summary
records but never read, update, or delete them from the client — that
keeps other players' data private even though there's no login. Deploy
them with the Firebase CLI:

```
npm install -g firebase-tools   # one-time
firebase login
firebase deploy --only firestore:rules --project <your-project-id>
```

(You can also paste the contents of `firestore.rules` directly into
**Firestore Database -> Rules** in the console and click Publish — same
result, no CLI needed.)

## 5. Verify it's working

1. Run the app (`npm run dev`), play through a few choices.
2. In the Firebase console, go to **Firestore Database -> Data**. You
   should see a `decisions` collection filling up as you make choices, and
   a `players/{sessionId}` document appear after your very first completed
   chapter — it keeps updating as you go, and gets `completed: true` once
   you reach an ending. That's deliberate: someone who closes the tab
   halfway through still shows up in the data instead of vanishing.
3. If nothing shows up, open the browser console — `firebaseClient.ts`
   logs a one-line notice in dev mode if it doesn't detect a config.

## 6. Pulling the numbers for your application

Once real players have used the app for a while:

1. In **Project settings -> Service accounts**, click **Generate new
   private key**. Save the downloaded file as `serviceAccountKey.json` in
   the project root (it's already gitignored — never commit this file, it's
   a real admin credential, unlike the web config above).
2. `npm install` (installs `firebase-admin`, already added as a dev
   dependency).
3. `npm run stats`

That prints total decisions logged, unique players, completion rate, and
the average knowledge-gain figure straight from the aggregated data —
exactly the kind of number to cite as evidence of measurable impact.

## Deploying the game itself

This only sets up data collection — it doesn't put the game on the
internet. Any static host works well with a Vite app (Vercel, Netlify,
Firebase Hosting itself, GitHub Pages): `npm run build` produces a `dist/`
folder to deploy. Ask if you'd like help with that next.
