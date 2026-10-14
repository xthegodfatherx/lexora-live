require('dotenv').config({ path: './config.env' });
const app = require('./app');
const { ensureEcheances } = require('./domain');
const { update } = require('./store');

const PORT = process.env.PORT || 8086;

update((db) => {
  ensureEcheances(db);
  return true;
});

setInterval(() => {
  update((db) => {
    ensureEcheances(db);
    return true;
  });
}, 60 * 60 * 1000).unref();

setInterval(() => {
  const { load, save } = require('./store');
  const { collecter } = require('./domain');
  const db = load();
  collecter(db).then(() => save(db)).catch(() => {});
}, 24 * 60 * 60 * 1000).unref();

app.listen(PORT, () => {
  console.log(`service-der démarré sur ${PORT}`);
});
