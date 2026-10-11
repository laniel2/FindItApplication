# FindIt — school lost & found app

A Vue 3 + Vite app. **No database and no server needed**: everything (accounts, posts, photos)
is saved in your browser's local storage.

Students sign up with a Gmail address, post lost or found items with a drag-and-drop photo,
search and filter posts, and manage a profile with a profile picture.

---

## Step-by-step setup

### 1. Install Node.js (one time)
Download the **LTS** version (18 or newer) from https://nodejs.org and install it.
Check it worked: open a terminal and run

```bash
node -v
```

### 2. Extract the project
Right-click `findit.zip` → **Extract All**. You will get a folder named `findit` that contains a `frontend` folder.

### 3. Open a terminal in the `frontend` folder
- **VS Code:** File → Open Folder → choose `findit/frontend`, then Terminal → New Terminal.
- **Windows:** open the `frontend` folder, click the address bar, type `cmd`, press Enter.

### 4. Install and run

```bash
npm install
npm run dev
```

Open the address it prints, normally **http://localhost:5173**.

### 5. Try it
1. Click **Create an account** and sign up with a Gmail address (`name@gmail.com`).
2. On **My profile**, drag a photo onto the circle to set your profile picture, then **Save profile**.
3. Go to **Post an item**, drop a photo, fill the form, and post.
4. Open **Browse** to search and filter. Use the card buttons to edit, mark as returned, or delete your own posts.
5. Open **Vue concepts** to see where every required topic lives in the code.

### Next time
Open a terminal in `frontend` and run `npm run dev`. (No need to run `npm install` again.)

---

## Good to know
- **Data is per browser.** Posts you make in Chrome will not appear in Edge or on another computer.
  To see data from two students, create two accounts in the same browser and log in and out.
- **To see the saved data:** press F12 → *Application* tab → *Local Storage* → `http://localhost:5173`.
  Look for `findit.db.users` and `findit.db.items`.
- **To reset everything:** in that same panel, right-click → *Clear*.
- **Storage limit:** browsers allow about 5 MB of local storage. Photos are shrunk automatically,
  so roughly 30 to 40 posts with photos fit. If it is full you will see "Browser storage is full";
  delete old posts or use smaller photos.
- **Login:** accounts use a Gmail address and a password. This is a learning project: passwords are only
  lightly protected, so do not use a real password. It is not the "Sign in with Google" popup.

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm` is not recognized | Reinstall Node.js, then close and reopen the terminal. |
| Port 5173 is busy | Vite will offer another port. Use the address it prints. |
| Blank page after a code change | Stop with `Ctrl + C` and run `npm run dev` again. |
| I forgot my password | Clear local storage (see above) and sign up again. |

---

## Where each required topic is in the code

| Topic | Files (inside `src/`) |
|---|---|
| **Form handling** | `composables/useForm.js` (values, rules, touched, submit), `components/FormField.vue`, `views/LoginView.vue`, `RegisterView.vue`, `ItemFormView.vue`, `ProfileView.vue` |
| **Emitting events** | `components/ItemCard.vue` (`open`, `edit`, `toggle`, `delete`), `ConfirmModal.vue` (`confirm`, `cancel`), `ItemFilters.vue` and `ImageDropzone.vue` (`update:modelValue`) |
| **Parent-child state** | `views/ItemsView.vue` owns the state and passes it down by props to `ItemFilters`, `ItemCard`, `StatsPanel`; children answer with events |
| **Route configuration** | `router/index.js`: nested routes, lazy loading, dynamic `:id`, `props: true`, `meta`, global guards, redirect, 404 |
| **Composition API vs Options API** | Composition: every `<script setup>` file. Options: `components/StatsPanel.vue` and `CounterOptions.vue`. Side by side: `CounterComposition.vue` vs `CounterOptions.vue` (live on the **Vue concepts** page) |
| **Mixins and composables** | Mixins: `mixins/formatMixin.js`, `counterMixin.js`. Composables: `composables/useFormat.js`, `useCounter.js`, `useForm.js`, `useAuth.js`, `useItems.js`, `useLocalStorage.js`, `useDebounce.js`, `useToast.js` |
| **Local storage** | `composables/useLocalStorage.js` and `api/localDb.js`. Used for the whole database (accounts and posts), the login session, last email, browse filters and the unfinished post draft |
| **CRUD** | `composables/useItems.js` + `api/localDb.js`. Create, read, update (edit + returned/reopen), delete items; update profile |

## Project structure

```
frontend/src/
  api/
    http.js        the one function the app uses to get/save data
    localDb.js     the "database" (localStorage): users + items
  assets/          styles
  components/      reusable pieces (ImageDropzone, ItemCard, ConfirmModal...)
  composables/     Composition API logic
  mixins/          Options API logic
  router/          route configuration
  utils/           helpers (formatting, image compression, constants)
  views/           pages
```

Build for production: `npm run build` (output in `frontend/dist`).
