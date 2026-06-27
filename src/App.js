import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';


function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  // Forme
  const [message, setMessage] = useState('');
  const [thresholdM, setThresholdM] = useState(2);
  const [guardiansInput, setGuardiansInput] = useState('');
  const [currentMessageId, setCurrentMessageId] = useState('');
  
  // Statusi poruke sa lanca
  const [searchId, setSearchId] = useState('');
  const [fetchedMeta, setFetchedMeta] = useState(null);
  const [shares, setShares] = useState([]);
  const [reconstructedMessage, setReconstructedMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Povezivanje na MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        const tempSigner = tempProvider.getSigner();
        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, tempSigner);

        setAccount(accounts[0]);
        setProvider(tempProvider);
        setSigner(tempSigner);
        setContract(tempContract);
        setStatusMessage("Novčanik uspešno povezan na Sepolia mrežu!");
      } catch (err) {
        setStatusMessage("Greška pri povezivanju sa MetaMask-om.");
      }
    } else {
      setStatusMessage("Molimo instalirajte MetaMask!");
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || '');
      });
    }
  }, []);

  // 1. Enkripcija i Registracija Poruke
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!contract) return alert("Poveži novčanik prvo!");

    try {
      setStatusMessage("Generisanje tajnih delova (Shamir's Secret Sharing)...");
      
      // Simulacija kreiranja jedinstvenog ID-ja i otiska (hash-a) poruke
      const messageId = ethers.utils.id("MSG_" + Date.now());
      const messageHash = ethers.utils.id(message);

      const guardiansArray = guardiansInput.split(',').map(addr => addr.trim());
      
      if (thresholdM > guardiansArray.length) {
        alert("Prag M ne može biti veći od ukupnog broja čuvara N!");
        return;
      }

      setStatusMessage("Slanje transakcije na Sepolia mrežu...");
      
      // Poziv pametnog ugovora
      const tx = await contract.registerMessage(messageId, thresholdM, messageHash, guardiansArray);
      await tx.wait();

      // Simulacija klijentskog deljenja ključa: Kreiramo delove tajne
      // U realnom sistemu ovi delovi bi bili enkriptovani javnim ključem svakog čuvara
      const mockShares = guardiansArray.map((guardian, index) => ({
        guardian: guardian,
        share: `SHARE_DEO_${index + 1}_ZA_PORUKU_${message.substring(0, 4)}`
      }));

      setCurrentMessageId(messageId);
      setShares(mockShares);
      setStatusMessage(`Poruka uspešno registrovana! ID: ${messageId}`);
      
      // Logujemo u lokalni storage radi lakše simulacije odbrane
      localStorage.setItem(messageId, JSON.stringify({ original: message, shares: mockShares }));
    } catch (err) {
      console.error(err);
      setStatusMessage("Greška pri registraciji poruke.");
    }
  };

  // 2. Slanje doprinosa od strane čuvara (Submit Contribution)
  const handleSubmitContribution = async (msgId) => {
    if (!contract) return alert("Poveži novčanik!");
    try {
      setStatusMessage("Slanje vašeg kriptografskog doprinosa na lanac...");
      const tx = await contract.submitContribution(msgId);
      await tx.wait();
      setStatusMessage("Doprinos uspešno zabeležen na blockchainu!");
      handleFetchMetadata(msgId); // Osveži podatke
    } catch (err) {
      console.error(err);
      setStatusMessage("Greška: Niste čuvar, već ste glasali ili je prag već dostignut.");
    }
  };

  // 3. Provera statusa na lancu (Dohvatanje metapodataka)
  const handleFetchMetadata = async (msgId) => {
    if (!contract) return;
    try {
      const meta = await contract.messages(msgId);
      setFetchedMeta({
        messageId: meta.messageId,
        owner: meta.owner,
        thresholdM: meta.thresholdM.toNumber(),
        totalGuardiansN: meta.totalGuardiansN.toNumber(),
        currentContributions: meta.currentContributions.toNumber(),
        messageHash: meta.messageHash,
        isDecrypted: meta.isDecrypted
      });
    } catch (err) {
      setStatusMessage("Neuspešno dohvatanje podataka sa lanca.");
    }
  };

  // 4. Rekonstrukcija originalne poruke (Kada se dostigne prag M)
  const handleRekonstrukcija = (msgId) => {
    const savedData = JSON.parse(localStorage.getItem(msgId));
    if (fetchedMeta && fetchedMeta.currentContributions >= fetchedMeta.thresholdM) {
      if (savedData) {
        setReconstructedMessage(savedData.original);
        setStatusMessage("Uspešna rekonstrukcija! Prag M je zadovoljen.");
      }
    } else {
      alert("Nemate dovoljno čuvara (doprinosa) na lancu da otključate poruku!");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2> Threshold Encryption DApp - NEMANJA GLIGOROV</h2>
      <hr />
      
      <button onClick={connectWallet} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        {account ? `Povezan: ${account.substring(0, 6)}...${account.substring(38)}` : "Poveži MetaMask"}
      </button>

      {statusMessage && <p style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>ℹ️ {statusMessage}</p>}

      {/* PANEL ZA KREIRANJE PORUKE */}
      <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>1. Registracija nove zaštićene poruke (Vlasnik)</h3>
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '10px' }}>
            <label>Poruka za enkripciju: </label><br />
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Prag M (Koliko čuvara otključava): </label><br />
            <input type="number" value={thresholdM} onChange={(e) => setThresholdM(Number(e.target.value))} required style={{ padding: '8px', width: '50px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Adrese čuvara (N) - odvojene zarezom: </label><br />
            <textarea value={guardiansInput} onChange={(e) => setGuardiansInput(e.target.value)} placeholder="0x..., 0x..." required style={{ width: '100%', height: '60px', padding: '8px' }} />
          </div>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px' }}>Generiši i Registruj na Lancu</button>
        </form>
      </div>

      {/* PRIKAZ GENERISANIH DELOVA (SHARES) ZA ČUVARE */}
      {shares.length > 0 && (
        <div style={{ marginTop: '20px', background: '#e2f0d9', padding: '15px', borderRadius: '8px' }}>
          <h4> Generisani delovi ključa (Distribuirano čuvarima):</h4>
          <small>U realnom sistemu, ovi delovi su enkriptovani javnim ključevima čuvara:</small>
          <ul>
            {shares.map((s, i) => (
              <li key={i}><strong>Čuvar {s.guardian.substring(0,6)}...:</strong> <code>{s.share}</code></li>
            ))}
          </ul>
          <p><strong>Zapišite Trenutni ID Poruke:</strong> <code>{currentMessageId}</code></p>
        </div>
      )}

      {/* PANEL ZA ČUVARE I DEKRIPCIJU */}
      <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>2. Panel za proveru i dešifrovanje</h3>
        <input type="text" placeholder="Unesite ID poruke (bytes32)" value={searchId} onChange={(e) => setSearchId(e.target.value)} style={{ width: '70%', padding: '8px', marginRight: '10px' }} />
        <button onClick={() => handleFetchMetadata(searchId)} style={{ padding: '8px' }}>Proveri na lancu</button>

        {fetchedMeta && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
            <h4> Status na Blockchain-u:</h4>
            <p>Vlasnik: {fetchedMeta.owner}</p>
            <p>Potreban prag (M): <strong>{fetchedMeta.thresholdM}</strong></p>
            <p>Ukupno čuvara (N): {fetchedMeta.totalGuardiansN}</p>
            <p>Trenutno dalo doprinos: <strong style={{ color: 'red' }}>{fetchedMeta.currentContributions}</strong></p>
            <p>Status: {fetchedMeta.isDecrypted ? " Spremno za dešifrovanje" : " Zaključano (Nedovoljno doprinosa)"}</p>

            <div style={{ marginTop: '10px' }}>
              <button onClick={() => handleSubmitContribution(fetchedMeta.messageId)} style={{ padding: '10px', backgroundColor: '#ffc107', marginRight: '10px', border: 'none', borderRadius: '5px' }}>
                 Potpiši i pošalji moj doprinos (Kao Čuvar)
              </button>
              <button onClick={() => handleRekonstrukcija(fetchedMeta.messageId)} style={{ padding: '10px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '5px' }}>
                 Rekonstruiši originalnu poruku
              </button>
            </div>
          </div>
        )}

        {reconstructedMessage && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '5px' }}>
            <h4> Otključana tajna poruka:</h4>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{reconstructedMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;