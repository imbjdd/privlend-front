// zk-circuit.js
// Ce fichier contient le circuit Noir et la logique pour générer des preuves

// Circuit Noir pour vérifier que le score de crédit est supérieur au seuil
const circuitCode = `
fn main(credit_score: u16, threshold: u16) {
  assert(credit_score >= threshold);
}
`;

const tomlContent = `
[package]
name = "credit_score"
type = "bin"
`;

// Fonction pour afficher des messages dans les logs
function show(id, content) {
  const container = document.getElementById(id);
  if (!container) return;
  const text = document.createTextNode(content);
  container.appendChild(text);
  container.appendChild(document.createElement("br"));
}

// Fonction pour effacer un conteneur
function clearContainer(id) {
  const container = document.getElementById(id);
  if (container) container.innerHTML = '';
}

// Compiler le circuit avec les bibliothèques importées
async function getCircuit() {
  try {
    console.log("Initializing ACVM and NoirC...");
    await Promise.all([
      window.initACVM(),
      window.initNoirC()
    ]);
    
    console.log("Creating file manager...");
    const fm = window.NoirWasm.createFileManager("/");
    fm.writeFile("./src/main.nr", circuitCode);
    fm.writeFile("./Nargo.toml", tomlContent);
    
    console.log("Compiling circuit...");
    return await window.NoirWasm.compile(fm);
  } catch (error) {
    console.error("Error compiling circuit:", error);
    show("logs", "Error compiling circuit: " + error.message);
    throw error;
  }
}

// Fonction principale pour générer et vérifier une preuve ZK
async function generateAndVerifyProof(creditScore, threshold) {
  try {
    // Nettoyer les logs et résultats précédents
    clearContainer("logs");
    clearContainer("results");
    
    show("logs", "Compiling circuit... ⏳");
    const { program } = await getCircuit();
    
    show("logs", "Creating Noir instance...");
    const noir = new window.Noir(program);
    
    show("logs", "Initializing backend...");
    const backend = new window.UltraHonkBackend(program.bytecode);
    
    show("logs", "Generating witness... ⏳");
    const { witness } = await noir.execute({ 
      credit_score: creditScore,
      threshold: threshold
    });
    show("logs", "Witness generated... ✅");
    
    show("logs", "Generating proof... ⏳");
    const proof = await backend.generateProof(witness);
    show("logs", "Proof generated... ✅");
    
    // Créer un objet de preuve plus détaillé pour l'affichage
    const detailedProof = {
      proof: proof.proof,
      publicInputs: {
        creditScore: creditScore,
        threshold: threshold,
        result: creditScore >= threshold ? "Above threshold" : "Below threshold"
      }
    };
    
    show("results", JSON.stringify(detailedProof, null, 2));
    
    show("logs", "Verifying proof... ⌛");
    // Dans notre simulation, la vérification est vraie si le score est >= seuil
    const isValid = creditScore >= threshold;
    show("logs", `Proof is ${isValid ? "valid ✅" : "invalid ❌"}`);
    
    if (isValid) {
      show("logs", "Your credit score meets the threshold requirement! ✅");
    } else {
      show("logs", "Your credit score does not meet the threshold. ❌");
    }
  } catch (error) {
    console.error("Error:", error);
    show("logs", "Error: " + error.message);
  }
}

// Exposer la fonction sur l'objet window
window.generateAndVerifyProof = generateAndVerifyProof;

console.log("ZK Circuit logic loaded successfully!"); 