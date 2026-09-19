# DEVILAATORi avaldamine

Avalik aadress: https://devilaator.ee. Failid on mõeldud domeeni juurkataloogis serveerimiseks.

- Avalda HTML, css/, js/, img/, favicon.svg, robots.txt ja sitemap.xml HTTPS-i kaudu.
- Seadista veebimajutus tagastama tundmatute aadresside korral 404.html koos HTTP staatusega 404. Ära suuna tundmatuid aadresse avalehele staatusega 200.
- Suuna alternatiivsed domeenid ja HTTP päringud püsivalt aadressile https://devilaator.ee. Avalehe kanooniline aadress on /.
- Kontrolli pärast avaldamist robots.txt, sitemap.xml-i ning jagamispildi /img/monkey.png kättesaadavust.
- Kontaktivormi aktiveerimiseks täida js/main.js alguses NEXT_PUBLIC_SUPABASE_URL ja NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Need on brauseris avalikud väärtused; .env faili ega ehitussammu pole vaja. Kasuta ainult projekti publishable key'd, mitte database passwordit, secret key'd ega service_role key'd.
- Vorm kasutab CDN-ist Supabase JS v2 klienti ja teeb public.contact_messages tabelisse ainult INSERT päringu väljadega name, email ja message. status peab saama andmebaasis vaikeväärtuse new; id ja created_at peavad samuti tekkima automaatselt. Säilita RLS ja anon kasutaja ainult INSERT policy. Andmete tagasilugemist ei kasutata.
- Täpsusta privacy.html-is veebimajutuse logide kasutamine ja säilitamine vastavalt valitud teenuse seadistusele.

Leht ei vaja npm-i ega ehitustööriistu. Kontaktivormi Supabase JS klient laaditakse CDN-ist. favicon.svg on asendatav gradientvärvides D-märk.
