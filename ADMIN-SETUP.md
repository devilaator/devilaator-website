# DEVILAATOR postkast

Ava avaldamise järel https://devilaator.ee/admin.html. Avalikus menüüs ega sitemap'is admin-linki pole. Leht on märgitud noindex, kuid ligipääsu kaitseb Supabase RLS, mitte peidetud URL.

Ühendusandmed tulevad endiselt js/main.js olemasolevatest NEXT_PUBLIC_SUPABASE_URL ja NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY väärtustest. Neid pole dubleeritud ega muudetud. Admin kasutab sama CDN-klienti ja eraldi Auth-seanssi sessionStorage'is; kontaktvorm jääb anonüümseks INSERT-kliendiks.

## Supabase'i seadistamine

1. Loo administraatori e-posti/parooliga kasutaja Supabase Authentication → Users kaudu. Veebilehel registreerimisvõimalust pole. Kui projektis pole avalikku registreerimist vaja, keela Auth-seadetes uute kasutajate registreerimine.
2. Märgi **ainult administraatori** serveri hallatavasse `app_metadata` objekti `contact_admin: true`. Ära kasuta selleks kasutaja muudetavat `user_metadata` välja. Seda saab teha Supabase'i haldusliidese või alloleva SQL-iga; brauserisse pole haldusvõtit vaja.
3. Lisa tabelile administraatori SELECT- ja UPDATE-poliitikad. Allolev SQL on käsitsi ülevaatamiseks ja Supabase SQL Editoris käivitamiseks; veebileht seda ei käivita. Asenda UUID oma loodud administraatori Auth kasutaja ID-ga.

```sql
-- Asenda allolev UUID oma administraatori Auth kasutaja ID-ga.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"contact_admin": true}'::jsonb
where id = '00000000-0000-0000-0000-000000000000'::uuid;

alter table public.contact_messages enable row level security;

-- Säilita olemasolev anon INSERT policy ja INSERT grant.
revoke select, update, delete on public.contact_messages from anon;
revoke select, update, delete on public.contact_messages from public;
revoke update on public.contact_messages from authenticated;
grant select on public.contact_messages to authenticated;
grant update (status) on public.contact_messages to authenticated;

create policy contact_admin_select on public.contact_messages
for select to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'contact_admin') = 'true');

create policy contact_admin_update on public.contact_messages
for update to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'contact_admin') = 'true')
with check ((auth.jwt() -> 'app_metadata' ->> 'contact_admin') = 'true');

-- Kaitse ka juhul, kui varem eksisteerib laiem authenticated policy.
create policy contact_admin_select_guard on public.contact_messages
as restrictive for select to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'contact_admin') = 'true');

create policy contact_admin_update_guard on public.contact_messages
as restrictive for update to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'contact_admin') = 'true')
with check ((auth.jwt() -> 'app_metadata' ->> 'contact_admin') = 'true');
```

SQL on mõeldud ühekordseks lisamiseks; kui samanimelised poliitikad on juba olemas, vaata need üle. Kontrolli ka olemasolevaid veerupõhiseid grante: ainult `status` peab olema admini poolt muudetav. Pärast app_metadata muutmist logi välja ja uuesti sisse, et JWT saaks uue rolli. Rolli eemaldamisel arvesta varem väljastatud JWT kehtivusajaga.

Ilma SELECT-poliitikata võib RLS tagastada tühja tulemuse, mitte HTTP viga. Postkast selgitab seda tühja tulemuse teates. Permission errori korral näidatakse veateadet. Testi eraldi anon-kasutaja ja tavalise autentitud kasutajaga, et kumbki ei saa sõnumeid lugeda ega muuta.

## Kustutamise õigus

„Kustuta” kasutab sama sisselogitud klienti ja küsib enne kinnitust. Kui DELETE-õigust veel pole, lisa Supabase SQL Editoris allolev grant ja poliitikad. See ei muuda olemasolevaid SELECT-/UPDATE-poliitikaid ega anna anon-kasutajale kustutamisõigust. Veebilehe kood ei rakenda seda SQL-i automaatselt.

```sql
grant delete on public.contact_messages to authenticated;

create policy contact_admin_delete on public.contact_messages
for delete to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'contact_admin') = 'true');

create policy contact_admin_delete_guard on public.contact_messages
as restrictive for delete to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'contact_admin') = 'true');
```

Käivita need lisad pärast eespool olevat põhiseadistust ja ainult juhul, kui samanimelisi poliitikaid veel pole. Kustutatud rea ID tagastamist kasutatakse õnnestumise kontrolliks: null kustutatud rida ei eemalda kaarti vaatest.

## Vastamine Edge Functioniga

„Vasta” avab sõnumikaardil vastusevormi ja kutsub olemasoleva Auth-seansiga funktsiooni `clever-endpoint`. JSON sisaldab ainult `to`, `name`, `subject` ja `message`. Resendi võti peab jääma Edge Functioni serveripoolsesse seadistusse; frontend seda ei kasuta.

Funktsioon peab kontrollima sisseloginud administraatori õigust serveris ja lubama brauseri CORS-päringud saidilt https://devilaator.ee. Edukas HTTP vastus tähendab frontendile edukat saatmist; saatmisvea korral tagasta veastaatus või JSON `error` / `success: false`. Pärast edukat saatmist uuendab postkast sõnumi staatuseks `replied`. Kui ainult staatuse salvestamine ebaõnnestub, näidatakse eraldi teadet ega saadeta kirja automaatselt uuesti.

## Käitumine

- Sõnumeid loetakse alles pärast Supabase Authi kinnitatud kasutaja kontrolli.
- Uusimad on ees; korraga laetakse 50 sõnumit ja lisamiseks on „Laadi rohkem”.
- Staatust muudab ainult vastav nupp. UPDATE saadab ainult `status` välja ja filtreerib sõnumi `id` järgi.
- Sõnumi sisu kuvatakse tekstina, mitte HTML-ina. E-post avab kohaliku meiliprogrammi.
- Väljalogimisel eemaldatakse sõnumid kohe, katkestatakse pooleliolevad postkastipäringud ja lõpetatakse selle vahekaardi seanss.

Supabase'i juhised: https://supabase.com/docs/guides/database/postgres/row-level-security
