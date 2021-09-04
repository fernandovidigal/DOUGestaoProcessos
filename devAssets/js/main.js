import Swal from 'sweetalert2';
import axios from 'axios';

const dialogMessage = document.querySelector('.dialogMessage');
if (dialogMessage) {
  const type = dialogMessage.dataset.type;
  const title = dialogMessage.dataset.title;
  const text = dialogMessage.dataset.text;
  const selfClose = dialogMessage.dataset.selfclose;

  const dialogParams = {
    icon: type,
    title: text,
    showConfirmButton: selfClose == 'true' ? false : true,
  };
  if (selfClose == 'true') {
    dialogParams.timer = 1500;
  }
  Swal.fire(dialogParams);
}

const naoaplicavel = document.querySelector('.naoaplicavel');
const referenciaInput = document.querySelector('.referencia__input');
if (naoaplicavel && referenciaInput) {
  naoaplicavel.addEventListener('change', function () {
    referenciaInput.disabled = !referenciaInput.disabled;
    referenciaInput.value = '';
  });
}

// Gestão dos cliques nas linhas da tabela
const tableRows = document.querySelectorAll('.table_data_row');
if (tableRows && tableRows.length > 0) {
  tableRows.forEach((row) => {
    const processoId = row.dataset.processo;
    row.addEventListener('click', () => {
      window.location.assign(window.location.origin + '/processo/' + processoId);
    });
  });
}

const processoDeleteBtnList = document.querySelectorAll('.processo-deleteBtn');
if(processoDeleteBtnList && processoDeleteBtnList.length > 0){
  processoDeleteBtnList.forEach(btn => {
    btn.addEventListener('click', async function(e){
      e.preventDefault();
      e.stopPropagation();

      const processoId = this.dataset.processo;
      const referencia = this.dataset.referencia;
      const designacao = this.dataset.designacao;
      
      const result = await Swal.fire({
        title: `${designacao}`,
        html: `Tem a certeza que deseja eliminar este processo?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim, eliminar!',
        confirmButtonColor: '#d9534f',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      });

      if (result.value) {
        try {
          const response = await axios({
            method: 'DELETE',
            url: `/eliminarProcesso/${processoId}`,
          });

          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Processo eliminado',
              showConfirmButton: false,
              timer: 1500,
              willClose: () => {
                location.reload();
              },
            });
          } else {
            throw new Error();
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Não foi possível eliminar o processo',
          });
        }
      }
    });
  })
}
