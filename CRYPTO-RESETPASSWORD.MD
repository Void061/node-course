# Libreria integrata su node.js per cryptare (utile per reset password)

```
const crypto = require("crypto");
crypto.randomBytes(32, (err, buffer) => {
    if(err){
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
  })
```
