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

Projekta **saknē** izveido failu ar nosaukumu `.env`

Failā jāatrodas 3 mainīgajiem:

```sh
# tava bota tokens
BOT_TOKEN=""
# postgresql datubāzes savienošanās url
DB_URL=""
# testēšanas servera ID
TEST_GUILD_ID=""
```

Piemērs `.env` failam:

```sh
BOT_TOKEN="MTExNTAwNjc1NzIzMjcyNjAyNw.GurI6k.XR9s7NMg1kdHkADJigxXFNxrgURxpyMfcgowG0"
DB_URL="postgresql://stiligsNosaukums:DrosaParole123@stiligs.db.url:6969"
TEST_GUILD_ID="797584379685240882"
```

### 3.4 Ieinstalēt projekta nepieciešamās pakotnes/bibliotēkas

```sh
npm ci
```

### 3.5 Izveidot datubāzes tabulu

Palaid sekojošo komandu lai xml failu ierakstītu jaunā PostgreSQL tabulā.

```sh
npm run create-table
```

Šis var aizņemt pāris minūtes, kopā ir 397k ieraksti.

### 3.6 Reģistrē Discord bota komandas

Reģistrēt komandas globāli:

```sh
npm run register-global
```

Reģistrēt tikai 1 serverī (TEST_GUILD_ID):

```sh
npm run register
```

### 3.7 Pēdējais solis: palaist botu

Palaist botu produkcijas režīmā:

```sh
npm run build
npm start
```

Palaist botu "dev" režīmā (restartēsies pēc failu izmaiņām):

```sh
npm run dev
```
