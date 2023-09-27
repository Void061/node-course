# Per utilizzare mysql

- Serve mysql2, quindi npm install --save mysql2

# Connessione al DB

Solitamente in util/database.js

```
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'nodejs_course',
  password: 'toor',
});

module.exports = pool.promise();
```

Poi si importa, in app.js

```
const db = require('./util/database');
// Esecuzione di una query, grazie a pool.promise() possiamo
// Lavorare con le promises, quindi then, catch disponibili
// Esegui una query, su result[0] hai i dati
// Su result[1], i meta dati
db.execute('SELECT * FROM products').then((result) => {
  console.log(result[0], result[1]);
}).catch((err) => {
  console.log(err);
});

// E' possibile estrapolare direttamente le rows e i fieldData
db.execute('SELECT * FROM products').then(([rows, fieldData]) => {
  console.log(rows);
}).catch((err) => {
  console.log(err);
});
```

# SELECT DATA
```
db.execute('SELECT * FROM products').then(([rows, fieldData]) => {
  console.log(rows);
}).catch((err) => {
  console.log(err);
});
```
# ADD DATA
```
db.execute('SELECT * FROM products').then(([rows, fieldData]) => {
  console.log(rows);
}).catch((err) => {
  console.log(err);
});

db.execute(
      "INSERT INTO products (title, price, imageUrl, description) VALUES (? , ?, ?, ?)",
      [this.title, this.price, this.imageUrl, this.description]
    );
```

Tutto ciò verrà semplificato da sequelize.



