const fs = require('fs')
const moment = require('moment')
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
  fieldName: 'uid',
})
giftDB.ensureIndex({
  fieldName: 'roomId',
})
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

export function executor(cursor) {
  return new Promise((resolve, reject) => {
    cursor.exec((err, docs) => {
      if (err) reject(err)
      resolve(docs)
    })
  })
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
    find: (query, options = {}) => {
      const { skip, limit, sort, projection } = options
      return new Promise((resolve, reject) => {
        let cursor = db.find(query)
        if (projection) {
          cursor = cursor.projection(projection)
        }
        if (sort) {
          cursor = cursor.sort(sort)
        }
        if (skip) {
          cursor = cursor.skip(skip)
        }
        if (limit) {
          cursor = cursor.limit(limit)
        }
        cursor.exec((err, docs) => {
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
        db.update(query, data, options, (err, numAffected, affectedDocuments, upsert) => {
          if (err) reject(err)
          resolve(affectedDocuments)
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

export function backup() {
  const now = moment(new Date()).format("YYYY-MM-DD-HH:mm:ss");
  const DATADIR = `${__dirname}/../../data`
  // 是否先压缩一次？
  // commentDB.persistence.compactDatafile()
  fs.copyFileSync(`${DATADIR}/comment`, `${DATADIR}/comment-${now}`)
  fs.copyFileSync(`${DATADIR}/gift`, `${DATADIR}/gift-${now}`)
  fs.copyFileSync(`${DATADIR}/interact`, `${DATADIR}/interact-${now}`)
}

const userDBWrapper = wrapper(userDB)
const commentDBWrapper = wrapper(commentDB)
const giftDBWrapper = wrapper(giftDB)
const interactDBWrapper = wrapper(interactDB)
const otherDBWrapper = wrapper(otherDB)

export {
  userDBWrapper as userDB,
  commentDBWrapper as commentDB,
  giftDBWrapper as giftDB,
  interactDBWrapper as interactDB,
  otherDBWrapper as otherDB,
}
