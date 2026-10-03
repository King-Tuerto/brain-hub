# Brain Hub — Start here

*¿Prefieres español?* → **[EMPIEZA-AQUI.md](EMPIEZA-AQUI.md)**

**Time: about 15 minutes.** You can do every step on your phone.

By the end you'll have your own Brain Hub: a personal app with AI tools for
class, job hunting and research. Your first job with it is a sourced strategic
analysis of a real company.

---

## Read this first

**Stuck? Ask your AI, not the person who sent you this.**

Open Claude, ChatGPT or Gemini. Paste this whole guide in, then describe
exactly what's on your screen. For example:

- *"I'm on step 3 and I don't see a Pages option. Here's a screenshot."*
- *"What does 'fork' mean? Is it safe?"*
- *"The hub says 'Could not reach that brain'. What do I do?"*

There are no stupid questions, and asking can't break anything.

---

## What you need

- **A free GitHub account.** Sign up at [github.com](https://github.com) if
  you don't have one.
- **An AI app you already use:** Claude, ChatGPT or Gemini. The free version
  works.
- **Optional: an Open Brain.** If you built one with
  [Open Brain Express](https://github.com/King-Tuerto/open-brain-express),
  the hub can use your notes and save your work into it. Without one,
  everything still works; you just download results instead.

You do **not** need to install anything or pay for anything.

---

## Step 1 — Make your own copy (2 minutes)

1. Sign in to GitHub.
2. Open **[github.com/King-Tuerto/brain-hub](https://github.com/King-Tuerto/brain-hub)**.
3. Tap **Fork**, then **Create fork**. Keep the name `brain-hub`.

You now have your own copy at `github.com/YOUR-USERNAME/brain-hub`. It's
yours: your tools go in it, and you get updates from it (Step 6).

> On a phone, if you can't see **Fork**, open your browser menu and choose
> **Desktop site**.

---

## Step 2 — Turn on your website (2 minutes)

1. On **your copy**, tap **Settings**, then **Pages**. Pages is in the left
   menu; on a phone, scroll down.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Set **Branch** to **main** and the folder to **/ (root)**, then tap
   **Save**.
4. Wait one or two minutes, then refresh the page. A box appears: *"Your site
   is live at…"*

Your hub's address is:

**`https://YOUR-USERNAME.github.io/brain-hub/`**

Write it down. That's your app.

---

## Step 3 — Put it on your phone (1 minute)

Open your hub's address on your phone.

- **iPhone (Safari):** tap the **Share** button, then **Add to Home Screen**.
- **Android (Chrome):** tap the **⋮** menu, then **Install app** (or **Add to
  Home screen**).

From now on, open Brain Hub from its icon.

> **iPhone:** the home-screen app keeps its own settings, separate from
> Safari. Do Step 4 **in the home-screen app**, not in Safari.

---

## Step 4 — Set it up (3 minutes)

The hub asks three things, one screen at a time.

1. **Your name.** It's just for the greeting.
2. **Your brain.**
   - **No Open Brain?** Tap **Skip — I don't have a brain yet**.
   - **Have one?** Enter its address (`https://….supabase.co`), its
     **public** key (it starts `sb_publishable_` or `eyJ`), and the email
     and password you sign in to your brain with.
     - The hub first checks that your brain is locked to you. If it says
       your brain is **open**, follow its link to upgrade before going on.
     - **Never paste your secret key** (it starts `sb_secret_`).
3. **How tools should run.** Choose **Manual (copy and paste)** and pick the
   AI app you use.
   - **Manual is free:** it uses the AI app you already have, including its
     web search.
   - **Automatic** needs an OpenRouter key and is optional; you can switch
     later in **Settings**.

Tap **Finish**. You'll see your Home screen with your tools.

> **Your keys and password stay on your phone.** They're never saved to
> GitHub, and your password isn't stored at all.

---

## Step 5 — Your first company analysis (5–10 minutes)

1. On Home, tap **Company Analysis**.
2. Fill in:
   - **Company:** a real company you're curious about, with its ticker if it
     has one, e.g. *Costco Wholesale (NASDAQ: COST)*.
   - **Business unit for the environmental scan:** leave it blank, or name
     one.
   - **What is this for?** Pick one.
3. Tap **Run**. The hub writes a detailed prompt for you.
4. Tap **Copy prompt**, then **Open Claude** (or your app).
5. In your AI app, **paste** and send. The answer takes a minute or two,
   because it's searching the web.
6. When it's done, **copy the whole answer**. Most apps have a copy button
   under the answer.
7. Come back to Brain Hub. Tap **Paste answer**, or long-press in the box and
   choose **Paste**. Then tap **Use this answer**.

You'll see the analysis, and a **source check** under its title. Every fact
should have a link. If some don't, the hub lists them so you know which to
double-check.

**Want to be sure?** Tap **Check this answer**.
1. The hub writes a second prompt that asks your AI to open every link and
   confirm it says what the analysis claims.
2. Copy it, paste it into your AI app, and paste the reply back.
3. You get a score out of 100 and a list of exact fixes.

**Keep it:**
- **Save to brain** (if you connected one): saves a short summary you can
  search later, with the full report attached. Next time you analyse the
  same company, the hub finds your earlier work.
- **Download** saves the report as a file.

**That's it. You've done a sourced company analysis.**

---

## Step 6 — Getting updates

When new tools or fixes come out, your copy can catch up:

1. Open your copy on GitHub.
2. Tap **Sync fork**, then **Update branch**.

Your site refreshes on its own a minute later.

**Never edit the `core/` folder.** That's what keeps updates conflict-free.

---

## Make your own tools

Want a tool for something else, like a study planner, networking prep or
essay feedback?

1. Open your AI app and paste in
   **[WIDGET-GUIDE.md](WIDGET-GUIDE.md)** from your copy.
2. Ask for the tool you want.
3. Paste what it gives you into Brain Hub → **Add a tool**. The hub shows
   exactly what the tool can do before you install it.
4. To keep it on every device, save the file into the `plugins/` folder of
   your copy on GitHub. The hub finds it there by itself.

---

## If something goes wrong

| What you see | What to do |
|---|---|
| Your site address shows "404" | Wait two more minutes after Step 2. Check that Pages is set to **main** and **/ (root)**. |
| "Could not reach that brain" | Check the address starts with `https://` and ends with `.supabase.co`. |
| "This brain is open" | Your brain needs its security upgrade first. Follow the link the hub shows. |
| "Your brain session ended" | Tap **Sign in again**. |
| "Paste answer" does nothing | Long-press in the answer box and choose **Paste**. |
| Many claims "have no source" | Ask your AI to *"add a source link to every fact, or mark it [unverified]"*, then paste the new answer. |
| Anything else | Paste this guide into your AI, describe your screen, and ask. |
