const db = require('../src/service/nedb');

// db.insert([{ a: 5 }, { a: 42 }], (err, newDocs) => {
//   console.log(newDocs)
// })

(async () => {

  const results = await db.insert([{ a: 5 }, { a: 42 }])
  console.log(results)
})()


