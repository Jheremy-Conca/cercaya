import { useToast } from 'vue-toastification';

const toast = useToast();

export function useNotificar() {
  return {
    exito: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast.info(msg),
  };
}