type Key = string | number

interface Node {
  left?: Node
  right?: Node
  key: Key
  payload: any[]
  unique?: boolean
}

const tree: Node = {
  key: '',
  payload: []
}

function isEmptyTree () {
  return !tree.key
}

export function create (key: Key, value: string): Node {
  const node: Node = {
    key,
    payload: [value],
  }

  return node
}

export function insert (key: Key, value: any, node = tree) {
  if (isEmptyTree()) {
    tree.key = key
    tree.payload.push(value)
    return
  }

  // Same key
  if (compareKeys(node.key, key) === 0) {
    if (node.unique) {
      const err = new Error("Can't insert key " + key + ', it violates the unique constraint')
      // err.key = key
      // err.errorType = 'uniqueViolated'
      throw err
    } else {
      node.payload.push(value)
    }
    return
  }

  if (compareKeys(key, node.key) < 0) {
    // Insert in left subtree
    if (node.left) {
      insert(key, value, node.left)
    } else {
      node.left = create(key, value)
    }
  } else {
    // Insert in right subtree
    if (node.right) {
      insert(key, value, node.right)
    } else {
      node.right = create(key, value)
    }
  }
}

function search (value) {
  //
}

function compareKeys (a, b) {
  if (a < b) { return -1 }
  if (a > b) { return 1 }
  if (a === b) { return 0 }

  const err = new Error("Couldn't compare elements")
  // err.a = a
  // err.b = b
  throw err
}

export function print (node = tree, spacing = '', i = '|- ') {
  console.log(`${spacing}${i}${node.key}`)
  if (node.left) {
    print(node.left, spacing + '   ', 'L: ')
  }
  if (node.right) {
    print(node.right, spacing + '   ', 'R: ')
  }
}

export function getTree () {
  return tree
}
