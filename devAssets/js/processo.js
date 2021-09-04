import axios from 'axios';
import Swal from 'sweetalert2';

let quill;

const historico = document.getElementById('historico');
if (historico) {
  quill = new Quill('#historico', {
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'bullet' }, { list: 'ordered' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['clean'],
      ],
    },
    theme: 'snow',
  });
}

const qlEditor = document.querySelector('.ql-editor');
const qlContent = document.getElementById('historicocontent');
if (qlEditor && qlContent && quill) {
  if(qlContent.value != ""){
    qlEditor.innerHTML = qlContent.value;
  }

  quill.on('text-change', function () {
    const content = qlEditor.innerHTML;
    qlContent.value = content;
  });
}

const deleteHistoricoBtns = document.querySelectorAll('.deleteHistoricoBtn');
if (deleteHistoricoBtns && deleteHistoricoBtns.length > 0) {
  deleteHistoricoBtns.forEach((deleteBtn) => {
    const historicoId = deleteBtn.dataset.historico;

    deleteBtn.addEventListener('click', async function (e) {
      e.preventDefault();

      const result = await Swal.fire({
        title: 'Tem a certeza que deseja eliminar o histórico selecionado?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim, eliminar!',
        confirmButtonColor: '#d9534f',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      });

      if(result.value){
        try {
          const response = await axios({
            method: 'DELETE',
            url: `/processo/eliminarHistorico/${historicoId}`,
          });
          if(response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Histórico eliminado',
              showConfirmButton: false,
              timer: 1500,
              onClose: () => {
                location.reload();
              },
            });
          } else {
            throw new Error();
          }
        } catch(error){
          Swal.fire({
            icon: 'error',
            title: 'Não foi possível eliminar o histórico',
          });
        }
      }
    });
  });
}

const overlay = document.querySelector('.overlay');
const processoOptionsWrapper = document.querySelector('.processo__options__wrapper');
const processoOptionsBtn = document.querySelector('.processooptions__btn');
const processoOptionsCLoseBtn = document.querySelector('.processo__options__closeBtn');
if(overlay && processoOptionsWrapper){
  if (processoOptionsBtn) {
    processoOptionsBtn.addEventListener('click', () => {
      overlay.classList.add('overlay--open');
      processoOptionsWrapper.classList.add('processo__options__wrapper--open');
    });
  }

  overlay.addEventListener('click', ()=>{
    processoOptionsWrapper.classList.remove('processo__options__wrapper--open');
    overlay.classList.remove('overlay--open');
  });

  if(processoOptionsCLoseBtn){
    processoOptionsCLoseBtn.addEventListener('click', () => {
      processoOptionsWrapper.classList.remove('processo__options__wrapper--open');
      overlay.classList.remove('overlay--open');
    });
  }
}
