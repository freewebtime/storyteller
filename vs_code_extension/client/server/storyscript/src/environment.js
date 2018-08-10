"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = {
    declare: (context, fieldName) => {
        if (!context) {
            context = {};
        }
        if (!context[fieldName]) {
            context = Object.assign({}, context, { [fieldName]: {} });
        }
        return context;
    },
    addText: (context, text) => {
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
    setValue: (context, fieldName, value) => {
        if (!context) {
            context = {};
        }
        context = Object.assign({}, context, { [fieldName]: value });
        return context;
    },
    objectToString: (object) => {
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
        return `param1: ${exports.environment.objectToString(param1)}, param2: ${exports.environment.objectToString(param2)}`;
    }
};
//# sourceMappingURL=environment.js.map