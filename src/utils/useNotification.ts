// useNotification.ts
import { h } from 'vue';
import { useToast } from 'vue-toastification';
import { POSITION, TYPE } from 'vue-toastification';

export function useNotification() {
  const toast = useToast();

  function notify(type: 'success' | 'error' | 'info' | 'confirm' | 'confirmInfo' | 'warning', message: string, options?: any) {
    if (type === 'confirm') {
      toast(
        {
          component: {
            render() {
              return h('div', {}, [
                h('p', {}, message),
                h('div', { style: 'margin-top: 10px; display: flex; justify-content: flex-center; gap: 8px;' }, [
                  h(
                    'button',
                    {
                      class: 'btn btn-confirm',
                      onClick: () => {
                        options?.onConfirm?.();
                        toast.clear();
                      }
                    },
                    'Eliminar'
                  )
                ])
              ]);
            }
          }
        },
        {
          type: TYPE.ERROR,
          position: POSITION.TOP_CENTER,
          timeout: false,
          closeOnClick: true,
          draggable: true
        }
      );
    }else if (type === 'confirmInfo') {
      toast(
        {
          component: {
            render() {
              return h('div', {}, [
                h('p', {}, message),
                h('div', { style: 'margin-top: 10px; display: flex; justify-content: flex-center; gap: 8px;' }, [
                  h(
                    'button',
                    {
                      class: 'btn btn-confirm',
                      onClick: () => {
                        options?.onConfirm?.();
                        toast.clear();
                      }
                    },
                    'Aceptar'
                  )
                ])
              ]);
            }
          }
        },
        {
          type: TYPE.INFO,
          position: POSITION.TOP_CENTER,
          timeout: false,
          closeOnClick: true,
          draggable: true
        }
      );
    } else {
      toast[type](message);
    }
  }

  return { notify };
}

