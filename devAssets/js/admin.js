import axios from 'axios';
import Swal from 'sweetalert2';

const tipoProcessoDeleteBtns = document.querySelectorAll('.tipologia__deleteBtn');
if(tipoProcessoDeleteBtns && tipoProcessoDeleteBtns.length > 0){
  tipoProcessoDeleteBtns.forEach(deleteBtn => {
    const tipologiaId = deleteBtn.dataset.tipologiaid;
    const tipologia = deleteBtn.dataset.tipologia;

    deleteBtn.addEventListener('click', async function(e){
      e.preventDefault();
      const result = await Swal.fire({
        title: `${tipologia}`,
        html:
          '<p>Tem a certeza que deseja eliminar este tipo de processo?</p><br>' +
          '<p class="swal__alert">Esta acção é irreversível</p>' +
          '<p class="swal__alert--subtitle">Todos os processos deste tipo serão ELIMINADOS</p>',
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
            url: `/admin/deleteTipologia/${tipologiaId}`,
          });

          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Tipo de Processo eliminado',
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
            title: 'Não foi possível eliminar o tipo de processo',
          });
        }
      }

    });
  });
}

const deleteUserBtn = document.querySelectorAll('.utilizador__deleteBtn');
if (deleteUserBtn && deleteUserBtn.length > 0) {
  deleteUserBtn.forEach((delUserBtn) => {
    const utilizadorId = delUserBtn.dataset.utilizadorid;
    const nome = delUserBtn.dataset.nome;

    delUserBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const result = await Swal.fire({
        title: `${nome}`,
        text: 'Tem a certeza que deseja eliminar este utilizador?',
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
            url: `/admin/deleteUtilizador/${utilizadorId}`,
          });

          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              text: 'Utilizador eliminado',
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
            title: 'Não foi possível eliminar o utilizador',
          });
        }
      }
    });
  });
}