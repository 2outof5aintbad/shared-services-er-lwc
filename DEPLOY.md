# CCBSS ER Case Search — Setup Guide

## What you're installing

A new app called **CCBSS ER** that lets HR and ER staff search employee relations cases, view corrective action history, and get an AI-generated summary of search results — all inside Salesforce.

**Before you start, make sure you have:**
- [ ] System Administrator profile in your Salesforce sandbox
- [ ] The zip file: `ccbss-er-lwc-20260911.zip`
- [ ] About 15 minutes

---

## Step 1 — Open Workbench and log in

Workbench is a free Salesforce tool that runs in your browser. You don't need to install anything.

1. Open a new browser tab and go to **workbench.developerforce.com**
2. On the login page, change the **Environment** dropdown from `Production` to **Sandbox**
3. Leave everything else as-is
4. Check the box to accept the terms
5. Click **Login with Salesforce**
6. Log in with your **sandbox** username and password when prompted

> **You'll know it worked when** you see a Workbench homepage with your org name and username in the top-right corner.

---

## Step 2 — Upload and deploy the package

1. In the Workbench menu bar at the top, click **Migration**, then click **Deploy**
2. Click **Choose File** and select **`ccbss-er-lwc-20260911.zip`**
3. Check the box labeled **Single Package**
4. Click **Next**
5. Click **Deploy**

The progress bar will run for about 1–2 minutes.

> **You'll know it worked when** you see a green **Succeeded** message with 0 errors. If you see any red errors, take a screenshot and set it aside — do not proceed to the next step.

---

## Step 3 — Make the app visible

The app was installed, but it needs to be activated before users can see it in their App Launcher.

1. Go to your Salesforce sandbox and click the **gear icon** in the top-right corner, then click **Setup**
2. In the Quick Find search box (left side), type `Lightning App Builder` and click the result
3. Find the page called **CCBSS ER Case Search** in the list and click **Edit**
4. In the top-right corner of the editor, click the **Activation...** button
5. Click the **App** tab
6. Click **Assign to Apps**
7. Check the box next to **CCBSS ER**
8. Click **Save**, then click **Finish**

> **You'll know it worked when** you return to the Lightning App Builder list and the CCBSS ER Case Search page shows as **Active**.

---

## Step 4 — Give users access

Users won't see the app until you assign them access. You can do this one person at a time or for a group.

1. In Setup, clear the Quick Find box and type `Permission Sets`, then click the result
2. Click **CCBSS ER Access** in the list
3. Click **Manage Assignments**
4. Click **Add Assignments**
5. Check the box next to each person who should have access
6. Click **Assign**

> **You'll know it worked when** the user's name appears in the assignments list.

---

## Step 5 — Test it

1. Click the **App Launcher** — the grid of 9 dots in the top-left corner
2. In the search bar that appears, type `CCBSS ER` and click the result
3. You should land on the ER Case Search page
4. Type a keyword into the search box and click **Search**

> **You'll know it worked when** you see case results appear on the left and an "Agentforce Summary" panel populate on the right.
>
> **Note:** You'll need ER cases already in the system for results to appear. If the sandbox is empty, the search will return no results — that's expected, not a problem.

---

## Step 6 — Turn on AI-powered summaries *(optional)*

Out of the box, the Agentforce Summary panel uses a built-in analytics engine to write a summary of your search results. If your org has **Einstein for Service** included in your Salesforce contract, you can upgrade this to use a true AI language model that writes more natural, nuanced summaries.

**Not sure if you have it?** Look for "Einstein for Service" or "Einstein 1 Service Cloud" on your Salesforce contract. If you're not sure, skip this step — the tool works great without it.

### How to turn it on

1. In Setup, type `Einstein Generative AI` in Quick Find and click the result
2. If you see a toggle, flip it to **Enabled** and click **Save**
   - If you don't see this option at all, your org doesn't have the license yet — skip this step for now
3. That's it. No additional deployment needed.

Once enabled, here's what happens when you run a search:
- Results appear immediately with the standard summary
- 2–4 seconds later, the summary updates with an Einstein-generated analysis
- If Einstein doesn't respond, the standard summary stays — nothing breaks

### Something not working?

| What you're seeing | What to try |
|--------------------|-------------|
| Summary never updates after a few seconds | Einstein Generative AI may not be enabled — go back to Step 6 and check the toggle |
| You don't see the `Einstein Generative AI` option in Setup | Your org doesn't have the license yet — the standard summary will continue to work |
| Users see the standard summary but not the AI version | Assign the **Einstein** permission set to those users in Setup → Permission Sets |

---

You're all set.
