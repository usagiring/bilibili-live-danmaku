function getNodeHeight (node, height = 0) {
  if (!node) return height
  if (node.left || node.right) height++
  const left = getNodeHeight(node.left, height)
  const right = getNodeHeight(node.right, height)
  return Math.max(left, right)
}

function getBalanceFactor (node) {
  const leftHeight = node.left ? getNodeHeight(node.left) : 0
  const rightHeight = node.right ? getNodeHeight(node.right) : 0
  return leftHeight - rightHeight
}

// node: root
function rebalance (node) {
  const bf = getBalanceFactor(node)
  if (bf > 1 && getBalanceFactor(node.left) > 0) {
    // LL
    return rightRotate(node)
  } else if (bf > 1 && getBalanceFactor(node.left) <= 0) {
    // LR
    node.left = leftRotate(node.left)
    return rightRotate(node)
  } else if (bf < -1 && getBalanceFactor(node.right) <= 0) {
    // RR
    return leftRotate(node)
  } else if (bf < -1 && getBalanceFactor(node.right) > 0) {
    // RL
    node.right = rightRotate(node.right)
    return leftRotate(node)
  } else {
    return node
  }
}

function rightRotate (node) {
  const LR = node?.left?.right
  const root = node.left
  node.left = LR
  root.right = node
  return root
}

// function leftRotate (node) {
//   const LR = node?.left?.right
//   node = node.left
//   node.left = LR
//   node.right = node
//   return node
// }

function leftRotate (node) {
  const RL = node?.right?.left
  const root = node.right
  node.right = RL
  root.left = node
  return root
}

const tree = {
  value: 3,
  left: {
    value: 2,
    left: {
      value: 1,
      left: {
        value: 0,
        left: {
          value: -1
        }
      },
      right: {
        value: 1.5,
      }
    },
    right: {
      value: 2.5
    }
  },
  right: {
    value: 4,
    left: {
      value: 3.5,
    },
    right: {
      value: 5,
    }
  }
}
const h = getNodeHeight(tree)
console.log(h)

const bf = getBalanceFactor(tree)
console.log(bf)

// console.log('%o', tree)

// // const util = require('util')
// const newTree = rightRotate(tree)
// console.log('%o', newTree)

// const newTree2 = leftRotate(newTree)
// console.log('%o', newTree2)

const newTree = rebalance(tree)
console.log('%o', newTree)
