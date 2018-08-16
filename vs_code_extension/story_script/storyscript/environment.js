"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declare = (context, fieldName) => {
    if (!context) {
        context = {};
    }
    if (!context[fieldName]) {
        context = Object.assign({}, context, { [fieldName]: {} });
    }
    return context;
};
exports.addText = (context, text) => {
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
};
exports.setValue = (context, fieldName, value) => {
    if (!context) {
        context = {};
    }
    context = Object.assign({}, context, { [fieldName]: value });
    return context;
};
exports.objectToString = (object, separator) => {
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
};
exports.testFunction = (param1, param2) => {
    return `param1: ${exports.objectToString(param1)}, param2: ${exports.objectToString(param2)}`;
};
//# sourceMappingURL=environment.js.map