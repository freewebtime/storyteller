export enum AtiType {
  String = 'String',
  Number = 'Number',
  Template = 'Template',
  Variable = 'Variable',
}

export interface IActionTreeItem {

}


export interface IUtils {
  Concat: (prefix: string, postfix: string) => string
  Concat2: (prefix: string, postfix: string) => string
}

const struct = () => {
  let a = 5;
  let b = 5;
  let foo = {
    a,
    b,
    c: {
      foo: 'bar'
    }
  }

  foo = {
    ...foo,
    c: {
      ...foo.c,
      foo: 'foo'
    }
  }

  return foo;
}

