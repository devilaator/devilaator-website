# Elva Poksiklubi fotod

Lehe põhitaust kasutab jõudluse huvides faili `background.webp` ning jätab
`background.png` faili varuvariandiks. CSS lisab õrna tumeda overlay, kasutab
`cover`-suurust ja joondab pildi ülaserva järgi.

Päris treeneri- ja galeriifotod pole veel lisatud. Leht ei päri neid puuduvaid
faile ning kuvab nende asemel neutraalsed pildikohad.

Planeeritud failid:
- `karl-komlev.jpg` — Karl Komlevi portree, eelistatult 4:5.
- `training-01.jpg`, `training-02.jpg`, `training-03.jpg` — galerii, eelistatult 4:3.

## Portree ja galerii

Asenda portree `.elva-photo-empty` pildiga, säilitades `figcaption` elemendi.
Galerii nupule lisa pisipilt ning `data-full-src` ja `data-alt` väärtused,
et olemasolev lightbox avaks täissuuruses foto. Näide:

```html
<button class="elva-gallery-item" type="button"
        data-full-src="img/elva-poksiklubi/training-01.jpg"
        data-alt="[Kirjelda tegelikku fotot]">
  <img src="img/elva-poksiklubi/training-01.jpg"
       alt="[Kirjelda tegelikku fotot]" loading="lazy" decoding="async"
       width="1200" height="900">
</button>
```

Kasuta iga foto tegelikku sisu kirjeldavat alt-teksti. Portree ja galerii mõõdud,
`object-fit` ning portree fookuspunkt on CSS-is ette valmistatud. Lisa viited
alles siis, kui failid on olemas, et katkisi pilte ei tekiks.
