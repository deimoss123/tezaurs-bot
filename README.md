# Neoficiālais Tēzaura Discord bots

Visi dati pieder [Tēzauram](https://tezaurs.lv/).

Projekts izmanto tēzaura [atvērtos datus](https://repository.clarin.lv/repository/xmlui/handle/20.500.12574/92).

# Kā palaist botu?

Pirms sāc, pārliecinies, ka tev ir ieinstalēts Node.js, bez tā nekas nestrādās.

## 1. Izveido jaunu discord botu

- Atver pārlūkā https://discord.com/developers/applications
- New Application > Bot > Reset Token > Copy
  - Šeit tu iegūsti savu Discord bota tokenu, **saglabā to, jo tas būs nepieciešams vēlāk**
- Uzaicini botu uz savu serveri
  - OAuth2 > URL Generator
  - No Scopes izvēlies "applications.commands" un "bot"
  - Atver linku kas ir parādīts apakšā un pievieno botu savam serverim

## 2. Izveido PostgreSQL datubāzi

- Šo var izdarīt vai nu lokāli, vai arī mākonī (iesaku [railway.app](https://railway.app/))
- Iegūsti DB savienošanās URL, **kas būs nepieciešams vēlāk**
- Datubāze tiks izmantota lai glabātu tēzaura datus, kas tiks pārveidoti no xml faila

Datubāze ir palaižama lokāli caur Docker ar komandu

```sh
docker-compose up -d postgres
```

Pēc noklusējuma datubāzes url būs `postgres://tezaursbot@127.0.0.1:5432/tezaurs`

## 3. Koda daļa

### 3.1 Noklonē Github repo

```sh
git clone https://github.com/deimoss123/tezaurs-bot
cd tezaurs-bot
```

### 3.2 Atzippo `tezaurs_2023_4_tei.zip` failu

**Linux**

```sh
unzip tezaurs_2023_4_tei.zip
```

**Windows (PowerShell)**

```sh
Expand-Archive ./tezaurs_2023_4_tei.zip ./
```

Ja izmanto citu atzippošanas veidu, tad `tezaurs_2023_4_tei.xml` failam pēc atzippošanas ir jāatrodas projekta saknē, nevis iekšā citā mapē

### 3.3 `.env` fails

Projekta **saknē** izveido failu ar nosaukumu `.env`, izmantojot [.env.example](./.env.example) kā piemēru.

### 3.4 Ieinstalēt projekta nepieciešamās paciņas

```sh
bun install
npm rebuild
```

`npm rebuild` ir jālaiž, jo bun nespēj pareizi ieinstalēt to nolādēto XML paciņu

### 3.5 Izveidot datubāzes tabulu

Palaid sekojošo komandu lai xml failu ierakstītu jaunā PostgreSQL tabulā. (jālaiž ar npm, viss pārējais ar bun)

```sh
npm run create-table
```

Šis var aizņemt pāris minūtes, kopā ir 397k ieraksti.

### 3.6 Reģistrē Discord bota komandas

Reģistrēt tikai 1 serverī (TEST_GUILD_ID):

```sh
bun register
```

Reģistrēt komandas globāli:

```sh
bun register-global
```

### 3.7 Pēdējais solis: palaist botu

Palaist botu produkcijas režīmā:

```sh
bun start
```

Palaist botu "dev" režīmā (restartēsies pēc failu izmaiņām):

```sh
bun dev
```
