# 🔒 Threshold Encryption & Distributed Decryption DApp

Ovaj projekat predstavlja **decentralizovanu aplikaciju (DApp)** koja implementira sistem prag-enkripcije (*Threshold Encryption*) i distribuiranog dešifrovanja. Aplikacija omogućava bezbedno čuvanje tajnih poruka na taj način što se poruka može rekonstruisati isključivo ako sarađuje najmanje **M** od ukupno **N** predefinisanih čuvara ključa.

Projekat je razvijen u sklopu praktičnog dela ispitnih obaveza i u potpunosti ispunjava sve zahteve **Projektnog zadatka 7**.

---

## 🚀 Ključne Karakteristike

- **Decentralizovano upravljanje poverenjem:** Pametni ugovor na blockchainu čuva isključivo metapodatke o poruci (identifikator, vlasnika, prag M, listu čuvara i kriptografski hash), dok se sam sadržaj tajne nikada ne skladišti na mreži.
- **Klijentska simulacija Shamir-ovog deljenja tajne:** Pri registraciji poruke, privatni ključ se deli na N delova (shares). Manje od M delova ne pruža nikakvu informaciju o originalnoj poruci.
- **Integracija sa Web3 tehnologijama:** Kompletna koordinacija procesa, glasanje čuvara i revizorski trag obezbeđeni su putem `ethers.js` biblioteke i MetaMask novčanika.
- **Sepolia Testnet Deployment:** Pametni ugovor je uspešno postavljen i verifikovan na zvaničnoj Ethereum Sepolia testnoj mreži.

---

## 🛠️ Tehnološki Stak

| Sloj | Tehnologije |
|---|---|
| Pametni ugovori | Solidity, Remix IDE / Hardhat |
| Front-end | React.js, HTML5, CSS3 |
| Blockchain interakcija | Ethers.js (v5), MetaMask |
| Mreža | Ethereum Sepolia Testnet |
| Testiranje | Remix Solidity Unit Testing / Mocha & Chai |

---

## 💻 Pokretanje Projekta u Lokalnom Okruženju

Pratite sledeće korake kako biste pokrenuli aplikaciju na svom računaru.

### 1. Instalacija zavisnosti

Otvorite terminal, pozicionirajte se u koren foldera projekta, a zatim instalirajte potrebne pakete:

```bash
npm install
```

### 2. Pokretanje lokalnog razvojnog servera

Pokrenite React aplikaciju sledećom komandom:

```bash
npm start
```

Aplikacija će automatski biti dostupna u vašem browseru na adresi: `http://localhost:3000`

### 3. Podešavanje MetaMask-a

- Uverite se da je vaš MetaMask novčanik prebačen na **Sepolia** RPC testnu mrežu.
- Za testiranje scenarija sa više čuvara (`M > 1`), kreirajte dodatne naloge (Account 2, Account 3) unutar MetaMask-a i prebacite im minimalnu količinu SepoliaETH-a za pokrivanje mrežnih naknada (gas fee).

---

## 🧪 Pregled Testova (Unit & E2E)

Projekat sadrži automatizovane jedinične testove koji pokrivaju:

- **Validne scenarije:** Uspešnu registraciju zaštićene poruke i prihvatanje glasova autorizovanih čuvara.
- **Nevalidne scenarije i kontrolu pristupa:** Sprečavanje glasanja od strane adresa koje nisu na listi N čuvara i blokiranje rekonstrukcije poruke ako prag M nije dostignut.

**End-to-End (E2E)** provera je uspešno potvrđena kroz korisnički interfejs simulacijom nezavisnih potpisa preko različitih MetaMask naloga direktno na Sepolia mreži.
