import { IHash } from "../../shared/IHash";

interface IExecutionContext {
  modules: IHash<IModule>;
}

interface IModule {
  id: string;
  name: string;
  body: IObject;
}

enum ObjectType {
  Item = 'Item',
  TextLine = 'TextLine',
}

const asda = /^asdd/

interface IObject {
  id: string;
  name: string;
}

enum EcItemType {
  Object = 'Object',
  TextLine = 'TextLine',
}
