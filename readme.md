# DEVILAATOR

Static DEVILAATOR website for showcasing projects, APK downloads and contact functionality.

[https://devilaator.ee](https://devilaator.ee)

## Stack

- HTML, CSS and JavaScript
- GitHub Pages
- Supabase (contact messages, admin authentication and Edge Function)
- Resend (outgoing admin replies via the Edge Function)

## Projects

- QUIT30 — Android app, testing
- STEADY HAND — Android game, testing
- LOLL ÄPP — upcoming
- ELVA POKSIKLUBI — upcoming

## Structure

- `index.html` — homepage and project grid
- `quit30.html`, `steady-hand.html` — project pages
- `admin.html` — separate admin inbox
- `css/` — styles
- `js/` — project cards, contact form and admin code
- `img/` — images
- `downloads/` — APK files

## Local testing

```sh
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Contact / Admin

The contact form inserts messages into Supabase. The separate admin inbox uses Supabase Auth. Outgoing replies call a Supabase Edge Function that uses Resend.

## Security

Secrets are not stored in browser-facing code or committed to the repository. The browser uses a Supabase publishable key; server-side credentials belong in the Edge Function configuration.

## Deployment

The static site is deployed with GitHub Pages at https://devilaator.ee.

## License

No public open-source license is currently provided.
