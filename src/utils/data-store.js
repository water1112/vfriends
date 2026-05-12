const fs = require('fs');
const path = require('path');
const config = require('../config');

async function savePersona(persona) {
  const filePath = path.join(config.dataDir, 'personas', `${persona.persona_id}.json`);
  await fs.promises.writeFile(filePath, JSON.stringify(persona, null, 2), 'utf8');
}

async function loadPersona(personaId) {
  const filePath = path.join(config.dataDir, 'personas', `${personaId}.json`);
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

async function saveProfile(profile) {
  const filePath = path.join(config.dataDir, 'profiles', `${profile.profile_id}.json`);
  await fs.promises.writeFile(filePath, JSON.stringify(profile, null, 2), 'utf8');
}

async function loadProfile(profileId) {
  const filePath = path.join(config.dataDir, 'profiles', `${profileId}.json`);
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

module.exports = { savePersona, loadPersona, saveProfile, loadProfile };
