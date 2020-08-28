const Datastore = require('nedb')
const userDB = new Datastore({ filename: './data/user', autoload: true });
const commentDB = new Datastore({ filename: './data/comment', autoload: true });
const giftDB = new Datastore({ filename: './data/gift', autoload: true });
const interactDB = new Datastore({ filename: './data/interact', autoload: true });
const otherDB = new Datastore({ filename: './data/other', autoload: true });

userDB.loadDatabase();
commentDB.loadDatabase();
giftDB.loadDatabase();
interactDB.loadDatabase();

giftDB.ensureIndex({
  fieldName: 'sendAt',
})

interactDB.ensureIndex({
  fieldName: 'uid',
})
interactDB.ensureIndex({
  fieldName: 'roomId',
})
interactDB.ensureIndex({
  fieldName: 'sendAt',
})

commentDB.ensureIndex({
  fieldName: 'uid',
})
commentDB.ensureIndex({
  fieldName: 'roomId',
})
commentDB.ensureIndex({
  fieldName: 'sendAt',
})

userDB.ensureIndex({
  fieldName: 'uid',
  unique: true,
})

// userDB.ensureIndex({
//   fieldName: 'createdAt',
//   expireAfterSeconds: 604800 // 用户数据缓存 7天
// })

export default {
  userDB: wrapper(userDB),
  commentDB: wrapper(commentDB),
  giftDB: wrapper(giftDB),
  interactDB: wrapper(interactDB),
  otherDB: wrapper(otherDB),
}

function wrapper(db) {
  return {
    insert: (data) => {
      return new Promise((resolve, reject) => {
        db.insert(data, (err, newDocs) => {
          if (err) reject(err)
          resolve(newDocs)
        })
      })
    },
    find: (query) => {
      return new Promise((resolve, reject) => {
        db.find(query, (err, docs) => {
          if (err) reject(err)
          resolve(docs)
        })
      })
    },
    findOne: (query) => {
      return new Promise((resolve, reject) => {
        db.findOne(query, (err, doc) => {
          if (err) reject(err)
          resolve(doc)
        })
      })
    },
    update: (query, data, options = {}) => {
      return new Promise((resolve, reject) => {
        db.update(query, data, options, (err, doc) => {
          if (err) reject(err)
          resolve(doc)
        })
      })
    },
    remove: (query, options = {}) => {
      return new Promise((resolve, reject) => {
        db.remove(query, options, (err, numRemoved) => {
          if (err) reject(err)
          resolve(numRemoved)
        })
      })
    }
  }
}
