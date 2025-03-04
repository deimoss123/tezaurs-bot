# Neoficiālais Tēzaura Discord bots

Visi dati pieder [Tēzauram](https://tezaurs.lv/).

Projekts izmanto tēzaura [atvērtos datus](https://repository.clarin.lv/repository/xmlui/handle/20.500.12574/92).

Lai pievienotu botu savam serverim, spied [šeit](https://discord.com/api/oauth2/authorize?client_id=987805550014238720&permissions=0&scope=bot%20applications.commands).

# Kā palaist botu lokāli?

Tev būs nepieciešams:
- [Docker](https://www.docker.com).
- [Go](https://go.dev/).

Ja vēlies veikt izstrādi, būs nepieciešams:
- [Bun](https://bun.sh/).

## 1. Izveido jaunu discord botu

- Atver pārlūkā https://discord.com/developers/applications
- New Application > Bot > Reset Token > Copy
  - Šeit tu iegūsti savu Discord bota tokenu, **saglabā to, jo tas būs nepieciešams vēlāk**
- Uzaicini botu uz savu serveri
  - OAuth2 > URL Generator
  - No Scopes izvēlies "applications.commands" un "bot"
  - Atver linku kas ir parādīts apakšā un pievieno botu savam serverim

## 2. Noklonē Tēzaura bota repozitoriju lokāli

```sh
git clone https://github.com/deimoss123/tezaurs-bot
cd tezaurs-bot
```

### 2.1 Izveido PostgreSQL datubāzi

- Šo var izdarīt vai nu lokāli, vai arī mākonī
- Iegūsti DB savienošanās URL, **kas būs nepieciešams vēlāk**
- Datubāze tiks izmantota lai glabātu tēzaura datus, kas tiks pārveidoti no xml faila

Datubāze ir palaižama lokāli caur Docker ar komandu

```sh
docker-compose up -d postgres
```

Pēc noklusējuma datubāzes url būs `postgres://tezaursbot@127.0.0.1:5432/tezaurs`

Datubāzi jebkurā brīdī var apstādināt ar komandu
```sh
docker-compose down
```

### 2.2 Atvērto datu ievade

Ārpus tēzaura bota mapes noklonē (Tēzaura XML parseri)[https://github.com/deimoss123/tezaurs-xml-parser].
```sh
git clone https://github.com/deimoss123/tezaurs-xml-parser
cs tezaurs-xml-parser
```

Pārliecinies, ka datubāze ir ieslēgta. <br>
Datu faila nosaukums var atšķirties no zemāk esošā, tāpēc izmanto to, kas norādīta Tēzaura XML parsera README.
```sh
go run main.go -f tezaurs_2025_1_tei.xml -pg postgres://tezaursbot@127.0.0.1:5432/tezaurs -table
```

## 3. Bota palaišana

❗ Nākamās komandas notiek iepriekš izveidotajā (noklonētajā) tēzaura bota mapē.

### 3.1 `.env` fails

- Izveido jaunu failu ar nosaukumu `.env`, izmantojot [.env.example](./.env.example) kā piemēru.
- Ievadi bota tokenu (iegūts 1. punktā)
- Ja datubāzes URL nav mainīts, tad atstāj noklusējuma.
- Ievadi testēšanas Discord servera ID.

### 3.2 Palaid botu un datubāzi

```sh
docker compose up -d --remove-orphans
```

Botam tagad vajadzētu parādīties tiešsaistē Discordā.

### 3.3 Komandu reģistrēšana

Komandas var reģistrēt vai nu vienā serverī, vai globāli.

Lai reģistrētu komandas tikai testēšanas serverī:
```sh
docker compose run -it bot bun register
```

Lai reģistrētu komandas **globāli**:
```sh
docker compose run -it bot bun register-global
```

Ja komandas nav redzamas, restartē Discord (ctrl + r). <br>
Ja tās neparādās arī pēc restarta, tad iespējams tā ir Discord servera atļauju problēma.
