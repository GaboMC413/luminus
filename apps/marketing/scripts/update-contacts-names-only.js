const fs = require('fs');
const path = require('path');

// Title Case helper function
function toTitleCase(str) {
  if (!str) return '';
  const cleaned = str.replace(/["'\[\]]/g, '').trim();
  if (!cleaned) return '';

  return cleaned
    .toLowerCase()
    .split(/\s+/)
    .map((word, idx) => {
      // Keep small Spanish prepositions/connectors lowercase unless it's the first word
      if (idx > 0 && word.length <= 3 && ['de', 'del', 'la', 'el', 'los', 'las', 'da', 'do', 'dos', 'van', 'von', 'y', 'e'].includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Split full name into first and last name cleanly
function splitName(nombreRaw, apellidoRaw) {
  const nom = (nombreRaw || '').trim();
  const ape = (apellidoRaw || '').trim();

  if (ape) {
    return {
      firstName: toTitleCase(nom),
      lastName: toTitleCase(ape)
    };
  }

  if (!nom) {
    return { firstName: '', lastName: '' };
  }

  const parts = nom.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return {
      firstName: toTitleCase(parts[0]),
      lastName: ''
    };
  }

  // Common Spanish composite first names
  const compoundFirsts = [
    'maria', 'maría', 'juan', 'jose', 'josé', 'ana', 'carlos', 'luis',
    'victor', 'víctor', 'jorge', 'laura', 'claudia', 'diego', 'gloria'
  ];

  if (parts.length >= 3 && compoundFirsts.includes(parts[0].toLowerCase())) {
    const firstName = toTitleCase(parts.slice(0, 2).join(' '));
    const lastName = toTitleCase(parts.slice(2).join(' '));
    return { firstName, lastName };
  }

  const firstName = toTitleCase(parts[0]);
  const lastName = toTitleCase(parts.slice(1).join(' '));
  return { firstName, lastName };
}

// Parse CSV simple with quotes support
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { header: [], rows: [] };
  
  function parseLine(line) {
    const fields = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i+1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        fields.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    fields.push(cur);
    return fields.map(f => f.trim());
  }

  const header = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = cols[idx] || '';
    });
    rows.push(obj);
  }
  return { header, rows };
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  const csvPath = 'C:\\Users\\gabri\\Downloads\\1789870590_199093744245409547_subscribers_active.csv';
  const dataDir = path.resolve(__dirname, '../../../.local-data/email-marketing');
  const contactsFile = path.join(dataDir, 'contacts.json');
  const backupDir = path.join(dataDir, 'backups');

  if (!fs.existsSync(contactsFile)) {
    console.error('❌ No se encontró contacts.json en:', contactsFile);
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error('❌ No se encontró el archivo CSV en:', csvPath);
    process.exit(1);
  }

  // 1. Cargar datos
  console.log('📂 Leyendo contactos y archivo CSV...');
  const rawContacts = fs.readFileSync(contactsFile, 'utf8');
  const contacts = JSON.parse(rawContacts);
  const csvData = parseCSV(fs.readFileSync(csvPath, 'utf8'));

  console.log(`📊 Base actual: ${contacts.length} contactos.`);
  console.log(`📊 CSV nuevo: ${csvData.rows.length} suscriptores.`);

  // 2. Mapear CSV por email normalizado
  const csvMap = new Map();
  csvData.rows.forEach(row => {
    const email = (row['Suscriptor'] || row['email'] || row['Email'] || '').trim().toLowerCase();
    if (email) {
      csvMap.set(email, row);
    }
  });

  // Estadísticas previas de control
  const initialCount = contacts.length;
  const initialUnsubscribed = contacts.filter(c => c.unsubscribed === true).length;
  const initialBounced = contacts.filter(c => c.bounced === true).length;

  let updatedCount = 0;
  let emptyFilledCount = 0;
  let unchangedCount = 0;
  const updateSamples = [];

  // 3. Procesar contactos existentes
  const updatedContacts = contacts.map(contact => {
    const emailKey = (contact.email || '').trim().toLowerCase();
    const csvRow = csvMap.get(emailKey);

    // Si no está en el CSV o no hay información de nombre, mantener intacto
    if (!csvRow) {
      unchangedCount++;
      return contact;
    }

    const rawNom = csvRow['Nombre'] || '';
    const rawApe = csvRow['Apellido'] || '';

    // Si el CSV no tiene nombre, no alterar nada
    if (!rawNom.trim() && !rawApe.trim()) {
      unchangedCount++;
      return contact;
    }

    const { firstName: newFirst, lastName: newLast } = splitName(rawNom, rawApe);

    const oldFirst = (contact.firstName || '').trim();
    const oldLast = (contact.lastName || '').trim();

    const hadNoName = !oldFirst && !oldLast;

    let targetFirst = oldFirst;
    let targetLast = oldLast;

    if (hadNoName) {
      // Caso 1: Estaba totalmente vacío -> Asignar lo que viene en el CSV
      targetFirst = newFirst;
      targetLast = newLast;
    } else if (newFirst && newLast && (!oldLast || `${newFirst} ${newLast}`.length > `${oldFirst} ${oldLast}`.length)) {
      // Caso 2: El CSV aporta nombre y apellido más completos que los que teníamos
      targetFirst = newFirst;
      targetLast = newLast;
    } else if (!oldFirst && newFirst) {
      // Caso 3: Tenía apellido pero no primer nombre
      targetFirst = newFirst;
    } else if (!oldLast && newLast) {
      // Caso 4: Tenía primer nombre pero no apellido
      targetLast = newLast;
    } else {
      // Caso 5: El contacto local ya tenía nombre y apellido completos y el CSV solo traía 1 palabra o menos datos -> preservar local
    }

    const isDifferent = targetFirst !== oldFirst || targetLast !== oldLast;

    if (isDifferent) {
      if (hadNoName) {
        emptyFilledCount++;
      } else {
        updatedCount++;
      }

      if (updateSamples.length < 20) {
        updateSamples.push({
          email: contact.email,
          antes: `${oldFirst} ${oldLast}`.trim() || '(Vacío)',
          despues: `${targetFirst} ${targetLast}`.trim(),
          tagsPreservados: contact.tags,
          statusPreservado: contact.status || (contact.unsubscribed ? 'UNSUBSCRIBED' : 'ACTIVE')
        });
      }

      // Devolver copia modificando ÚNICAMENTE firstName y lastName
      return {
        ...contact,
        firstName: targetFirst,
        lastName: targetLast
      };
    } else {
      unchangedCount++;
      return contact;
    }
  });

  console.log('\n=============================================');
  console.log('📈 RESUMEN DEL PROCESO');
  console.log('=============================================');
  console.log(`- Nombres vacíos completados: ${emptyFilledCount}`);
  console.log(`- Nombres actualizados/enriquecidos: ${updatedCount}`);
  console.log(`- Total modificados: ${emptyFilledCount + updatedCount}`);
  console.log(`- Contactos sin cambios: ${unchangedCount}`);
  console.log(`- Total final de contactos: ${updatedContacts.length} (Original: ${initialCount})`);

  console.log('\n--- MUESTRA DE ACTUALIZACIONES ---');
  console.log(JSON.stringify(updateSamples, null, 2));

  // 4. Verificaciones de seguridad
  const finalUnsubscribed = updatedContacts.filter(c => c.unsubscribed === true).length;
  const finalBounced = updatedContacts.filter(c => c.bounced === true).length;

  if (updatedContacts.length !== initialCount) {
    throw new Error(`❌ ERROR CRÍTICO: La cantidad de contactos cambió (${initialCount} -> ${updatedContacts.length}). Cancelando.`);
  }

  if (finalUnsubscribed !== initialUnsubscribed) {
    throw new Error(`❌ ERROR CRÍTICO: El conteo de desuscritos cambió (${initialUnsubscribed} -> ${finalUnsubscribed}). Cancelando.`);
  }

  if (finalBounced !== initialBounced) {
    throw new Error(`❌ ERROR CRÍTICO: El conteo de rebotados cambió (${initialBounced} -> ${finalBounced}). Cancelando.`);
  }

  if (isDryRun) {
    console.log('\n🔍 MODO DRY RUN: No se han escrito cambios en disco. Todo validado correctamente.');
    return;
  }

  // 5. Crear Backup
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `contacts-backup-${timestamp}.json`);
  fs.writeFileSync(backupFile, rawContacts, 'utf8');
  console.log(`\n🔒 Backup de seguridad creado en: ${backupFile}`);

  // 6. Guardar cambios en contacts.json
  fs.writeFileSync(contactsFile, JSON.stringify(updatedContacts, null, 2), 'utf8');
  console.log(`✅ Base de datos actualizada con éxito en: ${contactsFile}`);
}

main().catch(err => {
  console.error('❌ Error en la ejecución:', err);
  process.exit(1);
});
