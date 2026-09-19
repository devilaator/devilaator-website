# DEVILAATORi avaldamine

Avalik aadress: https://devilaator.ee. Failid on mõeldud domeeni juurkataloogis serveerimiseks.

- Avalda HTML, css/, js/, img/, favicon.svg, robots.txt ja sitemap.xml HTTPS-i kaudu.
- Seadista veebimajutus tagastama tundmatute aadresside korral 404.html koos HTTP staatusega 404. Ära suuna tundmatuid aadresse avalehele staatusega 200.
- Suuna alternatiivsed domeenid ja HTTP päringud püsivalt aadressile https://devilaator.ee. Avalehe kanooniline aadress on /.
- Kontrolli pärast avaldamist robots.txt, sitemap.xml-i ning jagamispildi /img/monkey.png kättesaadavust.
- Kontaktivorm valideerib välju ainult brauseris ega saada andmeid. Saatmise liidestuskoht asub js/main.js lõpus. Enne saatmise avamist lisa serveripoolne valideerimine, päringute piiramine ja veakäsitlus ning uuenda vormi teadet ja privacy.html-i tegeliku andmetöötluse järgi.
- Täpsusta privacy.html-is veebimajutuse logide kasutamine ja säilitamine vastavalt valitud teenuse seadistusele.

Leht ei vaja ehitustööriistu ega väliseid JavaScripti teeke. favicon.svg on asendatav gradientvärvides D-märk.
