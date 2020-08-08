const Datastore = require('nedb')
const userDB = new Datastore({ filename: './data/user', autoload: true });
const commentDB = new Datastore({ filename: './data/comment', autoload: true });
const giftDB = new Datastore({ filename: './data/gift', autoload: true });
const interactDB = new Datastore({ filename: './data/interact', autoload: true });

userDB.loadDatabase();
commentDB.loadDatabase();
giftDB.loadDatabase();
interactDB.loadDatabase();

userDB.ensureIndex({
  fieldName: 'mid',
  unique: true,
})

userDB.ensureIndex({
  fieldName: 'createdAt',
  expireAfterSeconds: 604800 // 用户数据缓存 7天
})

export default {
  userDB: wrapper(userDB),
  commentDB: wrapper(commentDB),
  giftDB: wrapper(giftDB),
  interactDB: wrapper(interactDB)
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
