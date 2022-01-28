struct BSTNode {
  value: i32,
  left: Option<Box<BSTNode>>,
  right: Option<Box<BSTNode>>,
}

impl BSTNode {
  fn insert(&mut self, val: i32) {
    if val < self.value {
      match self.left {
        None => {
          self.left = Some(Box::new(BSTNode {
            value: val,
            left: None,
            right: None,
          }))
        }
        Some(ref mut node) => node.insert(val),
      }
    } else {
      match self.right {
        None => {
          self.right = Some(Box::new(BSTNode {
            value: val,
            left: None,
            right: None,
          }))
        }
        Some(ref mut node) => node.insert(val),
      }
    }
  }

  fn search(self, val: i32) -> Option<BSTNode> {
    if val == self.value {
      return Some(self);
    }
    if val < self.value {
      match self.left {
        None => None, //
        Some(node) => node.search(val),
      }
    } else {
      match self.right {
        None => None, //
        Some(node) => node.search(val),
      }
    }
  }

  fn print(self, spacing: String, i: &str) {
    println!("{0}{1}{2}", spacing, i, self.value);
    match self.left {
      None => (),
      Some(node) => node.print(spacing.to_string() + "   ", "L: "),
    };
    match self.right {
      None => (),
      Some(node) => node.print(spacing.to_string() + "   ", "R: "),
    };
  }
}

// export function print (node = tree, spacing = '', i = '|- ') {
//   console.log(`${spacing}${i}${node.key}`)
//   if (node.left) {
//     print(node.left, spacing + '   ', 'L: ')
//   }
//   if (node.right) {
//     print(node.right, spacing + '   ', 'R: ')
//   }
// }
fn main() {
  loop {}
}

#[test]
fn test_insert() {
  let mut tree: Option<BSTNode> = None;

  // match tree {
  //   None => tree = Some(BSTNode {
  //     value: val,
  //     left: None,
  //     right: None,
  //   }),
  //   Some(ref mut node) => node.insert(val)
  // }

  let array = vec![5, 7, 3, 9, 1, 6, 4, 8, 2];
  array.iter().for_each(|item| match tree {
    None => {
      tree = Some(BSTNode {
        value: *item,
        left: None,
        right: None,
      })
    }
    Some(ref mut node) => node.insert(*item),
  });
  // tree.insert(5);
  // tree.insert(7);
  // tree.insert(3);
  // tree.insert(9);
  // tree.insert(1);
  // tree.insert(6);
  // tree.insert(4);
  // tree.insert(8);
  // tree.insert(2);

  match tree {
    None => (),
    Some(node) => node.print(String::new(), "|- "),
  };
}
