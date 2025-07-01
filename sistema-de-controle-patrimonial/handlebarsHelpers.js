// handlebarsHelpers.js
const { format } = require('date-fns');
const { ptBR } = require('date-fns/locale');

module.exports = {
  formatDate: (data) => {
    if (!data) return '-';
    return format(new Date(data), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  },
  checkStatus: (valor) => {
    return valor && valor.trim() !== '' ? 'OK' : '-';
  },
  json: (context) => {
    return JSON.stringify(context, null, 2);
  }
};
