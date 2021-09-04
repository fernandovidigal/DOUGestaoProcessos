import Pikaday from 'pikaday';

const datepicker = document.querySelector('.datepicker');
const dateInput = document.querySelector('.data__input');
if (datepicker && dateInput) {
  const picker = new Pikaday({
    field: dateInput,
    trigger: datepicker,
    format: 'DD/MM/YYYY',
    setDefaultDate: false,
    firstDay: 1,
    maxDate: new Date(),
    showDaysInNextAndPreviousMonths: true,
    enableSelectionDaysInNextAndPreviousMonths: true,
    i18n: {
      previousMonth: 'Mês Anterior',
      nextMonth: 'Mês Seguinte',
      months: [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ],
      weekdays: [
        'Domingo',
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
        'Sábado',
      ],
      weekdaysShort: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    },
  });
}