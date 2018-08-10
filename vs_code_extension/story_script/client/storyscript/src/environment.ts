export const environment = {
  declare: (context: any, fieldName: string) => {
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
  },

  addText: (context: any, text: string) => {
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
  },

  setValue: (context: any, fieldName: string, value: any) => {
    if (!context) {
      context = {}
    }

    context = {
      ...context,
      [fieldName]: value
    };

    return context;
  },

  objectToString: (object: any) => {
    if (!object) {
      return '';
    }

    if (object.text instanceof Array) {
      let result = '';
      object.text.forEach(textItem => {
        result += textItem;
      });

      return result;
    }

    if (object instanceof Array) {
      let result = object.join('');
      return result;
    }

    return object.toString();
  },

  testFunction: (param1, param2) => {
    return `param1: ${environment.objectToString(param1)}, param2: ${environment.objectToString(param2)}`;
  }
}
