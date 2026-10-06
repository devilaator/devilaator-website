# DEVILAATOR

Static DEVILAATOR website for showcasing projects, APK downloads and contact functionality.

https://devilaator.ee

## Stack

- HTML, CSS and JavaScript
- GitHub Pages
- Supabase — contact messages, admin authentication and Edge Functions
- Resend — outgoing admin replies through a Supabase Edge Function

## Projects

- QUIT30 — Android app, testing
- STEADY HAND — Android game, testing
- KILBIHALDUS — electrical panel management application, in development
- ELVA POKSIKLUBI — upcoming

## Structure

- `index.html` — homepage and project grid
- `quit30.html` — QUIT30 project page
- `steady-hand.html` — STEADY HAND project page
- `admin.html` — separate admin inbox
- `css/` — styles
- `js/` — project cards, contact form and admin functionality
- `img/` — images
- `downloads/` — downloadable files

## Local testing

Run a local web server from the project directory:

```sh
python -m http.server 8000