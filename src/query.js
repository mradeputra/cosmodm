"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSql = void 0;
function toSql(query, selector, orderBy, isCountQuery = false) {
    const strQuery = query.toString();
    const expression = strQuery.slice(strQuery.indexOf('=>') + 2).trimStart();
    const splitedExp = expression.split(/(\|\||&&)/).map((s) => s.trim());
    const params = [];
    let whereClause = '';
    let logicalOperator = '';
    splitedExp.forEach((exp) => {
        if (isOperator(exp)) {
            logicalOperator = operatorMap[exp];
            return;
        }
        const matches = matchMethod(exp);
        if (!matches)
            throw new Error('Invalid query');
        const [_, property, operator, value] = matches;
        const paramsName = `@${property}_${params.length}`;
        if (operator === 'includes' || operator === 'startsWith' || operator === 'endsWith') {
            const contains = operator === 'includes' ? 'CONTAINS' : operator === 'startsWith' ? 'STARTSWITH' : 'ENDSWITH';
            params.push({ name: paramsName, value });
            whereClause += ` ${logicalOperator} ${contains}(c.${property}, ${paramsName})`;
        }
        else {
            const parsedValue = value.startsWith("'") ? value.slice(1, -1) : parseFloat(value);
            if (typeof parsedValue === 'number' && !isNaN(parsedValue)) {
                params.push({ name: paramsName, value: parsedValue });
                whereClause += ` ${logicalOperator} c.${property} ${operatorMap[operator]} ${paramsName}`;
            }
            else {
                whereClause += ` ${logicalOperator} c.${property} ${operatorMap[operator]} ${value}`;
            }
        }
        logicalOperator = '';
    });
    whereClause = `(${whereClause.trimStart()})`;
    let selectClause = '*';
    if (selector) {
        if (Array.isArray(selector)) {
            selectClause = selector.map((s) => `c.${String(s)}`).join(', ');
        }
        else {
            selectClause = `c.${String(selector)}`;
        }
    }
    const orderByClause = orderBy ? `ORDER BY ${orderBy.property.toString()} ${orderBy.descending ? 'DESC' : 'ASC'}` : '';
    const countClause = 'count(1)';
    const outputQuery = `SELECT ${isCountQuery ? countClause : selectClause} FROM c WHERE ${whereClause} ${orderByClause}`;
    return [outputQuery, params];
}
exports.toSql = toSql;
function matchMethod(exp) {
    const propertyRegex = /\.(\w+)\.(startsWith|endsWith|includes)\('(([^\\]|\\.)*?)'\)/;
    const commonRegex = /(\w+)\s*([<>!=]=?|===|\|\||&&|>|<)\s*(\d+|'[^']*'|\w+\(['"][^'"]*['"]\))/;
    let matches = exp.match(commonRegex);
    if (!matches) {
        matches = exp.match(propertyRegex);
    }
    return matches;
}
function isOperator(operator) {
    if (operator === '&&' || operator === '||')
        return true;
    return false;
}
const operatorMap = {
    '<': '<',
    '>': '>',
    '<=': '<=',
    '>=': '>=',
    '!=': '!=',
    '===': '=',
    '&&': 'AND',
    '||': 'OR'
};
//# sourceMappingURL=query.js.map