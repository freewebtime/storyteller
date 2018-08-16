export const declare = (context: any, fieldName: string) => {
  if (!context) {
    context = {}
  }

  if (!context[fieldName]) {
    context = {
      ...context,
      [fieldName]: {}
    }
  }

  return context;
}

export const addText = (context: any, text: string) => {
  if (!context) {
    context = {};
  }

  if (!(context['text'] instanceof Array)) {
    context['text'] = [];
  }

  context['text'] = [
    ...context['text'],
    text
  ];

  return context;
}

export const setValue = (context: any, fieldName: string, value: any) => {
  if (!context) {
    context = {}
  }

  context = {
    ...context,
    [fieldName]: value
  };

  return context;
}

export const objectToString = (object: any, separator?: string) => {
  if (!object) {
    return '';
  }

  separator = separator || '';

  if (object.text instanceof Array) {
    let result = object.text.join(separator);
    return result;
  }

  if (object instanceof Array) {
    let result = object.join(separator);
    return result;
  }

  return object.toString();
}

export const testFunction = (param1, param2) => {
  return `param1: ${objectToString(param1)}, param2: ${objectToString(param2)}`;
}
